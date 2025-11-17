"use client"
import React, { useEffect, useState } from "react";
import Sidebar from "../_components/Sidebar";
import ProfileNavbar from "../_components/ProfileNavbar";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchGoogleFitData } from '@/utils/googleFitUtils';
import GoogleFitIntegration from '../_components/GoogleFitIntegration';
import { Activity, TrendingUp, RefreshCw } from "lucide-react";

// Constants - Updated to include Google Fit placeholders
const FITNESS_ACTIVITIES = [
  { src: "/metabolism.png", title: "Fat Burning", progress: 65, current: 65, target: 100, unit: "%" },
  { src: "/sleeping.png", title: "Sleeping", progress: 65, current: 6.5, target: 8, unit: "hrs" },
  { src: "/cycling.png", title: "Cycling", progress: 80, current: 24, target: 30, unit: "km", timeLeft: "1 Day Left" },
];

// Sub-components
const WelcomeSection = ({ loading, profile }) => (
  <div className="mb-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Hey, {loading ? "Loading..." : profile?.name || "User"} 👋
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">
          {loading ? "Fetching your details..." : "Here is your daily activity and reports"}
        </p>
      </div>
    </div>
  </div>
);

const DailyMetricsGrid = ({ metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
    {metrics.map((metric, index) => (
      <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4 md:p-6">
          <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10`} />
          <div className="relative flex items-center gap-3 md:gap-4">
            <div className="flex-shrink-0">
              <Image
                src={metric.src}
                width={40}
                height={40}
                alt={metric.title}
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                  {metric.title}
                </h3>
                {metric.source && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    Live
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                {metric.desc}
              </p>
              {metric.source && (
                <p className="text-xs text-blue-600 mt-1">
                  via {metric.source}
                </p>
              )}
              {/* Progress bar for Google Fit data */}
              {metric.progress !== undefined && metric.progress > 0 && (
                <div className="mt-2">
                  <Progress value={metric.progress} className="h-1" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const ProfileCard = ({ loading, profile }) => (
  <Card className="h-full">
    <CardContent className="p-4 md:p-6 text-center">
      <div className="flex flex-col items-center">
        <div className="rounded-full overflow-hidden border-4 border-gray-100 mb-4">
          <Image 
            src={"/user.png"} 
            alt="profile" 
            width={80} 
            height={80} 
            className="object-cover"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {loading ? "Loading..." : profile?.name || "User"}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {loading ? "" : profile?.userType === "trainer" ? "Fitness Trainer" : profile?.userType || "User"}
        </p>
        
        {profile && (
          <div className="space-y-2 text-left w-full">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Email:</span>
              <span className="text-gray-900">{profile.email}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Age:</span>
              <span className="text-gray-900">{profile.age || "--"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Gender:</span>
              <span className="text-gray-900 capitalize">{profile.gender || "--"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Height:</span>
              <span className="text-gray-900">{profile.height ? `${profile.height} cm` : "--"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Weight:</span>
              <span className="text-gray-900">{profile.weight ? `${profile.weight} kg` : "--"}</span>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const ActivityCard = ({ activity }) => (
  <Card className="h-full hover:shadow-lg transition-all duration-300">
    <CardContent className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Image src={activity.src} alt={activity.title} width={24} height={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
            {activity.isLive && (
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {activity.current === "--" ? "--" : `${activity.current}/${activity.target} ${activity.unit}`}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Progress</span>
          <span className="text-blue-600">{activity.progress === 0 ? "--" : `${activity.progress}%`}</span>
        </div>
        {activity.progress > 0 ? (
          <Progress value={activity.progress} className="h-2" />
        ) : (
          <div className="w-full bg-gray-200 h-2 rounded"></div>
        )}
        
        {activity.timeLeft && (
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-600">
              {activity.current === "--" ? "--" : `${activity.current} / ${activity.target} ${activity.unit}`}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {activity.timeLeft}
            </span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const FitnessActivitySection = () => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-xl">Fitness Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-48 flex items-center justify-center">
        <p className="text-gray-500 text-center">
          Activity chart will be displayed here
        </p>
      </div>
    </CardContent>
  </Card>
);

const SleepAnalysisCard = ({ googleFitData }) => (
  <Card className="h-full">
    <CardContent className="p-4 md:p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Sleep Analysis</h3>
        
        {googleFitData?.sleep && googleFitData.sleep.duration > 0 ? (
          <div className="space-y-4">
            <div className="text-3xl font-bold text-indigo-600">
              {googleFitData.sleep.duration}h
            </div>
            <p className="text-sm text-gray-600">Last Night</p>
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-sm font-medium text-indigo-700">
                Quality: {googleFitData.sleep.quality}
              </p>
              {googleFitData.sleep.bedTime && (
                <p className="text-xs text-indigo-600 mt-1">
                  Bedtime: {new Date(googleFitData.sleep.bedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              Google Fit
            </Badge>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center space-y-2">
            <div className="text-3xl font-bold text-gray-400">--</div>
            <p className="text-sm text-gray-500">No sleep data available</p>
            <p className="text-xs text-gray-400 text-center">
              Connect Google Fit to view your sleep analysis
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const MainContentGrid = ({ loading, profile, googleFitData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
    {/* Sleep Analysis with Google Fit data */}
    <div className="lg:col-span-1">
      <SleepAnalysisCard googleFitData={googleFitData} />
    </div>
    
    {/* Fitness Activity */}
    <div className="lg:col-span-1">
      <FitnessActivitySection />
    </div>
    
    {/* Profile Card */}
    <div className="lg:col-span-1">
      <ProfileCard loading={loading} profile={profile} />
    </div>
  </div>
);

const ActivityMetricsGrid = ({ googleFitData }) => {
  // Enhanced fitness activities with Google Fit data
  const getEnhancedActivities = () => {
    let activities = [...FITNESS_ACTIVITIES];
    
    if (googleFitData) {
      // Update or add Google Fit activities
      const stepsActivity = {
        src: "/feet.png",
        title: "Daily Steps",
        progress: googleFitData.steps > 0 ? Math.min((googleFitData.steps / 10000) * 100, 100) : 0,
        current: googleFitData.steps > 0 ? googleFitData.steps.toLocaleString() : "--",
        target: "10,000",
        unit: "steps",
        isLive: googleFitData.steps > 0
      };
      
      const caloriesActivity = {
        src: "/food.png",
        title: "Calories Burned",
        progress: googleFitData.calories > 0 ? Math.min((googleFitData.calories / 2000) * 100, 100) : 0,
        current: googleFitData.calories > 0 ? googleFitData.calories : "--",
        target: "2,000",
        unit: "kcal",
        isLive: googleFitData.calories > 0
      };
      
      // Replace or add activities
      activities = [
        ...activities.slice(0, 1), // Keep Fat Burning
        stepsActivity,
        caloriesActivity,
        ...activities.slice(2) // Keep Cycling
      ];
    } else {
      // Show -- for steps and calories when no Google Fit data
      const stepsActivity = {
        src: "/feet.png",
        title: "Daily Steps",
        progress: 0,
        current: "--",
        target: "10,000",
        unit: "steps",
        isLive: false
      };
      
      const caloriesActivity = {
        src: "/food.png",
        title: "Calories Burned",
        progress: 0,
        current: "--",
        target: "2,000",
        unit: "kcal",
        isLive: false
      };
      
      activities = [
        ...activities.slice(0, 1), // Keep Fat Burning
        stepsActivity,
        caloriesActivity,
        ...activities.slice(2) // Keep Cycling
      ];
    }
    
    return activities;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {getEnhancedActivities().map((activity, index) => (
        <ActivityCard key={index} activity={activity} />
      ))}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const params = useParams();
  const email = params?.email;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleFitData, setGoogleFitData] = useState(null);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);

  const loadGoogleFitData = async () => {
    const isConnected = localStorage.getItem('googleFitConnected') === 'true';
    setGoogleFitConnected(isConnected);
    
    if (isConnected) {
      const fitData = await fetchGoogleFitData();
      if (fitData) {
        setGoogleFitData(fitData);
      }
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const profileRes = await fetch(`/api/profile/${email}`);
        const profileData = await profileRes.json();
        if (profileData.result) {
          setProfile(profileData.result);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (email) {
      fetchProfile();
      loadGoogleFitData();
    }
  }, [email]);

  // Create dynamic DAILY_METRICS based on Google Fit data
  const getDailyMetrics = () => {
    const baseMetrics = [
      { 
        src: "/sleeping.png", 
        title: "Sleep", 
        desc: googleFitData?.sleep?.duration && googleFitData.sleep.duration > 0 
          ? `${googleFitData.sleep.duration}h last night` 
          : "-- hrs last night", 
        color: "from-blue-500 to-blue-600",
        source: googleFitData?.sleep?.duration && googleFitData.sleep.duration > 0 ? "Google Fit" : null
      },
      { 
        src: "/heart.png", 
        title: "Heart Rate", 
        desc: googleFitData?.heartRate?.current && googleFitData.heartRate.current > 0 
          ? `${googleFitData.heartRate.current} BPM` 
          : "-- BPM", 
        color: "from-red-500 to-red-600",
        source: googleFitData?.heartRate?.current && googleFitData.heartRate.current > 0 ? "Google Fit" : null
      },
    ];

    if (googleFitConnected && googleFitData) {
      return [
        ...baseMetrics,
        { 
          src: "/feet.png", 
          title: "Steps", 
          desc: googleFitData.steps > 0 ? `${googleFitData.steps.toLocaleString()} Steps` : "-- Steps", 
          color: "from-green-500 to-green-600",
          source: googleFitData.steps > 0 ? "Google Fit" : null,
          progress: googleFitData.steps > 0 ? Math.min((googleFitData.steps / 10000) * 100, 100) : 0
        },
        { 
          src: "/food.png", 
          title: "Calories", 
          desc: googleFitData.calories > 0 ? `${googleFitData.calories} kCal` : "-- kCal", 
          color: "from-orange-500 to-orange-600",
          source: googleFitData.calories > 0 ? "Google Fit" : null,
          progress: googleFitData.calories > 0 ? Math.min((googleFitData.calories / 2000) * 100, 100) : 0
        },
      ];
    } else {
      return [
        ...baseMetrics,
        { src: "/feet.png", title: "Steps", desc: "-- Steps", color: "from-green-500 to-green-600" },
        { src: "/food.png", title: "Calories", desc: "-- kCal", color: "from-orange-500 to-orange-600" },
      ];
    }
  };

  const refreshGoogleFitData = async () => {
    if (googleFitConnected) {
      const fitData = await fetchGoogleFitData();
      if (fitData) {
        setGoogleFitData(fitData);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="lg:hidden p-4 bg-white border-b">
        <p className="text-sm text-gray-600">Use the menu icon to navigate</p>
      </div>

      <section className="flex-1 lg:ml-64">
        <ProfileNavbar />
        
        <main className="p-4 md:p-6 lg:p-8">
          <WelcomeSection 
            loading={loading} 
            profile={profile}
          />

          {!googleFitConnected && (
            <div className="mb-6" role="alert" aria-live="polite">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-1">Connect Google Fit</h3>
                    <p className="text-sm text-yellow-800">
                      Connect Google Fit to display live steps, calories, heart rate and sleep data on your dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refreshGoogleFitData} title="Refresh Google Fit data">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Updated Daily Metrics with Google Fit data */}
          <DailyMetricsGrid metrics={getDailyMetrics()} />
          
          <MainContentGrid loading={loading} profile={profile} googleFitData={googleFitData} />
          <ActivityMetricsGrid googleFitData={googleFitData} />
        </main>
      </section>
    </div>
  );
};

export default Dashboard;