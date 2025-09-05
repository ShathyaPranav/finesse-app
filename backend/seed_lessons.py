import json
import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Lesson, LessonContent, QuizQuestion

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finesse.db")

# Create database session
engine = create_engine(DATABASE_URL)

# Ensure all tables are created
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def create_lesson(lesson_data):
    """Create a lesson with its content items and quiz questions."""
    # Create the lesson
    lesson = Lesson(
        title=lesson_data['title'],
        description=lesson_data['description'],
        icon=lesson_data.get('icon', '📚'),
        xp_reward=lesson_data.get('xp', 100),
        estimated_duration=lesson_data.get('estimatedDuration', 30),
        order_index=lesson_data.get('order_index', 0),
        is_active=True
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    
    # Add content items
    for content_item in lesson_data['content']:
        content = LessonContent(
            lesson_id=lesson.id,
            content_type=content_item['type'],
            title=content_item['title'],
            content=json.dumps(content_item.get('content', {})),
            order_index=content_item.get('order_index', 0)
        )
        db.add(content)
        db.commit()
        db.refresh(content)
        
        # Add quiz questions if content type is quiz
        if content_item['type'] == 'quiz':
            question = content_item  # The quiz content is the question itself
            quiz_question = QuizQuestion(
                lesson_content_id=content.id,
                question=question['question'],
                options=json.dumps(question['options']),
                correct_answer=question['correctAnswer'],
                explanation=question.get('explanation', ''),
                order_index=0
            )
            db.add(quiz_question)
    
    db.commit()
    return lesson

def seed_database():
    print("Seeding database with initial lesson data...")
    
    try:
        # Clear existing data (for development)
        print("Clearing existing data...")
        db.query(QuizQuestion).delete()
        db.query(LessonContent).delete()
        db.query(Lesson).delete()
        db.commit()
    except Exception as e:
        print(f"Warning: Could not clear existing data: {e}")
        db.rollback()
    
    # Sample lesson data (similar to what we had in the frontend)
    lessons_data = [
        {
            "id": 1,
            "title": "Introduction to Investing",
            "description": "Master the fundamentals of investing and build a strong financial foundation.",
            "icon": "💰",
            "xp": 150,
            "estimatedDuration": 30,
            "order_index": 1,
            "content": [
                {
                    "id": "1-1",
                    "type": "text",
                    "title": "What is Investing?",
                    "content": "Investing is the act of allocating resources, usually money, with the expectation of generating an income or profit. Unlike saving, which focuses on preserving money, investing aims to grow your wealth over time through various financial instruments.",
                    "order_index": 1
                },
                {
                    "id": "1-2",
                    "type": "text",
                    "title": "Why Invest?",
                    "content": "Investing helps you:\n\n- Beat inflation and maintain purchasing power\n- Achieve long-term financial goals (retirement, home ownership, education)\n- Generate passive income streams\n- Build wealth over time through compound growth\n\nThe key is to start early and remain consistent.",
                    "order_index": 2
                },
                {
                    "id": "1-3",
                    "type": "quiz",
                    "title": "Understanding Investment Basics",
                    "question": "What is the primary purpose of investing?",
                    "options": [
                        "To spend money immediately on wants",
                        "To generate income or profit over time",
                        "To avoid paying taxes",
                        "To keep money under your mattress"
                    ],
                    "correctAnswer": 1,
                    "explanation": "The main goal of investing is to generate returns over time, helping your money grow and outpace inflation.",
                    "order_index": 3
                },
                {
                    "id": "1-4",
                    "type": "text",
                    "title": "The Power of Compounding",
                    "content": "Albert Einstein called compound interest the \"eighth wonder of the world.\" Here's why:\n\n- Your money earns returns\n- Those returns generate their own returns\n- The cycle continues, creating exponential growth\n\nExample: Investing $100 monthly at 7% return:\n- After 10 years: $17,308\n- After 20 years: $52,093\n- After 30 years: $113,356",
                    "order_index": 4
                },
                {
                    "id": "1-5",
                    "type": "quiz",
                    "title": "Compound Interest Quiz",
                    "question": "If you invest $1,000 at an 8% annual return, how much would you have after 10 years with annual compounding?",
                    "options": [
                        "$1,800",
                        "$2,158.92",
                        "$2,500",
                        "$3,000"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Using the compound interest formula: $1,000 * (1 + 0.08)^10 = $2,158.92. This demonstrates how money grows exponentially over time.",
                    "order_index": 5
                },
                {
                    "id": "1-6",
                    "type": "text",
                    "title": "Risk vs. Return",
                    "content": "Key investment principles:\n\n1. Higher potential returns usually come with higher risk\n2. Diversification reduces risk\n3. Time in the market beats timing the market\n4. Start early to maximize compounding\n5. Stay invested through market fluctuations",
                    "order_index": 6
                },
                {
                    "id": "1-7",
                    "type": "quiz",
                    "title": "Risk and Return",
                    "question": "Which statement about risk and return is TRUE?",
                    "options": [
                        "All high-risk investments guarantee high returns",
                        "Low-risk investments typically offer the highest returns",
                        "Higher potential returns usually come with higher risk",
                        "Investing in a single stock is the safest strategy"
                    ],
                    "correctAnswer": 2,
                    "explanation": "The fundamental principle of investing is the risk-return tradeoff. Higher potential returns are generally associated with higher levels of risk.",
                    "order_index": 7
                }
            ]
        },
        {
            "id": 2,
            "title": "Stocks: Building Blocks of Wealth",
            "description": "Master stock market fundamentals and learn how to evaluate companies.",
            "icon": "📈",
            "xp": 200,
            "estimatedDuration": 40,
            "order_index": 2,
            "content": [
                {
                    "id": "2-1",
                    "type": "text",
                    "title": "Understanding Stocks",
                    "content": "Stocks represent ownership shares in a company. When you buy a stock, you become a partial owner (shareholder) of that business.\n\nKey concepts:\n- Common vs. Preferred shares\n- Market capitalization\n- Stock exchanges (NSE, BSE, NYSE, NASDAQ)\n- Ticker symbols",
                    "order_index": 1
                },
                {
                    "id": "2-2",
                    "type": "text",
                    "title": "How Stocks Generate Returns",
                    "content": "Stock investors earn money through:\n\n1. Price Appreciation: Selling shares for more than purchase price\n2. Dividends: Regular payouts from company profits\n\nExample: If you buy 10 shares at ₹1,000 each and sell at ₹1,500, your capital gain is ₹5,000 (before taxes and fees).",
                    "order_index": 2
                },
                {
                    "id": "2-3",
                    "type": "quiz",
                    "title": "Stock Market Basics",
                    "question": "What does it mean to own a share of stock?",
                    "options": [
                        "You are lending money to the company",
                        "You own a small piece of the company",
                        "You are guaranteed annual returns",
                        "You become a company employee"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Owning a share means you own a fractional ownership stake in the company, making you a shareholder with certain rights.",
                    "order_index": 3
                },
                {
                    "id": "2-4",
                    "type": "text",
                    "title": "Fundamental Analysis",
                    "content": "How to evaluate stocks:\n\n- P/E Ratio: Price-to-Earnings ratio\n- P/B Ratio: Price-to-Book ratio\n- Debt-to-Equity: Company's financial leverage\n- ROE: Return on Equity\n- Dividend Yield: Annual dividend/stock price\n\nAlways research before investing.",
                    "order_index": 4
                },
                {
                    "id": "2-5",
                    "type": "quiz",
                    "title": "Stock Evaluation",
                    "question": "A company with a P/E ratio of 15 means:",
                    "options": [
                        "The stock price is 15 times the annual earnings per share",
                        "The company pays a 15% dividend",
                        "The stock price increased 15% this year",
                        "The company has 15% market share"
                    ],
                    "correctAnswer": 0,
                    "explanation": "P/E ratio compares a company's stock price to its earnings per share, helping investors assess if a stock is overvalued or undervalued.",
                    "order_index": 5
                },
                {
                    "id": "2-6",
                    "type": "text",
                    "title": "Investment Strategies",
                    "content": "Popular stock investment approaches:\n\n1. Value Investing: Finding undervalued stocks\n2. Growth Investing: Companies with high growth potential\n3. Dividend Investing: Focus on regular income\n4. Index Investing: Buying market indexes (e.g., NIFTY 50, S&P 500)\n5. Dollar-Cost Averaging: Investing fixed amounts regularly",
                    "order_index": 6
                },
                {
                    "id": "2-7",
                    "type": "quiz",
                    "title": "Investment Strategies",
                    "question": "Which strategy involves investing a fixed amount at regular intervals regardless of market conditions?",
                    "options": [
                        "Market Timing",
                        "Dollar-Cost Averaging",
                        "Day Trading",
                        "Swing Trading"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Dollar-cost averaging reduces the impact of market volatility by spreading purchases over time, often leading to better average purchase prices.",
                    "order_index": 7
                }
            ]
        },
        {
            "id": 3,
            "title": "Bonds: Fixed Income Essentials",
            "description": "Master bonds and other fixed income securities for stable returns.",
            "icon": "📊",
            "xp": 180,
            "estimatedDuration": 35,
            "order_index": 3,
            "content": [
                {
                    "id": "3-1",
                    "type": "text",
                    "title": "Understanding Bonds",
                    "content": "Bonds are debt securities where investors lend money to entities (governments, corporations) that borrow funds for a defined period at a fixed interest rate.\n\nKey terms:\n- Face Value: The amount paid at maturity\n- Coupon Rate: Annual interest payment\n- Maturity Date: When the bond principal is repaid\n- Yield: Effective return considering price and interest",
                    "order_index": 1
                },
                {
                    "id": "3-2",
                    "type": "text",
                    "title": "Types of Bonds",
                    "content": "1. Government Bonds: Issued by national governments (e.g., Treasury bills, G-Secs)\n2. Corporate Bonds: Issued by companies\n3. Municipal Bonds: Issued by local governments\n4. Convertible Bonds: Can be converted to stock\n5. Zero-Coupon Bonds: No periodic interest payments\n\nEach type has different risk and return characteristics.",
                    "order_index": 2
                },
                {
                    "id": "3-3",
                    "type": "quiz",
                    "title": "Bond Basics",
                    "question": "What happens to bond prices when interest rates rise?",
                    "options": [
                        "Bond prices increase",
                        "Bond prices decrease",
                        "Bond prices remain unchanged",
                        "Bond prices become more volatile"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Bond prices and interest rates have an inverse relationship. When rates rise, existing bonds with lower rates become less attractive, causing their prices to fall.",
                    "order_index": 3
                },
                {
                    "id": "3-4",
                    "type": "text",
                    "title": "Bond Pricing and Yield",
                    "content": "Bond pricing is inversely related to interest rates:\n\n- When rates fall, bond prices rise\n- When rates rise, bond prices fall\n- Longer-term bonds are more sensitive to rate changes\n\nYield to Maturity (YTM) is the total return anticipated if held until maturity.",
                    "order_index": 4
                },
                {
                    "id": "3-5",
                    "type": "quiz",
                    "title": "Bond Yield Quiz",
                    "question": "A bond with a 5% coupon rate trading at ₹950 (face value ₹1000) has a current yield of:",
                    "options": [
                        "5.0%",
                        "5.26%",
                        "4.75%",
                        "Cannot be determined"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Current yield = (Annual coupon payment / Current market price) × 100 = (₹50 / ₹950) × 100 = 5.26%",
                    "order_index": 5
                },
                {
                    "id": "3-6",
                    "type": "quiz",
                    "title": "Bond Risk Assessment",
                    "question": "Which type of bond typically offers the highest yield?",
                    "options": [
                        "Government bonds",
                        "High-grade corporate bonds",
                        "High-yield (junk) bonds",
                        "Municipal bonds"
                    ],
                    "correctAnswer": 2,
                    "explanation": "High-yield bonds offer higher returns to compensate investors for taking on greater credit risk and default probability.",
                    "order_index": 6
                }
            ]
        },
        {
            "id": 4,
            "title": "Diversification Strategies",
            "description": "Learn how to spread risk across different asset classes.",
            "icon": "🧺",
            "xp": 170,
            "estimatedDuration": 30,
            "order_index": 4,
            "content": [
                {
                    "id": "4-1",
                    "type": "text",
                    "title": "The Power of Diversification",
                    "content": "Diversification is the practice of spreading investments across various financial instruments, industries, and other categories to reduce risk.\n\nKey benefits:\n- Reduces portfolio volatility\n- Minimizes impact of poor-performing assets\n- Provides more consistent returns over time\n- Protects against market downturns",
                    "order_index": 1
                },
                {
                    "id": "4-2",
                    "type": "text",
                    "title": "Asset Class Diversification",
                    "content": "Different asset classes behave differently:\n\n1. Stocks: Higher risk, higher potential returns\n2. Bonds: Lower risk, steady income\n3. Real Estate: Inflation hedge, tangible asset\n4. Commodities: Protection against inflation\n5. Cash: Liquidity and stability\n\nMix these based on your risk tolerance and goals.",
                    "order_index": 2
                },
                {
                    "id": "4-3",
                    "type": "quiz",
                    "title": "Diversification Basics",
                    "question": "What is the main purpose of diversification?",
                    "options": [
                        "To maximize returns",
                        "To reduce risk",
                        "To minimize taxes",
                        "To increase liquidity"
                    ],
                    "correctAnswer": 1,
                    "explanation": "The primary goal of diversification is to reduce risk by spreading investments across different assets that don't move in perfect correlation.",
                    "order_index": 3
                },
                {
                    "id": "4-4",
                    "type": "text",
                    "title": "Geographic and Sector Diversification",
                    "content": "Beyond asset classes, diversify by:\n\n- Geography: Domestic vs. international markets\n- Sectors: Technology, healthcare, finance, etc.\n- Company size: Large-cap, mid-cap, small-cap\n- Investment style: Growth vs. value stocks\n\nThis reduces concentration risk in any single area.",
                    "order_index": 4
                },
                {
                    "id": "4-5",
                    "type": "quiz",
                    "title": "Portfolio Allocation",
                    "question": "A 25-year-old investor should typically have what stock allocation?",
                    "options": [
                        "20-30%",
                        "40-50%",
                        "70-80%",
                        "90-100%"
                    ],
                    "correctAnswer": 2,
                    "explanation": "Young investors can typically handle more risk and should have 70-80% in stocks to maximize long-term growth potential.",
                    "order_index": 5
                },
                {
                    "id": "4-6",
                    "type": "quiz",
                    "title": "Correlation Understanding",
                    "question": "Assets with low correlation are beneficial because they:",
                    "options": [
                        "Always move in the same direction",
                        "Move independently of each other",
                        "Guarantee higher returns",
                        "Are easier to analyze"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Low correlation means assets move independently, so when one falls, others may rise or remain stable, reducing overall portfolio risk.",
                    "order_index": 6
                }
            ]
        },
        {
            "id": 5,
            "title": "Risk Management",
            "description": "Techniques to protect your investments from significant losses.",
            "icon": "🎯",
            "xp": 190,
            "estimatedDuration": 35,
            "order_index": 5,
            "content": [
                {
                    "id": "5-1",
                    "type": "text",
                    "title": "Understanding Investment Risk",
                    "content": "Investment risk is the possibility of losing money or not achieving expected returns. Types of risk:\n\n1. Market Risk: Overall market decline\n2. Credit Risk: Borrower default\n3. Inflation Risk: Purchasing power erosion\n4. Liquidity Risk: Difficulty selling assets\n5. Interest Rate Risk: Rate changes affecting values",
                    "order_index": 1
                },
                {
                    "id": "5-2",
                    "type": "text",
                    "title": "Risk Management Strategies",
                    "content": "Key techniques to manage risk:\n\n- Asset Allocation: Spread across asset classes\n- Stop-Loss Orders: Automatic selling at predetermined prices\n- Position Sizing: Limit exposure to any single investment\n- Regular Rebalancing: Maintain target allocations\n- Emergency Fund: 3-6 months of expenses in cash",
                    "order_index": 2
                },
                {
                    "id": "5-3",
                    "type": "quiz",
                    "title": "Risk Types",
                    "question": "Which risk cannot be eliminated through diversification?",
                    "options": [
                        "Company-specific risk",
                        "Industry risk",
                        "Market risk",
                        "Credit risk"
                    ],
                    "correctAnswer": 2,
                    "explanation": "Market risk (systematic risk) affects all investments and cannot be eliminated through diversification, only reduced through asset allocation.",
                    "order_index": 3
                },
                {
                    "id": "5-4",
                    "type": "text",
                    "title": "Risk Tolerance Assessment",
                    "content": "Factors affecting risk tolerance:\n\n- Age: Younger investors can take more risk\n- Income stability: Steady income allows more risk\n- Investment timeline: Longer horizons permit more risk\n- Financial goals: Aggressive goals require more risk\n- Emotional comfort: Personal anxiety levels matter",
                    "order_index": 4
                },
                {
                    "id": "5-5",
                    "type": "quiz",
                    "title": "Stop-Loss Strategy",
                    "question": "A stop-loss order set at 10% below purchase price helps:",
                    "options": [
                        "Guarantee profits",
                        "Limit potential losses",
                        "Increase returns",
                        "Eliminate all risk"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Stop-loss orders help limit downside risk by automatically selling when losses reach a predetermined level.",
                    "order_index": 5
                },
                {
                    "id": "5-6",
                    "type": "quiz",
                    "title": "Risk-Return Relationship",
                    "question": "The risk-return tradeoff suggests that:",
                    "options": [
                        "Higher risk always means higher returns",
                        "Lower risk investments have no returns",
                        "Higher potential returns require accepting higher risk",
                        "Risk and return are unrelated"
                    ],
                    "correctAnswer": 2,
                    "explanation": "The fundamental principle is that to achieve higher potential returns, investors must be willing to accept higher levels of risk.",
                    "order_index": 6
                }
            ]
        },
        {
            "id": 6,
            "title": "Portfolio Construction",
            "description": "Build a balanced investment portfolio tailored to your goals.",
            "icon": "🏦",
            "xp": 220,
            "estimatedDuration": 45,
            "order_index": 6,
            "content": []
        }
    ]
    
    # Create lessons
    for lesson_data in lessons_data:
        try:
            print(f"Creating lesson: {lesson_data['title']}")
            create_lesson(lesson_data)
        except Exception as e:
            print(f"Error creating lesson {lesson_data['title']}: {e}")
            db.rollback()
            continue
    
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
