import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-header">
            <span class="login-icon">K</span>
            <h1>Acceso Admin</h1>
            <p>Inicia sesión para administrar tu portafolio</p>
          </div>

          <form (ngSubmit)="onLogin()" class="login-form">
            @if (error) {
              <div class="error-msg">{{ error }}</div>
            }

            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                class="form-control"
                placeholder="tu@email.com"
                required
              >
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <input
                type="password"
                id="password"
                [(ngModel)]="password"
                name="password"
                class="form-control"
                placeholder="••••••••"
                required
              >
            </div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
              @if (loading) {
                Iniciando sesión...
              } @else {
                Iniciar sesión
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 250px);
    }
    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 48px;
      width: 100%;
      max-width: 420px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .login-icon {
      display: inline-flex;
      width: 56px;
      height: 56px;
      background: var(--primary);
      border-radius: 16px;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 24px;
      color: white;
      margin-bottom: 16px;
    }
    .login-header h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .login-header p {
      color: var(--text-muted);
      font-size: 14px;
    }
    .error-msg {
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .btn-full {
      width: 100%;
      justify-content: center;
      padding: 14px;
      font-size: 15px;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    this.error = '';
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al iniciar sesión.';
        this.loading = false;
      }
    });
  }
}
