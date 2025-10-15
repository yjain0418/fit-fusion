"use client";
import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Edit3, 
  Award, 
  Activity, 
  Target, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Cake,
  Ruler,
  Scale,
  Star,
  TrendingUp,
  Dumbbell,
  Heart,
  Clock,
  Flame
} from "lucide-react";
import Sidebar from "../../_components/Sidebar";
import ProfileNavbar from "../../_components/ProfileNavbar";

// Sub-components
const ProfileHeader = ({ ratio, onUpdateClick, userName }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Profile Overview 👤
      </h1>
      <p className="text-lg text-gray-600">
        Welcome back, {userName || "User"}! Here's your fitness journey summary.
      </p>
    </div>
    
    <div className="flex items-center gap-4 mt-4 md:mt-0">
      <div className="text-right">
        <p className="text-sm text-gray-600 mb-1">Profile Completion</p>
        <div className="flex items-center gap-2">
          <Progress value={ratio} className="w-32 h-2" />
          <span className="text-sm font-semibold text-gray-900">{ratio}%</span>
        </div>
      </div>
      <Button 
        onClick={onUpdateClick}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Update Profile
      </Button>
    </div>
  </div>
);

const UserProfileCard = ({ user, onUpdateClick }) => (
  <Card className="h-full">
    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
      <CardTitle className="text-2xl flex items-center gap-2">
        <User className="w-6 h-6" />
        Personal Information
      </CardTitle>
      <CardDescription className="text-blue-100">
        Your basic profile details and health metrics
      </CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      <div className="space-y-6">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-900">{user?.name || "Not set"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Cake className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-semibold text-gray-900">{user?.age || "Not set"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Target className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-semibold text-gray-900 capitalize">{user?.gender || "Not set"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900 text-sm">{user?.email || "Not set"}</p>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Health Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Ruler className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Height</p>
                <p className="font-semibold text-gray-900">
                  {user?.height ? `${user.height} cm` : "Not set"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Scale className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-semibold text-gray-900">
                  {user?.weight ? `${user.weight} kg` : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Contact Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{user?.phone || "Not set"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">{user?.address || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Type Badge */}
        {user?.userType && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Account Type</h4>
                <Badge 
                  variant="secondary" 
                  className={`text-sm py-2 px-4 ${
                    user.userType === "trainer" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.userType === "trainer" ? "🏋️ Fitness Professional" : "👤 General User"}
                </Badge>
              </div>
              {user.userType === "trainer" && user.designation && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{user.designation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const BadgesCard = () => {
  const badges = [
    { name: "First Workout", icon: "🎯", earned: true, color: "bg-blue-100 text-blue-700" },
    { name: "Consistency King", icon: "🔥", earned: true, color: "bg-orange-100 text-orange-700" },
    { name: "Nutrition Master", icon: "🥗", earned: false, color: "bg-gray-100 text-gray-500" },
    { name: "Marathon Runner", icon: "🏃", earned: false, color: "bg-gray-100 text-gray-500" },
    { name: "Early Riser", icon: "🌅", earned: true, color: "bg-yellow-100 text-yellow-700" },
    { name: "Goal Crusher", icon: "🎯", earned: true, color: "bg-green-100 text-green-700" },
  ];

  const earnedCount = badges.filter(badge => badge.earned).length;
  const totalCount = badges.length;

  return (
    <Card className="">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-yellow-600" />
          Achievements
        </CardTitle>
        <CardDescription>
          {earnedCount}/{totalCount} badges unlocked
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                badge.earned 
                  ? `${badge.color} border-transparent shadow-sm` 
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <span className={`text-xs font-medium text-center leading-tight ${
                badge.earned ? '' : 'text-gray-400'
              }`}>
                {badge.name}
              </span>
            </div>
          ))}
        </div>
        
        <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Great Progress!</p>
              <p className="text-xs text-yellow-700">Complete 2 more to reach expert level</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WorkoutDataCard = () => {
  const stats = [
    { label: "Workouts", value: "5", change: "+2", positive: true, icon: Dumbbell, color: "text-blue-600" },
    { label: "Active Minutes", value: "240", change: "+45", positive: true, icon: Clock, color: "text-green-600" },
    { label: "Calories", value: "1.2k", change: "+320", positive: true, icon: Flame, color: "text-orange-600" },
    { label: "Current Streak", value: "7", change: "+3", positive: true, icon: Heart, color: "text-red-600" },
  ];

  return (
    <Card className="">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-green-600" />
          Fitness Stats
        </CardTitle>
        <CardDescription>
          This week's performance
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <div className={`flex items-center justify-center gap-1 text-xs ${
                stat.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
              <span className="text-sm text-gray-600">80%</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Monthly Challenge</span>
              <span className="text-sm text-gray-600">12/20</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Next Workout</p>
              <p className="text-xs text-green-700">Tomorrow • 7:00 AM • Cardio</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main ProfilePage Component
const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const path = usePathname();
  const email = path.split("/")[2];

  useEffect(() => {
    if (!email) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profile/${email}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data.result);
        } else {
          console.error("Failed to fetch user data");
          setUserData({});
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setUserData({});
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  const profileCompletionRatio = useMemo(() => {
    if (!userData) return 0;

    const fieldsToCount = Object.keys(userData).filter(
      (key) => key !== "userType" && key !== "coins" && key !== "_id"
    );
    
    const totalValues = fieldsToCount.length;
    if (totalValues === 0) return 0;

    let filledCount = 0;
    for (const key of fieldsToCount) {
      if (userData[key] && userData[key] !== 0) {
        filledCount++;
      }
    }

    const ratio = (filledCount / totalValues) * 100;
    return parseFloat(ratio.toFixed(2));
  }, [userData]);

  const handleUpdateProfileClick = () => {
    router.push(`/dashboard/${email}/profile/updateprofile`);
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <section className="flex-1 lg:ml-64">
          <ProfileNavbar />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <section className="flex-1 lg:ml-64">
        {/* <ProfileNavbar /> */}
        
        <main className="p-4 md:p-6 lg:p-8">
          <ProfileHeader 
            ratio={profileCompletionRatio}
            onUpdateClick={handleUpdateProfileClick}
            userName={userData?.name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Card - Takes 2 columns */}
            <div className="lg:col-span-2">
              <UserProfileCard
                user={userData}
                onUpdateClick={handleUpdateProfileClick}
              />
            </div>
            
            {/* Sidebar Cards - Takes 1 column */}
            <div className="space-y-6">
              <BadgesCard />
              <WorkoutDataCard />
            </div>
          </div>
        </main>
      </section>
    </div>
  );
};

export default ProfilePage;