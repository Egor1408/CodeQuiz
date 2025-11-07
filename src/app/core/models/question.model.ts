export interface QuestionOption {
	id: string;
	text: string;
}

export interface Question {
	id: string;
	question: string;
	options: QuestionOption[];
	correctAnswerId: string;
	explanation?: string;
}

export interface QuestionSection {
	id: string;
	title: string;
	questions: Question[];
}

export interface QuizData {
	language: string;
	sections: QuestionSection[];
}

