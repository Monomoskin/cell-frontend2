# Callus Volume Estimator - Client (UI)

Web interface for non-destructive volume estimation of plant tissue **callus** using Computer Vision.

## 🎯 Description

This is the frontend application of the **Callus Volume Estimator** system. It provides an intuitive user interface for researchers and lab technicians to upload callus images, view automatic segmentation, obtain volume estimations, and manage measurement history.

The client is built with **React + Electron** and communicates with the backend through a REST API.

## ✨ Key Features

- Upload callus images on differents views (top/side)
- Interactive image viewer with segmentation overlay
- Real-time volume estimation
- Dashboard with measurement statistics
- Cell/Culture list and detailed views
- Measurement history and tracking
- Responsive sidebar navigation

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Desktop**: Electron
- **Language**: JavaScript (JSX)
- **Styling**: CSS Modules + Less
- **Routing**: React Router
- **HTTP Client**: Axios (inside `/service`)
- **Build Tool**: Vite + electron-builder

## 📁 Project Structure

```bash
client/
├── node_modules/
├── public/
├── src/
│   ├── assets/                  # Images, icons, etc.
│   ├── components/
│   │   ├── ImageViewerModal/    # Modal for image visualization
│   │   └── Sidebar/             # Sidebar component
│   ├── electron/                # Electron-specific configurations
│   ├── Layouts/
│   │   └── DashboardLayout.jsx  # Main layout with sidebar
│   ├── Pages/
│   │   ├── CellDetails/         # Detailed view of a culture/cell
│   │   ├── CellList/            # List of cultures
│   │   ├── Dashboard/           # Main dashboard
│   │   ├── Mesurement/          # Measurement / Analysis page
│   │   └── WechatLogin/         # Login page (WeChat integration)
│   ├── Routes/
│   │   └── Routes.jsx           # Route definitions
│   ├── service/                 # API services
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── electron-builder.json
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```
