import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
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
  gifUrl: {
    type: String,
    trim: true
  },
  instructions: [{
    type: String,
    trim: true
  }],
  duration: { 
    type: Number, 
    default: 60,
    min: [1, 'Duration must be at least 1 second']
  },
  reps: { 
    type: Number, 
    default: 15,
    min: [0, 'Reps cannot be negative']
  },
  sets: { 
    type: Number, 
    default: 3,
    min: [1, 'Must have at least 1 set']
  },
  restTime: { 
    type: Number, 
    default: 30,
    min: [0, 'Rest time cannot be negative']
  }
});

const customWorkoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Workout name is required'],
    trim: true,
    maxlength: [100, 'Workout name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid difficulty level'
    },
    default: 'beginner'
  },
  exercises: {
    type: [exerciseSchema],
    validate: {
      validator: function(exercises) {
        return exercises && exercises.length > 0;
      },
      message: 'Workout must have at least one exercise'
    }
  },
  totalDuration: {
    type: Number,
    default: 0,
    min: [0, 'Total duration cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true, // This automatically handles createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
customWorkoutSchema.index({ userId: 1, createdAt: -1 });
customWorkoutSchema.index({ difficulty: 1 });
customWorkoutSchema.index({ isActive: 1 });
customWorkoutSchema.index({ name: 'text', description: 'text' }); // Text search

// Virtual for exercise count
customWorkoutSchema.virtual('exerciseCount').get(function() {
  return this.exercises ? this.exercises.length : 0;
});

// Virtual for estimated calories (rough estimate based on duration and difficulty)
customWorkoutSchema.virtual('estimatedCalories').get(function() {
  if (!this.totalDuration) return 0;
  
  const multipliers = {
    beginner: 0.08,    // 0.08 calories per second
    intermediate: 0.12, // 0.12 calories per second
    advanced: 0.16      // 0.16 calories per second
  };
  
  const multiplier = multipliers[this.difficulty] || 0.10;
  return Math.round(this.totalDuration * multiplier);
});

// Pre-save middleware to calculate totalDuration
customWorkoutSchema.pre('save', function(next) {
  if (this.exercises && this.exercises.length > 0) {
    this.totalDuration = this.exercises.reduce((total, exercise) => {
      const exerciseDuration = (exercise.duration || 60) * (exercise.sets || 1);
      const restDuration = (exercise.restTime || 30) * Math.max(0, (exercise.sets || 1) - 1);
      return total + exerciseDuration + restDuration;
    }, 0);
  }
  next();
});

// Pre-update middleware to update totalDuration on updates
customWorkoutSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.exercises) {
    let totalDuration = 0;
    if (update.exercises.length > 0) {
      totalDuration = update.exercises.reduce((total, exercise) => {
        const exerciseDuration = (exercise.duration || 60) * (exercise.sets || 1);
        const restDuration = (exercise.restTime || 30) * Math.max(0, (exercise.sets || 1) - 1);
        return total + exerciseDuration + restDuration;
      }, 0);
    }
    update.totalDuration = totalDuration;
  }
  next();
});

const CustomWorkout = mongoose.models.CustomWorkout || mongoose.model('CustomWorkout', customWorkoutSchema);

export default CustomWorkout;