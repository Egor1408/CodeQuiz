import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Светлая', icon: '☀️' },
    { value: 'dark', label: 'Темная', icon: '🌙' },
    { value: 'green', label: 'Зеленая', icon: '🌿' },
    { value: 'blue', label: 'Синяя', icon: '💙' }
  ];

  constructor(public themeService: ThemeService) {}

  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}

