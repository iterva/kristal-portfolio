import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando proyecto...</p>
        </div>
      }

      @if (!loading && post) {
        <article class="article">
          <a routerLink="/" class="back-link">
            <span class="material-icons">arrow_back</span>
            Volver al portafolio
          </a>

          <header class="article-header">
            <div class="article-tags">
              @for (tag of post.tags_list; track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </div>
            <h1 class="article-title">{{ post.title }}</h1>
            <div class="article-meta">
              <span>Por {{ post.author?.first_name }} {{ post.author?.last_name }}</span>
              <span>•</span>
              <span>{{ post.created_at | date:'longDate' }}</span>
            </div>
          </header>

          @if (post.image_url) {
            <div class="article-image">
              <img [src]="post.image_url" [alt]="post.title" (click)="openModal(post.image_url!)">
            </div>
          }

          @if (post.images && post.images.length > 0) {
            <div class="gallery">
              @for (img of post.images; track img.id) {
                <div class="gallery-item" (click)="openModal(img.image_url)">
                  <img [src]="img.image_url" [alt]="post.title">
                </div>
              }
            </div>
          }

          <div class="article-content" [innerHTML]="formatContent(post.content)"></div>

          @if (post.file_url || (post.all_files && post.all_files.length > 0)) {
            <div class="download-section">
              @if (post.file_url) {
                <div class="download-card">
                  <span class="material-icons download-icon">description</span>
                  <div class="download-info">
                    <p class="download-name">{{ post.file_name }}</p>
                    <p class="download-hint">Archivo adjunto disponible para descarga</p>
                  </div>
                  <a [href]="post.file_url" download class="btn btn-primary">
                    <span class="material-icons" style="font-size: 18px">download</span>
                    Descargar
                  </a>
                </div>
              }
              @for (file of post.all_files; track file.id) {
                <div class="download-card">
                  <span class="material-icons download-icon">description</span>
                  <div class="download-info">
                    <p class="download-name">{{ file.file_name }}</p>
                    <p class="download-hint">Archivo adjunto disponible para descarga</p>
                  </div>
                  <a [href]="file.file_url" download class="btn btn-primary">
                    <span class="material-icons" style="font-size: 18px">download</span>
                    Descargar
                  </a>
                </div>
              }
            </div>
          }
        </article>
      }

      @if (!loading && !post) {
        <div class="not-found">
          <span class="material-icons" style="font-size: 64px">search_off</span>
          <h2>Proyecto no encontrado</h2>
          <a routerLink="/" class="btn btn-primary">Volver al inicio</a>
        </div>
      }
    </div>

    @if (modalImage) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="closeModal()">
            <span class="material-icons">close</span>
          </button>
          <img [src]="modalImage" alt="Foto ampliada">
        </div>
      </div>
    }
  `,
  styles: [`
    .article {
      max-width: 800px;
      margin: 0 auto;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 32px;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: var(--primary);
      text-decoration: none;
    }
    .back-link .material-icons {
      font-size: 18px;
    }
    .article-header {
      margin-bottom: 32px;
    }
    .article-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .article-title {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 16px;
    }
    .article-meta {
      display: flex;
      gap: 8px;
      color: var(--text-muted);
      font-size: 14px;
    }
    .article-image {
      margin-bottom: 32px;
      border-radius: var(--radius);
      overflow: hidden;
    }
    .article-image img {
      width: 100%;
      border-radius: var(--radius);
    }
    .article-content {
      font-size: 16px;
      line-height: 1.8;
      color: var(--text);
    }
    .download-section {
      margin-top: 40px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .download-card {
      display: flex;
      align-items: center;
      gap: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
    }
    .download-icon {
      font-size: 40px;
      color: var(--primary);
    }
    .download-info {
      flex: 1;
    }
    .download-name {
      font-weight: 600;
      margin-bottom: 4px;
    }
    .download-hint {
      color: var(--text-muted);
      font-size: 13px;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 32px;
    }
    .gallery-item {
      border-radius: var(--radius);
      overflow: hidden;
      cursor: pointer;
      border: 1px solid var(--border);
      transition: border-color 0.2s, transform 0.2s;
    }
    .gallery-item:hover {
      border-color: var(--primary);
      transform: scale(1.02);
    }
    .gallery-item img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      display: block;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    .modal-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
    }
    .modal-content img {
      max-width: 90vw;
      max-height: 85vh;
      border-radius: 12px;
      object-fit: contain;
    }
    .modal-close {
      position: absolute;
      top: -16px;
      right: -16px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .loading, .not-found {
      text-align: center;
      padding: 80px 0;
      color: var(--text-muted);
    }
    .not-found h2 {
      margin: 16px 0 24px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .article-title { font-size: 28px; }
      .download-card { flex-direction: column; text-align: center; }
    }
  `]
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  loading = true;
  modalImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.postService.getPost(slug).subscribe({
        next: (post) => {
          this.post = post;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  formatContent(content: string): string {
    // Simple newline to <br> and paragraph conversion
    return content
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  openModal(url: string): void {
    this.modalImage = url;
  }

  closeModal(): void {
    this.modalImage = null;
  }
}
