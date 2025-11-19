"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  RotateCcw,
  Timer,
  Target,
  Zap,
  CheckCircle,
  Plus,
  Dumbbell,
} from "lucide-react";

const WorkoutSession = ({ userId, selectedWorkout = null, onWorkoutComplete, onCreateWorkout }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [sessionStatus, setSessionStatus] = useState('ready');
  const [sessionId, setSessionId] = useState(null);
  const [workoutLoaded, setWorkoutLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Extract email from URL path or userId prop
  useEffect(() => {
    let email = null;
    
    // If userId is already an email, use it directly
    if (userId && userId.includes('@')) {
      email = userId;
      console.log('[WORKOUT-SESSION] userId is already an email:', email);
    } else {
      // Try to extract email from URL path
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        console.log('[WORKOUT-SESSION] Current path:', path);
        
        // Extract email from path like /dashboard/[email]/workout
        const pathParts = path.split('/');
        const emailIndex = pathParts.findIndex(part => part === 'dashboard') + 1;
        
        if (emailIndex > 0 && pathParts[emailIndex]) {
          email = decodeURIComponent(pathParts[emailIndex]);
          console.log('[WORKOUT-SESSION] Extracted email from path:', email);
        }
      }
    }
    
    if (email && email.includes('@')) {
      setUserEmail(email);
      console.log('[WORKOUT-SESSION] Set user email:', email);
    } else {
      console.warn('[WORKOUT-SESSION] Could not determine user email from userId or path');
      // Fallback: use userId as is if no email found
      setUserEmail(userId);
    }
  }, [userId]);

  // Load workout from props or localStorage on component mount
  useEffect(() => {
    const loadWorkout = () => {
      if (selectedWorkout) {
        setCurrentWorkout(selectedWorkout);
        setWorkoutLoaded(true);
        return;
      }
      
      const customWorkout = localStorage.getItem('selectedWorkout');
      const tempWorkout = localStorage.getItem('tempWorkout');
      
      if (customWorkout) {
        const workout = JSON.parse(customWorkout);
        setCurrentWorkout(workout);
        setWorkoutLoaded(true);
        return;
      }
      
      if (tempWorkout) {
        const workout = JSON.parse(tempWorkout);
        setCurrentWorkout(workout);
        setWorkoutLoaded(true);
        return;
      }
      
      // No workout found, don't set a default
      setCurrentWorkout(null);
      setWorkoutLoaded(true);
    };

    loadWorkout();
  }, [selectedWorkout]);

  // Initialize timer when workout changes
  useEffect(() => {
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const currentExercise = currentWorkout.exercises[currentExerciseIndex];
      setTimeRemaining(currentExercise.duration);
      setIsResting(false);
      setCurrentSetIndex(0);
    }
  }, [currentWorkout, currentExerciseIndex]);

  // Timer effect
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Clear the interval immediately when timer completes
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            // Use setTimeout to prevent race conditions
            setTimeout(() => handleTimerComplete(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeRemaining, currentExerciseIndex, currentSetIndex, isResting]);

  // Session time tracker
  useEffect(() => {
    let sessionInterval;
    if (sessionStatus === 'active') {
      sessionInterval = setInterval(() => {
        if (startTimeRef.current) {
          setTotalSessionTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    }

    return () => clearInterval(sessionInterval);
  }, [sessionStatus]);

  const handleTimerComplete = () => {
    if (!currentWorkout) return;

    const currentExercise = currentWorkout.exercises[currentExerciseIndex];
    
    if (isResting) {
      // Rest period complete, start next set (don't increment set index here)
      setTimeRemaining(currentExercise.duration);
      setIsResting(false);
    } else {
      // Exercise set complete, increment set index
      const nextSetIndex = currentSetIndex + 1;
      
      if (nextSetIndex < currentExercise.sets) {
        // More sets remaining, start rest period
        setCurrentSetIndex(nextSetIndex);
        setTimeRemaining(currentExercise.restTime);
        setIsResting(true);
      } else {
        // All sets complete for this exercise, move to next exercise
        handleNextExercise();
      }
    }
  };

  const handleNextExercise = () => {
    if (!currentWorkout) return;

    // Mark current exercise as completed
    setCompletedExercises(prev => {
      if (!prev.includes(currentExerciseIndex)) {
        return [...prev, currentExerciseIndex];
      }
      return prev;
    });

    if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
      // Move to next exercise
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSetIndex(0); // Reset to first set
      setIsResting(false);
      // Set timer for next exercise
      const nextExercise = currentWorkout.exercises[nextIndex];
      setTimeRemaining(nextExercise.duration);
    } else {
      // Workout complete
      handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = async () => {
    setIsActive(false);
    setSessionStatus('completed');
    
    // Mark last exercise as completed if not already
    if (!completedExercises.includes(currentExerciseIndex)) {
      setCompletedExercises(prev => [...prev, currentExerciseIndex]);
    }
    
    // Update existing session instead of creating new one
    if (sessionId && userEmail) {
      try {
        const endTime = new Date();
        const finalDuration = Math.floor((endTime - new Date(sessionStartTime)) / 1000);
        
        const updateData = {
          sessionId: sessionId,
          status: 'completed',
          endTime: endTime.toISOString(),
          totalDuration: finalDuration,
          caloriesBurned: Math.round(finalDuration * 0.12),
          completedExercises: currentWorkout.exercises.length // All exercises completed
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
          console.log('Workout completed and saved successfully:', result.data);
          // Trigger refresh in parent component
          if (onWorkoutComplete) {
            onWorkoutComplete();
          }
        } else {
          console.error('Failed to complete workout:', result.error);
        }
      } catch (error) {
        console.error('Error completing workout:', error);
      }
    } else {
      console.warn('[WORKOUT-SESSION] Missing sessionId or userEmail for workout completion');
    }
    
    // Clear localStorage when workout is completed
    localStorage.removeItem('activeWorkout');
    localStorage.removeItem('selectedWorkout');
    localStorage.removeItem('tempWorkout');
  };

  // Generate unique session ID when workout starts
  const createInitialSession = async (newSessionId, startTime) => {
    if (!userEmail) {
      console.error('[WORKOUT-SESSION] Cannot create session - no user email available');
      return;
    }

    try {
      const sessionData = {
        userId: userEmail, // Use email as userId
        sessionId: newSessionId,
        workoutPlan: {
          planId: currentWorkout._id || `plan_${Date.now()}`,
          planName: currentWorkout.name,
          difficulty: currentWorkout.difficulty,
          exercises: currentWorkout.exercises.map(ex => ({
            name: ex.name,
            target: ex.target,
            equipment: ex.equipment,
            duration: ex.duration,
            reps: ex.reps,
            sets: ex.sets,
            restTime: ex.restTime
          }))
        },
        startTime: startTime,
        totalDuration: 0,
        totalExercises: currentWorkout.exercises.length,
        completedExercises: 0,
        caloriesBurned: 0,
        status: 'active'
      };

      const response = await fetch('/api/workout-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Initial session created successfully');
      } else {
        console.error('Failed to create initial session:', result.error);
      }
    } catch (error) {
      console.error('Error creating initial session:', error);
    }
  };

  const startWorkout = () => {
    if (!userEmail) {
      console.error('[WORKOUT-SESSION] Cannot start workout - no user email available');
      return;
    }

    if (sessionStatus === 'ready' || sessionStatus === 'completed') {
      const now = new Date().toISOString();
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Clear any existing intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setSessionId(newSessionId);
      setSessionStartTime(now);
      startTimeRef.current = Date.now();
      setSessionStatus('active');
      setCompletedExercises([]);
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
      setTotalSessionTime(0);
      
      // Create initial session in database
      createInitialSession(newSessionId, now);
      
      if (currentWorkout && currentWorkout.exercises.length > 0) {
        setTimeRemaining(currentWorkout.exercises[0].duration);
        setIsResting(false);
      }
    }
    setIsActive(true);
  };

  const pauseWorkout = () => {
    setIsActive(false);
    if (sessionStatus === 'active') {
      setSessionStatus('paused');
    }
  };

  const stopWorkout = async () => {
    setIsActive(false);
    
    // If we have an active session, mark it as completed
    if (sessionId && userEmail && (sessionStatus === 'active' || sessionStatus === 'paused')) {
      try {
        const endTime = new Date();
        const totalDuration = Math.floor((endTime - new Date(sessionStartTime)) / 1000);
        
        const updateData = {
          sessionId: sessionId,
          status: 'completed',
          endTime: endTime.toISOString(),
          totalDuration: totalDuration,
          caloriesBurned: Math.round(totalDuration * 0.12),
          completedExercises: completedExercises.length
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
          // Trigger refresh in parent component
          if (onWorkoutComplete) {
            onWorkoutComplete();
          }
        } else {
          console.error('Failed to stop workout:', result.error);
        }
      } catch (error) {
        console.error('Error stopping workout:', error);
      }
    }
    
    // Reset local state
    setSessionStatus('ready');
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setIsResting(false);
    setCompletedExercises([]);
    setTotalSessionTime(0);
    setSessionId(null);
    
    // Clear localStorage
    localStorage.removeItem('activeWorkout');
    localStorage.removeItem('selectedWorkout');
    localStorage.removeItem('tempWorkout');
    
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      setTimeRemaining(currentWorkout.exercises[0].duration);
    }
  };

  const skipExercise = () => {
    if (isActive && intervalRef.current) {
      // Clear the current timer first
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setTimeRemaining(0);
      // Use setTimeout to prevent race conditions
      setTimeout(() => handleNextExercise(), 100);
    }
  };

  const restartExercise = () => {
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      // Clear any active timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      const currentExercise = currentWorkout.exercises[currentExerciseIndex];
      setTimeRemaining(currentExercise.duration);
      setCurrentSetIndex(0);
      setIsResting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    const remainingSecs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMins}m ${remainingSecs}s`;
    }
    return `${remainingMins}m ${remainingSecs}s`;
  };

  // Update the display logic for current set
  const getCurrentSetDisplay = () => {
    if (!currentWorkout || !currentWorkout.exercises[currentExerciseIndex]) return "1/1";
    
    const currentExercise = currentWorkout.exercises[currentExerciseIndex];
    
    if (isResting) {
      // During rest, we've completed the current set, so show next set
      return `${Math.min(currentSetIndex + 1, currentExercise.sets)}/${currentExercise.sets}`;
    } else {
      // During exercise, show current active set
      return `${currentSetIndex + 1}/${currentExercise.sets}`;
    }
  };

  // Fix the progress calculation for sets
  const calculateProgress = () => {
    if (!currentWorkout || currentWorkout.exercises.length === 0) return 0;
    
    const totalExercises = currentWorkout.exercises.length;
    let progress = 0;
    
    // Add progress for completed exercises
    progress += (completedExercises.length / totalExercises) * 100;
    
    // Add partial progress for current exercise
    if (currentExerciseIndex < totalExercises && !completedExercises.includes(currentExerciseIndex)) {
      const currentExercise = currentWorkout.exercises[currentExerciseIndex];
      let currentExerciseProgress = 0;
      
      if (isResting) {
        // During rest, we've completed the current set
        currentExerciseProgress = (currentSetIndex + 1) / currentExercise.sets;
      } else {
        // During exercise, partial progress through current set
        currentExerciseProgress = currentSetIndex / currentExercise.sets;
      }
      
      progress += (currentExerciseProgress * (100 / totalExercises));
    }
    
    return Math.min(100, Math.round(progress));
  };

  // Handle create workout button
  const handleCreateWorkout = () => {
    if (onCreateWorkout) {
      onCreateWorkout();
    }
  };

  // Show loading state
  if (!workoutLoaded) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Timer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Loading workout...</p>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while determining user email
  if (!userEmail) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Timer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Loading user session...</p>
          <p className="text-sm text-gray-500 mt-2">Determining user identity...</p>
        </CardContent>
      </Card>
    );
  }

  // Show create workout prompt when no workout is available
  if (!currentWorkout) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workout Selected</h3>
            <p className="text-gray-600 mb-6">
              Create a custom workout or select an existing one to start your session.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleCreateWorkout} 
                size="lg" 
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Workout
              </Button>
              
              <div className="text-sm text-gray-500">
                Or switch to the "My Workout" tab to choose a custom workout
              </div>
            </div>
            </div>
        </CardContent>
      </Card>
    );
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> User Email: {userEmail} | Session ID: {sessionId || 'None'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workout Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                {currentWorkout.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">
                  {currentWorkout.difficulty}
                </Badge>
                <Badge variant="outline">
                  {currentWorkout.exercises.length} exercises
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatSessionTime(totalSessionTime)}
              </div>
              <div className="text-sm text-gray-600">Session Time</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {completedExercises.length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {currentExerciseIndex + 1}
                </div>
                <div className="text-xs text-gray-600">Current</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-600">
                  {currentWorkout.exercises.length}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sessionStatus === 'completed' ? (
        // Workout Complete Screen
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Workout Complete!</h2>
            <p className="text-gray-600 mb-6">
              Great job! You completed {currentWorkout.name} in {formatSessionTime(totalSessionTime)}
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{completedExercises.length}</div>
                <div className="text-sm text-blue-600">Exercises</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(totalSessionTime * 0.12)}</div>
                <div className="text-sm text-green-600">Calories</div>
              </div>
            </div>
            <Button onClick={stopWorkout} className="w-full max-w-md">
              Start New Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Active Workout Screen
        <>
          {/* Current Exercise Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{currentExercise.name}</span>
                <Badge variant={isResting ? "secondary" : "default"}>
                  {isResting ? `Rest after Set ${currentSetIndex}` : `Set ${getCurrentSetDisplay()}`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* Timer Display */}
                <div className="relative">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-lg text-gray-600">
                    {isResting ? `Rest Time (Set ${currentSetIndex} Complete)` : `Set ${currentSetIndex + 1} of ${currentExercise.sets}`}
                  </div>
                </div>

                {/* Exercise Info */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Target</span>
                    </div>
                    <div className="font-medium capitalize">{currentExercise.target}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-sm text-gray-600">Reps</span>
                    </div>
                    <div className="font-medium">{currentExercise.reps}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-sm text-gray-600">Equipment</span>
                    </div>
                    <div className="font-medium capitalize">{currentExercise.equipment}</div>
                  </div>
                </div>

                {/* Exercise Instructions */}
                {currentExercise.instructions && !isResting && (
                  <div className="text-left bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentExercise.instructions.map((instruction, idx) => (
                        <li key={idx} className="text-sm">{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                  {sessionStatus === 'ready' || sessionStatus === 'completed' ? (
                    <Button onClick={startWorkout} size="lg" className="px-8">
                      <Play className="w-5 h-5 mr-2" />
                      Start Workout
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={isActive ? pauseWorkout : startWorkout}
                        size="lg"
                        className="px-6"
                      >
                        {isActive ? (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                      
                      <Button onClick={stopWorkout} variant="outline" size="lg">
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                      
                      <Button onClick={skipExercise} variant="outline" size="lg">
                        <SkipForward className="w-5 h-5 mr-2" />
                        Skip
                      </Button>
                      
                      <Button onClick={restartExercise} variant="outline" size="lg">
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Restart
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise List */}
          <Card>
            <CardHeader>
              <CardTitle>Exercise List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentWorkout.exercises.map((exercise, index) => {
                  const isCompleted = completedExercises.includes(index);
                  const isCurrent = index === currentExerciseIndex;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCurrent
                          ? "border-blue-500 bg-blue-50"
                          : isCompleted
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isCurrent
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{exercise.name}</div>
                          <div className="text-sm text-gray-600">
                            {exercise.sets} sets × {exercise.reps} reps × {exercise.duration}s
                            {isCurrent && !isCompleted && (
                              <span className="ml-2 text-blue-600 font-medium">
                                {isResting ? 
                                  `(Resting after Set ${currentSetIndex})` : 
                                  `(Set ${currentSetIndex + 1}/${exercise.sets})`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          isCompleted
                            ? "default"
                            : isCurrent
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {isCompleted
                          ? "Complete"
                          : isCurrent
                          ? (isResting ? "Resting" : "Active")
                          : "Pending"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default WorkoutSession;