import { google } from 'googleapis';

export class GoogleFitService {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.oauth2Client = this.getAuthClient();
    this.fitness = google.fitness({
      version: 'v1',
      auth: this.oauth2Client
    });
  }

  getAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL || 'http://localhost:3000'
    );
    
    oauth2Client.setCredentials({
      access_token: this.accessToken,
      refresh_token: this.refreshToken
    });
    
    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token;
      }
      if (tokens.access_token) {
        this.accessToken = tokens.access_token;
      }
    });
    
    return oauth2Client;
  }

  async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      this.accessToken = credentials.access_token;
      this.oauth2Client.setCredentials(credentials);
      
      return credentials.access_token;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw new Error('Token refresh failed');
    }
  }

  async makeAuthenticatedRequest(requestFunction, retries = 1) {
    try {
      return await requestFunction();
    } catch (error) {
      if (error.code === 401 && retries > 0 && this.refreshToken) {
        try {
          await this.refreshAccessToken();
          return await requestFunction();
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication failed - please reconnect Google Fit');
        }
      }
      throw error;
    }
  }

  // Helper: normalize various time fields to milliseconds
  _pointTimeToMs(point, which = 'start') {
    const nanosKey = `${which}TimeNanos`;
    const millisKey = `${which}TimeMillis`;
    const altKey = `${which}Time`;

    const valNanos = point[nanosKey];
    if (valNanos !== undefined && valNanos !== null) {
      try {
        return Number(BigInt(valNanos) / 1000000n);
      } catch {
        // fallthrough
      }
    }

    const valMillis = point[millisKey];
    if (valMillis !== undefined && valMillis !== null) {
      return Number(valMillis);
    }

    const valAlt = point[altKey];
    if (valAlt !== undefined && valAlt !== null) {
      const s = String(valAlt);
      // heuristic: >13 digits -> nanos, otherwise ms
      if (s.length > 13) {
        try {
          return Number(BigInt(s) / 1000000n);
        } catch {}
      }
      return Number(s);
    }

    return 0;
  }

  async getTodaysSteps() {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0);

      const requestFunction = async () => {
        const response = await this.fitness.users.dataSources.datasets.get({
          userId: 'me',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
          datasetId: `${startTime.getTime()}000000-${endTime.getTime()}000000`
        });

        const steps = response.data.point?.reduce((total, point) => {
          return total + (point.value?.[0]?.intVal || 0);
        }, 0) || 0;

        return steps;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching steps:', error);
      return 0;
    }
  }

  async getTodaysCalories() {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0);

      const requestFunction = async () => {
        const response = await this.fitness.users.dataSources.datasets.get({
          userId: 'me',
          dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
          datasetId: `${startTime.getTime()}000000-${endTime.getTime()}000000`
        });

        const calories = response.data.point?.reduce((total, point) => {
          return total + (point.value?.[0]?.fpVal || 0);
        }, 0) || 0;

        return Math.round(calories);
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching calories:', error);
      return 0;
    }
  }

  async getHeartRate() {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 1);

      const datasetId = `${startTime.getTime()}000000-${endTime.getTime()}000000`;

      const requestFunction = async () => {
        const dataSourceCandidates = [
          'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
          'raw:com.google.heart_rate.bpm:com.google.android.apps.fitness:user_input',
          'raw:com.google.heart_rate.bpm:com.google.android.gms:from_sensor'
        ];

        let points = [];
        for (const dataSourceId of dataSourceCandidates) {
          try {
            const resp = await this.fitness.users.dataSources.datasets.get({
              userId: 'me',
              dataSourceId,
              datasetId
            });
            points = resp.data.point || [];
            if (points.length > 0) break;
          } catch (err) {
            continue;
          }
        }

        if (!points || points.length === 0) {
          return { current: 0, average: 0, samples: 0 };
        }

        const extractValue = (valueObj) => {
          if (!valueObj) return null;
          if (typeof valueObj.fpVal === 'number') return valueObj.fpVal;
          if (typeof valueObj.intVal === 'number') return valueObj.intVal;
          if (Array.isArray(valueObj.mapVal) && valueObj.mapVal.length > 0) {
            const first = valueObj.mapVal[0];
            if (first && first.value) {
              if (typeof first.value.fpVal === 'number') return first.value.fpVal;
              if (typeof first.value.intVal === 'number') return first.value.intVal;
            }
          }
          return null;
        };

        const values = [];
        for (const p of points) {
          const v = extractValue(p.value?.[0]);
          if (v !== null && v !== undefined) values.push(Number(v));
        }

        if (values.length === 0) {
          return { current: 0, average: 0, samples: 0 };
        }

        const currentRaw = values[values.length - 1] || 0;
        const avgRaw = values.reduce((s, n) => s + n, 0) / values.length;

        return {
          current: Math.round(currentRaw),
          average: Math.round(avgRaw),
          samples: values.length
        };
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching heart rate:', error);
      return { current: 0, average: 0, samples: 0 };
    }
  }

  async getActiveMinutes() {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0);

      const requestFunction = async () => {
        const response = await this.fitness.users.dataSources.datasets.get({
          userId: 'me',
          dataSourceId: 'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes',
          datasetId: `${startTime.getTime()}000000-${endTime.getTime()}000000`
        });

        const activeMinutes = response.data.point?.reduce((total, point) => {
          return total + (point.value?.[0]?.intVal || 0);
        }, 0) || 0;

        return activeMinutes;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching active minutes:', error);
      return 0;
    }
  }

  async getBodyWeight() {
    try {
      const end = Date.now();
      const start = end - 30 * 24 * 60 * 60 * 1000;
      const datasetId = `${start}000000-${end}000000`;

      const requestFunction = async () => {
        const candidates = [
          'derived:com.google.weight:com.google.android.gms:merge_weight',
          'raw:com.google.weight:com.google.android.apps.fitness:user_input',
          'raw:com.google.weight:com.google.android.gms:from_device'
        ];

        for (const dataSourceId of candidates) {
          try {
            const resp = await this.fitness.users.dataSources.datasets.get({
              userId: 'me',
              dataSourceId,
              datasetId
            });
            const points = resp.data.point || [];
            if (points.length === 0) continue;

            points.sort((a, b) => {
              const aEnd = BigInt(a.endTimeNanos || a.startTimeNanos || '0');
              const bEnd = BigInt(b.endTimeNanos || b.startTimeNanos || '0');
              return aEnd > bEnd ? 1 : aEnd < bEnd ? -1 : 0;
            });

            const latest = points[points.length - 1];
            const val = latest.value?.[0];
            if (!val) continue;
            const num = (typeof val.fpVal === 'number') ? val.fpVal : (typeof val.intVal === 'number' ? val.intVal : null);
            if (num === null || num === undefined) continue;
            return Math.round(num * 100) / 100;
          } catch (err) {
            continue;
          }
        }

        return 0;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching weight:', error);
      return 0;
    }
  }

  async getBodyHeight() {
    try {
      const end = Date.now();
      const start = end - 365 * 24 * 60 * 60 * 1000;
      const datasetId = `${start}000000-${end}000000`;

      const requestFunction = async () => {
        const candidates = [
          'derived:com.google.height:com.google.android.gms:merge_height',
          'raw:com.google.height:com.google.android.apps.fitness:user_input',
          'raw:com.google.height:com.google.android.gms:from_device'
        ];

        for (const dataSourceId of candidates) {
          try {
            const resp = await this.fitness.users.dataSources.datasets.get({
              userId: 'me',
              dataSourceId,
              datasetId
            });
            const points = resp.data.point || [];
            if (points.length === 0) continue;

            points.sort((a, b) => {
              const aEnd = BigInt(a.endTimeNanos || a.startTimeNanos || '0');
              const bEnd = BigInt(b.endTimeNanos || b.startTimeNanos || '0');
              return aEnd > bEnd ? 1 : aEnd < bEnd ? -1 : 0;
            });

            const latest = points[points.length - 1];
            const val = latest.value?.[0];
            if (!val) continue;
            const num = (typeof val.fpVal === 'number') ? val.fpVal : (typeof val.intVal === 'number' ? val.intVal : null);
            if (num === null || num === undefined) continue;
            return Math.round(num * 100) / 100;
          } catch (err) {
            continue;
          }
        }

        return 0;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching height:', error);
      return 0;
    }
  }

  async getBodyFat() {
    try {
      const end = Date.now();
      const start = end - 30 * 24 * 60 * 60 * 1000;
      const datasetId = `${start}000000-${end}000000`;

      const requestFunction = async () => {
        const candidates = [
          'derived:com.google.body.fat.percentage:com.google.android.gms:merge_body_fat_percentage',
          'raw:com.google.body.fat.percentage:com.google.android.apps.fitness:user_input',
          'raw:com.google.body.fat.percentage:com.google.android.gms:from_device'
        ];

        for (const dataSourceId of candidates) {
          try {
            const resp = await this.fitness.users.dataSources.datasets.get({
              userId: 'me',
              dataSourceId,
              datasetId
            });
            const points = resp.data.point || [];
            if (points.length === 0) continue;

            points.sort((a, b) => {
              const aEnd = BigInt(a.endTimeNanos || a.startTimeNanos || '0');
              const bEnd = BigInt(b.endTimeNanos || b.startTimeNanos || '0');
              return aEnd > bEnd ? 1 : aEnd < bEnd ? -1 : 0;
            });

            for (let i = points.length - 1; i >= 0; i--) {
              const val = points[i].value?.[0];
              if (!val) continue;
              let num = null;
              if (typeof val.fpVal === 'number') num = val.fpVal;
              else if (typeof val.intVal === 'number') num = val.intVal;
              else if (Array.isArray(val.mapVal) && val.mapVal.length > 0) {
                const first = val.mapVal[0];
                if (first && first.value) {
                  if (typeof first.value.fpVal === 'number') num = first.value.fpVal;
                  else if (typeof first.value.intVal === 'number') num = first.value.intVal;
                }
              }
              if (num === null || num === undefined) continue;

              let percent = Number(num);
              if (isNaN(percent)) continue;
              if (percent <= 1) percent = percent * 100;
              return Math.round(percent * 100) / 100;
            }
          } catch (err) {
            continue;
          }
        }

        return 0;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching body fat:', error);
      return 0;
    }
  }

  async getSleepHistory(days = 4) {
    try {
      const results = [];

      // Try Sessions API first for all days
      try {
        const endTimeForFetch = new Date();
        endTimeForFetch.setHours(23, 59, 59, 999);
        const endTimeMs = endTimeForFetch.getTime();
        
        const startTimeMs = endTimeMs - (days + 1) * 24 * 60 * 60 * 1000;

        const sessionsResponse = await this.makeAuthenticatedRequest(() =>
          this.fitness.users.sessions.list({
            userId: 'me',
            startTime: new Date(startTimeMs).toISOString(),
            endTime: new Date(endTimeMs).toISOString(),
            activityType: 72
          })
        );

        const sessions = sessionsResponse.data.session || [];

        if (sessions.length > 0) {
          const sessionsByDay = {};
          
          const todayMidnightUTC = new Date();
          todayMidnightUTC.setUTCHours(0, 0, 0, 0);
          
          for (let i = days - 1; i >= 0; i--) {
            const slotDay = new Date(todayMidnightUTC.getTime());
            slotDay.setUTCDate(slotDay.getUTCDate() - i);
            const dateKey = slotDay.toISOString().slice(0, 10);
            sessionsByDay[dateKey] = [];
          }
          
          sessions.forEach((session) => {
            let startMs, endMs;
            if (session.startTimeMillis) {
              startMs = parseInt(session.startTimeMillis, 10);
            } else if (session.startTime) {
              startMs = new Date(session.startTime).getTime();
            } else {
              return;
            }

            if (session.endTimeMillis) {
              endMs = parseInt(session.endTimeMillis, 10);
            } else if (session.endTime) {
              endMs = new Date(session.endTime).getTime();
            } else {
              return;
            }

            const endDate = new Date(endMs);
            const startDate = new Date(startMs);
            
            let sleepNightDate;
            
            // If wake time (end) is before 12 PM UTC, attribute to previous day
            if (endDate.getUTCHours() < 12) {
              sleepNightDate = new Date(Date.UTC(
                endDate.getUTCFullYear(),
                endDate.getUTCMonth(),
                endDate.getUTCDate() - 1,
                0, 0, 0, 0
              ));
            } else {
              sleepNightDate = new Date(Date.UTC(
                startDate.getUTCFullYear(),
                startDate.getUTCMonth(),
                startDate.getUTCDate(),
                0, 0, 0, 0
              ));
            }
            
            const dateKey = sleepNightDate.toISOString().slice(0, 10);
            
            if (sessionsByDay[dateKey] !== undefined) {
              sessionsByDay[dateKey].push(session);
            }
          });

          const sortedDates = Object.keys(sessionsByDay).sort();
          for (const dateKey of sortedDates) {
            const daySessions = sessionsByDay[dateKey];
            let totalMs = 0;
            let minStart = null;
            let maxEnd = null;

            daySessions.forEach((session) => {
              let startMs, endMs;
              
              if (session.startTimeMillis) {
                startMs = parseInt(session.startTimeMillis, 10);
              } else if (session.startTime) {
                startMs = new Date(session.startTime).getTime();
              } else {
                return;
              }

              if (session.endTimeMillis) {
                endMs = parseInt(session.endTimeMillis, 10);
              } else if (session.endTime) {
                endMs = new Date(session.endTime).getTime();
              } else {
                return;
              }
              
              if (endMs > startMs) {
                totalMs += endMs - startMs;
                if (!minStart || startMs < minStart) minStart = startMs;
                if (!maxEnd || endMs > maxEnd) maxEnd = endMs;
              }
            });

            const durationHours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100;

            let quality = 'Poor';
            if (durationHours >= 7) quality = 'Good';
            else if (durationHours >= 5) quality = 'Fair';
            else if (durationHours === 0) quality = 'No data';

            results.push({
              date: dateKey,
              durationHours,
              quality,
              bedTime: minStart ? new Date(minStart).toISOString() : null,
              wakeTime: maxEnd ? new Date(maxEnd).toISOString() : null
            });
          }
          
          return results;
        }
      } catch (err) {
        console.error('Sessions API failed:', err.message);
      }

      // Fallback to dataset method
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = days - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);

        const dayStartMs = day.getTime();
        const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000 - 1;
        const datasetId = `${dayStartMs}000000-${dayEndMs}000000`;

        let points = [];
        let foundSourceId = null;

        // Try merged sleep segments
        try {
          const mergedId = 'derived:com.google.sleep.segment:com.google.android.gms:merge_sleep_segments';
          const resp = await this.makeAuthenticatedRequest(() =>
            this.fitness.users.dataSources.datasets.get({
              userId: 'me',
              dataSourceId: mergedId,
              datasetId
            })
          );
          points = resp.data.point || [];
          if (points.length > 0) {
            foundSourceId = mergedId;
          }
        } catch {}

        // Fallback to individual sleep sources
        if (!points || points.length === 0) {
          const list = await this.makeAuthenticatedRequest(() => 
            this.fitness.users.dataSources.list({ userId: 'me' })
          );
          const sleepSources = (list.data.dataSource || []).filter(
            s => s.dataType?.name === 'com.google.sleep.segment'
          );

          for (const s of sleepSources) {
            const sid = s.dataStreamId || s.dataSourceId;
            try {
              const r = await this.makeAuthenticatedRequest(() =>
                this.fitness.users.dataSources.datasets.get({
                  userId: 'me',
                  dataSourceId: sid,
                  datasetId
                })
              );
              if ((r.data.point || []).length > 0) {
                points = r.data.point;
                foundSourceId = sid;
                break;
              }
            } catch {}
          }
        }

        // Fallback to activity segments with sleep type
        if (!points || points.length === 0) {
          const list = await this.makeAuthenticatedRequest(() => 
            this.fitness.users.dataSources.list({ userId: 'me' })
          );
          const activitySources = (list.data.dataSource || []).filter(
            s => s.dataType?.name === 'com.google.activity.segment'
          );

          const extractActivityType = (valueObj) => {
            if (!valueObj) return null;
            if (typeof valueObj.intVal === 'number') return valueObj.intVal;
            if (typeof valueObj.fpVal === 'number') return Math.round(valueObj.fpVal);
            if (Array.isArray(valueObj.mapVal) && valueObj.mapVal.length > 0) {
              const first = valueObj.mapVal[0];
              if (first && first.value) {
                if (typeof first.value.intVal === 'number') return first.value.intVal;
                if (typeof first.value.fpVal === 'number') return Math.round(first.value.fpVal);
              }
            }
            return null;
          };

          for (const s of activitySources) {
            const sid = s.dataStreamId || s.dataSourceId;
            try {
              const r = await this.makeAuthenticatedRequest(() =>
                this.fitness.users.dataSources.datasets.get({
                  userId: 'me',
                  dataSourceId: sid,
                  datasetId
                })
              );
              const pts = (r.data.point || []).filter(p => {
                const at = extractActivityType(p.value?.[0]);
                return at === 72;
              });
              if (pts.length > 0) {
                points = pts;
                foundSourceId = sid;
                break;
              }
            } catch {}
          }
        }

        if (!points || points.length === 0) {
          results.push({
            date: day.toISOString().slice(0, 10),
            durationHours: 0,
            quality: 'No data',
            bedTime: null,
            wakeTime: null
          });
          continue;
        }

        let totalMs = 0;
        let minStart = null;
        let maxEnd = null;

        for (const p of points) {
          const startMs = this._pointTimeToMs(p, 'start');
          const endMs = this._pointTimeToMs(p, 'end');

          const overlapStart = Math.max(startMs, dayStartMs);
          const overlapEnd = Math.min(endMs, dayEndMs);

          if (overlapEnd > overlapStart) {
            totalMs += overlapEnd - overlapStart;
            if (!minStart || overlapStart < minStart) minStart = overlapStart;
            if (!maxEnd || overlapEnd > maxEnd) maxEnd = overlapEnd;
          }
        }

        const durationHours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100;

        let quality = 'Poor';
        if (durationHours >= 7) quality = 'Good';
        else if (durationHours >= 5) quality = 'Fair';
        else if (durationHours === 0) quality = 'No data';

        results.push({
          date: day.toISOString().slice(0, 10),
          durationHours,
          quality,
          bedTime: minStart ? new Date(minStart).toISOString() : null,
          wakeTime: maxEnd ? new Date(maxEnd).toISOString() : null
        });
      }

      return results;
    } catch (error) {
      console.error('Error fetching sleep history:', error);
      return [];
    }
  }

  calculateBMI(weight, height) {
    if (!weight || !height) return 0;
    const bmi = weight / (height * height);
    return Math.round(bmi * 10) / 10;
  }

  async getAllComprehensiveData() {
    try {
      await this.oauth2Client.getAccessToken();

      const sleepHistoryPromise = this.getSleepHistory(4);

      const [steps, calories, heartRate, activeMinutes, weight, height, bodyFat, sleepHistory] = await Promise.all([
        this.getTodaysSteps(),
        this.getTodaysCalories(),
        this.getHeartRate(),
        this.getActiveMinutes(),
        this.getBodyWeight(),
        this.getBodyHeight(),
        this.getBodyFat(),
        sleepHistoryPromise
      ]);

      const lastSleep = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 2] : {
        durationHours: 0, quality: 'No data', bedTime: null, wakeTime: null
      };

      const bmi = this.calculateBMI(weight, height);

      return {
        activity: {
          steps,
          caloriesBurned: calories,
          distance: Math.round((steps * 0.762) / 1000 * 100) / 100,
          activeMinutes
        },
        heartRate,
        body: {
          weight,
          height,
          bodyFat,
          bmi
        },
        sleep: {
          duration: lastSleep.durationHours || 0,
          quality: lastSleep.quality || 'No data',
          bedTime: lastSleep.bedTime || null,
          wakeTime: lastSleep.wakeTime || null
        },
        sleepHistory,
        lastUpdated: new Date().toISOString(),
        accessToken: this.accessToken
      };
    } catch (error) {
      console.error('Error fetching comprehensive Google Fit data:', error);

      return {
        error: true,
        message: error.message,
        needsReauth: error.message.includes('Authentication failed') || error.code === 401
      };
    }
  }
}