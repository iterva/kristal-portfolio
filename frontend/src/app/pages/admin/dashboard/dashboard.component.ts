import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { Post, PaginatedResponse } from '../../../models/post.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="header-actions">
          <a routerLink="/admin/profile" class="btn btn-outline">
            <span class="material-icons" style="font-size: 18px">person</span>
            Editar perfil
          </a>
          <a routerLink="/admin/new" class="btn btn-primary">
            <span class="material-icons" style="font-size: 18px">add</span>
            Nuevo proyecto
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="loading">
          <div class="spinner"></div>
        </div>
      }

      @if (!loading && posts.length === 0) {
        <div class="empty-state">
          <span class="material-icons" style="font-size: 64px">post_add</span>
          <h3>No hay proyectos aún</h3>
          <p>Crea tu primer proyecto para mostrarlo en tu portafolio.</p>
          <a routerLink="/admin/new" class="btn btn-primary" style="margin-top: 16px">
            Crear proyecto
          </a>
        </div>
      }

      <div class="posts-list">
        @for (post of posts; track post.id) {
          <div class="post-item" [class.unpublished]="!post.published">
            <div class="post-info">
              @if (post.image_url) {
                <img [src]="post.image_url" class="post-thumb" [alt]="post.title">
              } @else {
                <div class="post-thumb post-thumb-placeholder">
                  <span class="material-icons">code</span>
                </div>
              }
              <div class="post-details">
                <h3>{{ post.title }}</h3>
                <div class="post-meta">
                  <span>{{ post.created_at | date:'mediumDate' }}</span>
                  @if (!post.published) {
                    <span class="badge-draft">Borrador</span>
                  } @else {
                    <span class="badge-published">Publicado</span>
                  }
                  @if (post.files_count) {
                    <span class="has-file">
                      <span class="material-icons" style="font-size: 14px">attach_file</span>
                      {{ post.files_count }} archivo{{ post.files_count! > 1 ? 's' : '' }}
                    </span>
                  }
                </div>
              </div>
            </div>
            <div class="post-actions">
              <a [routerLink]="['/admin/edit', post.slug]" class="btn btn-outline btn-sm">
                <span class="material-icons" style="font-size: 16px">edit</span>
                Editar
              </a>
              <button (click)="onDelete(post)" class="btn btn-danger btn-sm">
                <span class="material-icons" style="font-size: 16px">delete</span>
              </button>
            </div>
          </div>
        }
      </div>

      @if (hasMore) {
        <div class="load-more">
          <button (click)="loadMore()" class="btn btn-outline">Cargar más</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .dashboard-header h1 {
      font-size: 28px;
    }
    .header-actions {
      display: flex;
      gap: 12px;
    }
    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .post-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 20px;
      transition: border-color 0.2s;
    }
    .post-item:hover {
      border-color: var(--primary);
    }
    .post-item.unpublished {
      opacity: 0.7;
    }
    .post-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }
    .post-thumb {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }
    .post-thumb-placeholder {
      background: var(--bg-card-hover);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .post-thumb-placeholder .material-icons {
      font-size: 24px;
      color: var(--text-muted);
    }
    .post-details h3 {
      font-size: 16px;
      margin-bottom: 6px;
    }
    .post-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      color: var(--text-muted);
      font-size: 13px;
    }
    .badge-draft {
      background: rgba(255, 152, 0, 0.15);
      color: #ff9800;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-published {
      background: rgba(76, 175, 80, 0.15);
      color: var(--success);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .has-file {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--primary);
    }
    .post-actions {
      display: flex;
      gap: 8px;
    }
    .loading, .empty-state {
      text-align: center;
      padding: 60px 0;
      color: var(--text-muted);
    }
    .empty-state h3 {
      margin: 16px 0 8px;
      color: var(--text);
    }
    .load-more {
      text-align: center;
      margin-top: 32px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .post-item { flex-direction: column; gap: 12px; align-items: flex-start; }
      .post-actions { width: 100%; justify-content: flex-end; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  hasMore = false;
  currentPage = 1;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
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

  onDelete(post: Post): void {
    if (confirm(`¿Eliminar "${post.title}"?`)) {
      this.postService.deletePost(post.slug).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== post.id);
        }
      });
    }
  }
}
