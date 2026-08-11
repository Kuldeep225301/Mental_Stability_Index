# Mental Health Score Predictor

An end-to-end Machine Learning web application designed to predict and analyze mental stability metrics based on lifestyle, demographic, and behavioral parameters. The application serves real-time predictions via an asynchronous FastAPI backend deployed on Render.

---
# Overview
Understanding mental stability metrics requires combining data science with accessible tools. I built and deployed an interactive ML pipeline that transforms raw survey data into actionable predictions through a lightweight REST API.

## Key Project Outcomes & Impact

* **Real-Time Predictions:** Delivered an interactive REST API with sub-100ms response times for prediction queries.
* **Model Benchmark Optimization:** Compared multiple Machine Learning models to identify the optimal balance between variance and bias, achieving a peak $R^2$ score of **~75.3%**.
* **Production-Ready Pipeline:** Serialized preprocessors and model estimators into unified pipelines (`joblib`) to prevent data leakage between training and inference phases.
* **Cloud Infrastructure:** Integrated automated CI/CD deployment from GitHub to Render using SSH-authenticated workflows.

---

## 📊 Model Evaluation & Results

We trained and evaluated multiple algorithms to predict mental health stability scores. Below is the comparative performance breakdown on unseen test data:

| Metric | Linear Regression | Random Forest Regressor |
| :--- | :--- | :--- |
| **Testing $R^2$ Score / Accuracy** | **75.30%** | **75.30%** |
| **Training $R^2$ Score** | 71.81% | 98.15% |
| **Mean Absolute Error (MAE)** | 0.513 | 0.513 |
| **Mean Squared Error (MSE)** | 0.427 | 0.427 |
| **Root Mean Squared Error (RMSE)** | 0.653 | 0.653 |

> **Key Observation:** While Random Forest exhibited overfitting on the training set (98.15%), both models converged to a stable testing performance of ~75.3% accuracy with identical error rates ($\text{MAE} \approx 0.51$), confirming strong baseline predictability.

---

## Tech Stack

* **Language & Libraries:**  Python, Pandas, NumPy, Seaborn, Scikit-Learn, ML, Joblib.
* **Backend Framework:** FastAPI, Uvicorn, Pydantic, 
* **Deployment & Version Control:** Render, Git, GitHub, SSH

---

## Live Demo & API Documentation

* * **Live Application:** [Mental Stability Index on Render](https://mental-stability-index.onrender.com)
* **Interactive API Docs (Swagger UI):** `https://mental-stability-index.onrender.com/docs`

---

## Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Kuldeep225301/Mental_Stability_Index.git
   cd Mental_Stability_Index
