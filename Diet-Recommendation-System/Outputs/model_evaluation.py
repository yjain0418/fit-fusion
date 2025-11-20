"""
Model Evaluation Script for Diet Recommendation System
This script evaluates the performance of the diet recommendation model using various metrics.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class DietRecommendationEvaluator:
    def __init__(self, dataset_path='Data/dataset.csv'):
        """Initialize the evaluator with the dataset"""
        print("\n" + "="*60)
        print("🔬 DIET RECOMMENDATION MODEL - COMPREHENSIVE EVALUATION")
        print("="*60 + "\n")
        
        print("📂 Loading dataset...")
        self.df = pd.read_csv(dataset_path, compression='gzip')
        self.prepare_data()
        
    def prepare_data(self):
        """Prepare and clean the dataset"""
        # Select relevant nutritional columns
        self.nutritional_features = [
            'Calories', 'FatContent', 'SaturatedFatContent', 
            'CholesterolContent', 'SodiumContent', 'CarbohydrateContent',
            'FiberContent', 'SugarContent', 'ProteinContent'
        ]
        
        # Remove rows with missing values in nutritional columns
        self.df_clean = self.df[self.nutritional_features].dropna()
        
        print(f"✅ Dataset loaded successfully")
        print(f"   Total recipes: {len(self.df_clean)}")
        print(f"   Features used: {len(self.nutritional_features)}")
        print(f"   Feature names: {', '.join(self.nutritional_features[:4])}...\n")
        
    def evaluate_nearest_neighbors(self, n_neighbors=10, test_size=0.2):
        """
        Evaluate the k-NN based recommendation system
        Returns: Dictionary with evaluation metrics
        """
        print("="*60)
        print("📊 EVALUATING NEAREST NEIGHBORS MODEL")
        print("="*60 + "\n")
        
        # Prepare features
        X = self.df_clean[self.nutritional_features].values
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Split data
        X_train, X_test = train_test_split(
            X_scaled, test_size=test_size, random_state=42
        )
        
        print(f"Training set size: {len(X_train)} recipes")
        print(f"Test set size: {len(X_test)} recipes")
        print(f"Number of neighbors: {n_neighbors}\n")
        
        # Train k-NN model
        knn_model = NearestNeighbors(n_neighbors=n_neighbors, metric='euclidean')
        knn_model.fit(X_train)
        
        print("⚙️  Model trained successfully")
        
        # Evaluate on test set
        distances, indices = knn_model.kneighbors(X_test)
        
        # Calculate metrics
        results = {
            'mean_distance': np.mean(distances),
            'std_distance': np.std(distances),
            'min_distance': np.min(distances),
            'max_distance': np.max(distances),
            'median_distance': np.median(distances)
        }
        
        print(f"\n📏 Distance Metrics:")
        print(f"   Mean Distance: {results['mean_distance']:.4f}")
        print(f"   Std Distance: {results['std_distance']:.4f}")
        print(f"   Min Distance: {results['min_distance']:.4f}")
        print(f"   Max Distance: {results['max_distance']:.4f}")
        print(f"   Median Distance: {results['median_distance']:.4f}\n")
        
        return results, knn_model, scaler
    
    def evaluate_nutritional_accuracy(self, target_nutrition, knn_model, scaler, top_k=10):
        """
        Evaluate how well recommendations match target nutritional requirements
        """
        # Create target feature vector
        target_vector = np.zeros(len(self.nutritional_features))
        target_vector[0] = target_nutrition.get('Calories', 2000)  # Calories
        target_vector[1] = target_nutrition.get('Fat', 65)  # FatContent
        target_vector[5] = target_nutrition.get('Carbs', 300)  # CarbohydrateContent
        target_vector[8] = target_nutrition.get('Protein', 50)  # ProteinContent
        
        # Scale the target
        target_scaled = scaler.transform([target_vector])
        
        # Get recommendations
        distances, indices = knn_model.kneighbors(target_scaled, n_neighbors=top_k)
        
        # Get recommended recipes
        recommended_indices = indices[0]
        recommended_recipes = self.df_clean.iloc[recommended_indices]
        
        # Calculate accuracy metrics
        print(f"\n🎯 Target: {target_nutrition.get('Calories', 2000)} cal, {target_nutrition.get('Protein', 50)}g protein, {target_nutrition.get('Carbs', 300)}g carbs")
        print(f"📈 Recommended Avg: {recommended_recipes['Calories'].mean():.0f} cal, {recommended_recipes['ProteinContent'].mean():.0f}g protein, {recommended_recipes['CarbohydrateContent'].mean():.0f}g carbs")
        
        # Calculate percentage errors
        cal_error = abs(recommended_recipes['Calories'].mean() - target_nutrition.get('Calories', 2000)) / target_nutrition.get('Calories', 2000) * 100
        protein_error = abs(recommended_recipes['ProteinContent'].mean() - target_nutrition.get('Protein', 50)) / target_nutrition.get('Protein', 50) * 100
        carbs_error = abs(recommended_recipes['CarbohydrateContent'].mean() - target_nutrition.get('Carbs', 300)) / target_nutrition.get('Carbs', 300) * 100
        fat_error = abs(recommended_recipes['FatContent'].mean() - target_nutrition.get('Fat', 65)) / target_nutrition.get('Fat', 65) * 100
        
        avg_error = (cal_error + protein_error + carbs_error + fat_error) / 4
        accuracy = 100 - avg_error
        
        print(f"❌ Errors: Cal={cal_error:.1f}%, Pro={protein_error:.1f}%, Carb={carbs_error:.1f}%, Fat={fat_error:.1f}%")
        print(f"✅ Accuracy: {accuracy:.2f}%")
        
        return {
            'accuracy': accuracy,
            'cal_error': cal_error,
            'protein_error': protein_error,
            'carbs_error': carbs_error,
            'fat_error': fat_error,
            'recommended_recipes': recommended_recipes
        }
    
    def evaluate_diversity(self, knn_model, scaler, num_queries=100, top_k=10):
        """
        Evaluate the diversity of recommendations
        """
        print("\n" + "="*60)
        print("🎨 EVALUATING RECOMMENDATION DIVERSITY")
        print("="*60 + "\n")
        
        # Generate random queries
        X_scaled = scaler.transform(self.df_clean[self.nutritional_features].values)
        random_indices = np.random.choice(len(X_scaled), num_queries, replace=False)
        
        all_recommendations = set()
        
        for idx in random_indices:
            query = X_scaled[idx:idx+1]
            distances, indices = knn_model.kneighbors(query, n_neighbors=top_k)
            all_recommendations.update(indices[0])
        
        diversity_score = len(all_recommendations) / (num_queries * top_k) * 100
        
        print(f"Queries tested: {num_queries}")
        print(f"Recommendations per query: {top_k}")
        print(f"Unique recommendations: {len(all_recommendations)}")
        print(f"Total recommendations: {num_queries * top_k}")
        print(f"✅ Diversity Score: {diversity_score:.2f}%\n")
        
        return {
            'diversity_score': diversity_score,
            'unique_recommendations': len(all_recommendations),
            'total_recommendations': num_queries * top_k
        }
    
    def comprehensive_evaluation(self):
        """
        Run all evaluation metrics and generate a comprehensive report
        """
        # 1. Evaluate k-NN model
        knn_results, knn_model, scaler = self.evaluate_nearest_neighbors(n_neighbors=10)
        
        # 2. Evaluate nutritional accuracy for different diet goals
        test_cases = [
            {
                'name': 'Weight Loss (Low Calorie)',
                'Calories': 1500,
                'Protein': 100,
                'Carbs': 150,
                'Fat': 50
            },
            {
                'name': 'Maintenance (Balanced)',
                'Calories': 2000,
                'Protein': 150,
                'Carbs': 250,
                'Fat': 65
            },
            {
                'name': 'Weight Gain (High Calorie)',
                'Calories': 2500,
                'Protein': 180,
                'Carbs': 350,
                'Fat': 80
            },
            {
                'name': 'Low Carb Diet',
                'Calories': 1800,
                'Protein': 150,
                'Carbs': 50,
                'Fat': 130
            }
        ]
        
        all_accuracies = []
        
        print("="*60)
        print("🧪 TESTING MULTIPLE DIET SCENARIOS")
        print("="*60)
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\nTest Case {i}: {test_case['name']}")
            print("-"*60)
            
            nutrition_results = self.evaluate_nutritional_accuracy(
                test_case, knn_model, scaler, top_k=10
            )
            all_accuracies.append(nutrition_results['accuracy'])
        
        # 3. Evaluate diversity
        diversity_results = self.evaluate_diversity(knn_model, scaler)
        
        # Final Summary
        print("\n" + "="*60)
        print("📋 FINAL EVALUATION SUMMARY")
        print("="*60 + "\n")
        
        avg_accuracy = np.mean(all_accuracies)
        
        print(f"✅ Overall Model Accuracy: {avg_accuracy:.2f}%")
        print(f"✅ Recommendation Diversity: {diversity_results['diversity_score']:.2f}%")
        print(f"✅ Mean Distance Score: {knn_results['mean_distance']:.4f}")
        
        # Grade the model
        if avg_accuracy >= 85:
            grade = "A (Excellent)"
            emoji = "🏆"
        elif avg_accuracy >= 75:
            grade = "B (Good)"
            emoji = "✅"
        elif avg_accuracy >= 65:
            grade = "C (Fair)"
            emoji = "⚠️"
        elif avg_accuracy >= 55:
            grade = "D (Poor)"
            emoji = "❌"
        else:
            grade = "F (Needs Improvement)"
            emoji = "🔴"
        
        print(f"\n{emoji} Model Grade: {grade}")
        
        print("\n" + "="*60)
        print("Evaluation Complete!")
        print("="*60 + "\n")
        
        return {
            'overall_accuracy': avg_accuracy,
            'diversity_score': diversity_results['diversity_score'],
            'mean_distance': knn_results['mean_distance'],
            'grade': grade,
            'test_accuracies': all_accuracies
        }

def main():
    """Main function to run the evaluation"""
    try:
        # Initialize evaluator
        evaluator = DietRecommendationEvaluator()
        
        # Run comprehensive evaluation
        results = evaluator.comprehensive_evaluation()
        
        # Save results to file
        with open('comprehensive_evaluation_results.txt', 'w') as f:
            f.write("Diet Recommendation Model - Comprehensive Evaluation Results\n")
            f.write("="*60 + "\n\n")
            f.write(f"Dataset Size: {len(evaluator.df_clean)} recipes\n")
            f.write(f"Features Used: {len(evaluator.nutritional_features)}\n\n")
            f.write(f"Overall Accuracy: {results['overall_accuracy']:.2f}%\n")
            f.write(f"Diversity Score: {results['diversity_score']:.2f}%\n")
            f.write(f"Mean Distance: {results['mean_distance']:.4f}\n")
            f.write(f"Model Grade: {results['grade']}\n\n")
            f.write("Individual Test Case Accuracies:\n")
            for i, acc in enumerate(results['test_accuracies'], 1):
                f.write(f"  Test {i}: {acc:.2f}%\n")
        
        print("💾 Detailed results saved to 'comprehensive_evaluation_results.txt'\n")
        
    except FileNotFoundError:
        print("❌ Error: Could not find 'Data/dataset.csv'")
        print("   Make sure you're running this from the Diet-Recommendation-System directory\n")
    except Exception as e:
        print(f"❌ Error during evaluation: {str(e)}\n")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
