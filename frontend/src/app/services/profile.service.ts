import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProfileResponse, ProfilePhoto } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/`);
  }

  updateProfile(data: Record<string, string>): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/update/`, data);
  }

  uploadPhoto(file: File): Observable<ProfilePhoto> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ProfilePhoto>(`${this.apiUrl}/photos/`, formData);
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/photos/${photoId}/`);
  }

  uploadLogo(file: File): Observable<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ logo_url: string }>(`${this.apiUrl}/logo/`, formData);
  }

  deleteLogo(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/logo/delete/`);
  }
}
