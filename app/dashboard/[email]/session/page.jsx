"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../_components/Sidebar";
import ProfileNavbar from "../../_components/ProfileNavbar";
import WorkoutSession from "../../_components/WorkoutSession";
import { fetchExercises } from "@/app/api/exercise/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  TrendingUp,
  History,
  Timer,
  Zap,
  Plus,
  Play,
  Edit,
  Trash2,
  Save,
  Clock,
  Target,
  Dumbbell,
  MoreVertical,
  Eye,
  X,
} from "lucide-react";

const WorkoutSessionPage = () => {
  const params = useParams();
  const email = params?.email ? decodeURIComponent(params.email) : null;
  const [profile, setProfile] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Workout Builder State
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [bodyPart, setBodyPart] = useState("chest");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [saving, setSaving] = useState(false);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // FIXED: Initialize activeTab with "session" as default
  const [activeTab, setActiveTab] = useState("session");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutSessionKey, setWorkoutSessionKey] = useState(0);

  // Add this state at the top with other state declarations
  const [todayStats, setTodayStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    totalCalories: 0,
    completedWorkouts: 0
  });

  useEffect(() => {
    if (email) {
      fetchInitialData();
      fetchCustomWorkouts();
    }
  }, [email]);

  useEffect(() => {
    if (isBuilderOpen) {
      fetchExercisesData();
    }
  }, [bodyPart, isBuilderOpen]);

  // Force tab switch when selectedWorkout changes
  useEffect(() => {
    if (selectedWorkout) {
      console.log('Selected workout changed, switching to session tab');
      setActiveTab("session");
    }
  }, [selectedWorkout]);

  const fetchInitialData = async () => {
    if (!email) {
      console.log('[SESSION-PAGE] No email available for fetching data');
      return;
    }

    setLoading(true);
    
    try {
      const profileRes = await fetch(`/api/profile/${encodeURIComponent(email)}`);
      const profileData = await profileRes.json();
      
      if (profileData.result) {
        console.log('[SESSION-PAGE] Profile fetched successfully');
        setProfile(profileData.result);
      } else {
        console.log('[SESSION-PAGE] No profile found, continuing with email only');
      }

      try {
        // Fetch recent sessions using email
        console.log('[SESSION-PAGE] Fetching recent sessions...');
        const sessionsRes = await fetch(
          `/api/workout-sessions?userId=${encodeURIComponent(email)}&limit=5`
        );
        const sessionsData = await sessionsRes.json();
        
        console.log('[SESSION-PAGE] Sessions response:', sessionsData);
        
        if (sessionsData.success) {
          console.log('[SESSION-PAGE] Found', sessionsData.data.length, 'recent sessions');
          setRecentSessions(sessionsData.data);
        } else {
          console.log('[SESSION-PAGE] No sessions found:', sessionsData.error);
        }

        // Fetch today's stats using email
        console.log('[SESSION-PAGE] Fetching today stats...');
        const todayRes = await fetch(
          `/api/workout-sessions?userId=${encodeURIComponent(email)}&today=true`
        );
        const todayData = await todayRes.json();
        
        console.log('[SESSION-PAGE] Today stats response:', todayData);
        
        if (todayData.success && todayData.todayStats) {
          console.log('[SESSION-PAGE] Today stats loaded:', todayData.todayStats);
          setTodayStats(todayData.todayStats);
        } else {
          console.log('[SESSION-PAGE] No today stats found');
        }
      } catch (sessionError) {
        console.log('[SESSION-PAGE] Error fetching sessions:', sessionError.message);
      }
    } catch (error) {
      console.error('[SESSION-PAGE] Error fetching initial data:', error);
    } finally {
      setLoading(false);
      console.log('[SESSION-PAGE] Initial data fetch completed');
    }
  };

  const fetchCustomWorkouts = async () => {
    if (!email) {
      console.log('[SESSION-PAGE] No email available for fetching custom workouts');
      return;
    }

    console.log('[SESSION-PAGE] Fetching custom workouts for email:', email);
    
    try {
      // Use email directly as userId
      const encodedEmail = encodeURIComponent(email);
      console.log('[SESSION-PAGE] Making request to:', `/api/custom-workouts?userId=${encodedEmail}`);
      
      const response = await fetch(`/api/custom-workouts?userId=${encodedEmail}`);
      const data = await response.json();
      
      console.log('[SESSION-PAGE] Custom workouts response:', data);
      
      if (data.success) {
        console.log('[SESSION-PAGE] Found', data.data.length, 'custom workouts');
        setCustomWorkouts(data.data);
      } else {
        console.log('[SESSION-PAGE] No custom workouts found:', data.error);
      }
    } catch (error) {
      console.error('[SESSION-PAGE] Error fetching custom workouts:', error);
    }
  };

  const fetchExercisesData = async () => {
    if (!bodyPart) return;
    console.log('[SESSION-PAGE] Fetching exercises for body part:', bodyPart);
    setExercisesLoading(true);
    try {
      const data = await fetchExercises(bodyPart);
      console.log('[SESSION-PAGE] Fetched', data?.length || 0, 'exercises');
      setExercises(data || []);
    } catch (error) {
      console.error('[SESSION-PAGE] Failed to fetch exercises:', error);
    } finally {
      setExercisesLoading(false);
    }
  };

  // Workout Builder Functions
  const openBuilder = (workout = null) => {
    console.log('[SESSION-PAGE] Opening workout builder:', workout ? 'Edit mode' : 'Create mode');
    
    if (workout) {
      setEditingWorkout(workout);
      setWorkoutName(workout.name);
      setWorkoutDescription(workout.description || "");
      setDifficulty(workout.difficulty);
      setSelectedExercises(workout.exercises.map(ex => ({ ...ex, customId: Date.now() + Math.random() })));
    } else {
      resetBuilder();
    }
    setIsBuilderOpen(true);
  };

  const resetBuilder = () => {
    console.log('[SESSION-PAGE] Resetting workout builder');
    setEditingWorkout(null);
    setWorkoutName("");
    setWorkoutDescription("");
    setDifficulty("beginner");
    setSelectedExercises([]);
    setBodyPart("chest");
  };

  const closeBuilder = () => {
    console.log('[SESSION-PAGE] Closing workout builder');
    setIsBuilderOpen(false);
    resetBuilder();
  };

  const addExerciseToWorkout = (exercise) => {
    console.log('[SESSION-PAGE] Adding exercise to workout:', exercise.name);
    const exerciseWithDefaults = {
      ...exercise,
      duration: 60,
      reps: 15,
      sets: 3,
      restTime: 30,
      customId: Date.now() + Math.random()
    };
    setSelectedExercises([...selectedExercises, exerciseWithDefaults]);
  };

  const removeExerciseFromWorkout = (customId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.customId !== customId));
  };

  const updateExerciseSettings = (customId, field, value) => {
    console.log('[SESSION-PAGE] Updating exercise settings:', field, value);
    setSelectedExercises(selectedExercises.map(ex => 
      ex.customId === customId ? { ...ex, [field]: parseInt(value) || value } : ex
    ));
  };

  const calculateTotalDuration = () => {
    return selectedExercises.reduce((total, exercise) => {
      return total + (exercise.duration * exercise.sets) + (exercise.restTime * (exercise.sets - 1));
    }, 0);
  };

  const saveWorkout = async () => {
    if (!workoutName.trim() || selectedExercises.length === 0) {
      alert("Please provide a workout name and add at least one exercise");
      return;
    }

    if (!email) {
      alert("User email not available");
      return;
    }

    setSaving(true);
    try {
      const workoutPlan = {
        userId: email, // Use email directly as userId
        name: workoutName,
        description: workoutDescription,
        difficulty,
        exercises: selectedExercises.map(ex => ({
          exerciseId: ex.id,
          name: ex.name,
          target: ex.target,
          equipment: ex.equipment,
          gifUrl: ex.gifUrl,
          instructions: ex.instructions,
          duration: ex.duration,
          reps: ex.reps,
          sets: ex.sets,
          restTime: ex.restTime
        })),
        totalDuration: calculateTotalDuration(),
        createdAt: new Date().toISOString()
      };

      const url = editingWorkout 
        ? `/api/custom-workouts/${editingWorkout._id}`
        : '/api/custom-workouts';
      
      const method = editingWorkout ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutPlan)
      });

      const result = await response.json();
      if (result.success) {
        alert(editingWorkout ? "Workout updated successfully!" : "Workout saved successfully!");
        fetchCustomWorkouts();
        closeBuilder();
      } else {
        alert(`Failed to save workout plan: ${result.error || 'Unknown error'}`);
        console.error('Save workout error:', result);
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Error saving workout plan");
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkout = async (workoutId) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      const response = await fetch(`/api/custom-workouts/${workoutId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCustomWorkouts(customWorkouts.filter(w => w._id !== workoutId));
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const startWorkout = (workout) => {
    setSelectedWorkout(workout);
    setWorkoutSessionKey(prev => prev + 1);
    
    // Use functional update to ensure state change
    setActiveTab(currentTab => {
      return "session";
    });
  };

  // UPDATED: Replace the startWorkoutNow function with better debugging
  const startWorkoutNow = () => {
    if (selectedExercises.length === 0) {
      alert("Please add exercises to start a workout");
      return;
    }
    
    const tempWorkout = {
      name: workoutName || "Quick Workout",
      difficulty,
      exercises: selectedExercises.map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        target: ex.target,
        equipment: ex.equipment,
        gifUrl: ex.gifUrl,
        instructions: ex.instructions,
        duration: ex.duration,
        reps: ex.reps,
        sets: ex.sets,
        restTime: ex.restTime
      })),
      isTemp: true
    };
    
    setSelectedWorkout(tempWorkout);
    closeBuilder();
    
    setWorkoutSessionKey(prev => prev + 1);
    
    setActiveTab("session");
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m ${seconds % 60}s`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add helper function to format duration in minutes
  const formatMinutes = (seconds) => {
    return Math.round(seconds / 60);
  };

  // Calculate weekly goal progress (assuming 150 minutes per week goal)
  const weeklyGoalProgress = Math.min(100, (formatMinutes(todayStats.totalDuration * 7) / 150) * 100);

  // Add this function to refresh today's stats
  const refreshTodayStats = async () => {
    if (!email) {
      console.log('[SESSION-PAGE] No email available for refreshing stats');
      return;
    }
    
    console.log('[SESSION-PAGE] Refreshing today stats for:', email);
    
    try {
      const todayRes = await fetch(
        `/api/workout-sessions?userId=${encodeURIComponent(email)}&today=true`
      );
      const todayData = await todayRes.json();
      
      if (todayData.success && todayData.todayStats) {
        setTodayStats(todayData.todayStats);
      }
    } catch (error) {
      console.error('Error refreshing today stats:', error);
    }
  };

  // Add this function to handle stopping the workout
  const stopWorkout = async (sessionId, sessionData) => {
    try {
      const endTime = new Date();
      const totalDuration = Math.floor((endTime - new Date(sessionData.startTime)) / 1000); // in seconds
      
      const updateData = {
        sessionId: sessionId,
        status: 'completed',
        endTime: endTime,
        totalDuration: totalDuration,
        // Add any other completion data like calories burned, etc.
        caloriesBurned: sessionData.caloriesBurned || 0,
        completedExercises: sessionData.completedExercises || 0
      };

      const response = await fetch('/api/workout-sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Workout stopped and saved successfully:', result.data);
        // Refresh the recent sessions and today's stats
        await fetchInitialData();
        // You might want to navigate back or show a completion dialog
        setSelectedWorkout(null);
        setWorkoutSessionKey(prev => prev + 1);
      } else {
        console.error('Failed to stop workout:', result.error);
      }
    } catch (error) {
      console.error('Error stopping workout:', error);
    }
  };

  // Add this function to handle create workout
  const handleCreateWorkout = () => {
    setActiveTab("builder");
    setIsBuilderOpen(true);
  };

  // Add loading check for email
  if (!email) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64">
          <div className="p-8">
            <div className="text-center py-12">
              <Timer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Loading user session...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait while we determine your identity...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="p-8">
          <ProfileNavbar />
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Timer className="w-8 h-8 text-blue-600" />
              Workout Session
            </h1>
            <p className="text-gray-600">
              Start live sessions, create custom workouts, and track your progress
            </p>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Debug Info:</strong> User Email: {email}
                </div>
              </div>
            )}
          </div>

          {/* FIXED: Main Content Tabs with key prop to force re-render */}
          <Tabs 
            key={`tabs-${activeTab}-${workoutSessionKey}`} // Add key to force re-render
            value={activeTab} 
            onValueChange={(value) => {
              console.log('Tab manually changed to:', value);
              setActiveTab(value);
            }}
            defaultValue="session"
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="session">Live Session</TabsTrigger>
              <TabsTrigger value="workouts">My Workouts</TabsTrigger>
            </TabsList>

            {/* Live Session Tab */}
            <TabsContent value="session" className="space-y-6">
              {console.log('Rendering session tab, selectedWorkout:', selectedWorkout)}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Active Session - Pass email directly as userId */}
                <div className="xl:col-span-3">
                  <WorkoutSession 
                    userId={email} // Pass email directly as userId
                    selectedWorkout={selectedWorkout}
                    onWorkoutComplete={() => {
                      console.log('[SESSION-PAGE] Workout completed, refreshing data');
                      refreshTodayStats();
                      fetchInitialData(); // Refresh recent sessions too
                    }}
                    onCreateWorkout={handleCreateWorkout} // Add this prop
                    key={workoutSessionKey}
                  />
                </div>

                {/* Session Stats Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Today's Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5" />
                        Today's Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calories Burned</span>
                        <span className="font-semibold">{todayStats.totalCalories} kcal</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Minutes</span>
                        <span className="font-semibold">{formatMinutes(todayStats.totalDuration)} min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Workouts</span>
                        <span className="font-semibold">{todayStats.completedWorkouts} completed</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Weekly Goal</span>
                        <span className={`font-semibold ${weeklyGoalProgress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                          {Math.round(weeklyGoalProgress)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Sessions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <History className="w-5 h-5" />
                        Recent Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-4 text-gray-500">
                          Loading sessions...
                        </div>
                      ) : recentSessions.length > 0 ? (
                        <div className="space-y-3">
                          {recentSessions.map((session, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {session.workoutPlan?.planName || 'Unknown Workout'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(session.startTime).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {formatDuration(session.totalDuration || 0)}
                                </p>
                                <Badge
                                  variant={
                                    session.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {session.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Timer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No workout sessions yet</p>
                          <p className="text-xs">Start your first workout!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* My Workouts Tab */}
            <TabsContent value="workouts" className="space-y-6">
              {console.log('Rendering workouts tab')}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Custom Workouts</h2>
                <Button onClick={() => openBuilder()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Workout
                </Button>
              </div>

              {customWorkouts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Custom Workouts</h3>
                    <p className="text-gray-600 mb-6">Create your first personalized workout plan</p>
                    <Button onClick={() => openBuilder()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Workout
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customWorkouts.map((workout) => (
                    <Card key={workout._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{workout.name}</CardTitle>
                            <Badge className={`text-xs ${getDifficultyColor(workout.difficulty)}`}>
                              {workout.difficulty}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openBuilder(workout)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteWorkout(workout._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {workout.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{workout.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-blue-50 p-2 rounded">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span className="text-xs text-blue-600">Duration</span>
                            </div>
                            <div className="font-semibold text-blue-600">
                              {formatDuration(workout.totalDuration || 0)}
                            </div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Target className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600">Exercises</span>
                            </div>
                            <div className="font-semibold text-green-600">
                              {workout.exercises?.length || 0}
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => {
                            console.log('Start Workout button clicked for:', workout.name);
                            startWorkout(workout);
                          }}
                          className="w-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Workout
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Workout Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={closeBuilder}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {editingWorkout ? "Edit Workout" : "Create New Workout"}
            </DialogTitle>
            <DialogDescription>
              Build your personalized workout by selecting exercises and customizing settings
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Exercise Library */}
            <div className="lg:col-span-2 space-y-6">
              {/* Workout Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Workout Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Workout Name *</label>
                      <Input
                        placeholder="e.g., Morning Full Body"
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <Textarea
                      placeholder="Describe your workout..."
                      value={workoutDescription}
                      onChange={(e) => setWorkoutDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Exercise Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Exercises</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Select Body Part:</label>
                    <Select value={bodyPart} onValueChange={setBodyPart}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chest">Chest</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                        <SelectItem value="legs">Legs</SelectItem>
                        <SelectItem value="arms">Arms</SelectItem>
                        <SelectItem value="shoulders">Shoulders</SelectItem>
                        <SelectItem value="waist">Waist</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {exercisesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading exercises...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {exercises.map((exercise) => (
                        <div key={exercise.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                          <img
                            src={exercise.gifUrl}
                            alt={exercise.name}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                          <h3 className="font-semibold text-xs capitalize mb-1">{exercise.name}</h3>
                          <p className="text-xs text-gray-600 capitalize mb-2">Target: {exercise.target}</p>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => addExerciseToWorkout(exercise)}
                              className="flex-1 text-xs py-1 h-7"
                              disabled={selectedExercises.some(ex => ex.id === exercise.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedExercise(exercise);
                                setPreviewDialog(true);
                              }}
                              className="text-xs py-1 h-7 px-2"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Workout Builder Sidebar */}
            <div className="space-y-6">
              {/* Workout Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Workout Summary</span>
                    <Badge variant="outline">{selectedExercises.length} exercises</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {formatDuration(calculateTotalDuration())}
                      </div>
                      <div className="text-xs text-blue-600">Total Duration</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{selectedExercises.length}</div>
                      <div className="text-xs text-green-600">Exercises</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={startWorkoutNow}
                      className="w-full"
                      disabled={selectedExercises.length === 0}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Now
                    </Button>
                    <Button 
                      onClick={saveWorkout}
                      variant="outline"
                      className="w-full"
                      disabled={saving || !workoutName.trim() || selectedExercises.length === 0}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : editingWorkout ? "Update" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Exercises */}
              <Card>
                <CardHeader>
                  <CardTitle>Selected Exercises</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedExercises.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No exercises selected</p>
                      <p className="text-xs">Add exercises from the library</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {selectedExercises.map((exercise) => (
                        <div key={exercise.customId} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm capitalize">{exercise.name}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeExerciseFromWorkout(exercise.customId)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-gray-600 mb-1">Duration (s)</label>
                              <Input
                                type="number"
                                value={exercise.duration}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'duration', e.target.value)}
                                className="h-6 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Reps</label>
                              <Input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'reps', e.target.value)}
                                className="h-6 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Sets</label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'sets', e.target.value)}
                                className="h-6 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Rest (s)</label>
                              <Input
                                type="number"
                                value={exercise.restTime}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'restTime', e.target.value)}
                                className="h-6 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Preview Dialog */}
      {selectedExercise && (
        <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="capitalize">{selectedExercise.name}</DialogTitle>
              <DialogDescription>
                <img
                  src={selectedExercise.gifUrl}
                  alt={selectedExercise.name}
                  className="w-full h-64 object-cover rounded mb-4"
                />
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Target Muscle:</span>
                    <span className="ml-2 capitalize">{selectedExercise.target}</span>
                  </div>
                  <div>
                    <span className="font-medium">Equipment:</span>
                    <span className="ml-2 capitalize">{selectedExercise.equipment}</span>
                  </div>
                </div>
                {selectedExercise.instructions && (
                  <div>
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index} className="text-sm">{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WorkoutSessionPage;