import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import WorkoutSession from '@/lib/model/workoutSession';

export async function POST(request) {
  try {
    await connectDB();
    const sessionData = await request.json();
    
    console.log('Received session data:', sessionData);
    
    const workoutSessionData = {
      ...sessionData,
      status: sessionData.status === 'active' ? 'active' : sessionData.status,
    };

    delete workoutSessionData.endTime;

    const workoutSession = new WorkoutSession(workoutSessionData);
    await workoutSession.save();
    
    return NextResponse.json({ 
      success: true, 
      data: workoutSession 
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving workout session:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create workout session',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const today = searchParams.get('today') === 'true';

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'userId is required' 
      }, { status: 400 });
    }

    let query = { userId };
    
    if (today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const sessions = await WorkoutSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    // Calculate today's stats if requested
    let todayStats = null;
    if (today) {
      const completedSessions = sessions.filter(s => s.status === 'completed');
      todayStats = {
        totalSessions: sessions.length,
        totalDuration: completedSessions.reduce((sum, s) => sum + s.totalDuration, 0),
        totalCalories: completedSessions.reduce((sum, s) => sum + s.caloriesBurned, 0),
        completedWorkouts: completedSessions.length
      };
    }

    return NextResponse.json({ 
      success: true, 
      data: sessions,
      todayStats 
    });

  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch workout sessions' 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    const { sessionId } = updateData;
    
    if (!sessionId) {
      return NextResponse.json({ 
        success: false,
        error: 'sessionId is required' 
      }, { status: 400 });
    }

    // Remove sessionId from updateData since it's not part of the schema
    const { sessionId: _, ...dataToUpdate } = updateData;

    // If completing the session, add endTime and calculate duration
    if (dataToUpdate.status === 'completed') {
      if (!dataToUpdate.endTime) {
        dataToUpdate.endTime = new Date();
      }
      
      // Calculate total duration if not provided
      const existingSession = await WorkoutSession.findOne({ sessionId });
      if (existingSession && !dataToUpdate.totalDuration) {
        const endTime = new Date(dataToUpdate.endTime);
        const startTime = new Date(existingSession.startTime);
        dataToUpdate.totalDuration = Math.floor((endTime - startTime) / 1000);
      }
    }

    const session = await WorkoutSession.findOneAndUpdate(
      { sessionId },
      dataToUpdate,
      { new: true, runValidators: true }
    );

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: 'Session not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: session 
    });

  } catch (error) {
    console.error('Error updating workout session:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update workout session',
      details: error.message 
    }, { status: 500 });
  }
}