import { Lesson, LessonContent, QuizContent } from '../types/lessons';
import { Keys, getItemJSON, setItemJSON, getItem, getCurrentUser } from '../utils/userStorage';
import { progressApi, lessonsApi } from './api';

// Mock lesson data with content
const mockLessons: Lesson[] = [
  // Fundamentals of Investing
  {
    id: 1,
    title: 'Introduction to Investing',
    description: 'Master the fundamentals of investing and build a strong financial foundation.',
    icon: '💰',
    xp_reward: 200,
    estimated_duration: 45,
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    locked: false,
    progress: 0,
    content_items: [
      {
        id: 1,
        lesson_id: 1,
        content_type: 'text',
        title: 'Welcome to Investing',
        content: 'Welcome to the world of investing! Investing is one of the most powerful tools for building wealth and securing your financial future. In this comprehensive lesson, we\'ll explore the fundamental concepts that every successful investor needs to understand.\n\nInvesting is not just for the wealthy or financially savvy. With the right knowledge and approach, anyone can become a successful investor. This lesson will provide you with the essential building blocks to start your investment journey with confidence.\n\nWe\'ll cover topics such as the power of compound interest, different types of investments, and how to develop a solid investment strategy that aligns with your financial goals and risk tolerance.',
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        lesson_id: 1,
        content_type: 'text',
        title: 'What is Investing?',
        content: 'Investing is the act of allocating resources, usually money, with the expectation of generating income or profit over time. Unlike saving money in a bank account, which typically offers low returns, investing involves purchasing assets that have the potential to grow in value.\n\n### Key Aspects of Investing:\n\n1. **Asset Allocation**: Distributing your investments across different asset classes (stocks, bonds, real estate, etc.) to manage risk.\n2. **Risk vs. Return**: Understanding that higher potential returns typically come with higher risk.\n3. **Time Horizon**: The length of time you plan to hold an investment before needing the money.\n4. **Diversification**: Spreading investments across different assets to reduce risk.\n\nInvesting is not about getting rich quick; it\'s about building wealth gradually through smart decisions and patience.',
        order_index: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        lesson_id: 1,
        content_type: 'quiz',
        title: 'Quiz: Investment Basics',
        content: 'Test your understanding of basic investment concepts.',
        question: 'Which of the following best defines investing?',
        options: [
          'Putting money in a savings account',
          'Spending money on daily expenses',
          'Allocating money with the expectation of generating profit over time',
          'Borrowing money from a bank'
        ],
        correct_answer: 2,
        correctAnswer: 2,
        explanation: 'Investing involves allocating money with the expectation of generating income or profit over time, not just saving or spending money.',
        order_index: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        lesson_id: 1,
        content_type: 'text',
        title: 'The Power of Compound Interest',
        content: 'Albert Einstein reportedly called compound interest "the eighth wonder of the world." When you invest, you earn returns not just on your original investment, but also on the returns you\'ve already earned. This compounding effect can dramatically increase your wealth over time.\n\n### How Compound Interest Works:\n\n1. **Initial Investment**: You invest $1,000 at an 8% annual return.\n2. **Year 1**: $1,000 + ($1,000 × 0.08) = $1,080\n3. **Year 2**: $1,080 + ($1,080 × 0.08) = $1,166.40\n4. **Year 10**: $2,158.92\n5. **Year 30**: $10,062.66\n\n### Key Factors Affecting Compound Growth:\n- **Time**: The longer your money is invested, the more it can grow.\n- **Rate of Return**: Higher returns lead to faster growth.\n- **Regular Contributions**: Adding to your investments regularly can significantly boost growth.\n\nStarting early and staying invested are crucial to maximizing the power of compound interest.',
        order_index: 4,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        lesson_id: 1,
        content_type: 'text',
        title: 'Types of Investments',
        content: 'Understanding different types of investments is crucial for building a diversified portfolio. Here are the main categories:\n\n### 1. **Stocks**\n- Represent ownership in a company\n- Potential for high returns but with higher risk\n- Can provide dividends (a portion of company profits) to shareholders\n\n### 2. **Bonds**\n- Essentially loans to governments or corporations\n- Generally lower risk than stocks\n- Provide regular interest payments\n- Considered fixed-income securities\n\n### 3. **Mutual Funds**\n- Pools money from many investors\n- Professionally managed\n- Provides instant diversification\n- Can focus on specific sectors or asset classes\n\n### 4. **Exchange-Traded Funds (ETFs)**\n- Similar to mutual funds but trade like stocks\n- Typically have lower fees than mutual funds\n- Offer broad market exposure\n\n### 5. **Real Estate**\n- Physical property investments\n- Can provide rental income and appreciation\n- Requires more capital to start\n\n### 6. **Alternative Investments**\n- Includes commodities, cryptocurrencies, collectibles\n- Often more volatile and less regulated\n- Can provide portfolio diversification',
        order_index: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        lesson_id: 1,
        content_type: 'quiz',
        title: 'Quiz: Investment Types',
        content: 'Test your understanding of different investment types.',
        question: 'Which investment type represents ownership in a company and may provide dividends?',
        options: [
          'Bonds',
          'Stocks',
          'Savings Account',
          'Certificate of Deposit (CD)'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'Stocks represent ownership in a company and may provide dividends, which are a portion of the company\'s profits distributed to shareholders.',
        order_index: 6,
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        lesson_id: 1,
        content_type: 'text',
        title: 'Risk and Return',
        content: 'Understanding the relationship between risk and return is fundamental to investing. Generally, investments with higher potential returns come with higher levels of risk.\n\n### Risk vs. Return Spectrum\n\n| Investment Type | Risk Level | Potential Return |\n|-----------------|------------|------------------|\n| Savings Account | Very Low   | Very Low         |\n| Bonds           | Low        | Low to Moderate  |\n| Blue-Chip Stocks| Moderate   | Moderate         |\n| Growth Stocks   | High       | High             |\n| Cryptocurrency  | Very High  | Very High        |\n\n### Managing Investment Risk\n\n1. **Diversification**: Spread investments across different asset classes\n2. **Asset Allocation**: Choose an appropriate mix of investments based on your goals\n3. **Time Horizon**: Longer investment periods can help weather market volatility\n4. **Dollar-Cost Averaging**: Invest fixed amounts regularly to reduce impact of market timing\n\n### Understanding Volatility\n\n- Short-term price fluctuations are normal\n- Markets tend to increase in value over the long term\n- Emotional decisions during market downturns can harm returns\n- A well-diversified portfolio can help manage volatility',
        order_index: 7,
        created_at: new Date().toISOString()
      },
      {
        id: 7,
        lesson_id: 1,
        content_type: 'quiz',
        title: 'Quiz: Risk and Return',
        content: 'Test your understanding of risk and return in investing.',
        question: 'Which of the following best describes the relationship between risk and return in investing?',
        options: [
          'Higher risk always guarantees higher returns',
          'Lower risk investments typically offer higher potential returns',
          'Higher potential returns are generally associated with higher risk',
          'There is no relationship between risk and return'
        ],
        correct_answer: 2,
        correctAnswer: 2,
        explanation: 'The general principle is that investments with higher potential returns typically come with higher levels of risk. This is because investors demand higher returns as compensation for taking on additional risk.',
        order_index: 8,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        lesson_id: 1,
        content_type: 'quiz',
        title: 'Quiz: Basic Investment Concepts',
        content: 'Test your understanding of basic investment concepts',
        question: 'What is the primary goal of investing?',
        options: [
          'To spend all your money quickly',
          'To make your money grow over time',
          'To avoid paying any taxes',
          'To keep money under your mattress'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'The primary goal of investing is to make your money grow over time through the power of compound interest and capital appreciation.',
        order_index: 9,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        lesson_id: 1,
        content_type: 'quiz',
        title: 'Quiz: Compound Interest',
        content: 'Test your knowledge about compound interest',
        question: 'What makes compound interest so powerful for long-term wealth building?',
        options: [
          'You earn returns only on your initial investment',
          'You earn returns on both your initial investment and previous returns',
          'It guarantees you will never lose money',
          'It only works for wealthy people'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'Compound interest is powerful because you earn returns not just on your original investment, but also on all the returns you\'ve previously earned, creating exponential growth over time.',
        order_index: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        lesson_id: 1,
        content_type: 'quiz',
        title: 'Quiz: Investment vs Saving',
        content: 'Understanding the difference between investing and saving',
        question: 'What is the main difference between saving and investing?',
        options: [
          'Saving is for rich people, investing is for poor people',
          'Saving typically offers lower returns but more security, investing offers higher potential returns with more risk',
          'There is no difference between saving and investing',
          'Saving is illegal, investing is legal'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'Saving typically involves putting money in low-risk, low-return accounts like savings accounts, while investing involves purchasing assets with higher potential returns but also higher risk.',
        order_index: 6,
        created_at: new Date().toISOString()
      }
    ]
  },
  // Stocks: Building Blocks of Wealth
  {
    id: 2,
    title: 'Stocks: Building Blocks of Wealth',
    description: 'Master stock market fundamentals and how to evaluate companies.',
    icon: '📈',
    xp_reward: 200,
    estimated_duration: 40,
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    locked: false,
    progress: 0,
    content_items: [
      {
        id: 7,
        lesson_id: 2,
        content_type: 'text',
        title: 'Understanding Stocks',
        content: 'Stocks represent ownership shares in publicly traded companies. When you buy a stock, you become a shareholder and own a small piece of that company. As a shareholder, you have certain rights, including voting on company matters and potentially receiving dividends if the company distributes profits to shareholders.',
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 8,
        lesson_id: 2,
        content_type: 'text',
        title: 'How Stock Prices Work',
        content: 'Stock prices are determined by supply and demand in the market. When more people want to buy a stock than sell it, the price goes up. When more people want to sell than buy, the price goes down. Factors that influence stock prices include company performance, economic conditions, industry trends, and investor sentiment.',
        order_index: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 9,
        lesson_id: 2,
        content_type: 'text',
        title: 'Types of Stock Returns',
        content: 'There are two main ways to make money from stocks: capital appreciation and dividends. Capital appreciation occurs when the stock price increases above what you paid for it. Dividends are cash payments that some companies make to shareholders, typically quarterly. Many successful investors focus on companies that provide both growth potential and steady dividend income.',
        order_index: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 10,
        lesson_id: 2,
        content_type: 'quiz',
        title: 'Quiz: Stock Ownership',
        content: 'Test your understanding of stock ownership',
        question: 'What does owning a stock mean?',
        options: [
          'You own a piece of the company and become a shareholder',
          'You have lent money to the company',
          'You are now an employee of the company',
          'You have bought the company\'s products'
        ],
        correct_answer: 0,
        correctAnswer: 0,
        explanation: 'When you own a stock, you own a share of the company and become a shareholder with certain rights and potential benefits.',
        order_index: 4,
        created_at: new Date().toISOString()
      },
      {
        id: 11,
        lesson_id: 2,
        content_type: 'quiz',
        title: 'Quiz: Stock Price Determination',
        content: 'Understanding what drives stock prices',
        question: 'What primarily determines a stock\'s price?',
        options: [
          'The company CEO\'s salary',
          'Supply and demand in the market',
          'The color of the company logo',
          'Government regulations only'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'Stock prices are primarily determined by supply and demand in the market, influenced by factors like company performance, economic conditions, and investor sentiment.',
        order_index: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 12,
        lesson_id: 2,
        content_type: 'quiz',
        title: 'Quiz: Stock Returns',
        content: 'Understanding how you can make money from stocks',
        question: 'What are the two main ways to make money from stocks?',
        options: [
          'Buying low and selling high only',
          'Capital appreciation and dividends',
          'Trading fees and commissions',
          'Borrowing money and speculation'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'The two main ways to make money from stocks are capital appreciation (stock price increase) and dividends (cash payments from profitable companies).',
        order_index: 6,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 3,
    title: 'Fundamental Analysis',
    description: 'Master the art of evaluating stocks through financial statements and key metrics.',
    icon: '📊',
    xp_reward: 300,
    estimated_duration: 50,
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    locked: false,
    progress: 0,
    content_items: [
      {
        id: 20,
        lesson_id: 3,
        content_type: 'text',
        title: 'Introduction to Fundamental Analysis',
        content: 'Fundamental analysis is a method of evaluating a security\'s intrinsic value by examining related economic, financial, and other qualitative and quantitative factors. It involves analyzing a company\'s financial statements, health, management, competitive advantages, and market position.\n\n### Why Fundamental Analysis Matters\n- Identifies undervalued or overvalued stocks\n- Helps make informed investment decisions\n- Provides long-term investment insights\n- Reduces investment risk through thorough research\n- Helps understand a company\'s true financial health',
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 21,
        lesson_id: 3,
        content_type: 'text',
        title: 'Financial Statements Deep Dive',
        content: '### 1. Balance Sheet\n- **Assets**: Current assets, fixed assets, intangible assets\n- **Liabilities**: Current liabilities, long-term debt\n- **Shareholders\' Equity**: Common stock, retained earnings\n\n### 2. Income Statement\n- Revenue and sales growth\n- Cost of goods sold (COGS)\n- Operating expenses\n- Net income and EPS\n\n### 3. Cash Flow Statement\n- Operating activities\n- Investing activities\n- Financing activities\n- Free cash flow',
        order_index: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 22,
        lesson_id: 3,
        content_type: 'text',
        title: 'Key Financial Ratios',
        content: '### Profitability Ratios\n- **Gross Margin**: (Revenue - COGS) / Revenue\n- **Operating Margin**: Operating Income / Revenue\n- **Net Profit Margin**: Net Income / Revenue\n- **Return on Equity (ROE)**: Net Income / Shareholders\' Equity\n\n### Valuation Ratios\n- **P/E Ratio**: Price per Share / Earnings per Share\n- **P/B Ratio**: Price per Share / Book Value per Share\n- **PEG Ratio**: P/E Ratio / Earnings Growth Rate\n\n### Financial Health Ratios\n- **Current Ratio**: Current Assets / Current Liabilities\n- **Debt-to-Equity**: Total Debt / Shareholders\' Equity\n- **Interest Coverage**: EBIT / Interest Expense',
        order_index: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 23,
        lesson_id: 3,
        content_type: 'quiz',
        title: 'Quiz: Financial Statements',
        content: 'Test your understanding of financial statements and ratios.',
        question: 'Which financial statement would you look at to find a company\'s revenue and expenses over a period of time?',
        options: [
          'Balance Sheet',
          'Income Statement',
          'Cash Flow Statement',
          'All of the above'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'The Income Statement shows a company\'s revenues and expenses over a specific period, typically a quarter or year.',
        order_index: 4,
        created_at: new Date().toISOString()
      },
      {
        id: 24,
        lesson_id: 3,
        content_type: 'quiz',
        title: 'Quiz: Financial Ratios',
        content: 'Test your understanding of financial ratios and their interpretations.',
        question: 'A high P/E ratio typically indicates that:',
        options: [
          'The stock is undervalued',
          'The stock is overvalued',
          'The company has high debt',
          'The company is going bankrupt'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'A high P/E ratio generally indicates that investors are expecting higher earnings growth in the future compared to companies with a lower P/E ratio, which could mean the stock is overvalued.',
        order_index: 5,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 4,
    title: 'Risk Management',
    description: 'Master essential strategies to protect your investments and manage portfolio risk effectively.',
    icon: '🛡️',
    xp_reward: 300,
    estimated_duration: 45,
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    locked: false,
    progress: 0,
    content_items: [
      {
        id: 30,
        lesson_id: 4,
        content_type: 'text',
        title: 'Understanding Investment Risk',
        content: 'Risk management is the process of identifying, assessing, and controlling threats to your investment capital. It\'s about making calculated decisions to maximize returns while minimizing potential losses.\n\n### Types of Investment Risk\n- **Market Risk**: Overall market fluctuations\n- **Credit Risk**: Risk of default\n- **Liquidity Risk**: Inability to sell quickly\n- **Inflation Risk**: Loss of purchasing power\n- **Concentration Risk**: Overexposure to a single asset\n- **Currency Risk**: Fluctuations in exchange rates',
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 31,
        lesson_id: 4,
        content_type: 'text',
        title: 'Risk Management Strategies',
        content: '### 1. Diversification\n- Spread investments across different asset classes (stocks, bonds, real estate, commodities)\n- Invest in different sectors and industries\n- Consider geographic diversification\n\n### 2. Asset Allocation\n- Determine your risk tolerance\n- Set target allocations for different asset classes\n- Rebalance portfolio periodically\n\n### 3. Position Sizing\n- Never risk more than 1-2% of your portfolio on a single trade\n- Adjust position size based on volatility\n- Use stop-loss orders to limit losses',
        order_index: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 32,
        lesson_id: 4,
        content_type: 'text',
        title: 'Advanced Risk Management Tools',
        content: '### 1. Stop-Loss Orders\n- Market orders that sell when price hits a certain level\n- Trailing stops that adjust with price movements\n\n### 2. Options Strategies\n- Protective puts for downside protection\n- Covered calls for income generation\n- Collars for range-bound markets\n\n### 3. Portfolio Hedging\n- Using inverse ETFs to hedge market risk\n- Diversifying into non-correlated assets\n- Maintaining an appropriate cash position',
        order_index: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 33,
        lesson_id: 4,
        content_type: 'quiz',
        title: 'Quiz: Risk Management Basics',
        content: 'Test your understanding of fundamental risk management concepts.',
        question: 'Which of the following is NOT a type of investment risk?',
        options: [
          'Market Risk',
          'Diversification Risk',
          'Liquidity Risk',
          'Inflation Risk'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'Diversification is actually a risk management strategy, not a type of risk. The other options are all types of investment risks.',
        order_index: 4,
        created_at: new Date().toISOString()
      },
      {
        id: 34,
        lesson_id: 4,
        content_type: 'quiz',
        title: 'Quiz: Risk Management Strategies',
        content: 'Test your understanding of risk management techniques.',
        question: 'What is the primary purpose of a stop-loss order?',
        options: [
          'To guarantee profits on every trade',
          'To limit potential losses on a position',
          'To increase leverage in your account',
          'To automatically rebalance your portfolio'
        ],
        correct_answer: 1,
        correctAnswer: 1,
        explanation: 'A stop-loss order is designed to limit an investor\'s loss on a security position by automatically selling when the security reaches a certain price.',
        order_index: 5,
        created_at: new Date().toISOString()
      }
    ]
  }
];

// Get all lessons with progress (from backend API, no mock data)
const getLessons = async (): Promise<Lesson[]> => {
  // Fetch lessons from backend API
  const lessons = await lessonsApi.getLessons();

  // Merge client-side progress (local to the current user) without altering lesson data
  const progressData = getItemJSON<any>(Keys.userProgress, {});
  return lessons.map((lesson: any) => {
    const lessonProgress = progressData[lesson.id];
    return {
      ...lesson,
      progress: lessonProgress?.progress || 0,
      completed: lessonProgress?.completed || false,
      locked: false,
    } as Lesson;
  });
};

// Get a single lesson by ID (from backend API)
const getLessonById = async (id: number): Promise<Lesson | null> => {
  const lesson = await lessonsApi.getLesson(id);

  // Normalize quiz content: backend provides quiz details inside `content` JSON.
  // The UI expects quiz fields at the top level of the content item.
  const normalizedItems = (lesson?.content_items || []).map((item: any) => {
    if (item?.content_type === 'quiz') {
      const raw = item?.content;
      let obj: any = {};
      if (typeof raw === 'string') {
        try { obj = JSON.parse(raw); } catch { obj = {}; }
      } else if (raw && typeof raw === 'object') {
        obj = raw;
      }
      return {
        ...item,
        question: obj?.question ?? '',
        options: Array.isArray(obj?.options) ? obj.options : [],
        correct_answer: typeof obj?.correct_answer === 'number' ? obj.correct_answer : (typeof obj?.correctAnswer === 'number' ? obj.correctAnswer : 0),
        correctAnswer: typeof obj?.correctAnswer === 'number' ? obj.correctAnswer : (typeof obj?.correct_answer === 'number' ? obj.correct_answer : 0),
        explanation: obj?.explanation ?? ''
      };
    }
    return item;
  });

  const progressData = getItemJSON<any>(Keys.userProgress, {});
  const lessonProgress = progressData[id];
  return {
    ...lesson,
    content_items: normalizedItems,
    progress: lessonProgress?.progress || 0,
    completed: lessonProgress?.completed || false,
    locked: false,
  } as Lesson;
};

// Update lesson progress
const updateLessonProgress = async (
  lessonId: number, 
  progress: number,
  userId: number = 1
): Promise<void> => {
  // Ensure progress is between 0 and 100
  const validatedProgress = Math.min(100, Math.max(0, progress));
  
  // Update localStorage for persistence (user-scoped), independent of mock data
  const progressData = getItemJSON<any>(Keys.userProgress, {});
  const current = progressData[lessonId]?.progress || 0;
  if (validatedProgress > current) {
    progressData[lessonId] = {
      progress: validatedProgress,
      completed: validatedProgress >= 100,
      updatedAt: new Date().toISOString(),
    };
    setItemJSON(Keys.userProgress, progressData);

    // Try syncing progress to backend when authenticated
    try {
      const user = getCurrentUser();
      if (user?.id) {
        await progressApi.updateLessonProgress(user.id, lessonId, validatedProgress);
      }
    } catch (syncErr) {
      // Non-fatal: keep local progress; log for debugging
      console.warn('Failed to sync progress to backend, using local storage only.', syncErr);
    }
  }
};

// Mark a lesson as complete
const completeLesson = async (lessonId: number): Promise<void> => {
  return updateLessonProgress(lessonId, 100);
};

// Get user's overall progress
const getUserProgress = async (userId: number = 1) => {
  const progress = getItemJSON<any>(Keys.userProgress, {});
  const lessons = await getLessons();
  const completedLessons = Object.values(progress).filter((p: any) => p.completed).length;
  
  return {
    total_lessons: lessons.length,
    completed_lessons: completedLessons,
    overall_progress: Math.round((completedLessons / lessons.length) * 100) || 0
  };
};

// Reset all progress (for testing)
const resetProgress = () => {
  // Reset only the current user's progress
  setItemJSON(Keys.userProgress, {});
};

export default {
  getLessons,
  getLessonById,
  updateLessonProgress,
  completeLesson,
  getUserProgress,
  resetProgress
};
