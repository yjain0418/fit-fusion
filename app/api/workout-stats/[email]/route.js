import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import WorkoutSession from '@/lib/model/workoutSession';

export async function GET(request, { params }) {
    try {
        const { email } = params;
        
        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email parameter is required" },
                { status: 400 }
            );
        }

        // Connect to database with timeout
        const connectionTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database connection timeout')), 15000);
        });

        try {
            await Promise.race([connectDB(), connectionTimeout]);
        } catch (dbError) {
            console.error('[WORKOUT-STATS] Database connection failed:', dbError);
            return NextResponse.json({
                success: true,
                data: getFallbackStats(),
                fallback: true,
                message: "Using offline data - connection unavailable"
            });
        }

        const decodedEmail = decodeURIComponent(email);

        // Calculate date ranges
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

        // Query database with timeout
        const queryTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), 8000);
        });

        try {
            const [
                thisWeekSessions,
                lastWeekSessions,
                thisMonthSessions,
                allCompletedSessions,
                recentSessions
            ] = await Promise.race([
                Promise.all([
                    WorkoutSession.find({
                        userId: decodedEmail,
                        createdAt: { $gte: startOfWeek }
                    }).lean().exec(),
                    
                    WorkoutSession.find({
                        userId: decodedEmail,
                        createdAt: { 
                            $gte: startOfLastWeek,
                            $lt: startOfWeek
                        }
                    }).lean().exec(),
                    
                    WorkoutSession.find({
                        userId: decodedEmail,
                        createdAt: { $gte: startOfMonth }
                    }).lean().exec(),
                    
                    WorkoutSession.find({
                        userId: decodedEmail,
                        status: 'completed'
                    }).sort({ createdAt: -1 }).lean().exec(),
                    
                    WorkoutSession.find({
                        userId: decodedEmail
                    }).sort({ createdAt: -1 }).limit(10).lean().exec()
                ]),
                queryTimeout
            ]);

            // Calculate statistics
            const thisWeekStats = calculateWeekStats(thisWeekSessions);
            const lastWeekStats = calculateWeekStats(lastWeekSessions);
            const monthlyStats = calculateMonthStats(thisMonthSessions);
            const currentStreak = calculateCurrentStreak(allCompletedSessions);
            const nextWorkout = predictNextWorkout(recentSessions);

            // Calculate changes from last week
            const changes = {
                workouts: thisWeekStats.workouts - lastWeekStats.workouts,
                activeMinutes: thisWeekStats.activeMinutes - lastWeekStats.activeMinutes,
                calories: thisWeekStats.calories - lastWeekStats.calories,
                streak: currentStreak - (lastWeekStats.streak || 0)
            };

            // Calculate progress
            const weeklyGoalProgress = Math.min((thisWeekStats.workouts / 4) * 100, 100);
            const monthlyGoalProgress = Math.min((monthlyStats.workouts / 20) * 100, 100);

            const responseData = {
                thisWeek: {
                    workouts: thisWeekStats.workouts,
                    activeMinutes: thisWeekStats.activeMinutes,
                    calories: thisWeekStats.calories,
                    streak: currentStreak,
                    totalSets: thisWeekStats.totalSets,
                    averageWorkoutDuration: thisWeekStats.averageWorkoutDuration
                },
                changes: {
                    workouts: changes.workouts >= 0 ? `+${changes.workouts}` : `${changes.workouts}`,
                    activeMinutes: changes.activeMinutes >= 0 ? `+${changes.activeMinutes}` : `${changes.activeMinutes}`,
                    calories: changes.calories >= 0 ? `+${changes.calories}` : `${changes.calories}`,
                    streak: changes.streak >= 0 ? `+${changes.streak}` : `${changes.streak}`
                },
                progress: {
                    weeklyGoal: Math.round(weeklyGoalProgress),
                    monthlyGoal: Math.round(monthlyGoalProgress),
                    monthlyProgress: `${monthlyStats.workouts}/20`
                },
                nextWorkout: nextWorkout,
                summary: {
                    totalSessions: allCompletedSessions.length,
                    thisMonth: monthlyStats.workouts,
                    currentStreak: currentStreak,
                    totalCaloriesBurned: allCompletedSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0),
                    totalWorkoutTime: allCompletedSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0)
                },
                workoutHistory: thisWeekSessions.map(session => ({
                    date: session.createdAt,
                    planName: session.workoutPlan?.planName || 'Unknown',
                    duration: session.totalDuration,
                    calories: session.caloriesBurned,
                    status: session.status,
                    completedExercises: session.completedExercises,
                    totalExercises: session.totalExercises,
                    completionRate: Math.round((session.completedExercises / session.totalExercises) * 100) || 0
                }))
            };

            return NextResponse.json({
                success: true,
                data: responseData
            });

        } catch (queryError) {
            console.error('[WORKOUT-STATS] Query execution failed:', queryError);
            return NextResponse.json({
                success: true,
                data: getFallbackStats(),
                fallback: true,
                message: "Using offline data - query failed"
            });
        }

    } catch (error) {
        console.error("[WORKOUT-STATS] Error:", error);
        
        // Handle timeout and network errors
        if (error.message.includes('timeout') || error.code === 'ETIMEOUT') {
            return NextResponse.json({
                success: true,
                data: getFallbackStats(),
                fallback: true,
                message: "Connection timeout - using offline data"
            });
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return NextResponse.json({
                success: true,
                data: getFallbackStats(),
                fallback: true,
                message: "Database unavailable - using offline data"
            });
        }
        
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to fetch workout stats",
                error: error.message 
            },
            { status: 500 }
        );
    }
}

// Fallback data when database is unavailable
function getFallbackStats() {
    return {
        thisWeek: {
            workouts: 0,
            activeMinutes: 0,
            calories: 0,
            streak: 0,
            totalSets: 0,
            averageWorkoutDuration: 0
        },
        changes: {
            workouts: "+0",
            activeMinutes: "+0",
            calories: "+0",
            streak: "+0"
        },
        progress: {
            weeklyGoal: 0,
            monthlyGoal: 0,
            monthlyProgress: "0/20"
        },
        nextWorkout: {
            date: "Tomorrow",
            time: "7:00 AM",
            type: "Start your routine"
        },
        summary: {
            totalSessions: 0,
            thisMonth: 0,
            currentStreak: 0,
            totalCaloriesBurned: 0,
            totalWorkoutTime: 0
        },
        workoutHistory: []
    };
}

// Helper functions
function calculateWeekStats(sessions) {
    const completed = sessions.filter(s => s.status === 'completed');
    
    let totalSets = 0;
    completed.forEach(session => {
        if (session.exerciseProgress && Array.isArray(session.exerciseProgress)) {
            const sessionSets = session.exerciseProgress.reduce((exerciseSum, exercise) => {
                return exerciseSum + (exercise.completedSets ? exercise.completedSets.length : 0);
            }, 0);
            totalSets += sessionSets;
        } else {
            totalSets += session.stats?.totalSetsCompleted || 0;
        }
    });

    const activeMinutes = completed.reduce((sum, s) => {
        const duration = s.totalDuration || 0;
        return sum + (duration > 1000 ? Math.round(duration / 60) : duration);
    }, 0);

    const totalCalories = completed.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);
    const totalWorkouts = completed.length;
    const averageWorkoutDuration = totalWorkouts > 0 ? Math.round(activeMinutes / totalWorkouts) : 0;
    
    return {
        workouts: totalWorkouts,
        activeMinutes: activeMinutes,
        calories: totalCalories,
        totalSessions: sessions.length,
        totalSets: totalSets,
        averageWorkoutDuration: averageWorkoutDuration
    };
}

function calculateMonthStats(sessions) {
    const completed = sessions.filter(s => s.status === 'completed');
    
    const activeMinutes = completed.reduce((sum, s) => {
        const duration = s.totalDuration || 0;
        return sum + (duration > 1000 ? Math.round(duration / 60) : duration);
    }, 0);

    const totalCalories = completed.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);
    
    return {
        workouts: completed.length,
        activeMinutes: activeMinutes,
        calories: totalCalories
    };
}

function calculateCurrentStreak(sessions) {
    if (!sessions.length) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Group sessions by date
    const sessionsByDate = {};
    sessions.forEach(session => {
        const date = new Date(session.createdAt);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!sessionsByDate[dateKey]) {
            sessionsByDate[dateKey] = [];
        }
        sessionsByDate[dateKey].push(session);
    });

    // Check consecutive days starting from today or yesterday
    let currentDate = new Date(today);
    const todayKey = currentDate.toISOString().split('T')[0];
    
    if (!sessionsByDate[todayKey]) {
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayKey = currentDate.toISOString().split('T')[0];
        if (!sessionsByDate[yesterdayKey]) {
            return 0;
        }
    }
    
    // Count consecutive days with workouts
    let streakBroken = false;
    while (!streakBroken && streak < 365) {
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (sessionsByDate[dateKey] && sessionsByDate[dateKey].length > 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            streakBroken = true;
        }
    }

    return streak;
}

function predictNextWorkout(recentSessions) {
    if (!recentSessions.length) {
        return {
            date: "No data",
            time: "Set your schedule",
            type: "Get started",
            confidence: 0
        };
    }

    const completedSessions = recentSessions.filter(s => s.status === 'completed');
    
    if (!completedSessions.length) {
        return {
            date: "Tomorrow",
            time: "7:00 AM",
            type: "Start your routine",
            confidence: 0
        };
    }

    // Analyze workout patterns
    const workoutPatterns = completedSessions.map(session => {
        const date = new Date(session.createdAt);
        return {
            dayOfWeek: date.getDay(),
            hour: date.getHours(),
            planName: session.workoutPlan?.planName || "Workout"
        };
    });

    // Find most common patterns
    const dayFrequency = workoutPatterns.reduce((acc, pattern) => {
        acc[pattern.dayOfWeek] = (acc[pattern.dayOfWeek] || 0) + 1;
        return acc;
    }, {});

    const hourFrequency = workoutPatterns.reduce((acc, pattern) => {
        acc[pattern.hour] = (acc[pattern.hour] || 0) + 1;
        return acc;
    }, {});

    const typeFrequency = workoutPatterns.reduce((acc, pattern) => {
        acc[pattern.planName] = (acc[pattern.planName] || 0) + 1;
        return acc;
    }, {});

    const mostCommonDay = Object.keys(dayFrequency).reduce((a, b) => 
        dayFrequency[a] > dayFrequency[b] ? a : b
    );
    
    const mostCommonHour = Object.keys(hourFrequency).reduce((a, b) => 
        hourFrequency[a] > hourFrequency[b] ? a : b
    );
    
    const mostCommonType = Object.keys(typeFrequency).reduce((a, b) => 
        typeFrequency[a] > typeFrequency[b] ? a : b
    );

    // Calculate next workout date
    const today = new Date();
    const nextWorkoutDate = new Date(today);
    const currentHour = today.getHours();
    const suggestedHour = parseInt(mostCommonHour);
    
    if (today.getDay() !== parseInt(mostCommonDay) || currentHour >= suggestedHour) {
        const daysUntilNext = (parseInt(mostCommonDay) + 7 - today.getDay()) % 7;
        if (daysUntilNext === 0) {
            nextWorkoutDate.setDate(today.getDate() + 7);
        } else {
            nextWorkoutDate.setDate(today.getDate() + daysUntilNext);
        }
    }

    // Format time
    const hour = parseInt(mostCommonHour);
    const timeString = hour === 0 ? "12:00 AM" : 
                     hour < 12 ? `${hour}:00 AM` : 
                     hour === 12 ? "12:00 PM" : 
                     `${hour - 12}:00 PM`;

    // Format date
    const isToday = nextWorkoutDate.toDateString() === today.toDateString();
    const isTomorrow = nextWorkoutDate.toDateString() === new Date(today.getTime() + 24*60*60*1000).toDateString();
    
    let dateString;
    if (isToday) {
        dateString = "Today";
    } else if (isTomorrow) {
        dateString = "Tomorrow";
    } else {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dateString = dayNames[nextWorkoutDate.getDay()];
    }

    // Calculate confidence
    const totalSessions = completedSessions.length;
    const dayConfidence = dayFrequency[mostCommonDay] / totalSessions;
    const hourConfidence = hourFrequency[mostCommonHour] / totalSessions;
    const typeConfidence = typeFrequency[mostCommonType] / totalSessions;
    
    const overallConfidence = Math.round(((dayConfidence + hourConfidence + typeConfidence) / 3) * 100);

    return {
        date: dateString,
        time: timeString,
        type: mostCommonType,
        confidence: overallConfidence
    };
}