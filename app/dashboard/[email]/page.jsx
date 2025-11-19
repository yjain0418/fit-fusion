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
import { Activity, TrendingUp, RefreshCw } from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Constants - Updated to include placeholders
// const FITNESS_ACTIVITIES = [
//   // { src: "/metabolism.png", title: "Fat Burning", progress: 65, current: 65, target: 100, unit: "%" },
//   { src: "/sleeping.png", title: "Sleeping", progress: 65, current: 6.5, target: 8, unit: "hrs" },
//   { src: "/cycling.png", title: "Cycling", progress: 80, current: 24, target: 30, unit: "km", isLive: true },
// ];

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
                </p>
              )}
              {/* Progress bar*/}
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

// const ProfileCard = ({ loading, profile }) => (
//   <Card className="h-full">
//     <CardContent className="p-4 md:p-6 text-center">
//       <div className="flex flex-col items-center">
//         <div className="rounded-full overflow-hidden border-4 border-gray-100 mb-4">
//           <Image 
//             src={"/user.png"} 
//             alt="profile" 
//             width={80} 
//             height={80} 
//             className="object-cover"
//           />
//         </div>
//         <h2 className="text-xl font-bold text-gray-900">
//           {loading ? "Loading..." : profile?.name || "User"}
//         </h2>
//         <p className="text-sm text-gray-600 mb-4">
//           {loading ? "" : profile?.userType === "trainer" ? "Fitness Trainer" : profile?.userType || "User"}
//         </p>
        
//         {profile && (
//           <div className="space-y-2 text-left w-full">
//             <div className="flex justify-between text-xs">
//               <span className="text-gray-500">Email:</span>
//               <span className="text-gray-900">{profile.email}</span>
//             </div>
//             <div className="flex justify-between text-xs">
//               <span className="text-gray-500">Age:</span>
//               <span className="text-gray-900">{profile.age || "--"}</span>
//             </div>
//             <div className="flex justify-between text-xs">
//               <span className="text-gray-500">Gender:</span>
//               <span className="text-gray-900 capitalize">{profile.gender || "--"}</span>
//             </div>
//             <div className="flex justify-between text-xs">
//               <span className="text-gray-500">Height:</span>
//               <span className="text-gray-900">{profile.height ? `${profile.height} cm` : "--"}</span>
//             </div>
//             <div className="flex justify-between text-xs">
//               <span className="text-gray-500">Weight:</span>
//               <span className="text-gray-900">{profile.weight ? `${profile.weight} kg` : "--"}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </CardContent>
//   </Card>
// );

const HealthScoreCard = ({ googleFitData, profile }) => {
  const calculateHealthScore = () => {
    let score = 0;
    let maxScore = 0;

    // Sleep score (0-25 points)
    if (googleFitData?.sleepHistory && googleFitData.sleepHistory.length > 0) {
      const latestSleep = googleFitData.sleepHistory.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )[0];
      if (latestSleep.durationHours >= 7) score += 25;
      else if (latestSleep.durationHours >= 5) score += 15;
      else score += 5;
    }
    maxScore += 25;

    // Steps score (0-25 points)
    if (googleFitData?.steps) {
      const stepsRatio = Math.min(googleFitData.steps / 10000, 1);
      score += stepsRatio * 25;
    }
    maxScore += 25;

    // Calories score (0-25 points)
    if (googleFitData?.calories) {
      const caloriesRatio = Math.min(googleFitData.calories / 2000, 1);
      score += caloriesRatio * 25;
    }
    maxScore += 25;

    // Heart rate score (0-25 points)
    if (googleFitData?.heartRate?.current > 0) {
      const hr = googleFitData.heartRate.current;
      if (hr >= 60 && hr <= 100) score += 25;
      else if (hr >= 50 && hr <= 110) score += 15;
      else score += 5;
    }
    maxScore += 25;

    return Math.round((score / maxScore) * 100) || 0;
  };

  const healthScore = calculateHealthScore();
  
  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Good' };
    if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Fair' };
    return { bg: 'bg-red-500', text: 'text-red-600', label: 'Needs Attention' };
  };

  const scoreColor = getScoreColor(healthScore);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Health Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {/* Circular Progress */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - healthScore / 100)}`}
              className={scoreColor.text}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900">{healthScore}</span>
            <span className="text-sm text-gray-500">out of 100</span>
          </div>
        </div>

        {/* Status Badge */}
        <Badge className={`${scoreColor.bg} text-white`}>
          {scoreColor.label}
        </Badge>

        {/* Breakdown */}
        <div className="w-full space-y-2 pt-4 border-t">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Sleep Quality</span>
            <span className="font-medium">
              {googleFitData?.sleepHistory?.[0]?.durationHours || 0}h
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Daily Steps</span>
            <span className="font-medium">
              {googleFitData?.steps?.toLocaleString() || '--'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Calories Burned</span>
            <span className="font-medium">
              {googleFitData?.calories || '--'} kcal
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Heart Rate</span>
            <span className="font-medium">
              {googleFitData?.heartRate?.current || '--'} BPM
            </span>
          </div>
        </div>

        {/* Profile Link */}
        <Button variant="outline" size="sm" className="w-full mt-4">
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  );
};

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

const FitnessActivitySection = ({ googleFitData }) => {
  // Prepare hardcoded activity data for demonstration
  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Steps',
        data: [8500, 9200, 7800, 10500, 9800, 11200, 8900],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Calories',
        data: [420, 485, 390, 520, 490, 560, 445],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ]
  };

  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === 'Steps') {
                label += context.parsed.y.toLocaleString() + ' steps';
              } else {
                label += context.parsed.y + ' kcal';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
          color: '#6b7280',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Steps',
          color: 'rgb(34, 197, 94)',
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return value + ' kcal';
          },
          color: '#6b7280',
          font: {
            size: 10
          }
        },
        title: {
          display: true,
          text: 'Calories',
          color: 'rgb(249, 115, 22)',
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 10
          }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  // Weekly summary stats
  const weeklyStats = {
    totalSteps: 65900,
    avgSteps: 9414,
    totalCalories: 3310,
    avgCalories: 473
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Weekly Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="h-48">
          <Line data={activityData} options={activityOptions} />
        </div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-xs text-green-600 font-medium">Total Steps</p>
            <p className="text-lg font-bold text-green-700">{weeklyStats.totalSteps.toLocaleString()}</p>
            <p className="text-xs text-green-600">Avg: {weeklyStats.avgSteps.toLocaleString()}/day</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-2">
            <p className="text-xs text-orange-600 font-medium">Total Calories</p>
            <p className="text-lg font-bold text-orange-700">{weeklyStats.totalCalories.toLocaleString()}</p>
            <p className="text-xs text-orange-600">Avg: {weeklyStats.avgCalories}/day</p>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">
            Great week! Keep it up! 🎯
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const SleepAnalysisCard = ({ googleFitData }) => {
  // Get the latest sleep data from sleepHistory
  const getLatestSleep = () => {
    if (!googleFitData?.sleepHistory || googleFitData.sleepHistory.length === 0) {
      return null;
    }
    
    // Find the most recent entry with actual sleep data
    const sortedHistory = [...googleFitData.sleepHistory].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return sortedHistory.find(entry => entry.durationHours > 0) || null;
  };

  const latestSleep = getLatestSleep();
  const sleepHistory = googleFitData?.sleepHistory || [];

  // Prepare data for line chart
  const chartData = {
    labels: sleepHistory.map(day => 
      new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Sleep Duration (hours)',
        data: sleepHistory.map(day => day.durationHours),
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return gradient;
        },
        borderColor: 'rgb(99, 102, 241)',
        pointBackgroundColor: sleepHistory.map(day => {
          if (day.durationHours === 0) return 'rgb(209, 213, 219)';
          if (day.durationHours >= 7) return 'rgb(34, 197, 94)';
          if (day.durationHours >= 5) return 'rgb(234, 179, 8)';
          return 'rgb(248, 113, 113)';
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const hours = context.parsed.y;
            const quality = sleepHistory[context.dataIndex].quality;
            return [
              `Duration: ${hours}h`,
              `Quality: ${quality}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
          callback: function(value) {
            return value + 'h';
          },
          color: '#6b7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 10
          },
          maxRotation: 0,
          minRotation: 0
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 md:p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Sleep Analysis</h3>
          
          {latestSleep ? (
            <div className="space-y-4">
              {/* Line Chart */}
              {sleepHistory.length > 0 && (
                <div className="mt-4">
                  <div className="h-48 mb-3">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                  
                  {/* Legend */}
                  <div className="flex justify-center gap-4 text-xs border-t pt-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Good (7+h)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-600">Fair (5-7h)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <span className="text-gray-600">Poor (&lt;5h)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Sleep Summary */}
              <div className="bg-indigo-50 rounded-lg p-3 text-left">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Last Night</p>
                    <p className="text-xs text-indigo-600">
                      {new Date(latestSleep.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{latestSleep.durationHours}h</p>
                    <p className="text-xs text-indigo-700 font-medium">{latestSleep.quality}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-indigo-200">
                  {latestSleep.bedTime && (
                    <div>
                      <p className="text-xs text-indigo-600">Bedtime</p>
                      <p className="text-xs font-semibold text-indigo-900">
                        {new Date(latestSleep.bedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  {latestSleep.wakeTime && (
                    <div>
                      <p className="text-xs text-indigo-600">Wake</p>
                      <p className="text-xs font-semibold text-indigo-900">
                        {new Date(latestSleep.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center space-y-2">
              <div className="text-3xl font-bold text-gray-400">--</div>
              <p className="text-sm text-gray-500">No sleep data available</p>
              <p className="text-xs text-gray-400 text-center">
                Connect google to view your sleep analysis
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MainContentGrid = ({ loading, profile, googleFitData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
    {/* Sleep Analysis */}
    <div className="lg:col-span-1">
      <SleepAnalysisCard googleFitData={googleFitData} />
    </div>
    
    {/* Fitness Activity */}
    <div className="lg:col-span-1">
      <FitnessActivitySection />
    </div>
    
    {/* Profile Card */}
    <div className="lg:col-span-1">
      <HealthScoreCard googleFitData={googleFitData} profile={profile} />
    </div>
  </div>
);

const ActivityMetricsGrid = ({ googleFitData }) => {
  // Enhanced fitness activities with google data
  const getEnhancedActivities = () => {
    // let activities = [...FITNESS_ACTIVITIES];
    let activities;
    
    if (googleFitData) {
      // Update or add google activities
      const stepsActivity = {
        src: "/feet.png",
        title: "Daily Steps",
        progress: googleFitData?.steps > 0 ? Math.round(Math.min((googleFitData.steps / 10000) * 100, 100) * 100) / 100 : 0,
        current: googleFitData?.steps > 0 ? googleFitData.steps.toLocaleString() : "--",
        target: "10,000",
        unit: "steps",
        isLive: googleFitData?.steps > 0
      };
      
      const caloriesActivity = {
        src: "/food.png",
        title: "Calories Burned",
        progress: googleFitData?.calories > 0 ? Math.round(Math.min((googleFitData.calories / 2000) * 100, 100) * 100) / 100 : 0,
        current: googleFitData?.calories > 0 ? googleFitData.calories : "--",
        target: "2,000",
        unit: "kcal",
        isLive: googleFitData?.calories > 0
      };

      const fatBurning = {
        src: "/metabolism.png",
        title: "Body Fat",
        progress: googleFitData?.fatBurning > 0 ? Math.round(Math.min((googleFitData.fatBurning/ 100) * 100, 100) * 100) / 100 : 0,
        current: googleFitData?.fatBurning > 0 ? googleFitData.fatBurning: "--",
        target: "100",
        unit: "%",
        isLive: googleFitData?.fatBurning > 0
      };

      const sleeping = {
        src: "/sleeping.png",
        title: "Sleeping",
        progress: googleFitData?.sleep?.duration > 0 ? Math.round(Math.min((googleFitData.sleep.duration/ 8) * 100, 100) * 100) / 100 : 0,
        current: googleFitData?.sleep?.duration > 0 ? googleFitData.sleep.duration: "--",
        target: "8",
        unit: "hrs",
        isLive: googleFitData?.sleep?.duration > 0
      };
      
      // Replace or add activities
      activities = [
        fatBurning,
        stepsActivity,
        caloriesActivity,
        sleeping
      ];
    } else {
      // Show -- for steps and calories when no data
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

      const fatBurning = {
        src: "/metabolism.png",
        title: "Body Fat",
        progress: 0,
        current: "--",
        target: "100",
        unit: "%",
        isLive: false
      };

      const sleeping = {
        src: "/sleeping.png",
        title: "Sleeping",
        progress: 0,
        current: "--",
        target: "8",
        unit: "hrs",
        isLive: false
      };
      
      activities = [
        fatBurning,
        stepsActivity,
        caloriesActivity,
        sleeping
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

  // Create dynamic DAILY_METRICS based on data
  const getDailyMetrics = () => {
    // Get latest sleep data from sleepHistory
    const getLatestSleepDuration = () => {
      if (!googleFitData?.sleepHistory || googleFitData.sleepHistory.length === 0) {
        return null;
      }
      const sortedHistory = [...googleFitData.sleepHistory].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      const latestSleep = sortedHistory.find(entry => entry.durationHours > 0);
      return latestSleep ? latestSleep.durationHours : null;
    };

    const sleepDuration = getLatestSleepDuration();

    // const baseMetrics = [
    //   { 
    //     src: "/sleeping.png", 
    //     title: "Sleep", 
    //     desc: sleepDuration 
    //       ? `${sleepDuration}h last night` 
    //       : "-- hrs last night", 
    //     color: "from-blue-500 to-blue-600",
    //   }
    // ];

    if (googleFitConnected && googleFitData) {
      return [
        { 
          src: "/sleeping.png", 
          title: "Sleep", 
          desc: sleepDuration 
            ? `${sleepDuration}h last night` 
            : "-- hrs last night", 
          color: "from-blue-500 to-blue-600",
          // source: sleepDuration ? "Google Fit" : null
        },
        { 
          src: "/heart.png", 
          title: "Heart Rate", 
          desc: googleFitData?.heartRate?.current && googleFitData.heartRate.current > 0 
            ? `${googleFitData.heartRate.current} BPM` 
            : "-- BPM", 
          color: "from-red-500 to-red-600",
          // source: googleFitData?.heartRate?.current && googleFitData.heartRate.current > 0 ? "Google Fit" : null
        },
        { 
          src: "/feet.png", 
          title: "Steps", 
          desc: googleFitData?.steps > 0 ? `${googleFitData.steps.toLocaleString()} Steps` : "-- Steps", 
          color: "from-green-500 to-green-600",
          // source: googleFitData?.steps > 0 ? "Google Fit" : null,
          // progress: googleFitData?.steps > 0 ? Math.min((googleFitData.steps / 10000) * 100, 100) : 0
        },
        { 
          src: "/food.png", 
          title: "Calories", 
          desc: googleFitData?.calories > 0 ? `${googleFitData.calories} kCal` : "-- kCal", 
          color: "from-orange-500 to-orange-600",
          // source: googleFitData?.calories > 0 ? "Google Fit" : null,
          // progress: googleFitData?.calories > 0 ? Math.min((googleFitData.calories / 2000) * 100, 100) : 0
        },
      ];
    } else {
      return [
        { src: "/sleeping.png", title: "Sleep", desc: "-- hrs last night", color: "from-blue-500 to-blue-600" },
        { src: "/heart.png", title: "Heart Rate", desc: "-- BPM", color: "from-red-500 to-red-600" },
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
                    <h3 className="text-lg font-semibold text-yellow-900 mb-1">Connect to Google</h3>
                    <p className="text-sm text-yellow-800">
                      Connect Google to display live steps, calories, heart rate and sleep data on your dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refreshGoogleFitData} title="Refresh data">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Updated Daily Metrics*/}
          <DailyMetricsGrid metrics={getDailyMetrics()} />
          
          <MainContentGrid loading={loading} profile={profile} googleFitData={googleFitData} />
          <ActivityMetricsGrid googleFitData={googleFitData} />
        </main>
      </section>
    </div>
  );
};

export default Dashboard;