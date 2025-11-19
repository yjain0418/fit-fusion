import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CustomWorkout from '@/lib/model/customWorkout';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const updateData = await request.json();
    
    // Decode the userId if it contains URL-encoded characters
    if (updateData.userId) {
      updateData.userId = decodeURIComponent(updateData.userId);
    }
    
    const updatedWorkout = await CustomWorkout.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updatedWorkout,
      message: 'Workout updated successfully' 
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update workout',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const deletedWorkout = await CustomWorkout.findByIdAndDelete(id);
    
    if (!deletedWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Workout deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete workout' 
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const workout = await CustomWorkout.findById(id);
    
    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: workout 
    });
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch workout' 
    }, { status: 500 });
  }
}