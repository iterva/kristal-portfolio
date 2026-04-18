import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { ProfileService } from '../../services/profile.service';
import { Post, PaginatedResponse, ProfileResponse, ProfilePhoto } from '../../models/post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <section class="hero">
        <h1 class="hero-title">Hola, soy <span class="highlight">{{ profileName }}</span></h1>
        @if (jobTitle) {
          <p class="hero-job-title">{{ jobTitle }}</p>
        }
        <p class="hero-subtitle">{{ heroSubtitle }}</p>

        @if (photos.length > 0) {
          <div class="hero-photos">
            @for (photo of photos; track photo.id) {
              <div class="hero-photo" (click)="openModal(photo.image_url)">
                <img [src]="photo.image_url" alt="Foto de presentación">
              </div>
            }
          </div>
        }

        @if (bio) {
          <p class="hero-bio">{{ bio }}</p>
        }
      </section>

      <section class="posts-section">
        <h2 class="section-title">Mis Proyectos</h2>

        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Cargando proyectos...</p>
          </div>
        }

        @if (!loading && posts.length === 0) {
          <div class="empty-state">
            <span class="material-icons empty-icon">folder_open</span>
            <p>Aún no hay proyectos publicados.</p>
          </div>
        }

        <div class="posts-grid">
          @for (post of posts; track post.id) {
            <a [routerLink]="['/post', post.slug]" class="post-card">
              @if (post.image_url) {
                <div class="post-image">
                  <img [src]="post.image_url" [alt]="post.title">
                </div>
              } @else {
                <div class="post-image post-image-placeholder">
                  <span class="material-icons">code</span>
                </div>
              }
              <div class="post-body">
                <div class="post-tags">
                  @for (tag of post.tags_list; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-excerpt">{{ post.excerpt }}</p>
                <div class="post-meta">
                  <span>{{ post.created_at | date:'mediumDate' }}</span>
                  @if (post.file_name) {
                    <span class="has-file">
                      <span class="material-icons" style="font-size: 14px">attach_file</span>
                      Archivo adjunto
                    </span>
                  }
                </div>
              </div>
            </a>
          }
        </div>

        @if (hasMore) {
          <div class="load-more">
            <button (click)="loadMore()" class="btn btn-outline" [disabled]="loading">
              Cargar más
            </button>
          </div>
        }
      </section>
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
    .hero {
      text-align: center;
      padding: 60px 0 50px;
    }
    .hero-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .highlight {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      color: var(--text-muted);
      font-size: 18px;
      max-width: 600px;
      margin: 0 auto;
    }
    .hero-job-title {
      color: var(--primary);
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .hero-photos {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 32px;
      flex-wrap: wrap;
    }
    .hero-photo {
      width: 180px;
      height: 180px;
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid var(--border);
      transition: transform 0.3s, border-color 0.3s;
      cursor: pointer;
    }
    .hero-photo:hover {
      transform: scale(1.05);
      border-color: var(--primary);
    }
    .hero-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-bio {
      color: var(--text-muted);
      font-size: 15px;
      max-width: 650px;
      margin: 28px auto 0;
      line-height: 1.7;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 28px;
      text-align: left;
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
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 1001;
    }
    .modal-close:hover {
      background: var(--danger);
      color: white;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .section-title {
      font-size: 24px;
      margin-bottom: 32px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border);
    }
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
    }
    .post-card {
      background: var(--bg-card);
      border-radius: var(--radius);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid var(--border);
    }
    .post-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow);
      text-decoration: none;
      border-color: var(--primary);
    }
    .post-image {
      height: 200px;
      overflow: hidden;
    }
    .post-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .post-image-placeholder {
      background: var(--bg-card-hover);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .post-image-placeholder .material-icons {
      font-size: 48px;
      color: var(--text-muted);
    }
    .post-body {
      padding: 20px;
    }
    .post-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .post-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text);
    }
    .post-excerpt {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .post-meta {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-muted);
      font-size: 13px;
    }
    .has-file {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--primary);
    }
    .load-more {
      text-align: center;
      margin-top: 40px;
    }
    .loading, .empty-state {
      text-align: center;
      padding: 60px 0;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      display: block;
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
      .hero-title { font-size: 32px; }
      .posts-grid { grid-template-columns: 1fr; }
      .hero-photo { width: 140px; height: 140px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  hasMore = false;
  currentPage = 1;
  profileName = 'Kristal';
  jobTitle = '';
  heroSubtitle = 'Bienvenido a mi portafolio. Aquí comparto los proyectos en los que he trabajado.';
  photos: ProfilePhoto[] = [];
  bio = '';
  modalImage: string | null = null;

  constructor(private postService: PostService, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res: ProfileResponse) => {
        this.profileName = res.name || 'Kristal';
        if (res.profile.headline) {
          this.heroSubtitle = res.profile.headline;
        }
        this.jobTitle = res.profile.title || '';
        this.photos = res.profile.photos || [];
        this.bio = res.profile.bio || '';
      }
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts(this.currentPage).subscribe({
      next: (res: PaginatedResponse<Post>) => {
        this.posts = [...this.posts, ...res.results];
        this.hasMore = !!res.next;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.loadPosts();
  }

  openModal(imageUrl: string): void {
    this.modalImage = imageUrl;
  }

  closeModal(): void {
    this.modalImage = null;
  }
}
