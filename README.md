# Plot Manager

A full-stack application for managing and analyzing map plots, built with Django, React, and MapBox.

## 🚀 Overview

This project allows users to draw polygonal plots on a map, save them to a database, and calculate their surface area in hectares.

## 🎥 Video Demo

<!-- Add your video link or gif here -->
[Watch the Demo Video](./demo.mp4)

### Key Features
- **Interactive Map**: Draw polygons directly on a MapBox interface.
- **Plot Management**: Save, retrieve, and delete plots.
- **Calculations**: Automatic surface area calculation for drawn plots.
- **Visualization**: Fly-to animations and list views for saved locations.

## 🛠 Tech Stack

- **Backend**: Django, Django REST Framework, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, MapBox GL
- **Infrastructure**: Docker, Docker Compose

## 🏁 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### Running with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd SOWIT-ElMehdi-Mediani
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000/api](http://localhost:8000/api)
   - Django Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

4. **Create Admin Account**
   To access the Django Admin interface, you need to create a superuser:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

### ⚙️ Environment Configuration

You can configure the application using environment variables.

#### Frontend
The frontend requires a MapBox Access Token. You can set this in `frontend/.env` or rely on the `docker-compose.yml` defaults.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL of the backend API | `http://localhost:8000/api` |
| `VITE_MAPBOX_ACCESS_TOKEN` | Your MapBox public access token | *Demo Token* |

#### Backend
The backend settings can be configured via environment variables passed to the Docker container (defined in `docker-compose.yml`).

| Variable | Description |
|----------|-------------|
| `DEBUG` | Toggle Django debug mode (`True`/`False`) |
| `DJANGO_SECRET_KEY` | Secret key for cryptographic signing |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |

## 📦 Project Structure

```
.
├── backend/                # Django REST API
│   ├── plotmanager/        # Project settings
│   └── plots/              # App logic (Models, Views)
├── frontend/               # React Vite Application
│   ├── src/
│   │   ├── components/     # UI Components (MapBox, Modals)
│   │   └── hooks/          # API Hooks
└── docker-compose.yml      # Container orchestration
```

## 🧪 Development Notes

- **Database**: The `db` service uses a persistent volume `postgres_data` to store data across restarts.
- **Cleanup**: To stop services and remove volumes:
  ```bash
  docker-compose down -v
  ```
