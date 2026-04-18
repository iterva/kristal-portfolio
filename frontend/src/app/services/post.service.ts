import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post, PaginatedResponse } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPosts(page: number = 1): Observable<PaginatedResponse<Post>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<Post>>(`${this.apiUrl}/`, { params });
  }

  getPost(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${slug}/`);
  }

  createPost(formData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/`, formData);
  }

  updatePost(slug: string, formData: FormData): Observable<Post> {
    return this.http.patch<Post>(`${this.apiUrl}/${slug}/`, formData);
  }

  deletePost(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${slug}/`);
  }
}
