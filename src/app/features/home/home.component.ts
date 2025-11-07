import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LanguageCardComponent } from './components/language-card/language-card.component';
import { QuizConfigModalComponent } from '../quiz-config/quiz-config-modal.component';
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from '../../core/constants/programming-languages.const';
import { QuestionService } from '../../core/services/question.service';
import { QuizConfig } from '../../core/models/quiz-config.model';
import { QuizData } from '../../core/models/question.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageCardComponent, QuizConfigModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  languages = PROGRAMMING_LANGUAGES;
  
  selectedLanguage = signal<ProgrammingLanguage | null>(null);
  quizData = signal<QuizData | null>(null);
  isLoading = signal(false);

  constructor(
    private questionService: QuestionService,
    private router: Router
  ) {}

  async onLanguageSelect(languageId: string, disabled?: boolean): Promise<void> {
    if (disabled) {
      return;
    }
    
    const language = this.languages.find(l => l.id === languageId);
    if (!language) {
      return;
    }

    this.selectedLanguage.set(language);
    this.isLoading.set(true);

    try {
      const data = await this.questionService.loadQuizData(languageId);
      this.quizData.set(data);
    } catch {
      this.quizData.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  onModalClose(): void {
    this.selectedLanguage.set(null);
    this.quizData.set(null);
  }

  onQuizStart(config: QuizConfig): void {
    // Переход на страницу теста с конфигурацией
    this.router.navigate(['/quiz'], {
      state: { config }
    });
    this.onModalClose();
  }
}

