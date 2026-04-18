import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CommonModule],
  template: `
    <nav class="navbar">
      <div class="container nav-container">
        <a routerLink="/" class="logo">
          @if (logoUrl) {
            <img [src]="logoUrl" alt="Logo" class="logo-img">
          } @else {
            <span class="logo-icon">K</span>
            <span class="logo-text">Kristal</span>
          }
        </a>
        <div class="nav-links">
          @if (auth.isLoggedIn$ | async) {
            <a routerLink="/" class="nav-link">Portafolio</a>
            <a routerLink="/admin" class="nav-link">Dashboard</a>
            <button (click)="onLogout()" class="btn btn-outline btn-sm">Salir</button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(15, 15, 26, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: var(--primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      color: white;
    }
    .logo-img {
      height: 42px;
      max-width: 200px;
      border-radius: 10px;
      object-fit: contain;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-link:hover {
      color: var(--text);
      text-decoration: none;
    }
  `]
})
export class NavbarComponent implements OnInit {
  logoUrl: string | null = null;

  constructor(public auth: AuthService, private router: Router, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.logoUrl = res.profile.logo_url;
      }
    });
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
