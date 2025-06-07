import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  Trophy,
  RefreshCw,
  Clock,
  Heart,
  Lightbulb,
  Home,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { shareResultsAsImage } from '../common/utils';
import ShareableStats from './ShareableStats';
import {
  ALLOWED_NUMBERS_MAP,
  generateAllPossibleQuestions as generateAllPossibleQuestionsLogic,
  getTotalQuestionsForDifficulty as getTotalQuestionsForDifficultyLogic,
  pickNextUniqueQuestion,
  // DIFFICULTY_LEVELS, // Not directly used by name in component, map is enough
} from '../common/gameLogic.js';

const MultiplicationGame = () => {
  const GAME_TIME = 300; // 5 minutes in seconds
  const resultsRef = useRef(null);
  const [gameMode, setGameMode] = useState('menu');
  const [currentQuestion, setCurrentQuestion] = useState({ num1: 0, num2: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState(new Set());

  const encouragingMessages = [
    '!מדהים! את גאונית 🌟',
    '!כל הכבוד! ממשיכים ככה 🎉',
    '!וואו! איזה כוח 💪',
    '!מושלם! את על הדרך הנכונה ⭐',
    '!יופי! את לומדת מהר 🚀',
    '!נהדר! המוח שלך עובד מצוין 🧠',
    '!ברבו! תמשיכי ככה 👑',
    '!מעולה! את פשוט מדהימה ✨',
  ];

  const tips = [
    {
      title: 'טריק האצבעות לכפולות של 9',
      content:
        'הרימי 10 אצבעות. להכפלה 9×7, הורידי את האצבע ה-7. משמאל לאצבע שהורדת יש 6 אצבעות (עשרות), מימין יש 3 אצבעות (יחידות) = 63!',
      icon: '✋',
    },
    {
      title: 'כפולות של 5 - קל מאוד!',
      content:
        'כל כפולה של 5 מסתיימת ב-0 או ב-5. אם המספר זוגי - התוצאה מסתיימת ב-0, אם אי-זוגי - מסתיימת ב-5. למשל: 5×4=20, 5×7=35',
      icon: '🖐',
    },
    {
      title: 'כפולות של 2 - פשוט הכפילי!',
      content: 'כפולות של 2 זה פשוט לחבר את המספר לעצמו! 2×8 = 8+8 = 16',
      icon: '➕',
    },
    {
      title: 'כפולות של 10 - הכי קל!',
      content: 'כל כפולה של 10 זה פשוט להוסיף 0 בסוף! 10×6 = 60',
      icon: '🔟',
    },
    {
      title: 'הסימטריה של לוח הכפל',
      content:
        'זכרי: 3×7 זה אותו דבר כמו 7×3! אם את יודעת אחד, את יודעת את השני!',
      icon: '🔄',
    },
    {
      title: 'כפולות של 11 (עד 99)',
      content:
        'כדי לכפול מספר חד-ספרתי ב-11, פשוט כתבי את המספר פעמיים! 11×4 = 44, 11×7 = 77',
      icon: '🎯',
    },
    {
      title: 'כפולות של 6 = כפולות של 3 ×2',
      content:
        'אם את יודעת את כפולות של 3, כפולות של 6 זה פשוט להכפיל פי 2! 6×4 = (3×4)×2 = 12×2 = 24',
      icon: '✖️',
    },
    {
      title: "השיטה של 'בנייה'",
      content:
        'לא זוכרת 7×8? תחשבי: 7×7=49, ועוד 7 אחד = 49+7=56! בני על מה שאת כבר יודעת!',
      icon: '🏗️',
    },
  ];

  const shareResults = (accuracy) => {
    const gameData = {
      score,
      difficulty,
      totalCorrect,
      bestStreak,
      accuracy,
      setFeedback,
      setShowFeedback,
    };

    shareResultsAsImage(resultsRef, gameData);
  };

  // generateAllPossibleQuestions is now imported as generateAllPossibleQuestionsLogic

  const generateQuestion = (currentLevelDifficulty) => {
    const levelToUse = currentLevelDifficulty || difficulty;
    const allowedNumbersForLevel = ALLOWED_NUMBERS_MAP[levelToUse];

    if (!allowedNumbersForLevel) {
      console.error("Invalid difficulty level:", levelToUse);
      // Default to a fallback or handle error appropriately
      setGameMode('menu'); // Example: go back to menu
      return;
    }

    // Generate all *potential* question structures for this difficulty's allowed numbers
    const allPotentialQuestions = generateAllPossibleQuestionsLogic(allowedNumbersForLevel);
    
    const { question: nextQuestionData, updatedUsedKeys } = pickNextUniqueQuestion(
      allPotentialQuestions,
      usedQuestions // Pass the current Set of used question keys
    );

    if (!nextQuestionData) {
      // All questions completed! End game with bonus
      const completionBonus = 200;
      setScore((prev) => prev + completionBonus);
      setFeedback(
        `🎉 !מדהים! השלמת את כל התרגילים! בונוס השלמה: ${completionBonus} נקודות 🎉`
      );
      setShowFeedback(true);
      setTimeout(() => setGameMode('gameOver'), 3000);
      return;
    }

    setUsedQuestions(updatedUsedKeys);
    setCurrentQuestion({
      num1: nextQuestionData.num1,
      num2: nextQuestionData.num2,
      // key is part of nextQuestionData if needed, but setCurrentQuestion only needs num1, num2
    });
  };

  useEffect(() => {
    let timer;
    if (gameMode === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameMode('gameOver');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameMode, timeLeft]);

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameMode('playing');
    setScore(0);
    setLives(3);
    setTimeLeft(GAME_TIME);
    setQuestionsAnswered(0);
    setStreak(0);
    setUserAnswer('');
    setUsedQuestions(new Set());
    generateQuestion(selectedDifficulty);
  };

  const submitAnswer = () => {
    const correctAnswer = currentQuestion.num1 * currentQuestion.num2;
    const userNum = parseInt(userAnswer);

    if (userNum === correctAnswer) {
      const points = 10 + streak * 2;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setBestStreak((prev) => Math.max(prev, streak + 1));
      setTotalCorrect((prev) => prev + 1);

      const randomMessage =
        encouragingMessages[
          Math.floor(Math.random() * encouragingMessages.length)
        ];
      setFeedback(randomMessage);
      setShowFeedback(true);

      // Continue to next question after correct answer
      setQuestionsAnswered((prev) => prev + 1);
      setUserAnswer('');

      setTimeout(() => {
        setShowFeedback(false);
        generateQuestion();
      }, 2000);
    } else {
      setLives((prev) => prev - 1);
      setStreak(0);
      setFeedback(
        `הייתה טעות קטנה! התשובה הנכונה היא ${correctAnswer}. תמשיכי - את בדרך הנכונה 💪`
      );
      setShowFeedback(true);

      if (lives <= 1) {
        setTimeout(() => setGameMode('gameOver'), 3000);
        return;
      }

      setQuestionsAnswered((prev) => prev + 1);
      setUserAnswer('');

      // Wait for user confirmation for wrong answers
      // Will continue when user clicks "הבנתי, בואי נמשיך"
    }
  };

  const continueAfterWrongAnswer = () => {
    setShowFeedback(false);
    generateQuestion();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetGame = () => {
    setGameMode('menu');
    setScore(0);
    setLives(3);
    setTimeLeft(GAME_TIME);
    setQuestionsAnswered(0);
    setStreak(0);
    setUserAnswer('');
    setFeedback('');
    setShowFeedback(false);
    setUsedQuestions(new Set());
  };

  // Scoring Guide Screen
  if (gameMode === 'scoring') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-purple-600">
                  מדריך ניקוד
                </h2>
              </div>
              <button
                onClick={() => setGameMode('menu')}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-xl transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6 text-right">
              {/* How scoring works */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-400 p-3 sm:p-4 rounded-xl text-right">
                <h3 className="font-bold text-blue-700 text-base sm:text-lg mb-2 text-right">
                  איך הניקוד עובד:
                </h3>
                <ul className="text-blue-800 text-sm sm:text-base space-y-1 text-right list-none">
                  <li>• תשובה נכונה: 10 נקודות</li>
                  <li>• בונוס רצף: +2 נקודות לכל תשובה ברצף</li>
                  <li>• בונוס השלמה: 200 נקודות! (אם סיימת את כל התרגילים)</li>
                  <li>לדוגמה: תשובה 1=10, תשובה 2=12, תשובה 3=14</li>
                </ul>
              </div>

              {/* Easy level */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-r-4 border-green-400 p-3 sm:p-4 rounded-xl">
                <h3 className="font-bold text-green-700 text-base sm:text-lg mb-2">
                  🌟 רמה קלה (1, 2, 5, 10) - 34 תרגילים:
                </h3>
                <ul className="text-green-800 text-sm sm:text-base space-y-1">
                  <li>• הישג ממוצע: 120-200 נקודות</li>
                  <li>• הישג טוב: 250-350 נקודות</li>
                  <li>• הישג מעולה: 400+ נקודות</li>
                  <li>• השלמה מלאה: 530+ נקודות (עם בונוס!)</li>
                </ul>
              </div>

              {/* Medium level */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-r-4 border-yellow-400 p-3 sm:p-4 rounded-xl">
                <h3 className="font-bold text-yellow-700 text-base sm:text-lg mb-2">
                  ⭐ רמה בינונית (3, 4, 9) - 27 תרגילים:
                </h3>
                <ul className="text-yellow-800 text-sm sm:text-base space-y-1">
                  <li>• הישג ממוצע: 60-100 נקודות</li>
                  <li>• הישג טוב: 120-160 נקודות</li>
                  <li>• הישג מעולה: 180+ נקודות</li>
                  <li>• השלמה מלאה: 272+ נקודות (עם בונוס!)</li>
                </ul>
              </div>

              {/* Hard level */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-r-4 border-red-400 p-3 sm:p-4 rounded-xl">
                <h3 className="font-bold text-red-700 text-base sm:text-lg mb-2">
                  🔥 רמה קשה (6, 7, 8) - 27 תרגילים:
                </h3>
                <ul className="text-red-800 text-sm sm:text-base space-y-1">
                  <li>• הישג ממוצע: 60-100 נקודות</li>
                  <li>• הישג טוב: 120-160 נקודות</li>
                  <li>• הישג מעולה: 180+ נקודות</li>
                  <li>• השלמה מלאה: 272+ נקודות (עם בונוס!)</li>
                </ul>
              </div>

              {/* Champion level */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-r-4 border-purple-400 p-3 sm:p-4 rounded-xl">
                <h3 className="font-bold text-purple-700 text-base sm:text-lg mb-2">
                  👑 רמת אלופות (1-10) - 55 תרגילים:
                </h3>
                <ul className="text-purple-800 text-sm sm:text-base space-y-1">
                  <li>• הישג ממוצע: 200-400 נקודות</li>
                  <li>• הישג טוב: 500-700 נקודות</li>
                  <li>• השלמה מלאה: 1740+ נקודות (עם בונוס!)</li>
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-r-4 border-purple-400 p-3 sm:p-4 rounded-xl">
                <h3 className="font-bold text-purple-700 text-base sm:text-lg mb-2">
                  💡 טיפים להישג טוב:
                </h3>
                <ul className="text-purple-800 text-sm sm:text-base space-y-1">
                  <li>• התחילי מהרמה הקלה לבניית ביטחון</li>
                  <li>• שמרי על רצפים ארוכים לבונוס גבוה</li>
                  <li>• השתמשי בטיפים וטריקים שלמדת</li>
                  <li>• אל תמהרי - דיוק חשוב יותר ממהירות</li>
                  <li>• נסי להשלים את כל התרגילים לבונוס של 200 נקודות!</li>
                  <li>• רמת האלופות היא האתגר הגדול ביותר!</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => setGameMode('menu')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
              >
                בואי נתחיל! <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (gameMode === 'tips') {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-2 sm:p-4"
        dir="rtl"
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-purple-600">
                  טיפים וטריקים
                </h2>
              </div>
              <button
                onClick={() => setGameMode('menu')}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-xl transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-screen overflow-y-auto">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border-r-4 border-orange-400 p-3 sm:p-4 rounded-xl text-right"
                >
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <span className="text-2xl sm:text-3xl flex-shrink-0">
                      {tip.icon}
                    </span>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-purple-700 text-sm sm:text-base mb-2 text-right">
                        {tip.title}
                      </h3>
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed text-right">
                        {tip.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => setGameMode('menu')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
              >
                בואי נתרגל! <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-sm sm:max-w-md w-full text-center">
          <div className="mb-4 sm:mb-6">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
              משחק לוח הכפל
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              בואי נתאמן יחד ונהיה אלופות!
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <button
              onClick={() => startGame('easy')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              🌟 קל (1, 2, 5, 10)
            </button>
            <button
              onClick={() => startGame('medium')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              ⭐ בינוני (3, 4, 9)
            </button>
            <button
              onClick={() => startGame('hard')}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              🔥 קשה (6, 7, 8)
            </button>
            <button
              onClick={() => startGame('champion')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              👑 אלופות (1-10)
            </button>
            <button
              onClick={() => setGameMode('tips')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{ backgroundColor: '#f97316' }}
            >
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              טיפים וטריקים
            </button>
            <button
              onClick={() => setGameMode('scoring')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              מדריך ניקוד
            </button>
          </div>

          {(bestStreak > 0 || totalCorrect > 0) && (
            <div className="space-y-2 p-3 sm:p-4 bg-yellow-100 rounded-xl">
              {bestStreak > 0 && (
                <p className="text-yellow-800 font-bold text-xs sm:text-sm">
                  🏆 השיא שלך: {bestStreak} ברציפות!
                </p>
              )}
              {totalCorrect > 0 && (
                <p className="text-yellow-800 font-bold text-xs sm:text-sm">
                  ⭐ סה"כ תשובות נכונות: {totalCorrect}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameMode === 'gameOver') {
    // Ensure totalCorrect and lives are accurate for calculation.
    // questionsAnswered might be more reliable if it tracks actual attempts.
    // The original logic for accuracy: (totalCorrect / (totalCorrect + (3 - lives)))
    // This implies (3-lives) is the number of wrong answers.
    // Let's assume questionsAnswered = totalCorrect + wrongAnswers
    const wrongAnswers = questionsAnswered - totalCorrect;
    const totalAttempts = totalCorrect + wrongAnswers;

    const accuracy =
      totalAttempts > 0
        ? Math.round((totalCorrect / totalAttempts) * 100)
        : 0;
        
    const difficultyText =
      difficulty === 'easy'
        ? 'קל'
        : difficulty === 'medium'
        ? 'בינוני'
        : difficulty === 'hard'
        ? 'קשה'
        : 'אלופות';

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 max-w-sm sm:max-w-md w-full text-center">
          <Award className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
            {totalCorrect >= questionsAnswered * 0.8
              ? 'מדהים! 🎉'
              : totalCorrect >= questionsAnswered * 0.6
              ? 'כל הכבוד! 👏'
              : 'התחלה מעולה! 💪'}
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            מבחן ברמה {difficultyText}
          </p>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            ממשיכים להתקדם!
          </p>

          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
              <p className="text-blue-800 font-bold text-sm sm:text-base">
                הניקוד שלך: {score}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
              <p className="text-green-800 font-bold text-sm sm:text-base">
                תשובות נכונות: {totalCorrect}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl">
              <p className="text-yellow-800 font-bold text-sm sm:text-base">
                הרצף הטוב ביותר: {bestStreak}
              </p>
            </div>
            {accuracy > 0 && (
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <p className="text-purple-800 font-bold text-sm sm:text-base">
                  דיוק: {accuracy}%
                </p>
              </div>
            )}
          </div>
          <div
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          >
            <div ref={resultsRef}>
              <ShareableStats
                score={score}
                difficulty={difficulty}
                totalCorrect={totalCorrect}
                bestStreak={bestStreak}
                accuracy={accuracy}
              />
            </div>
          </div>
          {accuracy >= 80 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-xl border-2 border-yellow-400">
              <p className="text-orange-800 font-bold text-sm sm:text-base">
                🌟 ביצוע מעולה! את אלופה אמיתית! 🌟
              </p>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => shareResults(accuracy)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>📱</span>
              שתף את ההישג
            </button>
            <button
              onClick={resetGame}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              שחק שוב
            </button>
            <button
              onClick={() => setGameMode('tips')}
              style={{ backgroundColor: '#f97316' }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              בואי נלמד טריקים
            </button>
          </div>
        </div>
      </div>
    );
  }

  // getTotalQuestionsForDifficulty is now imported as getTotalQuestionsForDifficultyLogic

  const getCompletedQuestionsCount = () => {
    return usedQuestions.size;
  };

  // Main Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-row-reverse justify-between items-center text-xs sm:text-sm">
            {/* Home button + lives */}
            <div className="flex flex-row-reverse items-center gap-2">
              <button
                onClick={() => setGameMode('menu')}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-xl transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      i < lives ? 'text-red-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-bold text-blue-600">
                {formatTime(timeLeft)}
              </span>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-bold text-purple-600">ניקוד: {score}</span>
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            </div>
          </div>

          {streak > 0 && (
            <div className="mt-2 text-center">
              <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                🔥 רצף: {streak}
              </span>
            </div>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 text-center">
          {showFeedback ? (
            <div className="py-6 sm:py-8">
              <p className="text-lg sm:text-2xl font-bold text-purple-600 mb-2 sm:mb-4">
                {feedback}
              </p>
              {streak > 2 && !feedback.includes('הייתה טעות') && (
                <div className="animate-bounce">
                  <p
                    className="text-sm sm:text-base font-bold force-text-orange"
                  >
                    🔥 את על הגל! 🔥
                  </p>
                </div>
              )}

              {/* Show continue button for wrong answers */}
              {feedback.includes('הייתה טעות') && (
                <button
                  onClick={continueAfterWrongAnswer}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg text-sm sm:text-base"
                >
                  !הבנתי, בואי נמשיך 👍
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 sm:mb-8">
                <p className="text-4xl sm:text-6xl font-bold text-purple-600 mb-4 sm:mb-6">
                  {currentQuestion.num1} × {currentQuestion.num2}
                </p>
                <p className="text-base sm:text-xl text-gray-600">מה התוצאה?</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && userAnswer && submitAnswer()
                  }
                  className="w-24 h-12 sm:w-32 sm:h-16 text-2xl sm:text-3xl font-bold text-center border-4 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none bg-white text-black no-spinners"
                  placeholder="?"
                  autoFocus
                />
              </div>

              <button
                onClick={submitAnswer}
                disabled={!userAnswer}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-colors shadow-lg text-base sm:text-xl"
              >
                בדוק תשובה
              </button>
            </>
          )}
        </div>

        {/* Progress */}
        <div
          className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-lg p-3 sm:p-4"
          dir="rtl"
        >
          <div className="mb-2">
            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
              <span>שאלות: {questionsAnswered}</span>
              <span>תשובות נכונות: {totalCorrect}</span>
              <span>
                רמה:
                {difficulty === 'easy'
                  ? 'קל'
                  : difficulty === 'medium'
                  ? 'בינוני'
                  : difficulty === 'hard'
                  ? 'קשה'
                  : 'אלופות'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (getCompletedQuestionsCount() /
                    getTotalQuestionsForDifficultyLogic(difficulty)) * // Use imported
                  100
                }%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>
              התקדמות: {getCompletedQuestionsCount()}/
              {getTotalQuestionsForDifficultyLogic(difficulty)} {/* Use imported */}
            </span>
            <span>
              {Math.round(
                (getCompletedQuestionsCount() /
                  getTotalQuestionsForDifficultyLogic(difficulty)) * // Use imported
                  100
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplicationGame;
