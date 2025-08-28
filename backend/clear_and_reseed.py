#!/usr/bin/env python3

"""
Clear existing lessons and reseed with new data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models

def clear_and_reseed():
    db = SessionLocal()
    
    # Delete all existing lessons
    db.query(models.Lesson).delete()
    db.commit()
    print("Cleared all existing lessons")
    
    # Beginner-friendly progressive lessons
    lessons_data = [
        {
            "title": "💰 What Are Stocks?",
            "description": "Start your investing journey - learn what stocks really are",
            "content": "A stock represents ownership in a company. When you buy a stock, you become a shareholder and own a tiny piece of that business. Companies sell stocks to raise money for growth, and you can profit when the company does well.",
            "xp_reward": 100,
            "order_index": 1,
            "category": "basics"
        },
        {
            "title": "🏪 How Stock Markets Work", 
            "description": "Discover where stocks are bought and sold",
            "content": "Stock markets are like giant marketplaces where people buy and sell company shares. The most famous ones are NYSE and NASDAQ. Prices go up when more people want to buy than sell, and down when more want to sell than buy.",
            "xp_reward": 120,
            "order_index": 2,
            "category": "basics"
        },
        {
            "title": "📱 Your First Stock Purchase",
            "description": "Learn how to actually buy your first stock",
            "content": "To buy stocks, you need a brokerage account (like Robinhood, Fidelity, or Charles Schwab). You deposit money, search for a company, decide how many shares to buy, and place your order. Start small with companies you know and understand.",
            "xp_reward": 150,
            "order_index": 3,
            "category": "basics"
        },
        {
            "title": "🛡️ Don't Lose Your Money",
            "description": "Essential rules to protect your investments",
            "content": "Never invest money you can't afford to lose. Diversify by buying different stocks, not just one. Don't panic sell when prices drop - markets go up and down. Set a budget and stick to it. Remember: investing is a marathon, not a sprint.",
            "xp_reward": 180,
            "order_index": 4,
            "category": "strategy"
        },
        {
            "title": "📊 Reading Stock Charts",
            "description": "Understand what those green and red lines mean",
            "content": "Stock charts show price movements over time. Green usually means the price went up, red means it went down. Look for trends - is the stock generally going up or down over months? Don't worry about daily fluctuations when starting out.",
            "xp_reward": 200,
            "order_index": 5,
            "category": "analysis"
        },
        {
            "title": "🎯 Building Your Portfolio",
            "description": "Create a balanced mix of investments",
            "content": "A portfolio is your collection of investments. Mix different types: some stable big companies, some growth stocks, maybe some index funds. The 'rule of 100' suggests: subtract your age from 100 - that's the percentage to put in stocks vs safer bonds.",
            "xp_reward": 220,
            "order_index": 6,
            "category": "strategy"
        }
    ]
    
    for lesson_data in lessons_data:
        lesson = models.Lesson(**lesson_data)
        db.add(lesson)
    
    db.commit()
    print(f"Created {len(lessons_data)} new lessons with database indicators!")
    db.close()

if __name__ == "__main__":
    clear_and_reseed()
