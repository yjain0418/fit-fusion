import mongoose from 'mongoose';

const WorkoutSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    default: function() { 
      return new mongoose.Types.ObjectId().toString(); 
    }
  },
  workoutPlan: {
    planId: { 
      type: String, 
      required: true,
      default: function() { 
        return new mongoose.Types.ObjectId().toString(); 
      }
    },
    planName: { 
      type: String, 
      required: [true, 'Plan name is required'],
      trim: true
    },
    difficulty: { 
      type: String, 
      required: true,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: '{VALUE} is not a valid difficulty level'
      },
      lowercase: true
    },
    exercises: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      target: {
        type: String,
        trim: true
      },
      equipment: {
        type: String,
        trim: true
      },
      duration: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
        default: 60
      },
      reps: {
        type: Number,
        min: [0, 'Reps cannot be negative'],
        default: 0
      },
      sets: {
        type: Number,
        min: [0, 'Sets cannot be negative'],
        default: 1
      },
      restTime: {
        type: Number,
        min: [0, 'Rest time cannot be negative'],
        default: 30
      }
    }]
  },
  
  // Local exercise tracking data
  exerciseProgress: [{
    exerciseId: String,
    exerciseName: String,
    plannedSets: { type: Number, default: 3 },
    completedSets: [{
      setNumber: Number,
      reps: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      restTime: { type: Number, default: 30 },
      completedAt: { type: Date, default: Date.now }
    }]
  }],
  
  // Session statistics
  stats: {
    currentExerciseIndex: { type: Number, default: 0 },
    totalExercisesCompleted: { type: Number, default: 0 },
    totalSetsCompleted: { type: Number, default: 0 },
    currentCalories: { type: Number, default: 0 },
    elapsedTime: { type: Number, default: 0 }, // in seconds
    lastUpdated: { type: Date, default: Date.now }
  },
  
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || !this.startTime || value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  totalDuration: {
    type: Number,
    required: true,
    min: [0, 'Duration cannot be negative']
  },
  completedExercises: {
    type: Number,
    default: 0,
    min: [0, 'Completed exercises cannot be negative']
  },
  totalExercises: {
    type: Number,
    required: true,
    min: [1, 'Must have at least one exercise']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'abandoned', 'paused'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  caloriesBurned: {
    type: Number,
    default: 0,
    min: [0, 'Calories burned cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
WorkoutSessionSchema.index({ userId: 1, createdAt: -1 });
WorkoutSessionSchema.index({ sessionId: 1 }, { unique: true });
WorkoutSessionSchema.index({ status: 1 });

const WorkoutSession = mongoose.models.WorkoutSession || mongoose.model('WorkoutSession', WorkoutSessionSchema);

export default WorkoutSession;