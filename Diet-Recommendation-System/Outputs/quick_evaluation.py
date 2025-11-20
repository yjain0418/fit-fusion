"""
Quick Model Evaluation Script
Run this for a fast accuracy check
"""

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

def quick_evaluate():
    print("\n" + "="*60)
    print("🚀 DIET RECOMMENDATION MODEL - QUICK EVALUATION")
    print("="*60 + "\n")
    
    try:
        # Load data
        print("📂 Loading dataset...")
        df = pd.read_csv('Data/dataset.csv', compression='gzip')
        
        # Select features
        features = ['Calories', 'FatContent', 'CarbohydrateContent', 'ProteinContent']
        df_features = df[features].dropna()
        
        print(f"✅ Dataset loaded: {len(df_features)} recipes")
        print(f"   Features: {', '.join(features)}\n")
        
        # Standardize
        print("⚙️  Training model...")
        scaler = StandardScaler()
        X = scaler.fit_transform(df_features)
        
        # Train k-NN
        knn = NearestNeighbors(n_neighbors=10, metric='euclidean')
        knn.fit(X)
        print("✅ Model trained successfully\n")
        
        # Test with sample targets
        test_targets = [
            {
                'name': 'Weight Loss (Low Calorie)',
                'Calories': 1500, 
                'FatContent': 50, 
                'CarbohydrateContent': 150, 
                'ProteinContent': 100
            },
            {
                'name': 'Maintenance (Balanced)',
                'Calories': 2000, 
                'FatContent': 65, 
                'CarbohydrateContent': 250, 
                'ProteinContent': 150
            },
            {
                'name': 'Weight Gain (High Calorie)',
                'Calories': 2500, 
                'FatContent': 80, 
                'CarbohydrateContent': 350, 
                'ProteinContent': 180
            },
            {
                'name': 'Low Carb Diet',
                'Calories': 1800, 
                'FatContent': 130, 
                'CarbohydrateContent': 50, 
                'ProteinContent': 150
            },
        ]
        
        print("🧪 Running accuracy tests...\n")
        
        total_accuracy = 0
        results = []
        
        for i, target in enumerate(test_targets, 1):
            target_vector = np.array([[
                target['Calories'], 
                target['FatContent'], 
                target['CarbohydrateContent'], 
                target['ProteinContent']
            ]])
            target_scaled = scaler.transform(target_vector)
            
            distances, indices = knn.kneighbors(target_scaled, n_neighbors=10)
            recommended = df_features.iloc[indices[0]]
            
            # Calculate errors
            cal_error = abs(recommended['Calories'].mean() - target['Calories']) / target['Calories'] * 100
            protein_error = abs(recommended['ProteinContent'].mean() - target['ProteinContent']) / target['ProteinContent'] * 100
            carbs_error = abs(recommended['CarbohydrateContent'].mean() - target['CarbohydrateContent']) / target['CarbohydrateContent'] * 100
            fat_error = abs(recommended['FatContent'].mean() - target['FatContent']) / target['FatContent'] * 100
            
            avg_error = (cal_error + protein_error + carbs_error + fat_error) / 4
            accuracy = 100 - avg_error
            
            results.append({
                'name': target['name'],
                'accuracy': accuracy,
                'cal_error': cal_error,
                'protein_error': protein_error,
                'carbs_error': carbs_error,
                'fat_error': fat_error
            })
            
            print(f"Test {i}: {target['name']}")
            print(f"   Target: {target['Calories']} cal, {target['ProteinContent']}g protein, {target['CarbohydrateContent']}g carbs")
            print(f"   Recommended Avg: {recommended['Calories'].mean():.0f} cal, {recommended['ProteinContent'].mean():.0f}g protein, {recommended['CarbohydrateContent'].mean():.0f}g carbs")
            print(f"   ✅ Accuracy: {accuracy:.2f}%")
            print(f"   📊 Errors: Cal={cal_error:.1f}%, Pro={protein_error:.1f}%, Carb={carbs_error:.1f}%, Fat={fat_error:.1f}%\n")
            
            total_accuracy += accuracy
        
        overall_accuracy = total_accuracy / len(test_targets)
        
        # Calculate diversity
        print("🎨 Testing recommendation diversity...")
        num_queries = 50
        top_k = 10
        random_indices = np.random.choice(len(X), num_queries, replace=False)
        all_recommendations = set()
        
        for idx in random_indices:
            query = X[idx:idx+1]
            distances, indices = knn.kneighbors(query, n_neighbors=top_k)
            all_recommendations.update(indices[0])
        
        diversity_score = len(all_recommendations) / (num_queries * top_k) * 100
        print(f"   Unique recipes: {len(all_recommendations)} / {num_queries * top_k}")
        print(f"   ✅ Diversity Score: {diversity_score:.2f}%\n")
        
        # Final results
        print("="*60)
        print("📋 FINAL EVALUATION RESULTS")
        print("="*60)
        print(f"\n📊 Overall Model Accuracy: {overall_accuracy:.2f}%")
        print(f"🎨 Recommendation Diversity: {diversity_score:.2f}%")
        
        # Grade the model
        if overall_accuracy >= 85:
            grade = "A (Excellent)"
            emoji = "🏆"
        elif overall_accuracy >= 75:
            grade = "B (Good)"
            emoji = "✅"
        elif overall_accuracy >= 65:
            grade = "C (Fair)"
            emoji = "⚠️"
        elif overall_accuracy >= 55:
            grade = "D (Poor)"
            emoji = "❌"
        else:
            grade = "F (Needs Improvement)"
            emoji = "🔴"
        
        print(f"\n{emoji} Model Grade: {grade}")
        
        print("\n" + "="*60)
        print("Evaluation Complete!")
        print("="*60 + "\n")
        
        # Save detailed results
        with open('quick_evaluation_results.txt', 'w') as f:
            f.write("Diet Recommendation Model - Quick Evaluation Results\n")
            f.write("="*60 + "\n\n")
            f.write(f"Dataset Size: {len(df_features)} recipes\n")
            f.write(f"Overall Accuracy: {overall_accuracy:.2f}%\n")
            f.write(f"Diversity Score: {diversity_score:.2f}%\n")
            f.write(f"Model Grade: {grade}\n\n")
            f.write("Detailed Results by Test Case:\n")
            f.write("-"*60 + "\n")
            for result in results:
                f.write(f"\n{result['name']}:\n")
                f.write(f"  Accuracy: {result['accuracy']:.2f}%\n")
                f.write(f"  Calorie Error: {result['cal_error']:.2f}%\n")
                f.write(f"  Protein Error: {result['protein_error']:.2f}%\n")
                f.write(f"  Carbs Error: {result['carbs_error']:.2f}%\n")
                f.write(f"  Fat Error: {result['fat_error']:.2f}%\n")
        
        print("💾 Detailed results saved to 'quick_evaluation_results.txt'\n")
        
        return overall_accuracy, diversity_score, grade
        
    except FileNotFoundError:
        print("❌ Error: Could not find 'Data/dataset.csv'")
        print("   Make sure you're running this from the Diet-Recommendation-System directory")
        return None, None, None
    except Exception as e:
        print(f"❌ Error during evaluation: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None, None

if __name__ == "__main__":
    quick_evaluate()
