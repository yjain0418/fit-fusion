"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Heart, 
  Footprints, 
  Flame, 
  Clock, 
  RefreshCw,
  Link,
  Unlink,
  AlertCircle,
  Moon,
  Scale,
  Apple,
  MapPin,
  TrendingUp,
  CheckCircle,
  User,
  Ruler
} from "lucide-react";

const GoogleFitIntegration = ({ userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [fitData, setFitData] = useState({
    activity: {
      steps: 0,
      distance: 0,
      activeMinutes: 0,
      caloriesBurned: 0
    },
    heartRate: { current: 0, average: 0, max: 0, min: 0 },
    nutrition: {
      caloriesConsumed: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    body: {
      weight: 0,
      height: 0,
      bodyFat: 0,
      bmi: 0
    },
    lastUpdated: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Check if user is already connected to Google
    const savedToken = localStorage.getItem('googleFitToken');
    const savedConnection = localStorage.getItem('googleFitConnected');
    
    if (savedToken && savedConnection === 'true') {
      setAccessToken(savedToken);
      setIsConnected(true);
      // Auto-fetch data on load
      fetchFitData(savedToken);
    }

    // Check for auth errors
    const authError = localStorage.getItem('googleFitError');
    if (authError === 'reconnect_needed' || authError === 'auth_expired') {
      setError('Your connection has expired. Please reconnect to continue seeing live data.');
      localStorage.removeItem('googleFitError');
    }
  }, []);

  const connectToGoogleFit = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        setError('Integration is not configured. Please contact support.');
        return;
      }

      const scopes = [
        'openid',
        'email', 
        'profile',
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.sleep.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.nutrition.read',
        'https://www.googleapis.com/auth/fitness.body.read'
      ].join(' ');

      const redirectUri = `${window.location.origin}/api/auth/google-fit/callback`;
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${Date.now()}`;

      const popup = window.open(
        authUrl, 
        'googleFitAuth', 
        'width=500,height=700,scrollbars=yes,resizable=yes,left=' + 
        (window.screen.width / 2 - 250) + ',top=' + 
        (window.screen.height / 2 - 350)
      );
      
      if (!popup) {
        setError('Popup blocked. Please allow popups for this site.');
        return;
      }

      let checkCount = 0;
      const maxChecks = 300; // 5 minutes

      const checkClosed = setInterval(() => {
        checkCount++;
        
        if (popup.closed || checkCount >= maxChecks) {
          clearInterval(checkClosed);
          
          if (checkCount >= maxChecks) {
            popup.close();
            setError('Authentication timed out. Please try again.');
            setIsConnecting(false);
            return;
          }

          // Check if authentication was successful
          setTimeout(() => {
            const token = localStorage.getItem('googleFitToken');
            const connected = localStorage.getItem('googleFitConnected');
            const error = localStorage.getItem('googleFitError');
            
            if (error) {
              localStorage.removeItem('googleFitError');
              if (error.includes('access_denied')) {
                setError('Access denied. This app is in testing mode. Please contact the developer to add you as a test user.');
              } else if (error.includes('403')) {
                setError('Your email is not approved for testing. Please contact the developer.');
              } else {
                setError(`Authentication failed: ${error}`);
              }
            } else if (token && connected === 'true') {
              setAccessToken(token);
              setIsConnected(true);
              fetchFitData(token);
              setError(null);
            } else {
              setError('Authentication was cancelled. Please try again.');
            }
            setIsConnecting(false);
          }, 500);
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting to Google:', error);
      setError('Failed to connect to Google. Please try again.');
      setIsConnecting(false);
    }
  };

  const disconnectFromGoogleFit = () => {
    setIsConnected(false);
    setAccessToken(null);
    setFitData({
      activity: {
        steps: 0,
        distance: 0,
        activeMinutes: 0,
        caloriesBurned: 0
      },
      heartRate: { current: 0, average: 0, max: 0, min: 0 },
      nutrition: {
        caloriesConsumed: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      body: {
        weight: 0,
        height: 0,
        bodyFat: 0,
        bmi: 0
      },
      lastUpdated: null
    });
    localStorage.removeItem('googleFitToken');
    localStorage.removeItem('googleFitConnected');
    localStorage.removeItem('googleFitLastFetch');
    localStorage.removeItem('googleFitRefreshToken');
  };

  const fetchFitData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const refreshToken = localStorage.getItem('googleFitRefreshToken');
      const params = new URLSearchParams({ accessToken: token });
      if (refreshToken) {
        params.append('refreshToken', refreshToken);
      }

      const response = await fetch(`/api/google-fit?${params}`);
      const result = await response.json();

      if (result.success && result.data) {
        // Update token if it was refreshed
        if (result.newAccessToken) {
          setAccessToken(result.newAccessToken);
          localStorage.setItem('googleFitToken', result.newAccessToken);
        }

        setFitData(prevData => ({
          ...prevData,
          activity: {
            steps: result.data.activity?.steps || 0,
            distance: result.data.activity?.distance || 0,
            activeMinutes: result.data.activity?.activeMinutes || 0,
            caloriesBurned: result.data.activity?.caloriesBurned || 0
          },
          heartRate: {
            current: result.data.heartRate?.current || 0,
            average: result.data.heartRate?.average || 0,
            max: result.data.heartRate?.max || 0,
            min: result.data.heartRate?.min || 0
          },
          body: {
            weight: result.data.body?.weight || 0,
            height: result.data.body?.height || 0,
            bodyFat: result.data.body?.bodyFat || 0,
            bmi: result.data.body?.bmi || 0
          },
          lastUpdated: result.data.lastUpdated || new Date().toISOString()
        }));

        localStorage.setItem('googleFitLastFetch', Date.now().toString());
      } else {
        if (result.needsReauth) {
          // Token expired, disconnect user
          disconnectFromGoogleFit();
          setError('Your connection has expired. Please reconnect to continue seeing live data.');
        } else {
          setError(result.error || 'Failed to fetch fitness data');
        }
      }
    } catch (error) {
      console.error('Error fetching fit data:', error);
      setError('Failed to fetch fitness data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (accessToken) {
      fetchFitData(accessToken);
    }
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getBMICategory = (bmi) => {
    if (!bmi || bmi === 0) return { category: 'N/A', color: 'text-gray-600' };
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  // Helper function to format numeric values safely
  const formatValue = (value, unit = '', defaultValue = '--') => {
    if (value === null || value === undefined || value === 0) {
      return defaultValue;
    }
    return `${value}${unit}`;
  };

  return (
    <div className="space-y-6">
      {/* Integration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Integration</h3>
                <p className="text-sm text-gray-600">Connect your google account for real-time health data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isConnected ? "default" : "secondary"}
                className={isConnected ? "bg-green-100 text-green-800" : ""}
              >
                {isConnected ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  "Not Connected"
                )}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Connect to Google for Better Insights
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Sync your health data to get personalized workout recommendations and track your progress more accurately.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={connectToGoogleFit} 
                    disabled={isConnecting}
                    size="lg"
                    className="w-full"
                  >
                    <Link className="w-5 h-5 mr-2" />
                    {isConnecting ? 'Connecting...' : 'Connect Google Account'}
                  </Button>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Benefits List */}
                <div className="mt-8 text-left">
                  <h5 className="font-medium text-gray-900 mb-3">What you'll get:</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-blue-500" />
                      <span>Real-time steps and distance tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Heart rate monitoring and trends</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Accurate calorie burn tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-purple-500" />
                      <span>Body metrics and BMI tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status and Controls */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Google Account Connected</p>
                    <p className="text-xs text-green-600">
                      Last updated: {formatLastUpdated(fitData.lastUpdated)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={refreshData}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-200 hover:bg-green-100"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={disconnectFromGoogleFit}
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Unlink className="w-4 h-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Quick Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Footprints className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {fitData.activity.steps?.toLocaleString() || '--'}
                  </p>
                  <p className="text-xs text-blue-600">Steps Today</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <Flame className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {fitData.activity.caloriesBurned || '--'}
                  </p>
                  <p className="text-xs text-orange-600">Calories Burned</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {fitData.heartRate.current || fitData.heartRate.average || '--'}
                  </p>
                  <p className="text-xs text-red-600">Heart Rate (BPM)</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <Scale className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-indigo-600">
                    {fitData.body.bmi || '--'}
                  </p>
                  <p className="text-xs text-indigo-600">BMI</p>
                </div>
              </div>

              {/* Detailed Data Tabs */}
              <Tabs defaultValue="activity" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="heart">Heart Rate</TabsTrigger>
                  <TabsTrigger value="body">Body Metrics</TabsTrigger>
                </TabsList>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Steps</p>
                            <p className="text-xl font-bold text-blue-600">
                              {fitData.activity.steps?.toLocaleString() || '--'}
                            </p>
                            <p className="text-xs text-gray-500">Goal: 10,000</p>
                          </div>
                          <Footprints className="w-6 h-6 text-blue-600" />
                        </div>
                        {fitData.activity.steps > 0 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((fitData.activity.steps / 10000) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Distance</p>
                            <p className="text-xl font-bold text-purple-600">
                              {fitData.activity.distance ? `${fitData.activity.distance} km` : '--'}
                            </p>
                            <p className="text-xs text-gray-500">Today</p>
                          </div>
                          <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                            <p className="text-xl font-bold text-orange-600">
                              {fitData.activity.caloriesBurned || '--'}
                            </p>
                            <p className="text-xs text-gray-500">kcal</p>
                          </div>
                          <Flame className="w-6 h-6 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Minutes</p>
                            <p className="text-xl font-bold text-green-600">
                              {fitData.activity.activeMinutes || '--'}
                            </p>
                            <p className="text-xs text-gray-500">Goal: 30 min</p>
                          </div>
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        {fitData.activity.activeMinutes > 0 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((fitData.activity.activeMinutes / 30) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Heart Rate Tab */}
                <TabsContent value="heart" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Current/Latest</p>
                            <p className="text-2xl font-bold text-red-600">
                              {fitData.heartRate.current || '--'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">BPM</p>
                          </div>
                          <Heart className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Average</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {fitData.heartRate.average || '--'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">BPM</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {(!fitData.heartRate.current && !fitData.heartRate.average) && (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No heart rate data available</p>
                      <p className="text-sm">Make sure your fitness tracker is connected and synced with Google</p>
                    </div>
                  )}
                </TabsContent>

                {/* Body Metrics Tab */}
                <TabsContent value="body" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Weight</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {fitData.body.weight ? `${fitData.body.weight} kg` : '--'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Most Recent</p>
                          </div>
                          <Scale className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Height</p>
                            <p className="text-2xl font-bold text-green-600">
                              {fitData.body.height ? `${fitData.body.height} m` : '--'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Profile Data</p>
                          </div>
                          <Ruler className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">BMI</p>
                            <p className={`text-2xl font-bold ${getBMICategory(fitData.body.bmi).color}`}>
                              {fitData.body.bmi || '--'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getBMICategory(fitData.body.bmi).category}
                            </p>
                          </div>
                          <User className="w-8 h-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Body Fat</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {fitData.body.bodyFat ? `${fitData.body.bodyFat}%` : '--'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Percentage</p>
                          </div>
                          <Activity className="w-8 h-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* BMI Chart/Guide */}
                  {fitData.body.bmi > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">BMI Guidelines</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 px-3 rounded bg-blue-50">
                            <span className="text-sm">Underweight</span>
                            <span className="text-sm text-blue-600">{"< 18.5"}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 px-3 rounded bg-green-50">
                            <span className="text-sm">Normal weight</span>
                            <span className="text-sm text-green-600">18.5 - 24.9</span>
                          </div>
                          <div className="flex justify-between items-center py-2 px-3 rounded bg-orange-50">
                            <span className="text-sm">Overweight</span>
                            <span className="text-sm text-orange-600">25 - 29.9</span>
                          </div>
                          <div className="flex justify-between items-center py-2 px-3 rounded bg-red-50">
                            <span className="text-sm">Obese</span>
                            <span className="text-sm text-red-600">{"≥ 30"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(!fitData.body.weight && !fitData.body.height && !fitData.body.bmi && !fitData.body.bodyFat) && (
                    <div className="text-center py-8 text-gray-500">
                      <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No body metrics data available</p>
                      <p className="text-sm">Connect a smart scale or manually log your data in Google to see body metrics here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleFitIntegration;