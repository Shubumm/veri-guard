import os
import json
from datetime import datetime
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://taggsqrnpinmsscmudac.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZ2dzcXJucGlubXNzY211ZGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzE1MjksImV4cCI6MjA4OTk0NzUyOX0.0CD5qXVyl0cGkfE6KniH6thZLIRLRCbvyomEeOaZF7Y"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def log_transaction(input_data: dict, prediction: dict):
    try:
        supabase.table("transactions").insert({
            "timestamp": datetime.now().isoformat(),
            "amount": float(input_data.get("Amount", 0)),
            "fraud_probability": float(prediction.get("fraud_probability", 0)),
            "risk_level": prediction.get("risk_level", ""),
            "action": prediction.get("action", ""),
            "input_data": input_data,
            "prediction": prediction
        }).execute()
    except Exception as e:
        print(f"Logging error: {e}")

def get_recent_transactions(limit: int = 10):
    try:
        response = supabase.table("transactions")\
            .select("*")\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()
        return response.data
    except Exception as e:
        print(f"Fetch error: {e}")
        return []

def get_stats():
    try:
        response = supabase.table("transactions").select("action").execute()
        logs = response.data
        total = len(logs)
        blocked = sum(1 for l in logs if l['action'] == 'BLOCKED')
        flagged = sum(1 for l in logs if l['action'] == 'FLAGGED')
        approved = sum(1 for l in logs if l['action'] == 'APPROVED')
        return {
            'total': total,
            'blocked': blocked,
            'flagged': flagged,
            'approved': approved
        }
    except Exception as e:
        print(f"Stats error: {e}")
        return {'total': 0, 'blocked': 0, 'flagged': 0, 'approved': 0}