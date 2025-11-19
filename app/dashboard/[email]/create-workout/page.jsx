"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../_components/Sidebar";
import ProfileNavbar from "../../_components/ProfileNavbar";
import { fetchExercises } from "@/app/api/exercise/route";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Minus, 
  Save, 
  Play, 
  Trash2, 
  Clock, 
  Target, 
  Dumbbell,
  Edit3,
  Eye
} from "lucide-react";

const CreateWorkoutPage = () => {
  const params = useParams();
  const router = useRouter();
  const email = params?.email;
  
  const [exercises, setExercises] = useState([]);
  const [bodyPart, setBodyPart] = useState("chest");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const getExercises = async () => {
      if (!bodyPart) return;
      setLoading(true);
      try {
        const data = await fetchExercises(bodyPart);
        setExercises(data || []);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    getExercises();
  }, [bodyPart]);

  const addExerciseToWorkout = (exercise) => {
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

    setSaving(true);
    try {
      const workoutPlan = {
        userId: email,
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

      const response = await fetch('/api/custom-workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutPlan)
      });

      const result = await response.json();
      if (result.success) {
        alert("Workout plan saved successfully!");
        router.push(`/dashboard/${email}/my-workouts`);
      } else {
        alert("Failed to save workout plan");
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Error saving workout plan");
    } finally {
      setSaving(false);
    }
  };

  const startWorkoutNow = () => {
    if (selectedExercises.length === 0) {
      alert("Please add exercises to start a workout");
      return;
    }
    
    // Store the temporary workout in localStorage for immediate use
    const tempWorkout = {
      name: workoutName || "Quick Workout",
      exercises: selectedExercises,
      difficulty,
      isTemp: true
    };
    
    localStorage.setItem('tempWorkout', JSON.stringify(tempWorkout));
    router.push(`/dashboard/${email}/session?temp=true`);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m ${seconds % 60}s`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="p-8">
          <ProfileNavbar />
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Edit3 className="w-8 h-8 text-blue-600" />
              Create Custom Workout
            </h1>
            <p className="text-gray-600">
              Build your personalized workout by selecting exercises and customizing their settings
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Exercise Library */}
            <div className="xl:col-span-2 space-y-6">
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

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading exercises...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {exercises.map((exercise) => (
                        <div key={exercise.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <img
                            src={exercise.gifUrl}
                            alt={exercise.name}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                          <h3 className="font-semibold text-sm capitalize mb-2">{exercise.name}</h3>
                          <p className="text-xs text-gray-600 capitalize mb-2">Target: {exercise.target}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => addExerciseToWorkout(exercise)}
                              className="flex-1"
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
                      <div className="text-2xl font-bold text-blue-600">
                        {formatDuration(calculateTotalDuration())}
                      </div>
                      <div className="text-xs text-blue-600">Total Duration</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedExercises.length}</div>
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
                      Start Workout Now
                    </Button>
                    <Button 
                      onClick={saveWorkout}
                      variant="outline"
                      className="w-full"
                      disabled={saving || !workoutName.trim() || selectedExercises.length === 0}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save for Later"}
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
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedExercises.map((exercise) => (
                        <div key={exercise.customId} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-sm capitalize">{exercise.name}</h4>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeExerciseFromWorkout(exercise.customId)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-gray-600 mb-1">Duration (s)</label>
                              <Input
                                type="number"
                                value={exercise.duration}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'duration', e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Reps</label>
                              <Input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'reps', e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Sets</label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'sets', e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Rest (s)</label>
                              <Input
                                type="number"
                                value={exercise.restTime}
                                onChange={(e) => updateExerciseSettings(exercise.customId, 'restTime', e.target.value)}
                                className="h-8"
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
        </div>
      </main>

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

export default CreateWorkoutPage;