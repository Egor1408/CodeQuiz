import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgrammingLanguage } from '../../core/constants/programming-languages.const';
import { QuizData, QuestionSection } from '../../core/models/question.model';
import { QuizConfig } from '../../core/models/quiz-config.model';

@Component({
	selector: 'app-quiz-config-modal',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './quiz-config-modal.component.html',
	styleUrl: './quiz-config-modal.component.scss'
})
export class QuizConfigModalComponent implements OnInit, OnChanges {
	@Input({ required: true }) language!: ProgrammingLanguage;
	@Input() quizData: QuizData | null = null;
	@Output() close = new EventEmitter<void>();
	@Output() start = new EventEmitter<QuizConfig>();

	questionCountOptions = [10, 25, 50, 'all'] as const;
	selectedQuestionCount: number | 'all' = 10;
	
	sections = signal<QuestionSection[]>([]);
	selectedSections = signal<Set<string>>(new Set());
	selectAllSections = signal(false);

	languageName = computed(() => this.language?.name || '');

	// Подсчет общего количества вопросов в выбранных темах
	totalQuestionsInSelectedSections = computed(() => {
		const selected = this.selectedSections();
		if (selected.size === 0) {
			return 0;
		}
		
		return this.sections()
			.filter(section => selected.has(section.id))
			.reduce((total, section) => total + section.questions.length, 0);
	});

	// Проверка, доступен ли вариант количества вопросов
	isQuestionCountDisabled = computed(() => {
		const total = this.totalQuestionsInSelectedSections();
		return (count: number | 'all') => {
			if (count === 'all') {
				return false; // "Все" всегда доступно
			}
			return total < count;
		};
	});

	ngOnInit(): void {
		this.loadSections();
	}

	ngOnChanges(changes: SimpleChanges): void {
		// Отслеживаем изменения quizData
		if (changes['quizData']) {
			this.loadSections();
		}
	}

	private loadSections(): void {
		if (this.quizData && this.quizData.sections) {
			this.sections.set(this.quizData.sections);
			// По умолчанию выбираем все темы
			this.selectAllSections.set(true);
			this.selectedSections.set(new Set(this.quizData.sections.map(s => s.id)));
		}
	}

	onSelectAllChange(checked: boolean): void {
		this.selectAllSections.set(checked);
		if (checked) {
			const allSectionIds = new Set(this.sections().map(s => s.id));
			this.selectedSections.set(allSectionIds);
		} else {
			this.selectedSections.set(new Set());
		}
		
		// Обновляем выбранное количество вопросов при изменении выбора тем
		this.updateSelectedQuestionCount();
	}

	onSectionToggle(sectionId: string, checked: boolean): void {
		const current = new Set(this.selectedSections());
		if (checked) {
			current.add(sectionId);
		} else {
			current.delete(sectionId);
		}
		this.selectedSections.set(current);
		
		// Обновляем состояние "Выбрать все" на основе текущего состояния
		const allSelected = current.size === this.sections().length && this.sections().length > 0;
		this.selectAllSections.set(allSelected);

		// Обновляем выбранное количество вопросов при изменении выбора тем
		this.updateSelectedQuestionCount();
	}

	private updateSelectedQuestionCount(): void {
		const total = this.totalQuestionsInSelectedSections();
		if (typeof this.selectedQuestionCount === 'number' && this.selectedQuestionCount > total) {
			if (total >= 50) {
				this.selectedQuestionCount = 50;
			} else if (total >= 25) {
				this.selectedQuestionCount = 25;
			} else if (total >= 10) {
				this.selectedQuestionCount = 10;
			} else {
				this.selectedQuestionCount = 'all';
			}
		}
	}

	onClose(): void {
		this.close.emit();
	}

	onStart(): void {
		const config: QuizConfig = {
			languageId: this.language.id,
			questionCount: this.selectedQuestionCount,
			selectedSections: Array.from(this.selectedSections())
		};
		
		this.start.emit(config);
	}
}

