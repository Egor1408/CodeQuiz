import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizResult } from '../../core/models/quiz-result.model';

@Component({
	selector: 'app-results',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './results.component.html',
	styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
	result = signal<QuizResult | null>(null);

	constructor(
		private router: Router,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		// Получаем данные из state
		const navigation = this.router.getCurrentNavigation();
		if (navigation?.extras?.state?.['result']) {
			this.result.set(navigation.extras.state['result'] as QuizResult);
			return;
		}

		// Fallback: пытаемся получить из history state
		const state = history.state;
		if (state && state.result) {
			this.result.set(state.result as QuizResult);
			return;
		}

		// Если данных нет, перенаправляем на главную
		this.router.navigate(['/']);
	}

	onBackToHome(): void {
		this.router.navigate(['/']);
	}
}

