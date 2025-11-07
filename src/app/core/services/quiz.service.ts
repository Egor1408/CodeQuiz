import { Injectable } from '@angular/core';
import { QuizConfig } from '../models/quiz-config.model';
import { QuizData, Question, QuestionSection } from '../models/question.model';
import { QuestionService } from './question.service';

export interface PreparedQuestion extends Question {
	shuffledOptions: { id: string; text: string }[];
	sectionTitle: string;
}

@Injectable({
	providedIn: 'root'
})
export class QuizService {
	constructor(private questionService: QuestionService) {}

	/**
	 * Формирует список вопросов для теста на основе конфигурации
	 */
	async prepareQuestions(config: QuizConfig): Promise<PreparedQuestion[]> {
		// Загружаем данные вопросов
		const quizData = await this.questionService.loadQuizData(config.languageId);
		if (!quizData) {
			throw new Error('Failed to load quiz data');
		}

		// Фильтруем секции по выбранным
		const selectedSections = quizData.sections.filter(section =>
			config.selectedSections.includes(section.id)
		);

		if (selectedSections.length === 0) {
			throw new Error('No sections selected');
		}

		// Определяем общее количество вопросов
		const totalQuestionsAvailable = selectedSections.reduce(
			(sum, section) => sum + section.questions.length,
			0
		);

		let targetQuestionCount: number;
		if (config.questionCount === 'all') {
			targetQuestionCount = totalQuestionsAvailable;
		} else {
			targetQuestionCount = Math.min(config.questionCount, totalQuestionsAvailable);
		}

		// Вычисляем количество вопросов на тему
		const questionsPerSection = Math.floor(targetQuestionCount / selectedSections.length);
		const remainder = targetQuestionCount % selectedSections.length;

		// Собираем вопросы из каждой секции
		const allQuestions: PreparedQuestion[] = [];

		selectedSections.forEach((section, index) => {
			// Для последних секций добавляем остаток
			const questionsToTake = questionsPerSection + (index < remainder ? 1 : 0);

			// Рандомно выбираем вопросы из секции
			const shuffledSectionQuestions = this.shuffleArray([...section.questions]);
			const selectedQuestions = shuffledSectionQuestions.slice(0, questionsToTake);

			// Подготавливаем вопросы: перемешиваем варианты ответов
			selectedQuestions.forEach(question => {
				const shuffledOptions = this.shuffleArray([...question.options]);
				allQuestions.push({
					...question,
					shuffledOptions,
					sectionTitle: section.title
				});
			});
		});

		// Перемешиваем все вопросы в случайном порядке
		return this.shuffleArray(allQuestions);
	}

	/**
	 * Перемешивает массив в случайном порядке (алгоритм Фишера-Йетса)
	 */
	private shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}
}

