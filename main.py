import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware # CORS-> CROSS ORIGIN RESOURCE SHARING

# CORS->it allow to access the resourses from different origin (domain) from one server to other server.

app = FastAPI(title="Mental Health Score Prediction USing ML FastAPI ")

models = joblib.load("Mental_Health_Model.pkl")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],   # <-- fixed: was "allow_method" (missing the 's')
    allow_headers=["*"],
)


top_countries = ["Other", "India", "USA", "Canada", "Australia", "UK", "Germany", "Mexico", "Turkey", "France"]

class PredictionResponse(BaseModel):
    predicted_Mental_Health_Score: float


@app.get("/")
def greet():
    return {"message": "Welcome to my Mental Health Score ML Prediction Project."}


class MentalHealth(BaseModel):
    Age: int = Field(ge=10, le=100, description="Age of Studednt")
    Gender: Literal['Male', 'Female'] = Field(description=" Gender of Student ")
    Country: str = Field(description=" Students Country nam ")
    Academic_Level: Literal['Undergraduate', 'Graduate', 'High School'] = Field(description=" Academic_Level of the Students ")
    Most_Used_Platform: Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter', 'YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat'] = Field(description=" Academic_Level of the Students ")
    Purpose_Of_Use: Literal['Networking', 'Education', 'Entertainment', 'News'] = Field(description=" Purpose of the Students ")
    Avg_Daily_Usage_Hours: float = Field(ge=0, le=24, description=" Avg_Daily_Usage_Hours by the Students ")
    Daily_Unlocks: int = Field(ge=0, description=" Daily_Unlocks by the Students ")
    Study_Hours: float = Field(ge=0, le=24, description="Study_Hours of the Students ")
    Physical_Activity_Hours: float = Field(ge=0, description="Physical_Activity_Hours by the Students ")
    Sleep_Hours_Per_Night: float = Field(ge=0, le=24, description=" Sleep_Hours_Per_Night by the Students")
    Stress_Level: Literal['Medium', 'Low', 'Very High', 'High'] = Field(description=" Stress_Level of the Students ")


@app.post("/predict", response_model=PredictionResponse)
def predict_mental_health(data: MentalHealth):

    country_group = data.Country if data.Country in top_countries else "Other"

    try:
        input_data = pd.DataFrame([{
            "Age": data.Age,
            "Gender": data.Gender,
            "Country": data.Country,
            "Academic_Level": data.Academic_Level,
            "Most_Used_Platform": data.Most_Used_Platform,
            "Purpose_Of_Use": data.Purpose_Of_Use,
            "Avg_Daily_Usage_Hours": data.Avg_Daily_Usage_Hours,
            "Daily_Unlocks": data.Daily_Unlocks,
            "Study_Hours": data.Study_Hours,
            "Physical_Activity_Hours": data.Physical_Activity_Hours,
            "Sleep_Hours_Per_Night": data.Sleep_Hours_Per_Night,
            "Stress_Level": data.Stress_Level,
            "Grouped_Country": country_group
        }])

        prediction = models.predict(input_data)[0]

        return PredictionResponse(
            predicted_Mental_Health_Score=round(float(prediction), 2)
        )

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error in prediction: {str(e)}"
        )

