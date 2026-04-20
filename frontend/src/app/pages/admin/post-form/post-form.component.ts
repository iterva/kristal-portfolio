import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post.service';
import { CloudinaryService, CloudinarySignature, CloudinaryUploadResult } from '../../../services/cloudinary.service';
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
                <div class="media-item" [class.deleting]="deletingIds.has('img-' + img.id)" [class.is-cover]="img.is_cover">
                  @if (img.resource_type === 'video') {
                    <video [src]="img.image_url" muted></video>
                  } @else {
                    <img [src]="img.image_url" alt="Imagen">
                  }
                  @if (deletingIds.has('img-' + img.id)) {
                    <div class="deleting-overlay">
                      <span class="material-icons spin">autorenew</span>
                      <span>Eliminando...</span>
                    </div>
                  } @else {
                    <button type="button" class="cover-btn" [class.active]="img.is_cover" (click)="setCover(img)" title="Usar como portada">
                      <span class="material-icons">{{ img.is_cover ? 'star' : 'star_border' }}</span>
                    </button>
                    <button type="button" class="remove-btn" (click)="removeExistingImage(img)" title="Eliminar">
                      <span class="material-icons">close</span>
                    </button>
                  }
                  @if (img.is_cover) {
                    <span class="media-badge cover-badge">Portada</span>
                  }
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
                <div class="file-item" [class.deleting]="deletingIds.has('file-' + file.id)">
                  @if (deletingIds.has('file-' + file.id)) {
                    <span class="material-icons file-icon spin">autorenew</span>
                    <span class="file-name">Eliminando {{ file.file_name }}...</span>
                  } @else {
                    <span class="material-icons file-icon">description</span>
                    <span class="file-name">{{ file.file_name }}</span>
                    <button type="button" class="remove-btn-inline" (click)="removeExistingFile(file)" title="Eliminar">
                      <span class="material-icons">close</span>
                    </button>
                  }
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

          <!-- YouTube -->
          <div class="form-group">
            <label for="youtubeUrls">
              <span class="material-icons" style="font-size: 18px; vertical-align: middle; color: #f00">smart_display</span>
              Videos de YouTube
            </label>
            <textarea
              id="youtubeUrls"
              [(ngModel)]="youtubeUrls"
              name="youtubeUrls"
              class="form-control"
              placeholder="Pega links de YouTube, uno por línea&#10;https://www.youtube.com/watch?v=...&#10;https://youtu.be/..."
              rows="3"
            ></textarea>
            <small class="form-hint">Los videos se mostrarán embebidos en el post.</small>
          </div>

          <!-- Links externos -->
          <div class="form-group">
            <label for="externalLinks">
              <span class="material-icons" style="font-size: 18px; vertical-align: middle; color: var(--primary)">link</span>
              Links externos (Google Drive, Mega, etc.)
            </label>
            <textarea
              id="externalLinks"
              [(ngModel)]="externalLinks"
              name="externalLinks"
              class="form-control"
              placeholder="Un link por línea. Formato: URL | Nombre&#10;https://drive.google.com/file/d/.../view | Modelo 3D.blend&#10;https://mega.nz/file/... | Texturas HD"
              rows="3"
            ></textarea>
            <small class="form-hint">Se mostrarán como botones de descarga. Usa | para separar URL y nombre.</small>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="published" name="published">
              <span>Publicar inmediatamente</span>
            </label>
          </div>

          @if (uploading) {
            <div class="upload-progress">
              <div class="progress-header">
                <span class="material-icons spin">cloud_upload</span>
                <span>Subiendo {{ uploadCurrent }} de {{ uploadTotal }}...</span>
              </div>
              @for (item of uploadItems; track $index) {
                <div class="upload-file-row">
                  <span class="upload-file-name">{{ item.name }}</span>
                  <span class="upload-file-pct">{{ item.progress }}%</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" [style.width.%]="item.progress"></div>
                </div>
              }
            </div>
          }

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
    .media-item.is-cover {
      border: 2px solid #ffc107;
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
    .cover-btn {
      position: absolute;
      top: 4px;
      left: 4px;
      background: rgba(0,0,0,0.7);
      border: none;
      color: #999;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, color 0.2s;
    }
    .cover-btn .material-icons {
      font-size: 16px;
    }
    .cover-btn.active {
      opacity: 1;
      color: #ffc107;
    }
    .media-item:hover .cover-btn {
      opacity: 1;
    }
    .cover-btn:hover {
      color: #ffc107;
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
    .cover-badge {
      background: rgba(255, 193, 7, 0.85) !important;
      color: #000 !important;
      font-weight: 600;
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
    .upload-progress {
      background: var(--bg);
      border: 1px solid var(--primary);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .progress-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--primary);
      margin-bottom: 10px;
    }
    .progress-bar-track {
      width: 100%;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .upload-file-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 8px;
      margin-bottom: 4px;
    }
    .upload-file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      margin-right: 8px;
    }
    .upload-file-pct {
      font-weight: 600;
      color: var(--primary);
    }
    .media-item.deleting {
      opacity: 0.5;
      pointer-events: none;
    }
    .deleting-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: #fff;
      font-size: 11px;
    }
    .deleting-overlay .material-icons {
      font-size: 24px;
    }
    .file-item.deleting {
      opacity: 0.6;
      pointer-events: none;
    }
    .form-hint {
      display: block;
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-muted);
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
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
  youtubeUrls = '';
  externalLinks = '';
  published = true;
  error = '';
  saving = false;
  uploading = false;
  uploadItems: { name: string; progress: number }[] = [];
  uploadCurrent = 0;
  uploadTotal = 0;
  deletingIds = new Set<string>();

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
    private postService: PostService,
    private cloudinaryService: CloudinaryService,
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
          this.youtubeUrls = post.youtube_urls || '';
          this.externalLinks = post.external_links || '';
          this.published = post.published;
          this.existingCoverUrl = post.image_url;
          this.existingLegacyFileName = post.file_name;
          this.existingImages = post.images || [];
          this.existingFiles = post.all_files || [];
        }
      });
    }
  }

  private readonly MAX_IMAGE_MB = 10;
  private readonly MAX_VIDEO_MB = 100;
  private readonly MAX_FILE_MB = 100;

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const sizeMB = file.size / (1024 * 1024);
        const isVideo = file.type.startsWith('video/');
        const limit = isVideo ? this.MAX_VIDEO_MB : this.MAX_IMAGE_MB;
        if (sizeMB > limit) {
          this.error = `"${file.name}" pesa ${sizeMB.toFixed(1)} MB. El máximo para ${isVideo ? 'videos' : 'imágenes'} es ${limit} MB.`;
          input.value = '';
          return;
        }
        this.newImageFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.newImagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      this.error = '';
      input.value = '';
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > this.MAX_FILE_MB) {
          this.error = `"${file.name}" pesa ${sizeMB.toFixed(1)} MB. El máximo es ${this.MAX_FILE_MB} MB.`;
          input.value = '';
          return;
        }
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

  setCover(img: PostImage): void {
    if (img.is_cover) return;
    this.postService.setCoverImage(this.slug, img.id).subscribe({
      next: () => {
        this.existingImages.forEach(i => i.is_cover = (i.id === img.id));
      },
      error: () => {
        this.error = 'Error al establecer la portada.';
      }
    });
  }

  removeExistingImage(img: PostImage): void {
    const key = 'img-' + img.id;
    this.deletingIds.add(key);
    this.postService.deletePostImage(this.slug, img.id).subscribe({
      next: () => {
        this.deletingIds.delete(key);
        this.existingImages = this.existingImages.filter(i => i.id !== img.id);
      },
      error: (err) => {
        this.deletingIds.delete(key);
        console.error('Error eliminando imagen:', err);
        this.error = 'Error al eliminar la imagen.';
      }
    });
  }

  removeExistingFile(file: PostFileItem): void {
    const key = 'file-' + file.id;
    this.deletingIds.add(key);
    this.postService.deletePostFile(this.slug, file.id).subscribe({
      next: () => {
        this.deletingIds.delete(key);
        this.existingFiles = this.existingFiles.filter(f => f.id !== file.id);
      },
      error: (err) => {
        this.deletingIds.delete(key);
        console.error('Error eliminando archivo:', err);
        this.error = 'Error al eliminar el archivo.';
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
    formData.append('youtube_urls', this.youtubeUrls);
    formData.append('external_links', this.externalLinks);
    formData.append('published', this.published.toString());

    const request$ = this.isEditing
      ? this.postService.updatePost(this.slug, formData)
      : this.postService.createPost(formData);

    request$.subscribe({
      next: (post: Post) => {
        const slug = post.slug;
        const hasImages = this.newImageFiles.length > 0;
        const hasFiles = this.newFiles.length > 0;

        if (!hasImages && !hasFiles) {
          this.router.navigate(['/admin']);
          return;
        }

        // Prepare upload items for progress display
        const allFiles = [...this.newImageFiles, ...this.newFiles];
        this.uploadTotal = allFiles.length;
        this.uploadCurrent = 0;
        this.uploadItems = allFiles.map(f => ({ name: f.name, progress: 0 }));
        this.uploading = true;

        // Get signatures for the folders we need
        const signRequests: any[] = [];
        if (hasImages) {
          signRequests.push(this.cloudinaryService.getSignature('posts/images'));
        }
        if (hasFiles) {
          signRequests.push(this.cloudinaryService.getSignature('posts/files'));
        }

        forkJoin(signRequests).subscribe({
          next: (signatures: CloudinarySignature[]) => {
            const imgSig = hasImages ? signatures[0] : null;
            const fileSig = hasFiles ? signatures[hasImages ? 1 : 0] : null;

            const imageResults: CloudinaryUploadResult[] = [];
            const fileResults: { result: CloudinaryUploadResult; fileName: string }[] = [];
            let totalDone = 0;

            const checkAllDone = () => {
              if (totalDone < allFiles.length) return;
              // If no uploads succeeded, stay on page and show error
              const totalSuccess = imageResults.length + fileResults.length;
              if (totalSuccess === 0) {
                this.saving = false;
                this.uploading = false;
                if (!this.error) {
                  this.error = 'No se pudo subir ningún archivo. Revisa la consola para más detalles.';
                }
                return;
              }
              // Register successful uploads with backend
              const registers: any[] = [];
              if (imageResults.length > 0) {
                registers.push(this.postService.registerImages(slug, imageResults.map(r => ({
                  url: r.secure_url,
                  public_id: r.public_id,
                  resource_type: r.resource_type,
                }))));
              }
              if (fileResults.length > 0) {
                registers.push(this.postService.registerFiles(slug, fileResults.map(r => ({
                  url: r.result.secure_url,
                  public_id: r.result.public_id,
                  file_name: r.fileName,
                }))));
              }
              if (registers.length > 0) {
                forkJoin(registers).subscribe({
                  next: () => this.router.navigate(['/admin']),
                  error: (err) => {
                    this.saving = false;
                    this.uploading = false;
                    this.error = 'Archivos subidos a la nube pero hubo un error al registrarlos. Intenta editarlo de nuevo.';
                    console.error('Register error:', err);
                  }
                });
              } else {
                this.saving = false;
                this.uploading = false;
                if (!this.error) {
                  this.error = 'No se pudieron registrar los archivos.';
                }
              }
            };

            // Upload images directly to Cloudinary
            this.newImageFiles.forEach((file, i) => {
              const itemIndex = i;
              this.cloudinaryService.uploadFile(file, imgSig!, 'auto').subscribe({
                next: (progress) => {
                  this.uploadItems[itemIndex].progress = progress.progress;
                  if (progress.done) {
                    if (progress.result) {
                      imageResults.push(progress.result);
                      this.uploadCurrent++;
                    }
                    if (progress.error) {
                      this.error = `Error subiendo ${file.name}: ${progress.error}`;
                    }
                    totalDone++;
                    checkAllDone();
                  }
                }
              });
            });

            // Upload files directly to Cloudinary
            this.newFiles.forEach((file, i) => {
              const itemIndex = this.newImageFiles.length + i;
              this.cloudinaryService.uploadFile(file, fileSig!, 'raw').subscribe({
                next: (progress) => {
                  this.uploadItems[itemIndex].progress = progress.progress;
                  if (progress.done) {
                    if (progress.result) {
                      fileResults.push({ result: progress.result, fileName: file.name });
                      this.uploadCurrent++;
                    }
                    if (progress.error) {
                      this.error = `Error subiendo ${file.name}: ${progress.error}`;
                    }
                    totalDone++;
                    checkAllDone();
                  }
                }
              });
            });
          },
          error: () => {
            this.saving = false;
            this.uploading = false;
            this.error = 'Error al preparar la subida. Intenta de nuevo.';
          }
        });
      },
      error: (err) => {
        this.error = 'Error al guardar el proyecto. Verifica los datos e intenta de nuevo.';
        this.saving = false;
        console.error(err);
      }
    });
  }
}
