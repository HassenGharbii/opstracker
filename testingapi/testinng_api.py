from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Allow requests from frontend if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
