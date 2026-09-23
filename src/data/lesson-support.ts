import type { HomeworkItem } from '../types/content';

export interface AssistantCommonMistake {
  wrong: string;
  correction: string;
  reason?: string;
}

export interface AssistantTopic {
  id: string;
  title: string;
  explanation: string;
  simpleExplanation: string;
  examples: string[];
  commonMistake: AssistantCommonMistake;
}

export interface AssistantQuickQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  incorrectFeedback: string;
  hint?: string;
}

export interface LessonAssistantGuide {
  lessonTitle: string;
  intro: string;
  topics: AssistantTopic[];
  quickQuestion: AssistantQuickQuestion;
}

export function getLessonAssistantGuide(_lessonId: string): LessonAssistantGuide | null {
  return null;
}

export function getLessonHomeworkAssessment(_lessonId: string): HomeworkItem | null {
  return null;
}
