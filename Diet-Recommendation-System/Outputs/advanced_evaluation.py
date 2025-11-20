"""
Advanced Model Evaluation with Visualizations
Includes: Epoch vs Metrics, Heatmaps, Confusion Matrix, and more
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)

class AdvancedDietEvaluator:
    def __init__(self, dataset_path='Data/dataset.csv', test_size=0.3):
        """Initialize with 30% test data"""
        print("\n" + "="*70)
        print("🔬 ADVANCED DIET RECOMMENDATION MODEL EVALUATION")
        print("="*70 + "\n")
        
        print("📂 Loading dataset...")
        self.df = pd.read_csv(dataset_path, compression='gzip')
        self.test_size = test_size
        self.prepare_data()
        
    def prepare_data(self):
        """Prepare and split the dataset"""
        # Select nutritional features
        self.features = [
            'Calories', 'FatContent', 'SaturatedFatContent', 
            'CholesterolContent', 'SodiumContent', 'CarbohydrateContent',
            'FiberContent', 'SugarContent', 'ProteinContent'
        ]
        
        self.df_clean = self.df[self.features].dropna()
        
        print(f"✅ Dataset loaded: {len(self.df_clean)} recipes")
        print(f"   Features: {len(self.features)}")
        print(f"   Test split: {self.test_size*100}%\n")
        
    def train_with_epochs(self, n_neighbors=10, epochs=15):
        """
        Simulate training with different neighbor counts (epochs)
        and track metrics
        """
        print("="*70)
        print("📊 TRAINING MODEL WITH MULTIPLE CONFIGURATIONS (EPOCHS)")
        print("="*70 + "\n")
        
        # Prepare data
        X = self.df_clean[self.features].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Split data (70% train, 30% test)
        X_train, X_test = train_test_split(
            X_scaled, test_size=self.test_size, random_state=42
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Test samples: {len(X_test)}")
        print(f"Training epochs: {epochs}\n")
        
        # Track metrics across different k values (epochs)
        epoch_metrics = {
            'epoch': [],
            'train_distance': [],
            'test_distance': [],
            'train_accuracy': [],
            'test_accuracy': []
        }
        
        k_values = np.linspace(5, n_neighbors*2, epochs, dtype=int)
        
        # Sample for epoch evaluation to save memory
        train_sample_size = min(5000, len(X_train))
        test_sample_size = min(5000, len(X_test))
        train_sample_idx = np.random.choice(len(X_train), train_sample_size, replace=False)
        test_sample_idx = np.random.choice(len(X_test), test_sample_size, replace=False)
        
        print("Training progress:")
        for i, k in enumerate(k_values, 1):
            # Train model with k neighbors
            knn = NearestNeighbors(n_neighbors=min(k, len(X_train)), metric='euclidean')
            knn.fit(X_train)
            
            # Evaluate on train sample
            train_distances, _ = knn.kneighbors(X_train[train_sample_idx])
            train_dist = np.mean(train_distances)
            
            # Evaluate on test sample
            test_distances, _ = knn.kneighbors(X_test[test_sample_idx])
            test_dist = np.mean(test_distances)
            
            # Calculate accuracies (inverse of normalized distance)
            train_acc = max(0, 100 - train_dist * 50)
            test_acc = max(0, 100 - test_dist * 50)
            
            epoch_metrics['epoch'].append(i)
            epoch_metrics['train_distance'].append(train_dist)
            epoch_metrics['test_distance'].append(test_dist)
            epoch_metrics['train_accuracy'].append(train_acc)
            epoch_metrics['test_accuracy'].append(test_acc)
            
            if i % 10 == 0 or i == 1:
                print(f"  Epoch {i}/{epochs}: k={k}, Test Dist={test_dist:.4f}, Test Acc={test_acc:.2f}%")
        
        print("\n✅ Training complete!\n")
        
        # Final model
        final_knn = NearestNeighbors(n_neighbors=n_neighbors, metric='euclidean')
        final_knn.fit(X_train)
        
        return epoch_metrics, final_knn, scaler, X_train, X_test
    
    def evaluate_nutritional_predictions(self, knn_model, scaler, X_test):
        """Evaluate predictions vs actual values"""
        print("="*70)
        print("📈 EVALUATING NUTRITIONAL PREDICTIONS")
        print("="*70 + "\n")
        
        # Get predictions for test set
        distances, indices = knn_model.kneighbors(X_test[:1000])  # Sample 1000 for speed
        
        # Prepare data for confusion matrix (binned predictions)
        test_sample = self.df_clean.iloc[:1000]
        
        predictions = {
            'Calories': [],
            'Protein': [],
            'Carbs': [],
            'Fat': []
        }
        
        actuals = {
            'Calories': test_sample['Calories'].values,
            'Protein': test_sample['ProteinContent'].values,
            'Carbs': test_sample['CarbohydrateContent'].values,
            'Fat': test_sample['FatContent'].values
        }
        
        print("Calculating predictions...")
        for idx_set in indices:
            neighbors = self.df_clean.iloc[idx_set]
            predictions['Calories'].append(neighbors['Calories'].mean())
            predictions['Protein'].append(neighbors['ProteinContent'].mean())
            predictions['Carbs'].append(neighbors['CarbohydrateContent'].mean())
            predictions['Fat'].append(neighbors['FatContent'].mean())
        
        # Calculate regression metrics
        metrics = {}
        for nutrient in ['Calories', 'Protein', 'Carbs', 'Fat']:
            pred = np.array(predictions[nutrient])
            actual = actuals[nutrient]
            
            mse = mean_squared_error(actual, pred)
            mae = mean_absolute_error(actual, pred)
            r2 = r2_score(actual, pred)
            
            metrics[nutrient] = {
                'MSE': mse,
                'MAE': mae,
                'R2': r2,
                'RMSE': np.sqrt(mse)
            }
            
            print(f"{nutrient}:")
            print(f"  MAE: {mae:.2f}")
            print(f"  RMSE: {np.sqrt(mse):.2f}")
            print(f"  R²: {r2:.4f}\n")
        
        return predictions, actuals, metrics
    
    def create_confusion_matrix_categorical(self, predictions, actuals):
        """Create confusion matrix for categorical predictions"""
        print("="*70)
        print("🎯 CREATING CONFUSION MATRIX (CALORIE CATEGORIES)")
        print("="*70 + "\n")
        
        # Bin calories into categories
        def categorize_calories(cal):
            if cal < 300:
                return 'Low'
            elif cal < 600:
                return 'Medium'
            else:
                return 'High'
        
        pred_categories = [categorize_calories(c) for c in predictions['Calories']]
        actual_categories = [categorize_calories(c) for c in actuals['Calories']]
        
        # Create confusion matrix
        categories = ['Low', 'Medium', 'High']
        conf_matrix = np.zeros((3, 3), dtype=int)
        
        for pred, actual in zip(pred_categories, actual_categories):
            pred_idx = categories.index(pred)
            actual_idx = categories.index(actual)
            conf_matrix[actual_idx, pred_idx] += 1
        
        print("Calorie Category Mapping:")
        print("  Low: < 300 cal")
        print("  Medium: 300-600 cal")
        print("  High: > 600 cal\n")
        
        return conf_matrix, categories
    
    def plot_epoch_metrics(self, epoch_metrics):
        """Plot training metrics vs epochs"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('Training Metrics vs Epochs', fontsize=16, fontweight='bold')
        
        epochs = epoch_metrics['epoch']
        
        # Plot 1: Distance metrics
        axes[0, 0].plot(epochs, epoch_metrics['train_distance'], 
                        label='Train Distance', linewidth=2, marker='o', markersize=4)
        axes[0, 0].plot(epochs, epoch_metrics['test_distance'], 
                        label='Test Distance', linewidth=2, marker='s', markersize=4)
        axes[0, 0].set_xlabel('Epoch', fontsize=12)
        axes[0, 0].set_ylabel('Mean Distance', fontsize=12)
        axes[0, 0].set_title('Distance Metrics Over Epochs', fontsize=14)
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        
        # Plot 2: Accuracy metrics
        axes[0, 1].plot(epochs, epoch_metrics['train_accuracy'], 
                        label='Train Accuracy', linewidth=2, marker='o', markersize=4, color='green')
        axes[0, 1].plot(epochs, epoch_metrics['test_accuracy'], 
                        label='Test Accuracy', linewidth=2, marker='s', markersize=4, color='orange')
        axes[0, 1].set_xlabel('Epoch', fontsize=12)
        axes[0, 1].set_ylabel('Accuracy (%)', fontsize=12)
        axes[0, 1].set_title('Accuracy Over Epochs', fontsize=14)
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)
        
        # Plot 3: Overfitting analysis
        overfit = np.array(epoch_metrics['train_accuracy']) - np.array(epoch_metrics['test_accuracy'])
        axes[1, 0].plot(epochs, overfit, linewidth=2, color='red', marker='o', markersize=4)
        axes[1, 0].axhline(y=0, color='black', linestyle='--', alpha=0.5)
        axes[1, 0].set_xlabel('Epoch', fontsize=12)
        axes[1, 0].set_ylabel('Train - Test Accuracy (%)', fontsize=12)
        axes[1, 0].set_title('Overfitting Analysis', fontsize=14)
        axes[1, 0].grid(True, alpha=0.3)
        axes[1, 0].fill_between(epochs, 0, overfit, where=(overfit > 0), 
                                alpha=0.3, color='red', label='Overfitting')
        axes[1, 0].legend()
        
        # Plot 4: Convergence
        test_dist_change = np.diff(epoch_metrics['test_distance'])
        axes[1, 1].plot(range(1, len(test_dist_change)+1), test_dist_change, 
                        linewidth=2, color='purple', marker='o', markersize=4)
        axes[1, 1].axhline(y=0, color='black', linestyle='--', alpha=0.5)
        axes[1, 1].set_xlabel('Epoch', fontsize=12)
        axes[1, 1].set_ylabel('Distance Change', fontsize=12)
        axes[1, 1].set_title('Model Convergence', fontsize=14)
        axes[1, 1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('epoch_metrics.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: epoch_metrics.png\n")
        plt.close()
    
    def plot_confusion_matrix(self, conf_matrix, categories):
        """Plot confusion matrix heatmap"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Calculate percentages
        conf_matrix_pct = conf_matrix.astype('float') / conf_matrix.sum(axis=1)[:, np.newaxis] * 100
        
        # Create annotations
        annot = np.empty_like(conf_matrix, dtype=object)
        for i in range(conf_matrix.shape[0]):
            for j in range(conf_matrix.shape[1]):
                annot[i, j] = f'{conf_matrix[i, j]}\n({conf_matrix_pct[i, j]:.1f}%)'
        
        sns.heatmap(conf_matrix, annot=annot, fmt='', cmap='Blues', 
                    xticklabels=categories, yticklabels=categories,
                    cbar_kws={'label': 'Count'}, linewidths=2, linecolor='white',
                    ax=ax)
        
        ax.set_xlabel('Predicted Category', fontsize=12, fontweight='bold')
        ax.set_ylabel('Actual Category', fontsize=12, fontweight='bold')
        ax.set_title('Confusion Matrix - Calorie Category Predictions', 
                     fontsize=14, fontweight='bold', pad=20)
        
        plt.tight_layout()
        plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: confusion_matrix.png\n")
        plt.close()
    
    def plot_prediction_heatmaps(self, predictions, actuals):
        """Plot heatmaps for prediction accuracy"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle('Prediction vs Actual Heatmaps', fontsize=16, fontweight='bold')
        
        nutrients = ['Calories', 'Protein', 'Carbs', 'Fat']
        
        for idx, nutrient in enumerate(nutrients):
            ax = axes[idx // 2, idx % 2]
            
            pred = predictions[nutrient][:100]  # Sample for visualization
            actual = actuals[nutrient][:100]
            
            # Create 2D histogram
            h, xedges, yedges = np.histogram2d(actual, pred, bins=20)
            
            im = ax.imshow(h.T, origin='lower', cmap='YlOrRd', aspect='auto',
                          extent=[xedges[0], xedges[-1], yedges[0], yedges[-1]])
            
            # Add diagonal line (perfect prediction)
            min_val = min(xedges[0], yedges[0])
            max_val = max(xedges[-1], yedges[-1])
            ax.plot([min_val, max_val], [min_val, max_val], 
                   'b--', linewidth=2, label='Perfect Prediction')
            
            ax.set_xlabel(f'Actual {nutrient}', fontsize=11)
            ax.set_ylabel(f'Predicted {nutrient}', fontsize=11)
            ax.set_title(f'{nutrient} Predictions', fontsize=12, fontweight='bold')
            ax.legend()
            
            # Add colorbar
            plt.colorbar(im, ax=ax, label='Density')
        
        plt.tight_layout()
        plt.savefig('prediction_heatmaps.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: prediction_heatmaps.png\n")
        plt.close()
    
    def plot_error_distribution(self, predictions, actuals, metrics):
        """Plot error distributions"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 10))
        fig.suptitle('Prediction Error Distributions', fontsize=16, fontweight='bold')
        
        nutrients = ['Calories', 'Protein', 'Carbs', 'Fat']
        colors = ['orange', 'blue', 'green', 'red']
        
        for idx, (nutrient, color) in enumerate(zip(nutrients, colors)):
            ax = axes[idx // 2, idx % 2]
            
            errors = np.array(predictions[nutrient]) - actuals[nutrient]
            
            # Histogram
            ax.hist(errors, bins=50, alpha=0.7, color=color, edgecolor='black')
            
            # Add mean and median lines
            mean_error = np.mean(errors)
            median_error = np.median(errors)
            
            ax.axvline(mean_error, color='red', linestyle='--', linewidth=2, 
                      label=f'Mean: {mean_error:.2f}')
            ax.axvline(median_error, color='green', linestyle='--', linewidth=2,
                      label=f'Median: {median_error:.2f}')
            ax.axvline(0, color='black', linestyle='-', linewidth=1, alpha=0.5)
            
            ax.set_xlabel(f'Error ({nutrient})', fontsize=11)
            ax.set_ylabel('Frequency', fontsize=11)
            ax.set_title(f'{nutrient} - MAE: {metrics[nutrient]["MAE"]:.2f}', 
                        fontsize=12, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('error_distributions.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: error_distributions.png\n")
        plt.close()
    
    def plot_correlation_heatmap(self):
        """Plot feature correlation heatmap"""
        fig, ax = plt.subplots(figsize=(12, 10))
        
        # Calculate correlation matrix
        corr_matrix = self.df_clean[self.features].corr()
        
        # Create heatmap
        sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', 
                    center=0, square=True, linewidths=1, cbar_kws={"shrink": 0.8},
                    ax=ax)
        
        ax.set_title('Feature Correlation Matrix', fontsize=14, fontweight='bold', pad=20)
        
        plt.tight_layout()
        plt.savefig('correlation_heatmap.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: correlation_heatmap.png\n")
        plt.close()
    
    def plot_performance_summary(self, metrics):
        """Create a comprehensive performance summary"""
        fig, axes = plt.subplots(2, 2, figsize=(16, 10))
        fig.suptitle('Model Performance Summary', fontsize=16, fontweight='bold')
        
        nutrients = ['Calories', 'Protein', 'Carbs', 'Fat']
        
        # Plot 1: MAE comparison
        mae_values = [metrics[n]['MAE'] for n in nutrients]
        axes[0, 0].bar(nutrients, mae_values, color=['orange', 'blue', 'green', 'red'],
                       edgecolor='black', linewidth=2)
        axes[0, 0].set_ylabel('Mean Absolute Error', fontsize=12)
        axes[0, 0].set_title('MAE by Nutrient', fontsize=13, fontweight='bold')
        axes[0, 0].grid(True, alpha=0.3, axis='y')
        
        for i, v in enumerate(mae_values):
            axes[0, 0].text(i, v + max(mae_values)*0.02, f'{v:.2f}', 
                           ha='center', fontweight='bold')
        
        # Plot 2: RMSE comparison
        rmse_values = [metrics[n]['RMSE'] for n in nutrients]
        axes[0, 1].bar(nutrients, rmse_values, color=['orange', 'blue', 'green', 'red'],
                       edgecolor='black', linewidth=2)
        axes[0, 1].set_ylabel('Root Mean Squared Error', fontsize=12)
        axes[0, 1].set_title('RMSE by Nutrient', fontsize=13, fontweight='bold')
        axes[0, 1].grid(True, alpha=0.3, axis='y')
        
        for i, v in enumerate(rmse_values):
            axes[0, 1].text(i, v + max(rmse_values)*0.02, f'{v:.2f}', 
                           ha='center', fontweight='bold')
        
        # Plot 3: R² Score comparison
        r2_values = [metrics[n]['R2'] for n in nutrients]
        bars = axes[1, 0].bar(nutrients, r2_values, 
                              color=['orange', 'blue', 'green', 'red'],
                              edgecolor='black', linewidth=2)
        axes[1, 0].axhline(y=0.7, color='green', linestyle='--', 
                          label='Good Threshold', linewidth=2)
        axes[1, 0].set_ylabel('R² Score', fontsize=12)
        axes[1, 0].set_title('R² Score by Nutrient', fontsize=13, fontweight='bold')
        axes[1, 0].set_ylim([0, 1])
        axes[1, 0].legend()
        axes[1, 0].grid(True, alpha=0.3, axis='y')
        
        for i, v in enumerate(r2_values):
            axes[1, 0].text(i, v + 0.02, f'{v:.3f}', 
                           ha='center', fontweight='bold')
        
        # Plot 4: Overall accuracy score
        overall_r2 = np.mean(r2_values)
        overall_mae = np.mean(mae_values)
        
        metrics_summary = ['R² Score', 'Normalized\nMAE']
        values = [overall_r2 * 100, (1 - min(overall_mae/200, 1)) * 100]
        
        bars = axes[1, 1].bar(metrics_summary, values, 
                             color=['#2ecc71', '#3498db'],
                             edgecolor='black', linewidth=2)
        axes[1, 1].set_ylabel('Score (%)', fontsize=12)
        axes[1, 1].set_title('Overall Model Performance', fontsize=13, fontweight='bold')
        axes[1, 1].set_ylim([0, 100])
        axes[1, 1].grid(True, alpha=0.3, axis='y')
        
        for i, v in enumerate(values):
            axes[1, 1].text(i, v + 2, f'{v:.1f}%', 
                           ha='center', fontweight='bold', fontsize=12)
        
        plt.tight_layout()
        plt.savefig('performance_summary.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: performance_summary.png\n")
        plt.close()
    
    def run_comprehensive_evaluation(self):
        """Run full evaluation pipeline"""
        print("🚀 Starting comprehensive evaluation...\n")
        
        # Step 1: Train with epochs and get metrics
        epoch_metrics, knn_model, scaler, X_train, X_test = self.train_with_epochs(
            n_neighbors=10, epochs=15
        )
        
        # Step 2: Get predictions
        predictions, actuals, metrics = self.evaluate_nutritional_predictions(
            knn_model, scaler, X_test
        )
        
        # Step 3: Create confusion matrix
        conf_matrix, categories = self.create_confusion_matrix_categorical(
            predictions, actuals
        )
        
        # Step 4: Generate all visualizations
        print("="*70)
        print("📊 GENERATING VISUALIZATIONS")
        print("="*70 + "\n")
        
        self.plot_epoch_metrics(epoch_metrics)
        self.plot_confusion_matrix(conf_matrix, categories)
        self.plot_prediction_heatmaps(predictions, actuals)
        self.plot_error_distribution(predictions, actuals, metrics)
        self.plot_correlation_heatmap()
        self.plot_performance_summary(metrics)
        
        # Step 5: Generate final report
        self.generate_final_report(epoch_metrics, metrics, conf_matrix)
        
        print("="*70)
        print("✅ EVALUATION COMPLETE!")
        print("="*70 + "\n")
        
        print("📁 Generated Files:")
        print("   1. epoch_metrics.png - Training metrics over epochs")
        print("   2. confusion_matrix.png - Calorie category predictions")
        print("   3. prediction_heatmaps.png - Prediction vs actual analysis")
        print("   4. error_distributions.png - Error distribution analysis")
        print("   5. correlation_heatmap.png - Feature correlations")
        print("   6. performance_summary.png - Overall performance metrics")
        print("   7. advanced_evaluation_report.txt - Detailed text report\n")
    
    def generate_final_report(self, epoch_metrics, metrics, conf_matrix):
        """Generate comprehensive text report"""
        with open('advanced_evaluation_report.txt', 'w') as f:
            f.write("="*70 + "\n")
            f.write("ADVANCED DIET RECOMMENDATION MODEL EVALUATION REPORT\n")
            f.write("="*70 + "\n\n")
            
            f.write(f"Dataset Size: {len(self.df_clean)} recipes\n")
            f.write(f"Training Split: {(1-self.test_size)*100:.0f}%\n")
            f.write(f"Test Split: {self.test_size*100:.0f}%\n")
            f.write(f"Features Used: {len(self.features)}\n\n")
            
            f.write("="*70 + "\n")
            f.write("TRAINING METRICS (Final Epoch)\n")
            f.write("="*70 + "\n")
            f.write(f"Final Train Distance: {epoch_metrics['train_distance'][-1]:.4f}\n")
            f.write(f"Final Test Distance: {epoch_metrics['test_distance'][-1]:.4f}\n")
            f.write(f"Final Train Accuracy: {epoch_metrics['train_accuracy'][-1]:.2f}%\n")
            f.write(f"Final Test Accuracy: {epoch_metrics['test_accuracy'][-1]:.2f}%\n\n")
            
            f.write("="*70 + "\n")
            f.write("REGRESSION METRICS BY NUTRIENT\n")
            f.write("="*70 + "\n")
            for nutrient in ['Calories', 'Protein', 'Carbs', 'Fat']:
                f.write(f"\n{nutrient}:\n")
                f.write(f"  Mean Absolute Error (MAE): {metrics[nutrient]['MAE']:.2f}\n")
                f.write(f"  Root Mean Squared Error (RMSE): {metrics[nutrient]['RMSE']:.2f}\n")
                f.write(f"  R² Score: {metrics[nutrient]['R2']:.4f}\n")
                f.write(f"  Mean Squared Error (MSE): {metrics[nutrient]['MSE']:.2f}\n")
            
            f.write("\n" + "="*70 + "\n")
            f.write("CONFUSION MATRIX (Calorie Categories)\n")
            f.write("="*70 + "\n")
            f.write("Categories: Low (<300 cal), Medium (300-600 cal), High (>600 cal)\n\n")
            f.write("                 Predicted\n")
            f.write("              Low  Medium  High\n")
            f.write("Actual Low    " + "  ".join([f"{conf_matrix[0][j]:5d}" for j in range(3)]) + "\n")
            f.write("       Medium " + "  ".join([f"{conf_matrix[1][j]:5d}" for j in range(3)]) + "\n")
            f.write("       High   " + "  ".join([f"{conf_matrix[2][j]:5d}" for j in range(3)]) + "\n")
            
            # Calculate accuracy from confusion matrix
            diagonal_sum = sum([conf_matrix[i][i] for i in range(3)])
            total_sum = conf_matrix.sum()
            cat_accuracy = (diagonal_sum / total_sum) * 100
            
            f.write(f"\nCategorical Accuracy: {cat_accuracy:.2f}%\n")
            
            f.write("\n" + "="*70 + "\n")
            f.write("OVERALL MODEL ASSESSMENT\n")
            f.write("="*70 + "\n")
            
            avg_r2 = np.mean([metrics[n]['R2'] for n in ['Calories', 'Protein', 'Carbs', 'Fat']])
            avg_mae = np.mean([metrics[n]['MAE'] for n in ['Calories', 'Protein', 'Carbs', 'Fat']])
            
            f.write(f"Average R² Score: {avg_r2:.4f}\n")
            f.write(f"Average MAE: {avg_mae:.2f}\n")
            f.write(f"Categorical Accuracy: {cat_accuracy:.2f}%\n")
            f.write(f"Test Accuracy: {epoch_metrics['test_accuracy'][-1]:.2f}%\n\n")
            
            if avg_r2 >= 0.7:
                grade = "A (Excellent)"
            elif avg_r2 >= 0.5:
                grade = "B (Good)"
            elif avg_r2 >= 0.3:
                grade = "C (Fair)"
            else:
                grade = "D (Needs Improvement)"
            
            f.write(f"Model Grade: {grade}\n")
            
        print("✅ Saved: advanced_evaluation_report.txt\n")

def main():
    """Main execution function"""
    try:
        # Initialize evaluator with 30% test split
        evaluator = AdvancedDietEvaluator(test_size=0.3)
        
        # Run comprehensive evaluation
        evaluator.run_comprehensive_evaluation()
        
    except FileNotFoundError:
        print("❌ Error: Could not find 'Data/dataset.csv'")
        print("   Make sure you're running this from the Diet-Recommendation-System directory\n")
    except Exception as e:
        print(f"❌ Error during evaluation: {str(e)}\n")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
