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
      console.error('API request error:', error.message);
      
      if (error.code === 401 && retries > 0 && this.refreshToken) {
        console.log('Token expired, attempting refresh...');
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
      startTime.setHours(startTime.getHours() - 2);

      const requestFunction = async () => {
        const response = await this.fitness.users.dataSources.datasets.get({
          userId: 'me',
          dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
          datasetId: `${startTime.getTime()}000000-${endTime.getTime()}000000`
        });

        if (response.data.point && response.data.point.length > 0) {
          const latestPoint = response.data.point[response.data.point.length - 1];
          const currentBpm = latestPoint.value?.[0]?.fpVal || 0;
          
          const averageBpm = response.data.point.reduce((total, point) => {
            return total + (point.value?.[0]?.fpVal || 0);
          }, 0) / response.data.point.length;

          return {
            current: Math.round(currentBpm),
            average: Math.round(averageBpm)
          };
        }

        return { current: 0, average: 0 };
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching heart rate:', error);
      return { current: 0, average: 0 };
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

  // New method to get body weight
  async getBodyWeight() {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 30); // Last 30 days

      const requestFunction = async () => {
        const response = await this.fitness.users.dataSources.datasets.get({
          userId: 'me',
          dataSourceId: 'derived:com.google.weight:com.google.android.gms:merge_weight',
          datasetId: `${startTime.getTime()}000000-${endTime.getTime()}000000`
        });

        if (response.data.point && response.data.point.length > 0) {
          // Get the most recent weight entry
          const latestPoint = response.data.point[response.data.point.length - 1];
          const weight = latestPoint.value?.[0]?.fpVal || 0;
          return Math.round(weight * 100) / 100; // Round to 2 decimal places
        }

        return 0;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching weight:', error);
      return 0;
    }
  }

  // New method to get body height
  async getBodyHeight() {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 365); // Last year

      const requestFunction = async () => {
        const response = await this.fitness.users.dataSources.datasets.get({
          userId: 'me',
          dataSourceId: 'derived:com.google.height:com.google.android.gms:merge_height',
          datasetId: `${startTime.getTime()}000000-${endTime.getTime()}000000`
        });

        if (response.data.point && response.data.point.length > 0) {
          // Get the most recent height entry
          const latestPoint = response.data.point[response.data.point.length - 1];
          const height = latestPoint.value?.[0]?.fpVal || 0;
          return Math.round(height * 100) / 100; // Round to 2 decimal places
        }

        return 0;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching height:', error);
      return 0;
    }
  }

  // New method to get body fat percentage
  async getBodyFat() {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 30); // last 30 days

      const datasetId = `${startTime.getTime()}000000-${endTime.getTime()}000000`; // ms -> ns

      const requestFunction = async () => {
        const response = await this.fitness.users.dataSources.datasets.get({
          userId: 'me',
          // confirm this dataSourceId exists for the user via users.dataSources (see notes below)
          dataSourceId: 'derived:com.google.body.fat.percentage:com.google.android.gms:merge_body_fat_percentage',
          datasetId,
        });

        // Debug: uncomment to inspect what the API returned (redact tokens)
        // console.log('bodyFat response', JSON.stringify(response.data, null, 2));

        const points = response.data.point || [];
        if (points.length === 0) return 0;

        // helper to extract numeric value from different possible shapes
        const extractValue = (valueObj) => {
          if (!valueObj) return null;
          if (typeof valueObj.fpVal === 'number') return valueObj.fpVal;
          if (typeof valueObj.intVal === 'number') return valueObj.intVal;
          if (Array.isArray(valueObj.mapVal) && valueObj.mapVal.length > 0) {
            // mapVal elements look like { key: 'someKey', value: { fpVal: ... } }
            const first = valueObj.mapVal[0];
            if (first && first.value) {
              if (typeof first.value.fpVal === 'number') return first.value.fpVal;
              if (typeof first.value.intVal === 'number') return first.value.intVal;
            }
          }
          return null;
        };

        // sort by endTimeNanos (strings) to ensure newest last
        points.sort((a, b) => {
          const aEnd = BigInt(a.endTimeNanos || a.startTimeNanos || '0');
          const bEnd = BigInt(b.endTimeNanos || b.startTimeNanos || '0');
          return aEnd > bEnd ? 1 : aEnd < bEnd ? -1 : 0;
        });

        // pick the newest point
        const latestPoint = points[points.length - 1];
        const rawValObj = latestPoint.value?.[0] || null;
        const rawVal = extractValue(rawValObj);

        if (rawVal === null || rawVal === undefined) return 0;

        // Some devices/apps write body fat as a fraction (0.15) or percentage (15).
        // Normalise: if value <= 1, assume fractional and convert to percent.
        let bodyFatPercent = Number(rawVal);
        if (isNaN(bodyFatPercent)) return 0;

        if (bodyFatPercent <= 1) {
          bodyFatPercent = bodyFatPercent * 100;
        }

        // round to 2 decimals and return
        return Math.round(bodyFatPercent * 100) / 100;
      };

      return await this.makeAuthenticatedRequest(requestFunction);
    } catch (error) {
      console.error('Error fetching body fat:', error);
      return 0;
    }
  }

  // Helper method to calculate BMI
  calculateBMI(weight, height) {
    if (!weight || !height) return 0;
    const bmi = weight / (height * height);
    return Math.round(bmi * 10) / 10; // Round to 1 decimal place
  }

  async getAllComprehensiveData() {
    try {
      // First verify the token by making a simple request
      await this.oauth2Client.getAccessToken();
      
      const [steps, calories, heartRate, activeMinutes, weight, height, bodyFat] = await Promise.all([
        this.getTodaysSteps(),
        this.getTodaysCalories(),
        this.getHeartRate(),
        this.getActiveMinutes(),
        this.getBodyWeight(),
        this.getBodyHeight(),
        this.getBodyFat()
      ]);

      // Calculate BMI
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