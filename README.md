# CMAnGOS-CMS Desktop Application

A desktop application for managing CMAnGOS Classic WoW servers. This application combines an ASP.NET Core backend with a React frontend, packaged as an Electron desktop app.

## Features

- Account and character management
- Marketplace for character trading
- Bidding system
- Trade history tracking
- Auto-detection of CMAnGOS expansion (Classic, TBC, WotLK)

## Prerequisites

- .NET 8.0 SDK
- Node.js 20.x or later
- MySQL server with CMAnGOS databases

## Development Setup

### Backend (ASP.NET Core)

The backend API runs on `http://localhost:5023` and provides access to CMAnGOS databases.

```bash
cd CMAnGOS-CMS-API.Server
dotnet restore
dotnet build
```

### Frontend (React + Electron)

```bash
cd cmangos-cms-api.client
npm install
```

## Running in Development Mode

To run the application in development mode with hot-reload:

```bash
cd cmangos-cms-api.client
npm run electron:dev
```

This will:
1. Start the Vite dev server for the React frontend
2. Launch Electron which will start the ASP.NET Core backend automatically
3. Open DevTools for debugging

## Building for Production

### 1. Build the Backend

First, publish the backend for your target platform:

```bash
cd CMAnGOS-CMS-API.Server
dotnet publish -c Release -o bin/Release/net8.0/publish
```

### 2. Build the Electron App

```bash
cd cmangos-cms-api.client
npm run electron:build
```

This will create distributable packages in the `release` folder for your platform:
- Windows: `.exe` installer and portable version
- macOS: `.dmg` and `.zip`
- Linux: `.AppImage` and `.deb`

## Configuration

### Database Connection

Configure your MySQL connection strings in `CMAnGOS-CMS-API.Server/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "RealmdDatabase": "Server=localhost;Port=3306;Database={prefix}realmd;Uid=root;Pwd=;",
    "CharactersDatabase": "Server=localhost;Port=3306;Database={prefix}characters;Uid=root;Pwd=;",
    "MangosDatabase": "Server=localhost;Port=3306;Database={prefix}mangos;Uid=root;Pwd=;"
  },
  "CMAnGOS": {
    "ExpansionPrefix": "classic",
    "AutoDetectExpansion": true
  }
}
```

The `{prefix}` placeholder will be automatically replaced with the detected expansion prefix (classic, tbc, or wotlk).

## Project Structure

```
.
├── CMAnGOS-CMS-API.Server/     # ASP.NET Core backend
│   ├── Controllers/            # API controllers
│   ├── Data/                   # Database contexts
│   ├── Models/                 # Data models
│   └── Services/               # Business logic
└── cmangos-cms-api.client/     # React + Electron frontend
    ├── src/                    # React source code
    ├── electron/               # Electron main and preload scripts
    ├── dist/                   # Built React app
    └── dist-electron/          # Compiled Electron scripts
```

## Architecture

- **Frontend**: React 19 with TypeScript and Vite
- **Backend**: ASP.NET Core 8.0 Web API
- **Desktop**: Electron 34
- **Database**: MySQL with Pomelo.EntityFrameworkCore
- **Packaging**: electron-builder

The Electron main process manages the ASP.NET Core backend as a child process, ensuring proper startup and graceful shutdown.

## License

This project is licensed under the terms specified in the LICENSE file.