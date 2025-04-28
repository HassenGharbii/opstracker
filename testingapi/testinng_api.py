from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (adjust for production!)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load data from JSON
with open("response_1744896468032.json", "r", encoding="utf-8") as f:
    sample_data = json.load(f)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Alert API!"}

@app.get("/alerts")
def get_alerts():
    return sample_data

@app.get("/alerts/{alert_id}")
def get_alert_by_id(alert_id: str):
    for alert in sample_data:
        if alert["id"] == alert_id:
            return alert
    return {"error": "Alert not found"}