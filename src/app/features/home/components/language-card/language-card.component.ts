import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgrammingLanguage } from '../../../../core/constants/programming-languages.const';

@Component({
  selector: 'app-language-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-card.component.html',
  styleUrl: './language-card.component.scss'
})
export class LanguageCardComponent {
  @Input({ required: true }) language!: ProgrammingLanguage;
  
  defaultIcon = 'assets/images/languages/placeholder.svg';
  private errorCount = 0;
  
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.errorCount++;
    
    // Предотвращаем бесконечный цикл ошибок
    if (this.errorCount > 1) {
      img.style.display = 'none';
      return;
    }
    
    // Если это не placeholder, пробуем загрузить placeholder
    if (!img.src.includes('placeholder')) {
      img.src = this.defaultIcon;
    } else {
      // Если и placeholder не загрузился, скрываем изображение
      img.style.display = 'none';
    }
  }
}

