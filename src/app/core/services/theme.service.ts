import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'green' | 'blue';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'codequiz-theme';
  private readonly defaultTheme: Theme = 'light';

  currentTheme = signal<Theme>(this.loadTheme());

  constructor() {
    // Применяем тему сразу при загрузке
    const initialTheme = this.currentTheme();
    this.applyTheme(initialTheme);
    
    // Применяем тему при изменении
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(this.THEME_KEY);
    return (saved as Theme) || this.defaultTheme;
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

