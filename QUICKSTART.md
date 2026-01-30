# Quick Start Guide - CMAnGOS CMS Desktop App

This guide will help you get the CMAnGOS CMS Desktop Application running quickly.

## Prerequisites

Before you begin, ensure you have:

1. **.NET 8.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **Node.js 20.x or later** - [Download here](https://nodejs.org/)
3. **MySQL Server** with CMAnGOS databases set up

## First Time Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MeulenG/CMAnGOS-CMS.git
cd CMAnGOS-CMS
```

### 2. Configure Database Connection

Edit `CMAnGOS-CMS-API.Server/appsettings.json` with your MySQL credentials:

```json
{
  "ConnectionStrings": {
    "RealmdDatabase": "Server=localhost;Port=3306;Database={prefix}realmd;Uid=YOUR_USER;Pwd=YOUR_PASSWORD;",
    "CharactersDatabase": "Server=localhost;Port=3306;Database={prefix}characters;Uid=YOUR_USER;Pwd=YOUR_PASSWORD;",
    "MangosDatabase": "Server=localhost;Port=3306;Database={prefix}mangos;Uid=YOUR_USER;Pwd=YOUR_PASSWORD;"
  }
}
```

Replace `YOUR_USER` and `YOUR_PASSWORD` with your MySQL credentials.

### 3. Install Frontend Dependencies

```bash
cd cmangos-cms-api.client
npm install
```

## Running in Development Mode

From the `cmangos-cms-api.client` directory:

```bash
npm run electron:dev
```

This will:
1. Start the React development server
2. Launch the Electron app
3. Automatically start the ASP.NET Core backend
4. Open the application window with DevTools

**Note:** The first time you run this, the backend will take a moment to compile and start.

## Building for Distribution

### Step 1: Build the Backend

```bash
cd CMAnGOS-CMS-API.Server
dotnet publish -c Release -o bin/Release/net8.0/publish
```

### Step 2: Build the Electron App

```bash
cd ../cmangos-cms-api.client
npm run electron:build
```

### Step 3: Find Your Installer

The installer will be in `cmangos-cms-api.client/release/`:

- **Windows:** `CMAnGOS CMS Setup X.X.X.exe` or portable version
- **macOS:** `CMAnGOS CMS-X.X.X.dmg` or `.zip`
- **Linux:** `CMAnGOS CMS-X.X.X.AppImage` or `.deb`

## Verifying Your Build

Run the build validation script:

```bash
cd /path/to/CMAnGOS-CMS
./test-build.sh
```

This will verify that all components build correctly before packaging.

## Troubleshooting

### Backend Won't Start

**Problem:** Backend fails to connect to MySQL

**Solution:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check your credentials in `appsettings.json`
3. Ensure CMAnGOS databases exist

### Electron Window Doesn't Open

**Problem:** Electron starts but window doesn't appear

**Solution:**
1. Check the console output for errors
2. Ensure the backend started successfully (check for "Now listening on: http://localhost:5023")
3. Try killing any existing backend processes: `pkill -f "CMAnGOS-CMS-API.Server"`

### Build Fails

**Problem:** `npm run build` or `dotnet build` fails

**Solution:**
1. Ensure you have the correct Node.js version: `node --version` (should be 20.x+)
2. Ensure you have .NET 8.0: `dotnet --version` (should be 8.x)
3. Clear npm cache: `npm cache clean --force && rm -rf node_modules && npm install`
4. Clean .NET build: `dotnet clean && dotnet build`

### Port Already in Use

**Problem:** Error message about port 5023 already in use

**Solution:**
1. Kill the existing process:
   - Windows: `netstat -ano | findstr :5023` then `taskkill /PID <PID> /F`
   - Linux/Mac: `lsof -ti:5023 | xargs kill -9`

## Development Tips

### Hot Reload

In development mode, the React frontend supports hot reload - your changes will appear immediately without restarting the app.

### Backend Changes

If you modify backend code (C#), restart the Electron app to see your changes:
1. Close the Electron window
2. Run `npm run electron:dev` again

### Debugging

The Electron window opens with DevTools enabled in development mode. You can:
- Inspect React components
- View console logs
- Debug JavaScript/TypeScript
- Monitor network requests to the backend API

### Backend Logs

Backend logs appear in the terminal where you ran `npm run electron:dev`. Look for:
- Database connection status
- API endpoint calls
- Error messages

## Platform-Specific Notes

### Windows
- The app requires .NET 8.0 Runtime (included in installer)
- Windows Defender may warn about the app - click "More info" → "Run anyway"

### macOS
- You may need to allow the app in System Preferences → Security & Privacy
- On Apple Silicon, the app runs through Rosetta if needed

### Linux
- For `.deb`: `sudo dpkg -i CMAnGOS-CMS-X.X.X.deb`
- For `.AppImage`: `chmod +x CMAnGOS-CMS-X.X.X.AppImage && ./CMAnGOS-CMS-X.X.X.AppImage`

## Need More Help?

- Check `README.md` for detailed documentation
- See `ELECTRON_CONVERSION.md` for technical details about the conversion
- Review the logs in the terminal for error messages
- Ensure all prerequisites are installed correctly

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Run in development mode |
| `npm run electron:build` | Build for distribution |
| `npm run build` | Build frontend only |
| `npm run compile:electron` | Compile Electron TypeScript |
| `dotnet run` | Run backend only (from Server directory) |

---

**Happy gaming! 🎮**
