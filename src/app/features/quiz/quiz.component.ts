import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizService, PreparedQuestion } from '../../core/services/quiz.service';
import { QuizConfig } from '../../core/models/quiz-config.model';
import { UserAnswer, QuizResult, SectionStatistics } from '../../core/models/quiz-result.model';

@Component({
	selector: 'app-quiz',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './quiz.component.html',
	styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
	questions = signal<PreparedQuestion[]>([]);
	currentQuestionIndex = signal(0);
	selectedAnswerId = signal<string | null>(null);
	showResult = signal(false);
	isCorrect = signal<boolean | null>(null);
	startTime = signal<Date | null>(null);
	questionStartTime = signal<Date | null>(null);
	answers = signal<UserAnswer[]>([]);
	config = signal<QuizConfig | null>(null);

	currentQuestion = computed(() => {
		const index = this.currentQuestionIndex();
		return this.questions()[index] || null;
	});

	progress = computed(() => {
		const total = this.questions().length;
		if (total === 0) return 0;
		return ((this.currentQuestionIndex() + 1) / total) * 100;
	});

	isLastQuestion = computed(() => {
		return this.currentQuestionIndex() === this.questions().length - 1;
	});

	// Статус каждого вопроса: true - правильно, false - неправильно, null - не отвечен
	questionStatuses = computed(() => {
		const statuses: (boolean | null)[] = new Array(this.questions().length).fill(null);
		const answersMap = new Map<string, boolean>();
		this.answers().forEach(answer => {
			answersMap.set(answer.questionId, answer.isCorrect);
		});
		
		this.questions().forEach((question, index) => {
			const isCorrect = answersMap.get(question.id);
			if (isCorrect !== undefined) {
				statuses[index] = isCorrect;
			}
		});
		
		return statuses;
	});

	constructor(
		private quizService: QuizService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	async ngOnInit(): Promise<void> {
		// Получаем конфигурацию из query параметров или state
		const config = this.getConfigFromRoute();
		if (!config) {
			this.router.navigate(['/']);
			return;
		}

		this.config.set(config);

		try {
			const questions = await this.quizService.prepareQuestions(config);
			this.questions.set(questions);
			this.startTime.set(new Date());
			this.questionStartTime.set(new Date());
		} catch {
			this.router.navigate(['/']);
		}
	}

	private getConfigFromRoute(): QuizConfig | null {
		// Пытаемся получить из state (при переходе через router.navigate)
		const navigation = this.router.getCurrentNavigation();
		if (navigation?.extras?.state?.['config']) {
			return navigation.extras.state['config'] as QuizConfig;
		}

		// Пытаемся получить из history state (fallback)
		const state = history.state;
		if (state && state.config) {
			return state.config as QuizConfig;
		}

		// Пытаемся получить из query параметров
		const queryParams = this.route.snapshot.queryParams;
		if (queryParams['languageId'] && queryParams['questionCount'] && queryParams['selectedSections']) {
			return {
				languageId: queryParams['languageId'],
				questionCount: queryParams['questionCount'] === 'all' ? 'all' : +queryParams['questionCount'],
				selectedSections: Array.isArray(queryParams['selectedSections'])
					? queryParams['selectedSections']
					: queryParams['selectedSections'].split(',')
			};
		}

		return null;
	}

	onAnswerSelect(answerId: string): void {
		if (this.showResult()) {
			return; // Не позволяем менять ответ после проверки
		}

		const question = this.currentQuestion();
		if (!question) {
			return;
		}

		this.selectedAnswerId.set(answerId);

		// Сразу проверяем ответ
		const isCorrect = answerId === question.correctAnswerId;
		this.isCorrect.set(isCorrect);

		// Вычисляем время, потраченное на вопрос
		const timeSpent = this.questionStartTime()
			? Date.now() - this.questionStartTime()!.getTime()
			: 0;

		// Сохраняем ответ
		const answer: UserAnswer = {
			questionId: question.id,
			selectedAnswerId: answerId,
			correctAnswerId: question.correctAnswerId,
			isCorrect,
			timeSpent
		};

		this.answers.update(answers => [...answers, answer]);
		this.showResult.set(true);
	}

	onNextQuestion(): void {
		if (this.isLastQuestion()) {
			// Переход на страницу результатов
			this.finishQuiz();
		} else {
			// Переход к следующему вопросу
			this.currentQuestionIndex.update(index => index + 1);
			this.selectedAnswerId.set(null);
			this.showResult.set(false);
			this.isCorrect.set(null);
			this.questionStartTime.set(new Date());
		}
	}

	private finishQuiz(): void {
		const config = this.config();
		if (!config) {
			this.router.navigate(['/']);
			return;
		}

		const totalQuestions = this.questions().length;
		const correctAnswers = this.answers().filter(a => a.isCorrect).length;
		const incorrectAnswers = totalQuestions - correctAnswers;
		const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

		// Собираем статистику по секциям
		const sectionStatsMap = new Map<string, { title: string; total: number; correct: number }>();
		
		// Инициализируем секции
		this.questions().forEach(question => {
			// Находим секцию вопроса по sectionTitle
			const sectionTitle = question.sectionTitle;
			// Используем sectionTitle как ключ, но нам нужен sectionId
			// Найдем sectionId из конфигурации
			if (!sectionStatsMap.has(sectionTitle)) {
				sectionStatsMap.set(sectionTitle, { title: sectionTitle, total: 0, correct: 0 });
			}
			const stats = sectionStatsMap.get(sectionTitle)!;
			stats.total++;
		});

		// Подсчитываем правильные ответы по секциям
		const answersMap = new Map<string, boolean>();
		this.answers().forEach(answer => {
			answersMap.set(answer.questionId, answer.isCorrect);
		});

		this.questions().forEach(question => {
			const isCorrect = answersMap.get(question.id);
			if (isCorrect !== undefined) {
				const stats = sectionStatsMap.get(question.sectionTitle);
				if (stats && isCorrect) {
					stats.correct++;
				}
			}
		});

		// Формируем массив статистики по секциям
		const sectionStatistics: SectionStatistics[] = [];
		sectionStatsMap.forEach((stats, sectionTitle) => {
			// Используем sectionTitle как sectionId для статистики
			sectionStatistics.push({
				sectionId: sectionTitle,
				sectionTitle: stats.title,
				totalQuestions: stats.total,
				correctAnswers: stats.correct,
				incorrectAnswers: stats.total - stats.correct,
				percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
			});
		});

		const endTime = new Date();
		const startTime = this.startTime();
		const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

		const result: QuizResult = {
			languageId: config.languageId,
			totalQuestions,
			correctAnswers,
			incorrectAnswers,
			percentage,
			answers: this.answers(),
			sectionStatistics,
			startTime: startTime || new Date(),
			endTime,
			duration
		};

		// Переход на страницу результатов с данными
		this.router.navigate(['/results'], { state: { result } });
	}
}

