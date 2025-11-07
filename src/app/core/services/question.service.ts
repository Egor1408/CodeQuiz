import { Injectable, Inject, Optional } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { QuizData } from '../models/question.model';

@Injectable({
	providedIn: 'root'
})
export class QuestionService {
	constructor(@Optional() @Inject(APP_BASE_HREF) private baseHref: string | null) {}

	async loadQuizData(languageId: string): Promise<QuizData | null> {
		try {
			// Используем baseHref для правильного пути на GitHub Pages
			// baseHref обычно имеет формат "/CodeQuiz/" или "/"
			const basePath = this.baseHref || '/';
			// Убираем завершающий слэш, если есть, чтобы избежать двойных слэшей
			const normalizedBase = basePath.endsWith('/') 
				? basePath.slice(0, -1) 
				: basePath;
			
			const path = `${normalizedBase}/assets/data/questions/${languageId}.json`;
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

