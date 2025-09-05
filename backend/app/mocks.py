from datetime import datetime, timezone
from typing import List, Dict, Any
from . import models, schemas

def create_mock_lessons() -> List[Dict[str, Any]]:
    """Generate mock lesson data with content and quiz questions"""
    return [
        {
            "id": 1,
            "title": "Introduction to Stock Market",
            "description": "Learn the basics of stock market investing",
            "icon": "📈",
            "order_index": 1,
            "is_active": True,
            "content_items": [
                {
                    "id": 1,
                    "content_type": "text",
                    "content": "Welcome to the world of stock market investing! In this lesson, we'll cover the fundamental concepts you need to know.",
                    "order_index": 1
                },
                {
                    "id": 2,
                    "content_type": "text",
                    "content": "The stock market is where buyers and sellers trade shares of publicly traded companies.",
                    "order_index": 2
                },
                {
                    "id": 3,
                    "content_type": "quiz",
                    "question": "What is the stock market?",
                    "options": [
                        "A place to buy groceries",
                        "A marketplace for buying and selling company shares",
                        "A type of bank account"
                    ],
                    "correct_answer": 1,
                    "explanation": "The stock market is a marketplace where buyers and sellers trade shares of publicly traded companies.",
                    "order_index": 3
                }
            ]
        },
        {
            "id": 2,
            "title": "Understanding Stock Prices",
            "description": "Learn how stock prices are determined",
            "icon": "💹",
            "order_index": 2,
            "is_active": True,
            "content_items": [
                {
                    "id": 4,
                    "content_type": "text",
                    "content": "Stock prices are determined by supply and demand in the market.",
                    "order_index": 1
                },
                {
                    "id": 5,
                    "content_type": "quiz",
                    "question": "What primarily determines a stock's price?",
                    "options": [
                        "The company's CEO's salary",
                        "Supply and demand in the market",
                        "The color of the stock ticker"
                    ],
                    "correct_answer": 1,
                    "explanation": "Stock prices are primarily determined by the balance between supply (sellers) and demand (buyers) in the market.",
                    "order_index": 2
                }
            ]
        },
        {
            "id": 3,
            "title": "Risk Management",
            "description": "Learn how to manage investment risks",
            "icon": "🛡️",
            "order_index": 3,
            "is_active": True,
            "content_items": [
                {
                    "id": 6,
                    "content_type": "text",
                    "content": "Diversification is key to managing investment risk.",
                    "order_index": 1
                },
                {
                    "id": 7,
                    "content_type": "quiz",
                    "question": "What is a good strategy to manage investment risk?",
                    "options": [
                        "Investing all your money in one stock",
                        "Diversifying your investments",
                        "Following stock tips from social media"
                    ],
                    "correct_answer": 1,
                    "explanation": "Diversification helps spread risk across different investments, reducing the impact of any single investment's performance on your overall portfolio.",
                    "order_index": 2
                }
            ]
        }
    ]

def get_mock_user() -> Dict[str, Any]:
    """Generate mock user data"""
    return {
        "id": 1,
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

def get_mock_user_progress() -> Dict[str, Any]:
    """Generate mock user progress data"""
    return {
        "user_id": 1,
        "lesson_id": 1,
        "completed": True,
        "score": 100,
        "last_accessed": datetime.now(timezone.utc).isoformat()
    }
