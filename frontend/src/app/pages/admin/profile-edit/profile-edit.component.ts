import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ProfilePhoto } from '../../../models/post.model';

@Component({
  selector: 'app-profile-edit',
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
          <h1>Editar Perfil</h1>
          <p class="form-desc">Estos datos se muestran en la página principal de tu portafolio.</p>
        </div>

        <!-- LOGO SECTION -->
        <div class="photos-section">
          <div class="section-label">Logo del navbar</div>
          <div class="logo-section">
            @if (logoUrl) {
              <div class="logo-preview">
                <img [src]="logoUrl" alt="Logo actual">
                <button (click)="onDeleteLogo()" class="photo-delete" title="Eliminar logo">
                  <span class="material-icons">close</span>
                </button>
              </div>
            }
            <label class="photo-add logo-add">
              <input type="file" accept="image/*" (change)="onLogoSelected($event)" [disabled]="uploadingLogo" hidden>
              <span class="material-icons">add_a_photo</span>
              <span>{{ uploadingLogo ? 'Subiendo...' : (logoUrl ? 'Cambiar logo' : 'Subir logo') }}</span>
            </label>
          </div>
          <small class="field-hint">Se muestra junto a "Kristal" en la barra de navegación. Si no subes uno, se muestra la K por defecto.</small>
        </div>

        <!-- PHOTOS SECTION -->
        <div class="photos-section">
          <div class="section-label">Fotos de presentación (máx. 4)</div>
          <div class="photos-grid">
            @for (photo of photos; track photo.id) {
              <div class="photo-card">
                <img [src]="photo.image_url" alt="Foto de presentación">
                <button (click)="onDeletePhoto(photo)" class="photo-delete" title="Eliminar foto">
                  <span class="material-icons">close</span>
                </button>
              </div>
            }
            @if (photos.length < 4) {
              <label class="photo-add">
                <input type="file" accept="image/*" (change)="onPhotoSelected($event)" [disabled]="uploadingPhoto" hidden>
                <span class="material-icons">add_photo_alternate</span>
                <span>{{ uploadingPhoto ? 'Subiendo...' : 'Agregar foto' }}</span>
              </label>
            }
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="profile-form">
          @if (success) {
            <div class="success-msg">Perfil actualizado correctamente.</div>
          }
          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }

          <div class="section-label">Información personal</div>

          <div class="form-row">
            <div class="form-group">
              <label for="first_name">Nombre</label>
              <input type="text" id="first_name" [(ngModel)]="firstName" name="first_name" class="form-control" placeholder="Kristal">
            </div>
            <div class="form-group">
              <label for="last_name">Apellido</label>
              <input type="text" id="last_name" [(ngModel)]="lastName" name="last_name" class="form-control" placeholder="">
            </div>
          </div>

          <div class="form-group">
            <label for="title">Título profesional</label>
            <input type="text" id="title" [(ngModel)]="jobTitle" name="title" class="form-control" placeholder="Full Stack Developer">
          </div>

          <div class="form-group">
            <label for="headline">Subtítulo del hero (página principal)</label>
            <input type="text" id="headline" [(ngModel)]="headline" name="headline" class="form-control" placeholder="Bienvenido a mi portafolio. Aquí comparto mis proyectos.">
            <small class="field-hint">Este texto aparece debajo de "Hola, soy Kristal" en la página principal.</small>
          </div>

          <div class="form-group">
            <label for="bio">Bio / Sobre mí</label>
            <textarea id="bio" [(ngModel)]="bio" name="bio" class="form-control" rows="4" placeholder="Cuéntale a los reclutadores sobre ti..."></textarea>
          </div>

          <div class="form-group">
            <label for="location">Ubicación</label>
            <input type="text" id="location" [(ngModel)]="location" name="location" class="form-control" placeholder="Ciudad, País">
          </div>

          <div class="section-label">Redes sociales</div>

          <div class="form-group">
            <label for="github_url">GitHub URL</label>
            <input type="url" id="github_url" [(ngModel)]="githubUrl" name="github_url" class="form-control" placeholder="https://github.com/tuusuario">
          </div>

          <div class="form-group">
            <label for="linkedin_url">LinkedIn URL</label>
            <input type="url" id="linkedin_url" [(ngModel)]="linkedinUrl" name="linkedin_url" class="form-control" placeholder="https://linkedin.com/in/tuusuario">
          </div>

          <div class="form-group">
            <label for="website_url">Sitio web</label>
            <input type="url" id="website_url" [(ngModel)]="websiteUrl" name="website_url" class="form-control" placeholder="https://tusitio.com">
          </div>

          <div class="form-actions">
            <a routerLink="/admin" class="btn btn-outline">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              @if (saving) {
                Guardando...
              } @else {
                Guardar cambios
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper {
      max-width: 700px;
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
      margin-bottom: 8px;
    }
    .form-desc {
      color: var(--text-muted);
      font-size: 14px;
    }
    .profile-form {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
    }
    .section-label {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      margin-bottom: 16px;
      margin-top: 8px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .field-hint {
      display: block;
      margin-top: 6px;
      color: var(--text-muted);
      font-size: 12px;
    }
    .success-msg {
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid var(--success);
      color: var(--success);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
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
      .profile-form { padding: 20px; }
      .photos-grid { grid-template-columns: 1fr 1fr; }
    }
    .photos-section {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      margin-bottom: 24px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-preview {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .logo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .logo-add {
      width: 80px;
      height: 80px;
      aspect-ratio: auto;
    }
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .photo-card {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-delete {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(244, 67, 54, 0.9);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .photo-delete:hover {
      transform: scale(1.1);
    }
    .photo-delete .material-icons {
      font-size: 16px;
    }
    .photo-add {
      aspect-ratio: 1;
      border-radius: 12px;
      border: 2px dashed var(--border);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      color: var(--text-muted);
      font-size: 13px;
      transition: border-color 0.2s, color 0.2s;
    }
    .photo-add:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .photo-add .material-icons {
      font-size: 32px;
    }
  `]
})
export class ProfileEditComponent implements OnInit {
  firstName = '';
  lastName = '';
  jobTitle = '';
  headline = '';
  bio = '';
  location = '';
  githubUrl = '';
  linkedinUrl = '';
  websiteUrl = '';
  saving = false;
  success = false;
  error = '';
  photos: ProfilePhoto[] = [];
  uploadingPhoto = false;
  logoUrl: string | null = null;
  uploadingLogo = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        const nameParts = res.name.split(' ');
        this.firstName = nameParts[0] || '';
        this.lastName = nameParts.slice(1).join(' ') || '';
        this.jobTitle = res.profile.title || '';
        this.headline = res.profile.headline || '';
        this.bio = res.profile.bio || '';
        this.location = res.profile.location || '';
        this.githubUrl = res.profile.github_url || '';
        this.linkedinUrl = res.profile.linkedin_url || '';
        this.websiteUrl = res.profile.website_url || '';
        this.photos = res.profile.photos || [];
        this.logoUrl = res.profile.logo_url;
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadingPhoto = true;
      this.profileService.uploadPhoto(input.files[0]).subscribe({
        next: (photo) => {
          this.photos.push(photo);
          this.uploadingPhoto = false;
          input.value = '';
        },
        error: () => {
          this.uploadingPhoto = false;
          input.value = '';
        }
      });
    }
  }

  onDeletePhoto(photo: ProfilePhoto): void {
    if (confirm('¿Eliminar esta foto?')) {
      this.profileService.deletePhoto(photo.id).subscribe({
        next: () => {
          this.photos = this.photos.filter(p => p.id !== photo.id);
        }
      });
    }
  }

  onSubmit(): void {
    this.saving = true;
    this.success = false;
    this.error = '';

    const data: Record<string, string> = {
      first_name: this.firstName,
      last_name: this.lastName,
      title: this.jobTitle,
      headline: this.headline,
      bio: this.bio,
      location: this.location,
      github_url: this.githubUrl,
      linkedin_url: this.linkedinUrl,
      website_url: this.websiteUrl,
    };

    this.profileService.updateProfile(data).subscribe({
      next: () => {
        this.saving = false;
        this.success = true;
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al guardar el perfil.';
      }
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadingLogo = true;
      this.profileService.uploadLogo(input.files[0]).subscribe({
        next: (res) => {
          this.logoUrl = res.logo_url;
          this.uploadingLogo = false;
          input.value = '';
        },
        error: () => {
          this.uploadingLogo = false;
          input.value = '';
        }
      });
    }
  }

  onDeleteLogo(): void {
    if (confirm('¿Eliminar el logo?')) {
      this.profileService.deleteLogo().subscribe({
        next: () => {
          this.logoUrl = null;
        }
      });
    }
  }
}
