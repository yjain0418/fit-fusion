"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../_components/Sidebar";
import ProfileNavbar from "../../_components/ProfileNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Play, 
  Clock, 
  Target, 
  MoreVertical,
  Edit,
  Trash2,
  Dumbbell
} from "lucide-react";

const MyWorkoutsPage = () => {
  const params = useParams();
  const router = useRouter();
  const email = params?.email;
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomWorkouts();
  }, [email]);

  const fetchCustomWorkouts = async () => {
    try {
      const response = await fetch(`/api/custom-workouts?userId=${email}`);
      const data = await response.json();
      if (data.success) {
        setCustomWorkouts(data.data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = (workout) => {
    localStorage.setItem('selectedWorkout', JSON.stringify(workout));
    router.push(`/dashboard/${email}/session?custom=true&id=${workout._id}`);
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="p-8">
          <ProfileNavbar />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <Dumbbell className="w-8 h-8 text-blue-600" />
                My Workouts
              </h1>
              <p className="text-gray-600">
                Manage your custom workout plans
              </p>
            </div>
            <Button 
              onClick={() => router.push(`/dashboard/${email}/create-workout`)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Workout
            </Button>
          </div>

          {/* Workouts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your workouts...</p>
            </div>
          ) : customWorkouts.length === 0 ? (
            <div className="text-center py-16">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Custom Workouts</h3>
              <p className="text-gray-600 mb-6">Create your first personalized workout plan</p>
              <Button onClick={() => router.push(`/dashboard/${email}/create-workout`)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Workout
              </Button>
            </div>
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
                          <DropdownMenuItem>
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
                          {formatDuration(workout.totalDuration)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">Exercises</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          {workout.exercises.length}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => startWorkout(workout)}
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
        </div>
      </main>
    </div>
  );
};

export default MyWorkoutsPage;