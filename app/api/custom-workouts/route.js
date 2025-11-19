import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CustomWorkout from '@/lib/model/customWorkout';

export async function POST(request) {
  try {
    await connectDB();
    
    const workoutData = await request.json();
    
    // Decode the userId if it contains URL-encoded characters
    if (workoutData.userId) {
      workoutData.userId = decodeURIComponent(workoutData.userId);
    }
    
    const customWorkout = new CustomWorkout(workoutData);
    await customWorkout.save();
    
    return NextResponse.json({ 
      success: true, 
      data: customWorkout,
      message: 'Custom workout saved successfully' 
    });
  } catch (error) {
    console.error('Error saving custom workout:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save custom workout',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Decode the userId to handle URL-encoded characters like %40 (@)
    userId = decodeURIComponent(userId);

    const customWorkouts = await CustomWorkout.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: customWorkouts 
    });
  } catch (error) {
    console.error('Error fetching custom workouts:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch custom workouts' 
    }, { status: 500 });
  }
}