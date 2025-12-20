from fastapi import APIRouter, Request
from App.Core.Database import get_database
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/track")
async def track_visit(request: Request):
    """Track A Page Visit From Frontend"""
    try:
        db = get_database()
        body = await request.json()
        
        visit_data = {
            "page": body.get("page", "/"),
            "timestamp": datetime.utcnow(),
            "user_agent": request.headers.get("user-agent", ""),
            "ip": request.client.host if request.client else "unknown",
            "referrer": body.get("referrer", ""),
        }
        
        await db.analytics.insert_one(visit_data)
        return {"status": "tracked"}
    except Exception as e:
        logger.error(f"Error Tracking Visit: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/stats")
async def get_analytics_stats(hours: int = 24):
    """Get Visitor Statistics For The Dashboard"""
    try:
        db = get_database()
        now = datetime.utcnow()
        
        # Get Visits For The Last N Hours
        time_threshold = now - timedelta(hours=hours)
        
        # Aggregate By Hour
        pipeline = [
            {"$match": {"timestamp": {"$gte": time_threshold}}},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$timestamp"},
                        "month": {"$month": "$timestamp"},
                        "day": {"$dayOfMonth": "$timestamp"},
                        "hour": {"$hour": "$timestamp"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1}}
        ]
        
        hourly_data = await db.analytics.aggregate(pipeline).to_list(100)
        
        # Format Data For Chart
        formatted_data = []
        for item in hourly_data:
            hour_str = f"{item['_id']['month']:02d}/{item['_id']['day']:02d} {item['_id']['hour']:02d}:00"
            formatted_data.append({
                "time": hour_str,
                "visitors": item["count"]
            })
        
        # Get Total Visitors For Different Periods
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        total_today = await db.analytics.count_documents({"timestamp": {"$gte": today_start}})
        total_week = await db.analytics.count_documents({"timestamp": {"$gte": week_start}})
        total_month = await db.analytics.count_documents({"timestamp": {"$gte": month_start}})
        total_all = await db.analytics.count_documents({})
        
        # Get Page Breakdown
        page_pipeline = [
            {"$match": {"timestamp": {"$gte": time_threshold}}},
            {"$group": {"_id": "$page", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        pages_data = await db.analytics.aggregate(page_pipeline).to_list(5)
        top_pages = [{"page": p["_id"], "visits": p["count"]} for p in pages_data]
        
        return {
            "hourly": formatted_data,
            "summary": {
                "today": total_today,
                "week": total_week,
                "month": total_month,
                "total": total_all
            },
            "topPages": top_pages
        }
    except Exception as e:
        logger.error(f"Error Getting Analytics: {e}")
        # Return Empty Data If DB Not Available
        return {
            "hourly": [],
            "summary": {"today": 0, "week": 0, "month": 0, "total": 0},
            "topPages": []
        }


@router.get("/realtime")
async def get_realtime_visitors():
    """Get Real-Time Visitor Count (Last 5 Minutes)"""
    try:
        db = get_database()
        now = datetime.utcnow()
        five_min_ago = now - timedelta(minutes=5)
        
        count = await db.analytics.count_documents({"timestamp": {"$gte": five_min_ago}})
        
        return {"activeNow": count}
    except Exception as e:
        logger.error(f"Error Getting Realtime: {e}")
        return {"activeNow": 0}