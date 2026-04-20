import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
                @if (img.resource_type === 'video') {
                  <div class="gallery-item gallery-video">
                    <video [src]="img.image_url" controls preload="metadata"></video>
                  </div>
                } @else {
                  <div class="gallery-item" (click)="openModal(img.image_url)">
                    <img [src]="img.image_url" [alt]="post.title">
                  </div>
                }
              }
            </div>
          }

          <div class="article-content" [innerHTML]="formatContent(post.content)"></div>

          @if (youtubeEmbeds.length > 0) {
            <div class="youtube-section">
              @for (embed of youtubeEmbeds; track $index) {
                <div class="youtube-embed">
                  <iframe
                    [src]="embed"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              }
            </div>
          }

          @if (post.file_url || (post.all_files && post.all_files.length > 0) || externalLinksList.length > 0) {
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
              @for (link of externalLinksList; track $index) {
                <div class="download-card external">
                  <span class="material-icons download-icon">cloud_download</span>
                  <div class="download-info">
                    <p class="download-name">{{ link.name }}</p>
                    <p class="download-hint">Enlace externo ({{ link.host }})</p>
                  </div>
                  <a [href]="link.url" target="_blank" rel="noopener" class="btn btn-primary">
                    <span class="material-icons" style="font-size: 18px">open_in_new</span>
                    Abrir
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
    .youtube-section {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .youtube-embed {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%;
      border-radius: var(--radius);
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .youtube-embed iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
    .download-card.external {
      border-color: var(--primary);
      border-style: dashed;
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
    .gallery-video {
      cursor: default;
    }
    .gallery-video video {
      width: 100%;
      border-radius: var(--radius);
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
  youtubeEmbeds: SafeResourceUrl[] = [];
  externalLinksList: { url: string; name: string; host: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.postService.getPost(slug).subscribe({
        next: (post) => {
          this.post = post;
          this.loading = false;
          this.parseYoutubeUrls(post.youtube_urls || '');
          this.parseExternalLinks(post.external_links || '');
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  private parseYoutubeUrls(text: string): void {
    this.youtubeEmbeds = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(url => this.extractYoutubeId(url))
      .filter((id): id is string => id !== null)
      .map(id => this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`));
  }

  private extractYoutubeId(url: string): string | null {
    // youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    const patterns = [
      /(?:youtube\.com\/watch\?.*v=)([\w-]{11})/,
      /(?:youtu\.be\/)([\w-]{11})/,
      /(?:youtube\.com\/embed\/)([\w-]{11})/,
    ];
    for (const p of patterns) {
      const match = url.match(p);
      if (match) return match[1];
    }
    return null;
  }

  private parseExternalLinks(text: string): void {
    this.externalLinksList = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split('|').map(p => p.trim());
        const url = parts[0];
        const name = parts[1] || this.fileNameFromUrl(url);
        let host = '';
        try { host = new URL(url).hostname.replace('www.', ''); } catch {}
        return { url, name, host };
      });
  }

  private fileNameFromUrl(url: string): string {
    try {
      const path = new URL(url).pathname;
      const name = path.split('/').pop();
      return name || 'Archivo externo';
    } catch {
      return 'Archivo externo';
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
