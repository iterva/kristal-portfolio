import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { Post, PostImage, PostFileItem } from '../../../models/post.model';
import { forkJoin } from 'rxjs';

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

          <!-- Imágenes -->
          <div class="form-group">
            <label>Imágenes del proyecto</label>
            <div class="file-input-wrapper">
              <input
                type="file"
                id="images"
                (change)="onImagesSelected($event)"
                accept="image/*"
                multiple
                class="file-input"
              >
              <label for="images" class="file-label">
                <span class="material-icons">add_photo_alternate</span>
                Seleccionar imágenes
              </label>
            </div>
            <div class="media-grid">
              @for (img of existingImages; track img.id) {
                <div class="media-item">
                  @if (img.resource_type === 'video') {
                    <video [src]="img.image_url" muted></video>
                  } @else {
                    <img [src]="img.image_url" alt="Imagen">
                  }
                  <button type="button" class="remove-btn" (click)="removeExistingImage(img)" title="Eliminar">
                    <span class="material-icons">close</span>
                  </button>
                </div>
              }
              @if (existingCoverUrl) {
                <div class="media-item">
                  <img [src]="existingCoverUrl" alt="Portada">
                  <span class="media-badge">Portada antigua</span>
                </div>
              }
              @for (preview of newImagePreviews; track $index) {
                <div class="media-item new-item">
                  <img [src]="preview" alt="Nueva imagen">
                  <button type="button" class="remove-btn" (click)="removeNewImage($index)" title="Eliminar">
                    <span class="material-icons">close</span>
                  </button>
                  <span class="media-badge new-badge">Nueva</span>
                </div>
              }
            </div>
          </div>

          <!-- Archivos -->
          <div class="form-group">
            <label>Archivos adjuntos</label>
            <div class="file-input-wrapper">
              <input
                type="file"
                id="files"
                (change)="onFilesSelected($event)"
                multiple
                class="file-input"
              >
              <label for="files" class="file-label">
                <span class="material-icons">attach_file</span>
                Seleccionar archivos
              </label>
            </div>
            <div class="files-list">
              @for (file of existingFiles; track file.id) {
                <div class="file-item">
                  <span class="material-icons file-icon">description</span>
                  <span class="file-name">{{ file.file_name }}</span>
                  <button type="button" class="remove-btn-inline" (click)="removeExistingFile(file)" title="Eliminar">
                    <span class="material-icons">close</span>
                  </button>
                </div>
              }
              @if (existingLegacyFileName) {
                <div class="file-item">
                  <span class="material-icons file-icon">description</span>
                  <span class="file-name">{{ existingLegacyFileName }} (antiguo)</span>
                </div>
              }
              @for (file of newFiles; track $index) {
                <div class="file-item new-item">
                  <span class="material-icons file-icon">note_add</span>
                  <span class="file-name">{{ file.name }}</span>
                  <button type="button" class="remove-btn-inline" (click)="removeNewFile($index)" title="Eliminar">
                    <span class="material-icons">close</span>
                  </button>
                </div>
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
    .file-input {
      display: none;
    }
    .file-input-wrapper {
      position: relative;
    }
    .file-label {
      display: inline-flex;
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
    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .media-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
      aspect-ratio: 1;
    }
    .media-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .media-item .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0,0,0,0.7);
      border: none;
      color: #fff;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .media-item .remove-btn .material-icons {
      font-size: 16px;
    }
    .media-item:hover .remove-btn {
      opacity: 1;
    }
    .media-badge {
      position: absolute;
      bottom: 4px;
      left: 4px;
      background: rgba(0,0,0,0.6);
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .new-badge {
      background: var(--primary) !important;
    }
    .files-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }
    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
    }
    .file-item.new-item {
      border-color: var(--primary);
      border-style: dashed;
    }
    .file-icon {
      font-size: 20px;
      color: var(--primary);
    }
    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .remove-btn-inline {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }
    .remove-btn-inline:hover {
      color: var(--danger);
    }
    .remove-btn-inline .material-icons {
      font-size: 18px;
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
      .post-form { padding: 20px; }
      .media-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
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
  error = '';
  saving = false;

  // Existing media from server
  existingImages: PostImage[] = [];
  existingFiles: PostFileItem[] = [];
  existingCoverUrl: string | null = null;
  existingLegacyFileName = '';

  // New files to upload
  newImageFiles: File[] = [];
  newImagePreviews: string[] = [];
  newFiles: File[] = [];

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
          this.existingCoverUrl = post.image_url;
          this.existingLegacyFileName = post.file_name;
          this.existingImages = post.images || [];
          this.existingFiles = post.all_files || [];
        }
      });
    }
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.newImageFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.newImagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      input.value = '';
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.newFiles.push(input.files[i]);
      }
      input.value = '';
    }
  }

  removeNewImage(index: number): void {
    this.newImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  removeNewFile(index: number): void {
    this.newFiles.splice(index, 1);
  }

  removeExistingImage(img: PostImage): void {
    this.postService.deletePostImage(this.slug, img.id).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(i => i.id !== img.id);
      }
    });
  }

  removeExistingFile(file: PostFileItem): void {
    this.postService.deletePostFile(this.slug, file.id).subscribe({
      next: () => {
        this.existingFiles = this.existingFiles.filter(f => f.id !== file.id);
      }
    });
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

    const request$ = this.isEditing
      ? this.postService.updatePost(this.slug, formData)
      : this.postService.createPost(formData);

    request$.subscribe({
      next: (post: Post) => {
        const slug = post.slug;
        const uploads: any[] = [];
        if (this.newImageFiles.length > 0) {
          uploads.push(this.postService.uploadPostImages(slug, this.newImageFiles));
        }
        if (this.newFiles.length > 0) {
          uploads.push(this.postService.uploadPostFiles(slug, this.newFiles));
        }
        if (uploads.length > 0) {
          forkJoin(uploads).subscribe({
            next: () => this.router.navigate(['/admin']),
            error: (err) => {
              this.saving = false;
              this.error = 'El post se guardó pero hubo un error al subir archivos. Intenta editarlo y subirlos de nuevo.';
              console.error('Error uploading files:', err);
            }
          });
        } else {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.error = 'Error al guardar el proyecto. Verifica los datos e intenta de nuevo.';
        this.saving = false;
        console.error(err);
      }
    });
  }
}
