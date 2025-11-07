import { Injectable } from '@angular/core';
import { QuizData } from '../models/question.model';

@Injectable({
	providedIn: 'root'
})
export class QuestionService {
	async loadQuizData(languageId: string): Promise<QuizData | null> {
		try {
			const response = await fetch(`/assets/data/questions/${languageId}.json`);
			if (!response.ok) {
				throw new Error(`Failed to load questions for ${languageId}`);
			}
			const data: QuizData = await response.json();
			return data;
		} catch (error) {
			return null;
		}
	}
}

