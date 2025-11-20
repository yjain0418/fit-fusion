import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { age, weight, height, gender, activityLevel, goal, dietType } = body;

    // Validate inputs
    if (!age || !weight || !height || !gender) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: age, weight, height, gender' 
      }, { status: 400 });
    }

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Adjust for goal
    let targetCalories = tdee;
    if (goal === 'lose') {
      targetCalories = tdee - 500; // 500 calorie deficit for weight loss
    } else if (goal === 'gain') {
      targetCalories = tdee + 500; // 500 calorie surplus for weight gain
    }

    // Calculate macros based on diet type
    let protein, carbs, fat;
    
    if (dietType === 'low_carb') {
      protein = Math.round(weight * 2.2); // 2.2g per kg
      fat = Math.round((targetCalories * 0.40) / 9); // 40% from fat
      carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    } else if (dietType === 'high_protein') {
      protein = Math.round(weight * 2.5); // 2.5g per kg
      fat = Math.round((targetCalories * 0.25) / 9); // 25% from fat
      carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    } else {
      // Balanced, vegetarian, vegan
      protein = Math.round(weight * 2); // 2g per kg
      fat = Math.round((targetCalories * 0.25) / 9); // 25% from fat
      carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    }

    // Generate meal recommendations
    const meals = generateDefaultMeals(targetCalories, protein, carbs, fat, dietType);

    return NextResponse.json({
      success: true,
      recommendations: {
        dailyCalories: Math.round(targetCalories),
        protein,
        carbs,
        fat,
        bmi: bmi.toFixed(1),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        meals
      }
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate diet recommendations',
      details: error.message 
    }, { status: 500 });
  }
}

function generateDefaultMeals(calories, protein, carbs, fat, dietType) {
  const mealsPerDay = 3;
  const caloriesPerMeal = Math.round(calories / mealsPerDay);
  const proteinPerMeal = Math.round(protein / mealsPerDay);
  const carbsPerMeal = Math.round(carbs / mealsPerDay);
  const fatPerMeal = Math.round(fat / mealsPerDay);

  const mealTypes = {
    balanced: [
      { name: "Breakfast: Oatmeal with Fruits & Nuts", icon: "🥣" },
      { name: "Lunch: Grilled Chicken with Rice & Vegetables", icon: "🍗" },
      { name: "Dinner: Fish with Quinoa & Salad", icon: "🐟" }
    ],
    low_carb: [
      { name: "Breakfast: Eggs with Avocado & Bacon", icon: "🥚" },
      { name: "Lunch: Grilled Steak with Cauliflower Rice", icon: "🥩" },
      { name: "Dinner: Salmon with Asparagus", icon: "🐟" }
    ],
    high_protein: [
      { name: "Breakfast: Protein Pancakes with Berries", icon: "🥞" },
      { name: "Lunch: Chicken Breast with Sweet Potato", icon: "🍗" },
      { name: "Dinner: Lean Beef with Broccoli", icon: "🥩" }
    ],
    vegetarian: [
      { name: "Breakfast: Greek Yogurt with Granola", icon: "🥣" },
      { name: "Lunch: Lentil Curry with Brown Rice", icon: "🍛" },
      { name: "Dinner: Tofu Stir-fry with Vegetables", icon: "🥗" }
    ],
    vegan: [
      { name: "Breakfast: Smoothie Bowl with Seeds", icon: "🥣" },
      { name: "Lunch: Chickpea Buddha Bowl", icon: "🥗" },
      { name: "Dinner: Tempeh with Quinoa & Veggies", icon: "🌱" }
    ]
  };

  const meals = mealTypes[dietType] || mealTypes.balanced;

  return meals.map(meal => ({
    name: meal.name,
    calories: caloriesPerMeal,
    protein: proteinPerMeal,
    carbs: carbsPerMeal,
    fat: fatPerMeal
  }));
}