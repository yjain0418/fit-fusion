from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import KNeighborsClassifier

app = Flask(__name__)

df = pd.read_csv(r"./public/HEALTH DATASET.csv", usecols=['age', 'height', 'weight', 'sex', 'waistline', 'health_status'], nrows=100000)

label_encoder = LabelEncoder()
df['sex'] = label_encoder.fit_transform(df['sex'])
df['health_status'] = label_encoder.fit_transform(df['health_status'])

X = df[['age', 'height', 'weight', 'sex', 'waistline']]
y = df['health_status']

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_scaled, y)

health_status_mapping = dict(zip(label_encoder.transform(label_encoder.classes_), label_encoder.classes_))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        age = float(data['age'])
        height = float(data['height'])
        weight = float(data['weight'])
        sex = int(data['sex'])
        waistline = float(data['waistline'])

        input_data = np.array([[age, height, weight, sex, waistline]])
        input_scaled = scaler.transform(input_data)
        prediction = knn.predict(input_scaled)[0]
        health_status = health_status_mapping[prediction]

        return jsonify({'result': health_status})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)