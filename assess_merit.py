# assess_merit.py
import sys
import joblib

# Load the trained model
model = joblib.load('merit_model.pkl')

# Extract features passed from Node.js
income = float(sys.argv[1])
employment_status = int(sys.argv[2])
education_level = int(sys.argv[3])

# Predict merit
features = [[income, employment_status, education_level]]
prediction = model.predict(features)

print(prediction[0])  # Output the prediction (1 for accepted, 0 for rejected)
