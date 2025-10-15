"use client"
import React, { useEffect, useState } from "react";
import Sidebar from "../_components/Sidebar";
import ProfileNavbar from "../_components/ProfileNavbar";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Constants
const DAILY_METRICS = [
  { src: "/sleeping.png", title: "Sleep", desc: "8 hrs last night", color: "from-blue-500 to-blue-600" },
  { src: "/feet.png", title: "Steps", desc: "4619 Steps", color: "from-green-500 to-green-600" },
  { src: "/food.png", title: "Food", desc: "150 kCal", color: "from-orange-500 to-orange-600" },
  { src: "/heart.png", title: "Heart", desc: "120/60 BPM", color: "from-red-500 to-red-600" },
];

const FITNESS_ACTIVITIES = [
  { src: "/metabolism.png", title: "Fat Burning", progress: 65, current: 65, target: 100, unit: "%" },
  { src: "/sleeping.png", title: "Sleeping", progress: 65, current: 6.5, target: 8, unit: "hrs" },
  { src: "/cycling.png", title: "Cycling", progress: 80, current: 24, target: 30, unit: "km", timeLeft: "1 Day Left" },
];

// Sub-components
const WelcomeSection = ({ loading, profile }) => (
  <div className="mb-8">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
      Hey, {loading ? "Loading..." : profile?.name || "User"} 👋
    </h1>
    <p className="text-sm md:text-base text-gray-600 mt-2">
      {loading ? "Fetching your details..." : "Here is your daily activity and reports"}
    </p>
  </div>
);

const DailyMetricCard = ({ item }) => (
  <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
    <CardContent className="p-4 md:p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color}`}>
          <Image src={item.src} alt={item.title} width={32} height={32} className="filter brightness-0 invert" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.desc}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const DailyMetricsGrid = () => (
  <section className="mb-8 md:mb-12">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Daily Metrics</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {DAILY_METRICS.map((item, index) => (
        <DailyMetricCard key={index} item={item} />
      ))}
    </div>
  </section>
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
              <span className="text-gray-900">{profile.age}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Gender:</span>
              <span className="text-gray-900 capitalize">{profile.gender}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Height:</span>
              <span className="text-gray-900">{profile.height} cm</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Weight:</span>
              <span className="text-gray-900">{profile.weight} kg</span>
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
        <div>
          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
          <p className="text-sm text-gray-600">
            {activity.current}/{activity.target} {activity.unit}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Progress</span>
          <span className="text-blue-600">{activity.progress}%</span>
        </div>
        <Progress value={activity.progress} className="h-2" />
        
        {activity.timeLeft && (
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-600">
              {activity.current} / {activity.target} {activity.unit}
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

const SleepAnalysisCard = () => (
  <Card className="h-full">
    <CardContent className="p-4 md:p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Sleep Analysis</h3>
        <div className="h-24 flex items-center justify-center">
          <p className="text-gray-500">Sleep quality chart</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MainContentGrid = ({ loading, profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
    {/* Sleep Analysis */}
    <div className="lg:col-span-1">
      <SleepAnalysisCard />
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

const ActivityMetricsGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {FITNESS_ACTIVITIES.map((activity, index) => (
      <ActivityCard key={index} activity={activity} />
    ))}
    
    {/* Empty card for future metrics */}
    <Card className="h-full border-dashed">
      <CardContent className="p-6 flex items-center justify-center h-full">
        <p className="text-gray-400 text-center">Additional metrics</p>
      </CardContent>
    </Card>
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const params = useParams();
  const email = params?.email;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/profile/${email}`);
        const data = await res.json();
        if (data.result) {
          setProfile(data.result);
        }
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    if (email) fetchProfile();
  }, [email]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile menu indicator */}
      <div className="lg:hidden p-4 bg-white border-b">
        <p className="text-sm text-gray-600">Use the menu icon to navigate</p>
      </div>

      {/* Main Content Area */}
      <section className="flex-1 lg:ml-64">
        <ProfileNavbar />
        
        <main className="p-4 md:p-6 lg:p-8">
          <WelcomeSection loading={loading} profile={profile} />
          <DailyMetricsGrid />
          <MainContentGrid loading={loading} profile={profile} />
          <ActivityMetricsGrid />
        </main>
      </section>
    </div>
  );
};

export default Dashboard;