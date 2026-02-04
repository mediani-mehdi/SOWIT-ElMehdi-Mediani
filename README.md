# Plot Manager

A full-stack application for managing and analyzing map plots, built with Django, React, and MapBox.

## 🚀 Overview

This project allows users to draw polygonal plots on a map, save them to a database, and calculate their surface area in hectares.

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
   cd hometest
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000/api](http://localhost:8000/api)
   - Django Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

### Configuration

The project comes with a default configuration for development.
- **Frontend**: API URL is set via `VITE_API_URL` in `docker-compose.yml`.
- **MapBox**: A demo token is provided in `frontend/.env`. For production, replace `VITE_MAPBOX_ACCESS_TOKEN` with your own key.

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
