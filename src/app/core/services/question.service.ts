import { Injectable, Inject, Optional, isDevMode } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { QuizData } from '../models/question.model';

@Injectable({
	providedIn: 'root'
})
export class QuestionService {
	private getBaseHref(): string {
		// Пытаемся получить baseHref из инжекции
		if (this.baseHref) {
			const normalized = this.baseHref.endsWith('/') 
				? this.baseHref.slice(0, -1) 
				: this.baseHref;
			return normalized;
		}
		
		// Если не получилось, определяем из document.baseURI
		if (typeof document !== 'undefined') {
			// Сначала проверяем тег <base>
			const baseElement = document.querySelector('base');
			if (baseElement && baseElement.href) {
				try {
					const baseUrl = new URL(baseElement.href);
					const pathname = baseUrl.pathname;
					// Убираем завершающий слэш
					const normalized = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
					if (normalized && normalized !== '/') {
						return normalized;
					}
				} catch (e) {
					// Если не удалось распарсить URL, используем альтернативный способ
				}
			}
			
			// Альтернативный способ - проверяем текущий URL
			// Если URL содержит /CodeQuiz, значит мы на GitHub Pages
			const currentUrl = window.location.href;
			if (currentUrl.includes('/CodeQuiz')) {
				return '/CodeQuiz';
			}
			
			// Также проверяем pathname
			const pathname = window.location.pathname;
			if (pathname.startsWith('/CodeQuiz')) {
				return '/CodeQuiz';
			}
		}
		
		// По умолчанию для локальной разработки
		return '';
	}

	constructor(@Optional() @Inject(APP_BASE_HREF) private baseHref: string | null) {}

	async loadQuizData(languageId: string): Promise<QuizData | null> {
		try {
			const basePath = this.getBaseHref();
			const path = basePath 
				? `${basePath}/assets/data/questions/${languageId}.json`
				: `/assets/data/questions/${languageId}.json`;
			
			// Логирование для отладки (включая production)
			console.log('BaseHref detected:', this.baseHref);
			console.log('BasePath calculated:', basePath);
			console.log('Loading quiz data from:', path);
			console.log('Current location:', window.location.href);
			console.log('Base element:', document.querySelector('base')?.href);
			
			const response = await fetch(path);
			
			if (!response.ok) {
				throw new Error(`Failed to load questions for ${languageId}: ${response.status} ${response.statusText}`);
			}
			
			const data: QuizData = await response.json();
			return data;
		} catch (error) {
			console.error('Error loading quiz data:', error);
			return null;
		}
	}
}

