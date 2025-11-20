import sys
import json
import pandas as pd
from pathlib import Path

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent / 'FastAPI_Backend'))

try:
    from model import recommend, output_recommended_recipes
    
    # Load dataset
    dataset_path = Path(__file__).parent / 'Data' / 'dataset.csv'
    dataset = pd.read_csv(dataset_path, compression='gzip')
    
    # Get command line arguments
    if len(sys.argv) > 1:
        calories = float(sys.argv[1])
        protein = float(sys.argv[2])
        carbs = float(sys.argv[3])
        fat = float(sys.argv[4])
        diet_type = sys.argv[5] if len(sys.argv) > 5 else 'balanced'
        
        # Create nutrition input
        # [Calories, FatContent, SaturatedFatContent, CholesterolContent, SodiumContent, 
        #  CarbohydrateContent, FiberContent, SugarContent, ProteinContent]
        nutrition_input = [
            calories,
            fat,
            fat * 0.3,  # Saturated fat (estimated)
            50,  # Cholesterol (estimated)
            500,  # Sodium (estimated)
            carbs,
            carbs * 0.1,  # Fiber (estimated)
            carbs * 0.2,  # Sugar (estimated)
            protein
        ]
        
        # Get recommendations
        params = {'n_neighbors': 5, 'return_distance': False}
        recommendations = recommend(dataset, nutrition_input, [], params)
        
        if recommendations is not None:
            meals = output_recommended_recipes(recommendations)
            print(json.dumps({'success': True, 'meals': meals}))
        else:
            print(json.dumps({'success': False, 'meals': None}))
    else:
        print(json.dumps({'success': False, 'error': 'No arguments provided'}))
        
except Exception as e:
    print(json.dumps({'success': False, 'error': str(e)}))
