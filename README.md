# Kristal - Portfolio Blog

Proyecto de portafolio personal con Angular (frontend) y Django REST Framework (backend).

## Estructura

```
kristal-Portfolio/
├── backend/          # Django REST API
│   ├── portfolio/    # Settings del proyecto
│   ├── blog/         # App principal (posts, auth, profile)
│   └── manage.py
├── frontend/         # Angular 17
│   └── src/app/
│       ├── pages/          # Componentes de páginas
│       ├── components/     # Navbar, Footer
│       ├── services/       # AuthService, PostService
│       └── models/         # Interfaces TypeScript
└── README.md
```

## Requisitos

- Python 3.10+
- Node.js 18+
- npm 9+

---

## Setup Backend (Django)

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar configuración
copy .env.example .env

# Ejecutar migraciones
python manage.py migrate

# Crear tu usuario
python manage.py createportfoliouser --email latshir110@gmail.com --password "Jaziel110#" --first-name Kristal

# Iniciar servidor
python manage.py runserver
```

El backend correrá en `http://localhost:8000`

---

## Setup Frontend (Angular)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx ng serve
```

El frontend correrá en `http://localhost:4200`

---

## Uso

### Vista pública (Reclutadores)
- `http://localhost:4200` — Portafolio con todos los proyectos publicados
- `http://localhost:4200/post/{slug}` — Detalle de un proyecto con opción de descarga de archivos

### Vista admin (Kristal)
- `http://localhost:4200/login` — Iniciar sesión
- `http://localhost:4200/admin` — Dashboard para gestionar proyectos
- `http://localhost:4200/admin/new` — Crear nuevo proyecto
- `http://localhost:4200/admin/edit/{slug}` — Editar proyecto existente

### API Endpoints
- `GET /api/posts/` — Lista de posts (paginada)
- `GET /api/posts/{slug}/` — Detalle de un post
- `POST /api/posts/` — Crear post (autenticado)
- `PATCH /api/posts/{slug}/` — Actualizar post (autenticado)
- `DELETE /api/posts/{slug}/` — Eliminar post (autenticado)
- `POST /api/auth/login/` — Login (email + password)
- `POST /api/auth/logout/` — Logout
- `GET /api/profile/` — Perfil público

---

## Funcionalidades

- ✅ Blog tipo portafolio con diseño oscuro moderno
- ✅ Subida de imágenes por proyecto
- ✅ Subida de archivos con botón de descarga
- ✅ Sistema de autenticación (un solo usuario admin)
- ✅ Tags por proyecto
- ✅ Vista pública para reclutadores
- ✅ Dashboard admin para CRUD de proyectos
- ✅ Diseño responsive
