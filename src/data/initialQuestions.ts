import { PracticeQuestion } from '../types.ts';

// Clean practice question list as requested - default is completely empty
export const INITIAL_QUESTIONS: PracticeQuestion[] = [];

// Template reference for bulk uploading or importing questions
export const SAMPLE_QUESTION_TEMPLATE: PracticeQuestion = {
  id: 'sample-q-1',
  question: 'What is the time complexity of binary search on a sorted array of size N?',
  subjectId: 'dsa',
  subjectName: 'Data Structures & Algorithms',
  unitNumber: 2,
  unitName: 'Searching and Sorting',
  topicId: 'dsa-u2-t1',
  topicName: 'Binary Search Algorithm',
  type: 'mcq',
  difficulty: 'medium',
  marks: 2,
  options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
  correctAnswer: 'O(log N)',
  explanation: 'Binary search repeatedly divides the search interval in half, resulting in logarithmic O(log N) runtime.',
  hints: 'Each comparison eliminates half of the remaining elements.'
};
