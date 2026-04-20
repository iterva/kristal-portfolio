import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post, PaginatedResponse, PostImage, PostFileItem } from '../models/post.model';

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

  uploadPostImages(slug: string, files: File[]): Observable<HttpEvent<PostImage[]>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    const req = new HttpRequest('POST', `${this.apiUrl}/${slug}/images/`, formData, {
      reportProgress: true,
    });
    return this.http.request<PostImage[]>(req);
  }

  deletePostImage(slug: string, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${slug}/images/${imageId}/`);
  }

  uploadPostFiles(slug: string, files: File[]): Observable<HttpEvent<PostFileItem[]>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    const req = new HttpRequest('POST', `${this.apiUrl}/${slug}/files/`, formData, {
      reportProgress: true,
    });
    return this.http.request<PostFileItem[]>(req);
  }

  deletePostFile(slug: string, fileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${slug}/files/${fileId}/`);
  }

  registerImages(slug: string, items: { url: string; public_id: string; resource_type: string }[]): Observable<PostImage[]> {
    return this.http.post<PostImage[]>(`${this.apiUrl}/${slug}/images/register/`, { items });
  }

  registerFiles(slug: string, items: { url: string; public_id: string; file_name: string }[]): Observable<PostFileItem[]> {
    return this.http.post<PostFileItem[]>(`${this.apiUrl}/${slug}/files/register/`, { items });
  }
}
