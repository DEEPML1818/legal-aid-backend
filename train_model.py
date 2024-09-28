# train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

# Load historical data
data = pd.read_csv('historical_data.csv')  # Example dataset

# Feature selection
X = data[['income', 'employment_status', 'education_level']]  # Example features
y = data['accepted']  # 1 if accepted, 0 if rejected

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = LogisticRegression()
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f'Model accuracy: {accuracy}')

# Save the trained model
joblib.dump(model, 'merit_model.pkl')
