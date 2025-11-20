# Diet Recommendation System Integration

This document explains the diet recommendation system integration with Fit Fusion.

## Overview

The Diet Recommendation System provides personalized meal recommendations based on:
- User's health profile (age, weight, height, gender)
- Activity level
- Health goals (weight loss, maintenance, gain)
- Diet preferences (balanced, low-carb, high-protein, vegetarian, vegan)

## Features Implemented

### 1. **Personalized Recommendations** (`/dashboard/[email]/diet`)
   - Calculate BMI (Body Mass Index)
   - Calculate BMR (Basal Metabolic Rate)
   - Calculate TDEE (Total Daily Energy Expenditure)
   - Generate macro distribution (Protein, Carbs, Fat)
   - Suggest 3 meals per day based on diet preferences

### 2. **Custom Food Search**
   - Search the food database by keywords
   - View nutritional information for specific foods
   - Get cooking and prep times
   - Browse ingredients list

## API Routes

### `/api/diet/recommendations` (POST)
Generates personalized diet recommendations.

**Request Body:**
```json
{
  "age": 25,
  "weight": 70,
  "height": 175,
  "gender": "male",
  "activityLevel": "moderate",
  "goal": "lose",
  "dietType": "balanced"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": {
    "dailyCalories": 2100,
    "protein": 140,
    "carbs": 210,
    "fat": 58,
    "bmi": "22.9",
    "bmr": 1750,
    "tdee": 2600,
    "meals": [...]
  }
}
```

### `/api/diet/custom-search` (POST)
Searches for specific foods in the database.

**Request Body:**
```json
{
  "query": "chicken"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "name": "Grilled Chicken Breast",
      "calories": "165",
      "protein": "31.0",
      "carbs": "0.0",
      "fat": "3.6",
      "cookTime": "15 mins",
      "prepTime": "5 mins"
    }
  ]
}
```

## Calculations

### BMI (Body Mass Index)
```
BMI = weight (kg) / (height (m))²
```

### BMR (Basal Metabolic Rate)
**For Males:**
```
BMR = 10 × weight + 6.25 × height - 5 × age + 5
```

**For Females:**
```
BMR = 10 × weight + 6.25 × height - 5 × age - 161
```

### TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × Activity Multiplier
```

**Activity Multipliers:**
- Sedentary: 1.2
- Light Activity: 1.375
- Moderate Activity: 1.55
- Active: 1.725
- Very Active: 1.9

### Target Calories
- **Weight Loss:** TDEE - 500 calories
- **Maintain Weight:** TDEE
- **Weight Gain:** TDEE + 500 calories

### Macronutrient Distribution
- **Protein:** 2g per kg of body weight
- **Fat:** 25% of total calories (÷ 9 for grams)
- **Carbs:** Remaining calories (÷ 4 for grams)

## Diet Types

### 1. Balanced
- Mixed macronutrients
- Variety of food groups
- Suitable for general health

### 2. Low Carb
- Higher fat and protein
- Lower carbohydrate intake
- Good for blood sugar control

### 3. High Protein
- Increased protein intake
- Supports muscle building
- Recovery-focused

### 4. Vegetarian
- No meat or fish
- Includes dairy and eggs
- Plant-based proteins

### 5. Vegan
- 100% plant-based
- No animal products
- Uses plant proteins

## Database Integration

The system uses the diet recommendation dataset from `Diet-Recommendation-System/Data/dataset.csv`.

**Dataset Fields:**
- Name
- CookTime
- PrepTime
- TotalTime
- RecipeIngredientParts
- Calories
- FatContent
- SaturatedFatContent
- CholesterolContent
- SodiumContent
- CarbohydrateContent
- FiberContent
- SugarContent
- ProteinContent
- RecipeInstructions

## Python Backend Integration

The system can optionally integrate with the FastAPI backend for more advanced recommendations:

### Setup:
```bash
cd Diet-Recommendation-System/FastAPI_Backend
pip install -r requirements.txt
```

### Run FastAPI Server:
```bash
uvicorn main:app --reload
```

The helper script `diet_helper.py` bridges Node.js and the Python recommendation engine.

## UI Components

### Main Page Components:
1. **Health Profile Form** - Input user metrics
2. **Recommendations Display** - Show calculated values and meal plan
3. **Custom Search** - Search for specific foods
4. **Meal Cards** - Display nutritional breakdown
5. **Food Cards** - Show individual food items

### Technologies Used:
- **React** - UI framework
- **Next.js** - Server-side rendering
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Lucide React** - Icons

## Navigation

The diet page is accessible from the sidebar:
- Path: `/dashboard/[email]/diet`
- Icon: `/diet.png`
- Label: "Diet Recommendations"

## Future Enhancements

1. **Save Diet Plans** - Store recommendations in database
2. **Meal History** - Track past meals
3. **Shopping Lists** - Generate grocery lists
4. **Recipe Details** - Full cooking instructions
5. **Calorie Tracking** - Daily calorie counter
6. **Progress Charts** - Visualize nutrition over time
7. **Integration with Workout** - Adjust nutrition based on exercise

## Testing

To test the integration:

1. Navigate to `/dashboard/[email]/diet`
2. Fill in your health profile
3. Click "Get Diet Recommendations"
4. View personalized meal plan
5. Try the custom search with "chicken", "rice", or "salad"

## Troubleshooting

**Issue:** Dataset not found
- **Solution:** Ensure `Diet-Recommendation-System/Data/dataset.csv` exists
- Falls back to mock data if dataset is missing

**Issue:** Python script fails
- **Solution:** The system uses fallback meal generation
- Check Python dependencies are installed

**Issue:** No recommendations shown
- **Solution:** Verify all required fields are filled
- Check browser console for errors

## Support

For issues or questions:
1. Check the console logs
2. Verify all dependencies are installed
3. Ensure the dataset file is present
4. Test with mock data first
