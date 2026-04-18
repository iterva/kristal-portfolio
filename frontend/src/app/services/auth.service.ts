import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'portfolio_token';
  private userKey = 'portfolio_user';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login/`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.loggedIn.next(true);
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout/`, {}).subscribe({
      complete: () => {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.loggedIn.next(false);
      },
      error: () => {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.loggedIn.next(false);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getUser(): { id: number; email: string; first_name: string; last_name: string } | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }
}
