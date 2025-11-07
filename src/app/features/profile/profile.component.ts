import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h1>Профиль</h1>
      <p>Страница профиля будет здесь</p>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
      min-height: calc(100vh - 80px);
      background: var(--page-bg);
    }
  `]
})
export class ProfileComponent {}

