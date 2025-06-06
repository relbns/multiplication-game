// src/common/gameLogic.js

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  CHAMPION: 'champion',
};

export const ALLOWED_NUMBERS_MAP = {
  [DIFFICULTY_LEVELS.EASY]: [1, 2, 5, 10],
  [DIFFICULTY_LEVELS.MEDIUM]: [3, 4, 9],
  [DIFFICULTY_LEVELS.HARD]: [6, 7, 8],
  [DIFFICULTY_LEVELS.CHAMPION]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

const ALL_SECOND_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Generates all possible unique questions for a given set of allowed first numbers.
 * Each allowed first number is paired with all numbers from 1 to 10.
 * A normalized key (e.g., "2x5") is used to ensure uniqueness (2x5 is same as 5x2).
 * @param {number[]} allowedFirstNumbers - Array of numbers allowed as the first multiplicand.
 * @returns {Array<{num1: number, num2: number, key: string}>} Array of question objects.
 */
export const generateAllPossibleQuestions = (allowedFirstNumbers) => {
  if (!allowedFirstNumbers || allowedFirstNumbers.length === 0) {
    return [];
  }
  const questions = [];
  const seenKeys = new Set(); // To ensure we only add truly unique questions based on normalized key

  for (const num1 of allowedFirstNumbers) {
    for (const num2 of ALL_SECOND_NUMBERS) {
      const minNum = Math.min(num1, num2);
      const maxNum = Math.max(num1, num2);
      const questionKey = `${minNum}×${maxNum}`;

      // Only add if this normalized key hasn't been processed via allowedFirstNumbers
      // This handles cases where both numbers in a pair might be in allowedFirstNumbers
      // (e.g., for champion level, 2x3 and 3x2 using allowedFirstNumbers).
      // The goal is that num1 from the question object is one of the allowedFirstNumbers.
      // The key normalization handles overall uniqueness.
      
      // We need to ensure that the question objects are formed correctly
      // such that `q.num1` is from `allowedFirstNumbers`.
      // The original game logic always had `q.num1` from `allowedNumbers` (difficulty specific)
      // and `q.num2` from `allNumbers` (1-10).
      // The key was for `usedQuestions` tracking.

      // Let's stick to the original game's structure for question objects:
      // num1 is from the difficulty's specific set, num2 is from 1-10.
      // The key is for tracking.
      questions.push({ num1, num2, key: questionKey });
    }
  }
  
  // The above loop generates num1 (from allowed) x num2 (from 1-10).
  // The `getTotalQuestionsForDifficulty` function correctly counts unique keys.
  // This function should return all pairs {num1 (allowed), num2 (1-10), key}.
  // Uniqueness of keys will be handled by the caller using a Set of keys.
  return questions;
};


/**
 * Calculates the total number of unique questions for a given difficulty level.
 * @param {string} difficulty - The difficulty level ('easy', 'medium', 'hard', 'champion').
 * @returns {number} The total number of unique questions.
 */
export const getTotalQuestionsForDifficulty = (difficulty) => {
  const numbers = ALLOWED_NUMBERS_MAP[difficulty];
  if (!numbers) return 0;

  const seenUniqueKeys = new Set();
  for (const num1 of numbers) {
    for (const num2 of ALL_SECOND_NUMBERS) {
      const minNum = Math.min(num1, num2);
      const maxNum = Math.max(num1, num2);
      const key = `${minNum}×${maxNum}`;
      seenUniqueKeys.add(key);
    }
  }
  return seenUniqueKeys.size;
};

/**
 * Picks the next unique question from the available pool.
 * @param {Array<{num1: number, num2: number, key: string}>} allQuestionsForLevel - All possible questions for the current level.
 * @param {Set<string>} usedQuestionKeys - A Set of keys for questions already used.
 * @returns {{question: {num1: number, num2: number, key: string} | null, updatedUsedKeys: Set<string>}}
 *          An object containing the next question (or null if all used) and the updated set of used keys.
 */
export const pickNextUniqueQuestion = (allQuestionsForLevel, usedQuestionKeys) => {
  const availableQuestions = allQuestionsForLevel.filter(
    (q) => !usedQuestionKeys.has(q.key)
  );

  if (availableQuestions.length === 0) {
    return { question: null, updatedUsedKeys: usedQuestionKeys };
  }

  // The Math.random() part makes this impure if not mocked, but the function itself is deterministic given a random source.
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  
  const newUsedKeys = new Set(usedQuestionKeys);
  newUsedKeys.add(selectedQuestion.key);

  return { question: selectedQuestion, updatedUsedKeys: newUsedKeys };
};
