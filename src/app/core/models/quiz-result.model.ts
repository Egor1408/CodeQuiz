import { Question } from './question.model';

export interface UserAnswer {
	questionId: string;
	selectedAnswerId: string;
	correctAnswerId: string;
	isCorrect: boolean;
	timeSpent: number; // в миллисекундах
}

export interface SectionStatistics {
	sectionId: string;
	sectionTitle: string;
	totalQuestions: number;
	correctAnswers: number;
	incorrectAnswers: number;
	percentage: number;
}

export interface QuizResult {
	languageId: string;
	totalQuestions: number;
	correctAnswers: number;
	incorrectAnswers: number;
	percentage: number;
	answers: UserAnswer[];
	sectionStatistics: SectionStatistics[];
	startTime: Date;
	endTime: Date;
	duration: number; // в миллисекундах
}

