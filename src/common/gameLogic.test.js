// src/common/gameLogic.test.js
import { vi } from 'vitest';
import {
  DIFFICULTY_LEVELS,
  ALLOWED_NUMBERS_MAP,
  generateAllPossibleQuestions,
  getTotalQuestionsForDifficulty,
  pickNextUniqueQuestion,
} from './gameLogic.js';

describe('gameLogic.js', () => {
  describe('getTotalQuestionsForDifficulty', () => {
    it('should return correct number of unique questions for "easy"', () => {
      expect(getTotalQuestionsForDifficulty(DIFFICULTY_LEVELS.EASY)).toBe(34);
    });
    it('should return correct number of unique questions for "medium"', () => {
      expect(getTotalQuestionsForDifficulty(DIFFICULTY_LEVELS.MEDIUM)).toBe(27);
    });
    it('should return correct number of unique questions for "hard"', () => {
      expect(getTotalQuestionsForDifficulty(DIFFICULTY_LEVELS.HARD)).toBe(27);
    });
    it('should return correct number of unique questions for "champion"', () => {
      expect(getTotalQuestionsForDifficulty(DIFFICULTY_LEVELS.CHAMPION)).toBe(55);
    });
    it('should return 0 for an unknown difficulty', () => {
      expect(getTotalQuestionsForDifficulty('unknown_difficulty')).toBe(0);
    });
  });

  describe('generateAllPossibleQuestions', () => {
    it('should generate questions with num1 from allowedFirstNumbers and num2 from 1-10', () => {
      const allowed = ALLOWED_NUMBERS_MAP[DIFFICULTY_LEVELS.EASY]; // [1, 2, 5, 10]
      const questions = generateAllPossibleQuestions(allowed);

      expect(questions.length).toBe(allowed.length * 10); // 4 * 10 = 40 raw pairs

      questions.forEach(q => {
        expect(allowed).toContain(q.num1);
        expect(q.num2).toBeGreaterThanOrEqual(1);
        expect(q.num2).toBeLessThanOrEqual(10);
        const min = Math.min(q.num1, q.num2);
        const max = Math.max(q.num1, q.num2);
        expect(q.key).toBe(`${min}×${max}`);
      });
    });

    it('should return an empty array if allowedFirstNumbers is empty or null', () => {
      expect(generateAllPossibleQuestions([])).toEqual([]);
      expect(generateAllPossibleQuestions(null)).toEqual([]);
    });
  });

  describe('pickNextUniqueQuestion', () => {
    let mockMathRandom;

    beforeEach(() => {
      let callCount = 0;
      // Ensure enough distinct random values if testing full exhaustion
      const randomSequence = Array.from({ length: 100 }, (_, i) => i * 0.01); 
      mockMathRandom = vi.spyOn(global.Math, 'random').mockImplementation(() => {
        const val = randomSequence[callCount % randomSequence.length];
        callCount++;
        return val;
      });
    });

    afterEach(() => {
      if (mockMathRandom) mockMathRandom.mockRestore();
      vi.clearAllMocks();
    });

    it('should pick a question from available questions and update usedKeys', () => {
      const allQuestions = [
        { num1: 1, num2: 1, key: '1×1' },
        { num1: 1, num2: 2, key: '1×2' },
      ];
      const usedKeys = new Set();
      const result = pickNextUniqueQuestion(allQuestions, usedKeys);

      expect(result.question).toBeDefined();
      expect(result.question).not.toBeNull();
      expect(allQuestions).toContain(result.question);
      expect(result.updatedUsedKeys.has(result.question.key)).toBe(true);
      expect(result.updatedUsedKeys.size).toBe(1);
    });

    it('should return null if all questions are used', () => {
      const allQuestions = [{ num1: 1, num2: 1, key: '1×1' }];
      const usedKeys = new Set(['1×1']);
      const result = pickNextUniqueQuestion(allQuestions, usedKeys);

      expect(result.question).toBeNull();
      expect(result.updatedUsedKeys.size).toBe(1);
    });

    it('should pick all unique questions sequentially without repetition until exhaustion for a given difficulty', () => {
      const difficulty = DIFFICULTY_LEVELS.EASY;
      const allowed = ALLOWED_NUMBERS_MAP[difficulty];
      const allQuestionsForLevel = generateAllPossibleQuestions(allowed);
      const totalUniqueExpected = getTotalQuestionsForDifficulty(difficulty);
      
      let currentUsedKeys = new Set();
      const pickedQuestionKeys = new Set();
      let pickedQuestionObjects = [];

      for (let i = 0; i < totalUniqueExpected; i++) {
        const { question, updatedUsedKeys } = pickNextUniqueQuestion(allQuestionsForLevel, currentUsedKeys);
        expect(question).not.toBeNull();
        // Check if the question's key is truly unique for this picking sequence
        expect(pickedQuestionKeys.has(question.key)).toBe(false);
        
        pickedQuestionKeys.add(question.key);
        pickedQuestionObjects.push(question);
        currentUsedKeys = updatedUsedKeys;
      }

      expect(pickedQuestionKeys.size).toBe(totalUniqueExpected);
      
      // Try picking one more, should be null
      const { question: lastPick } = pickNextUniqueQuestion(allQuestionsForLevel, currentUsedKeys);
      expect(lastPick).toBeNull();
    });
  });
});
