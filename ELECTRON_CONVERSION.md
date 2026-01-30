# Electron Desktop App Conversion - Summary

This document summarizes the conversion of the CMAnGOS CMS web application to an Electron desktop application.

## What Changed

### Architecture
**Before:** Web application with separate frontend (Vite dev server) and backend (ASP.NET Core) deployable to web servers

**After:** Desktop application where Electron manages both the React frontend and ASP.NET Core backend as a single packaged application

### Key Components

1. **Electron Main Process** (`cmangos-cms-api.client/electron/main.ts`)
   - Starts the ASP.NET Core backend on localhost:5023
   - Creates and manages the Electron window
   - Handles graceful shutdown of all processes
   - Supports both development and production modes

2. **Backend Changes** (`CMAnGOS-CMS-API.Server/`)
   - Configured to listen only on localhost
   - Removed HTTPS redirection (unnecessary for local-only)
   - Updated CORS to allow any origin (safe for desktop)
   - Removed Docker and web deployment configurations

3. **Frontend Changes** (`cmangos-cms-api.client/`)
   - Updated Vite configuration for Electron renderer
   - Added Electron dependencies and build scripts
   - Removed HTTPS certificate generation
   - Configured for local file serving

## How It Works

### Development Mode
```bash
cd cmangos-cms-api.client
npm run electron:dev
```

This command:
1. Starts Vite dev server on port 5173
2. Waits for Vite to be ready
3. Launches Electron which starts the backend via `dotnet run`
4. Opens the app window with DevTools enabled

### Production Build
```bash
# 1. Build backend
cd CMAnGOS-CMS-API.Server
dotnet publish -c Release -o bin/Release/net8.0/publish

# 2. Build and package Electron app
cd ../cmangos-cms-api.client
npm run electron:build
```

This creates platform-specific installers:
- **Windows**: `.exe` installer and portable version
- **macOS**: `.dmg` and `.zip`
- **Linux**: `.AppImage` and `.deb`

## Files Added

- `cmangos-cms-api.client/electron/main.ts` - Electron main process
- `cmangos-cms-api.client/electron/preload.ts` - Preload script for security
- `cmangos-cms-api.client/electron-builder.json` - Packaging configuration
- `cmangos-cms-api.client/tsconfig.electron.json` - TypeScript config for Electron
- `test-build.sh` - Build validation script

## Files Removed

- `CMAnGOS-CMS-API.Server/Dockerfile` - No longer needed
- `.dockerignore` - No longer needed

## Files Modified

- `CMAnGOS-CMS-API.Server/Program.cs` - Localhost binding and CORS
- `CMAnGOS-CMS-API.Server/CMAnGOS-CMS-API.Server.csproj` - Removed Docker packages
- `CMAnGOS-CMS-API.Server/Properties/launchSettings.json` - Removed Docker profile
- `cmangos-cms-api.client/package.json` - Added Electron dependencies
- `cmangos-cms-api.client/vite.config.ts` - Simplified for Electron
- `cmangos-cms-api.client/.gitignore` - Added Electron build outputs
- `README.md` - Updated documentation

## Testing

All components have been validated:
- ✅ Backend builds successfully
- ✅ Backend publishes for production
- ✅ Frontend builds successfully
- ✅ Electron TypeScript compiles
- ✅ All build artifacts are generated
- ✅ Code review passed
- ✅ Security audit passed (no vulnerabilities)
- ✅ CodeQL security scan passed

## Next Steps for Users

1. **Install Prerequisites:**
   - .NET 8.0 SDK
   - Node.js 20.x or later
   - MySQL server with CMAnGOS databases

2. **Setup:**
   ```bash
   cd cmangos-cms-api.client
   npm install
   ```

3. **Run in Development:**
   ```bash
   npm run electron:dev
   ```

4. **Build for Distribution:**
   ```bash
   # First, publish the backend
   cd ../CMAnGOS-CMS-API.Server
   dotnet publish -c Release -o bin/Release/net8.0/publish
   
   # Then build the Electron app
   cd ../cmangos-cms-api.client
   npm run electron:build
   ```

5. **Distribute:**
   - Find the installers in `cmangos-cms-api.client/release/`
   - Share the appropriate installer for each platform

## Benefits of Desktop App

- ✅ No web server configuration needed
- ✅ Simplified deployment (single installer per platform)
- ✅ Backend not accessible from network (localhost only)
- ✅ Better suited for local CMAnGOS server management
- ✅ Native desktop experience with window management
- ✅ Can be distributed like any other desktop application

## Technical Details

### Process Management
The Electron main process uses `child_process.spawn()` to start the ASP.NET Core backend and manages its lifecycle:
- Waits for backend to be ready before showing the window
- Monitors backend output for debugging
- Ensures backend is terminated when app closes
- Handles platform-specific process termination (taskkill on Windows, SIGTERM on Unix)

### Security
- Context isolation enabled in Electron
- Preload script for secure IPC
- Backend only listens on localhost
- No external network exposure
- Regular dependency updates for security patches

### Cross-Platform Support
The app can be built for:
- Windows (installer and portable)
- macOS (DMG and ZIP)
- Linux (AppImage and DEB)

All builds are configured in `electron-builder.json`.
