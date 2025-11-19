export const fetchGoogleFitData = async () => {
  const token = localStorage.getItem('googleFitToken');
  const refreshToken = localStorage.getItem('googleFitRefreshToken');
  const isConnected = localStorage.getItem('googleFitConnected') === 'true';
  
  if (!token || !isConnected) {
    return null;
  }

  try {
    const params = new URLSearchParams({ accessToken: token });
    if (refreshToken) {
      params.append('refreshToken', refreshToken);
    }

    const response = await fetch(`/api/google-fit?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!result.success) {
      if (result.needsReauth) {
        // Clear tokens and show reconnection needed
        localStorage.removeItem('googleFitToken');
        localStorage.removeItem('googleFitRefreshToken');
        localStorage.removeItem('googleFitConnected');
        localStorage.setItem('googleFitError', 'reconnect_needed');
        console.log('Google authentication expired - reconnection needed');
        return null;
      }
      throw new Error(result.error || 'Failed to fetch data');
    }

    // Update token if it was refreshed
    if (result.newAccessToken) {
      localStorage.setItem('googleFitToken', result.newAccessToken);
      console.log('Google token refreshed successfully');
    }

    if (result.data && result.data.activity) {
      return {
        steps: result.data.activity.steps || 0,
        calories: result.data.activity.caloriesBurned || 0,
        distance: result.data.activity.distance || 0,
        activeMinutes: result.data.activity.activeMinutes || 0,
        heartRate: result.data.heartRate || { current: 0, average: 0 },
        sleep: result.data.sleep || {duration: 0, quality: 'No data', bedTime: null, wakeTime: null},
        sleepHistory: result.data.sleepHistory || [],
        fatBurning: result.data.body.bodyFat || 0,
        lastUpdated: result.data.lastUpdated || new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Check if it's an auth error
    if (error.message.includes('Authentication') || error.message.includes('401')) {
      localStorage.setItem('googleFitError', 'auth_expired');
    }
    
    return null;
  }
};

// Helper function to check if Google is connected
export const isGoogleFitConnected = () => {
  return localStorage.getItem('googleFitConnected') === 'true';
};

// Helper function to get stored Google token
export const getGoogleFitToken = () => {
  return localStorage.getItem('googleFitToken');
};

// Helper function to disconnect Google
export const disconnectGoogleFit = () => {
  localStorage.removeItem('googleFitToken');
  localStorage.removeItem('googleFitRefreshToken');
  localStorage.removeItem('googleFitConnected');
  localStorage.removeItem('googleFitConnectedAt');
  localStorage.removeItem('googleFitLastFetch');
  localStorage.removeItem('googleFitError');
};

// Check for auth errors and show reconnection message
export const checkGoogleFitAuthStatus = () => {
  const error = localStorage.getItem('googleFitError');
  
  if (error === 'reconnect_needed' || error === 'auth_expired') {
    localStorage.removeItem('googleFitError');
    return {
      needsReconnect: true,
      message: 'Your Google connection has expired. Please reconnect to continue seeing live data.'
    };
  }
  
  return { needsReconnect: false };
};

// Format fitness data for display
export const formatFitnessData = (data) => {
  if (!data) return null;

  return {
    steps: {
      value: data.steps.toLocaleString(),
      label: 'Steps Today',
      progress: Math.min((data.steps / 10000) * 100, 100) // 10k steps goal
    },
    calories: {
      value: data.calories,
      label: 'Calories Burned',
      progress: Math.min((data.calories / 2000) * 100, 100) // 2000 cal goal
    },
    distance: {
      value: `${data.distance} km`,
      label: 'Distance',
      progress: Math.min((parseFloat(data.distance) / 10) * 100, 100) // 10km goal
    },
    activeMinutes: {
      value: `${data.activeMinutes} min`,
      label: 'Active Minutes',
      progress: Math.min((data.activeMinutes / 30) * 100, 100) // 30 min goal
    },
    fatBurning: {
      value: `${data.fatBurning} %`,
      label: 'Body Fat Percentage',
      progress: Math.min((data.fatBurning / 100) * 100, 100) // 100% body fat goal
    },
  };
};