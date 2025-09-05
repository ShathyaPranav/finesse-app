import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import lessonService from '../services/lessonService';
import { Lesson, LessonContent, QuizContent } from '../types/lessons';
import LoadingSpinner from '../components/LoadingSpinner';
import TopBar from '../components/TopBar';
import '../styles/LessonPage.css';
import { Keys, getItemInt, fullyQualifiedKey, setItem } from '../utils/userStorage';

interface UserAnswer {
  [key: number]: number;
}

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer>({});
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentContent, setCurrentContent] = useState<LessonContent | null>(null);
  const [isLastStep, setIsLastStep] = useState<boolean>(false);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  
  // User data - in a real app, these would come from auth context
  const userId = 1;
  const [userScore, setUserScore] = useState<number>(0);
  const [userStreak, setUserStreak] = useState<number>(0);

  // Save current lesson ID to localStorage when it changes
  useEffect(() => {
    if (id) {
      setItem(Keys.lastVisitedLesson, id);
    }
  }, [id]);

  // Fetch lesson data and user stats on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch lesson data
        const lessonData = await lessonService.getLessonById(Number(id));
        
        if (!lessonData) {
          throw new Error('Lesson not found');
        }
        
        setLesson(lessonData);
        setProgress(lessonData.progress || 0);
        setIsCompleted(lessonData.progress === 100);
        
        // Set initial content
        if (lessonData.content_items?.length > 0) {
          setCurrentContent(lessonData.content_items[0]);
          setIsLastStep(lessonData.content_items.length === 1);
        }
        
        // Read XP and streak from localStorage (single source of truth set by Dashboard)
        const savedXP = getItemInt(Keys.userXP, 0);
        setUserScore(savedXP);
        const currentStreak = getItemInt(Keys.currentStreak, 0);
        setUserStreak(currentStreak);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load lesson. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Keep XP and streak in sync with Dashboard via localStorage when page gains focus
  useEffect(() => {
    const updateStatsFromStorage = () => {
      const savedXP = getItemInt(Keys.userXP, 0);
      setUserScore(savedXP);
      const currentStreak = getItemInt(Keys.currentStreak, 0);
      setUserStreak(currentStreak);
    };
    // Initial read on mount
    updateStatsFromStorage();
    // Update when window regains focus
    window.addEventListener('focus', updateStatsFromStorage);
    return () => window.removeEventListener('focus', updateStatsFromStorage);
  }, []);

  // Sync XP and streak across tabs via storage event
  useEffect(() => {
    const keyXP = fullyQualifiedKey(Keys.userXP);
    const keyStreak = fullyQualifiedKey(Keys.currentStreak);
    const onStorage = (e: StorageEvent) => {
      if (e.key === keyXP || e.key === keyStreak) {
        const savedXP = getItemInt(Keys.userXP, 0);
        setUserScore(savedXP);
        const currentStreak = getItemInt(Keys.currentStreak, 0);
        setUserStreak(currentStreak);
      } else if (e.key === 'user') {
        // Active user changed in another tab; refresh stats
        const savedXP = getItemInt(Keys.userXP, 0);
        setUserScore(savedXP);
        const currentStreak = getItemInt(Keys.currentStreak, 0);
        setUserStreak(currentStreak);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Update current content when step changes
  useEffect(() => {
    if (lesson?.content_items?.length) {
      const content = lesson.content_items[currentStep];
      setCurrentContent(content);
      setIsLastStep(currentStep === lesson.content_items.length - 1);
      
      // Always calculate progress based on current step
      const newProgress = Math.round(((currentStep + 1) / lesson.content_items.length) * 100);
      
      // Only update if different to avoid unnecessary re-renders
      if (newProgress !== progress) {
        setProgress(newProgress);
      }
      
      // Check if current answer exists
      const hasAnswer = userAnswers[currentStep] !== undefined;
      setHasAnswered(hasAnswer);
      
      // If it's a quiz, check if the answer is correct
      if (content.content_type === 'quiz' && hasAnswer) {
        const quizContent = content as QuizContent;
        setIsCorrect(userAnswers[currentStep] === quizContent.correct_answer);
      } else {
        setIsCorrect(false);
      }
    }
  }, [currentStep, lesson, userAnswers]);

  const handleAnswerSelect = async (stepIndex: number, answerIndex: number) => {
    // Store the current progress before updating answers
    const previousProgress = progress;
    
    // Update the user's answer
    const newAnswers = {
      ...userAnswers,
      [stepIndex]: answerIndex
    };
    setUserAnswers(newAnswers);
    setHasAnswered(true);
    
    // If it's a quiz, check if the answer is correct
    if (currentContent?.content_type === 'quiz' && lesson) {
      const quizContent = currentContent as QuizContent;
      const isAnswerCorrect = answerIndex === quizContent.correct_answer;
      setIsCorrect(isAnswerCorrect);
      
      // If the answer is incorrect, reset progress to the initial step
      if (!isAnswerCorrect) {
        // Calculate progress based on the first step only
        const initialProgress = Math.round((1 / lesson.content_items.length) * 100);
        setProgress(initialProgress);
        
        // Update progress in the backend
        try {
          await lessonService.updateLessonProgress(Number(id), initialProgress, userId);
        } catch (error) {
          console.error('Error updating progress:', error);
          // Revert progress on error
          setProgress(previousProgress);
        }
      } else {
        // For correct answers, calculate progress normally
        const newProgress = Math.round(((stepIndex + 1) / lesson.content_items.length) * 100);
        setProgress(newProgress);
      }
    }
  };

  // Save progress function that can be reused
  const saveProgress = useCallback(async (newProgress: number, isComplete: boolean = false) => {
    if (!lesson) return;
    
    // Ensure progress is a number and within bounds
    const updatedProgress = Math.min(100, Math.max(0, newProgress));
    
    // Only update if progress increases
    if (updatedProgress <= progress) return;
    
    // Update local state optimistically
    setProgress(updatedProgress);
    
    // Save to backend without blocking UI
    try {
      // Use Promise.all to ensure both updates complete
      await Promise.all([
        lessonService.updateLessonProgress(Number(id), updatedProgress, userId),
        isComplete ? lessonService.completeLesson(Number(id)) : Promise.resolve()
      ]);
      
      if (isComplete) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      // Don't revert - we'll try again on next update
    }
  }, [id, lesson, progress, userId]);

  // Save progress when step changes or component unmounts
  useEffect(() => {
    if (!lesson) return;
    
    const newProgress = Math.min(
      100,
      Math.round(((currentStep + 1) / lesson.content_items.length) * 100)
    );
    
    // Only save if progress increased
    if (newProgress > progress) {
      const isComplete = newProgress === 100;
      saveProgress(newProgress, isComplete);
    }
  }, [currentStep, lesson, progress, saveProgress]);

  const handleNextStep = () => {
    if (!lesson?.content_items) return;

    const currentItem = lesson.content_items[currentStep];
    const isQuiz = currentItem.content_type === 'quiz';
    
    // For quiz steps, require a correct answer before proceeding
    if (isQuiz && userAnswers[currentStep] === undefined) {
      return; // Don't proceed if no answer selected
    }

    // If it's a quiz and the answer is incorrect, do not allow proceeding
    if (isQuiz && !isCorrect) {
      return;
    }

    if (currentStep < lesson.content_items.length - 1) {
      // Move to next step
      setCurrentStep(prev => prev + 1);
      setShowFeedback(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowFeedback(false);
    }
  };

  // Reset progress for testing
  const handleResetProgress = async () => {
    if (!lesson) return;
    
    try {
      // Reset all states
      setCurrentStep(0);
      setUserAnswers({});
      setHasAnswered(false);
      setShowFeedback(false);
      setIsCompleted(false);
      setProgress(0);
      
      // Reset in the backend
      await lessonService.updateLessonProgress(Number(id), 0, userId);
      
      // Force re-render with initial state
      const updatedLesson = await lessonService.getLessonById(Number(id));
      if (updatedLesson) {
        setLesson({
          ...updatedLesson,
          progress: 0
        });
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
      setError('Failed to reset progress. Please try again.');
    }
  };

  const handleCheckAnswer = () => {
    if (hasAnswered) {
      setShowFeedback(true);
    }
  };

  const handleCompleteLesson = () => {
    if (!lesson?.content_items) return;
    const currentItem = lesson.content_items[currentStep];
    const isQuiz = currentItem.content_type === 'quiz';
    // Require a correct quiz answer to complete the lesson
    if (isQuiz && !isCorrect) {
      return;
    }
    navigate('/lessons');
  };

  // Format text content by removing markdown syntax
  const formatTextContent = (text: string): string => {
    // Replace markdown headers
    let formatted = text
      .replace(/^###\s*(.*?)\s*$/gm, '<h4>$1</h4>') // ### Header -> <h4>Header</h4>
      .replace(/^##\s*(.*?)\s*$/gm, '<h3>$1</h3>')   // ## Header -> <h3>Header</h3>
      .replace(/^#\s*(.*?)\s*$/gm, '<h2>$1</h2>');    // # Header -> <h2>Header</h2>
      
    // Replace bold and italic markdown
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
    // Replace lists
    formatted = formatted
      .replace(/^\s*[-*]\s+(.*$)/gm, '<li>$1</li>') // Unordered lists
      .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>'); // Ordered lists
      
    // Replace empty lines with paragraph tags
    formatted = formatted
      .split('\n\n')
      .map((para: string): string => {
        if (para.trim() === '') return '';
        if (para.startsWith('<h') || para.startsWith('<li>')) return para;
        return `<p>${para}</p>`;
      })
      .join('\n');
      
    // Handle tables (simple markdown tables)
    formatted = formatted.replace(
      /\|(.+)\|\n\|[-|\s]+\n((?:\|.*\|\n)*)/g,
      (match: string, headers: string, rows: string): string => {
        const headerCells = headers
          .split('|')
          .map((h: string): string => h.trim())
          .filter((h: string): boolean => h !== '')
          .map((h: string): string => `<th>${h}</th>`)
          .join('');
          
        const tableRows = rows
          .split('\n')
          .filter((row: string): boolean => row.trim() !== '')
          .map((row: string): string => {
            const cells = row
              .split('|')
              .map((cell: string): string => cell.trim())
              .filter((cell: string, i: number, arr: string[]): boolean => i > 0 && i < arr.length - 1) // Remove empty first/last cells
              .map((cell: string): string => `<td>${cell}</td>`)
              .join('');
            return `<tr>${cells}</tr>`;
          })
          .join('');
          
        return `
          <div class="table-container">
            <table>
              <thead><tr>${headerCells}</tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        `;
      }
    );
    
    return formatted;
  };

  const renderContent = () => {
    if (!currentContent) return null;

    switch (currentContent.content_type) {
      case 'text':
        return (
          <div className="content-box">
            <div className="lesson-text">
              <h2>{currentContent.title}</h2>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: formatTextContent(
                    typeof currentContent.content === 'string' 
                      ? currentContent.content 
                      : JSON.stringify(currentContent.content, null, 2)
                  ) 
                }}
              />
            </div>
          </div>
        );
      case 'quiz':
        const quizContent = currentContent as QuizContent;
        return (
          <div className="content-box">
            <div className="quiz-content">
              <h2>{quizContent.title}</h2>
              <p className="quiz-question">{quizContent.question}</p>
              <div className="quiz-options">
                {quizContent.options.map((option, index) => (
                  <button
                    key={index}
                    className={`quiz-option ${
                      userAnswers[currentStep] === index ? 'selected' : ''
                    } ${
                      showFeedback
                        ? index === quizContent.correct_answer
                          ? 'correct'
                          : userAnswers[currentStep] === index
                          ? 'incorrect'
                          : ''
                        : ''
                    }`}
                    onClick={() => !hasAnswered && handleAnswerSelect(currentStep, index)}
                    disabled={hasAnswered}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showFeedback && (
                <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <h3>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                  <p>{quizContent.explanation}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div>Unsupported content type</div>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!lesson || !currentContent) {
    return <div className="error-message">Lesson content not found</div>;
  }

  return (
    <div className="lesson-page">
      <TopBar score={userScore} streak={userStreak} />
      
      <div className="lesson-container">
        <header className="lesson-header">
          <h1>{lesson.title}</h1>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}% Complete</span>
          </div>
          <button 
            onClick={handleResetProgress}
            className="reset-button"
            title="Reset progress for testing"
          >
            Reset Progress
          </button>
        </header>

      <main className="lesson-content">
        {renderContent()}
      </main>

      <footer className="lesson-navigation">
        <button 
          onClick={handlePreviousStep} 
          disabled={currentStep === 0}
          className="nav-button prev-button"
        >
          Previous
        </button>
        
        {currentContent?.content_type === 'quiz' && !showFeedback ? (
          <button 
            onClick={handleCheckAnswer}
            disabled={!hasAnswered}
            className="check-answer-button"
          >
            Check Answer
          </button>
        ) : (
          <button 
            onClick={isLastStep ? handleCompleteLesson : handleNextStep}
            className={`nav-button next-button ${isLastStep ? 'complete-button' : ''}`}
          >
            {isLastStep ? 'Complete Lesson' : 'Next'}
          </button>
        )}
        </footer>
      </div>
    </div>
  );
};

export default LessonPage;
