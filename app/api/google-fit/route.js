import { NextResponse } from 'next/server';
import { GoogleFitService } from '@/lib/googleFit';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access token is required',
          needsReauth: true
        }, 
        { status: 400 }
      );
    }

    const googleFitService = new GoogleFitService(accessToken, refreshToken);
    const data = await googleFitService.getAllComprehensiveData();

    if (data.error) {
      return NextResponse.json({
        success: false,
        error: data.message,
        needsReauth: data.needsReauth
      }, { status: data.needsReauth ? 401 : 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      // Include updated token if it was refreshed
      ...(data.accessToken !== accessToken && { newAccessToken: data.accessToken })
    });

  } catch (error) {
    console.error('Google API Error:', error);
    
    const isAuthError = error.code === 401 || error.message.includes('authentication');
    
    return NextResponse.json({
      success: false,
      error: isAuthError ? 'Authentication failed - please reconnect to Google' : 'Failed to fetch Google data',
      needsReauth: isAuthError
    }, { status: isAuthError ? 401 : 500 });
  }
}

export async function POST(request) {
  try {
    const { accessToken, dataType } = await request.json();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 });
    }

    const googleFitService = new GoogleFitService(accessToken);
    let data;

    switch (dataType) {
      case 'steps':
        data = await googleFitService.getTodaysSteps();
        break;
      case 'calories':
        data = await googleFitService.getTodaysCalories();
        break;
      case 'heartRate':
        data = await googleFitService.getHeartRate();
        break;
      case 'activeMinutes':
        data = await googleFitService.getActiveMinutes();
        break;
      default:
        data = await googleFitService.getAllComprehensiveData();
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching specific data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data'
    }, { status: 500 });
  }
}