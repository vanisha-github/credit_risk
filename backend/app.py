from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
from transform import transform_input
import os



app = Flask(__name__)
CORS(app)
port = int(os.environ.get("PORT", 5000))
app.run(host="0.0.0.0", port=port)
# =========================
# LOAD MODEL
# =========================
model = joblib.load("lgb_model_2.pkl")
feature_names = joblib.load("feature_names.pkl")
explainer = joblib.load("shap_explainer.pkl")

from helper import preprocess_data
# =========================
# ROOT ROUTE (IMPORTANT)
# =========================
@app.route("/")
def home():
    return "Backend is running 🚀"

# =========================
# ROUTE
# =========================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("RAW INPUT:", data)

        raw = transform_input(data)
        df = pd.DataFrame([raw])

# ensure all columns exist
        for col in feature_names:
            if col not in df.columns:
                df[col] = 0

        df = df[feature_names]

        df.replace([np.inf, -np.inf], 0, inplace=True)
        df.fillna(0, inplace=True)

        print("AFTER PREPROCESS:\n", df.head())
        print("ANY NaN:\n", df.isnull().sum().sum())
        prob = model.predict_proba(df)[0][1]

        risk = (
            "Low Risk" if prob < 0.3
            else "Medium Risk" if prob < 0.6
            else "High Risk"
        )
        
        shap_values = explainer.shap_values(df)

# handle both old + new SHAP versions
        if isinstance(shap_values, list):
            shap_values = shap_values[1]

# get single prediction row
        shap_values = shap_values[0]

        feature_importance = sorted(
        zip(feature_names, shap_values),
        key=lambda x: abs(x[1]),
        reverse=True
        )[:5]

        return jsonify({
            "probability": float(prob),
            "risk": risk,
             "explanations": [
            {"feature": f, "impact": float(v)}
            for f, v in feature_importance
            ]
        })

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)