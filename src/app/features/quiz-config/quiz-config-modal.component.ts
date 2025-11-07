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

	questionCountOptions = [3, 10, 20, 'all'] as const;
	selectedQuestionCount: number | 'all' = 3;
	
	sections = signal<QuestionSection[]>([]);
	selectedSections = signal<Set<string>>(new Set());
	selectAllSections = signal(false);

	languageName = computed(() => this.language?.name || '');

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

