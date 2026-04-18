import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="form-wrapper">
        <div class="form-header">
          <a routerLink="/admin" class="back-link">
            <span class="material-icons">arrow_back</span>
            Volver al dashboard
          </a>
          <h1>{{ isEditing ? 'Editar' : 'Nuevo' }} Proyecto</h1>
        </div>

        <form (ngSubmit)="onSubmit()" class="post-form">
          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }

          <div class="form-group">
            <label for="title">Título *</label>
            <input
              type="text"
              id="title"
              [(ngModel)]="title"
              name="title"
              class="form-control"
              placeholder="Nombre del proyecto"
              required
            >
          </div>

          <div class="form-group">
            <label for="excerpt">Resumen</label>
            <textarea
              id="excerpt"
              [(ngModel)]="excerpt"
              name="excerpt"
              class="form-control"
              placeholder="Breve descripción del proyecto (se muestra en la tarjeta)"
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="content">Contenido *</label>
            <textarea
              id="content"
              [(ngModel)]="content"
              name="content"
              class="form-control"
              placeholder="Describe tu proyecto en detalle..."
              rows="12"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="tags">Tags</label>
            <input
              type="text"
              id="tags"
              [(ngModel)]="tags"
              name="tags"
              class="form-control"
              placeholder="Angular, Python, API (separados por coma)"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="image">Imagen del proyecto</label>
              <div class="file-input-wrapper">
                <input
                  type="file"
                  id="image"
                  (change)="onImageSelected($event)"
                  accept="image/*"
                  class="file-input"
                >
                <label for="image" class="file-label">
                  <span class="material-icons">image</span>
                  {{ imageFile ? imageFile.name : 'Seleccionar imagen' }}
                </label>
              </div>
              @if (existingImageUrl && !imageFile) {
                <img [src]="existingImageUrl" class="preview-img" alt="Preview">
              }
              @if (imagePreview) {
                <img [src]="imagePreview" class="preview-img" alt="Preview">
              }
            </div>

            <div class="form-group">
              <label for="file">Archivo adjunto (opcional)</label>
              <div class="file-input-wrapper">
                <input
                  type="file"
                  id="file"
                  (change)="onFileSelected($event)"
                  class="file-input"
                >
                <label for="file" class="file-label">
                  <span class="material-icons">attach_file</span>
                  {{ attachmentFile ? attachmentFile.name : 'Seleccionar archivo' }}
                </label>
              </div>
              @if (existingFileName) {
                <p class="existing-file">Archivo actual: {{ existingFileName }}</p>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="published" name="published">
              <span>Publicar inmediatamente</span>
            </label>
          </div>

          <div class="form-actions">
            <a routerLink="/admin" class="btn btn-outline">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              @if (saving) {
                Guardando...
              } @else {
                {{ isEditing ? 'Actualizar' : 'Publicar' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper {
      max-width: 800px;
      margin: 0 auto;
    }
    .form-header {
      margin-bottom: 32px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 16px;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: var(--primary);
      text-decoration: none;
    }
    .form-header h1 {
      font-size: 28px;
    }
    .post-form {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
    }
    .error-msg {
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .file-input {
      display: none;
    }
    .file-input-wrapper {
      position: relative;
    }
    .file-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--bg);
      border: 1px dashed var(--border);
      border-radius: 8px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .file-label:hover {
      border-color: var(--primary);
    }
    .preview-img {
      margin-top: 12px;
      max-height: 150px;
      border-radius: 8px;
    }
    .existing-file {
      margin-top: 8px;
      color: var(--primary);
      font-size: 13px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--text);
    }
    .checkbox-label input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .post-form { padding: 20px; }
    }
  `]
})
export class PostFormComponent implements OnInit {
  isEditing = false;
  slug = '';
  title = '';
  excerpt = '';
  content = '';
  tags = '';
  published = true;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  attachmentFile: File | null = null;
  existingImageUrl: string | null = null;
  existingFileName = '';
  error = '';
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.isEditing = true;
      this.slug = slug;
      this.postService.getPost(slug).subscribe({
        next: (post: Post) => {
          this.title = post.title;
          this.excerpt = post.excerpt;
          this.content = post.content;
          this.tags = post.tags_list.join(', ');
          this.published = post.published;
          this.existingImageUrl = post.image_url;
          this.existingFileName = post.file_name;
        }
      });
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachmentFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.error = 'El título y contenido son obligatorios.';
      return;
    }

    this.saving = true;
    this.error = '';

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('excerpt', this.excerpt);
    formData.append('content', this.content);
    formData.append('tags', this.tags);
    formData.append('published', this.published.toString());

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }
    if (this.attachmentFile) {
      formData.append('file', this.attachmentFile);
    }

    const request$ = this.isEditing
      ? this.postService.updatePost(this.slug, formData)
      : this.postService.createPost(formData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error = 'Error al guardar el proyecto. Verifica los datos e intenta de nuevo.';
        this.saving = false;
        console.error(err);
      }
    });
  }
}
