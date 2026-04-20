import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  original_filename: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  done: boolean;
  result?: CloudinaryUploadResult;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Get a signed upload params from our backend */
  getSignature(folder: string): Observable<CloudinarySignature> {
    return this.http.post<CloudinarySignature>(`${this.apiUrl}/cloudinary/sign/`, { folder });
  }

  /**
   * Upload a file directly to Cloudinary with progress tracking.
   * Returns an observable that emits progress updates.
   */
  uploadFile(
    file: File,
    signature: CloudinarySignature,
    resourceType: string = 'auto'
  ): Observable<UploadProgress> {
    const subject = new Subject<UploadProgress>();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.api_key);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('signature', signature.signature);
    formData.append('folder', signature.folder);

    const url = `https://api.cloudinary.com/v1_1/${signature.cloud_name}/${resourceType}/upload`;

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        subject.next({
          file,
          progress: Math.round((e.loaded / e.total) * 100),
          done: false,
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: CloudinaryUploadResult = JSON.parse(xhr.responseText);
          subject.next({
            file,
            progress: 100,
            done: true,
            result,
          });
        } catch (e) {
          subject.next({
            file,
            progress: 0,
            done: true,
            error: 'Respuesta inválida de Cloudinary.',
          });
        }
        subject.complete();
      } else {
        let errorMsg = `Error ${xhr.status}`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.error && body.error.message) {
            errorMsg = body.error.message;
          }
        } catch (e) {}
        console.error('Cloudinary upload error:', xhr.status, xhr.responseText);
        subject.next({
          file,
          progress: 0,
          done: true,
          error: errorMsg,
        });
        subject.complete();
      }
    });

    xhr.addEventListener('error', () => {
      subject.next({
        file,
        progress: 0,
        done: true,
        error: 'Error de conexión al subir archivo.',
      });
      subject.complete();
    });

    xhr.open('POST', url);
    xhr.send(formData);

    return subject.asObservable();
  }
}
