import { app, BrowserWindow, shell } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import { existsSync } from 'fs';
import { ConfigService } from './services/ConfigService.js';
import { ProfileService } from './services/ProfileService.js';
import { ConfigHandler } from './ipc/config-handler.js';
import { ProfileHandler } from './ipc/profile-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

// Services
let configService: ConfigService;
let profileService: ProfileService;
let configHandler: ConfigHandler;
let profileHandler: ProfileHandler;

const API_PORT = 5023;
const API_URL = `http://localhost:${API_PORT}`;
const isDevelopment = process.env.NODE_ENV === 'development';

function getBackendPath(): string {
  if (isDevelopment) {
    const projectRoot = join(__dirname, '..', '..');
    return join(projectRoot, 'CMAnGOS-CMS-API.Server');
  } else {
    const resourcesPath = process.resourcesPath;
    const backendPath = join(resourcesPath, 'backend');
    
    if (process.platform === 'win32') {
      return join(backendPath, 'CMAnGOS-CMS-API.Server.exe');
    } else {
      return join(backendPath, 'CMAnGOS-CMS-API.Server');
    }
  }
}

async function waitForBackend(maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_URL}/swagger/index.html`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(1000)
      });
      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (error) {
      // Backend not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// Kill any existing backend processes on the port
async function killExistingBackend(): Promise<void> {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      // On Windows, find and kill processes using the port
      const findProcess = spawn('powershell', [
        '-Command',
        `Get-NetTCPConnection -LocalPort ${API_PORT} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }`
      ]);
      
      findProcess.on('close', () => {
        console.log('Cleaned up any existing backend processes');
        setTimeout(resolve, 500); // Wait a bit for the port to be released
      });
    } else {
      // On Unix-like systems, use lsof
      const findProcess = spawn('sh', [
        '-c',
        `lsof -ti:${API_PORT} | xargs kill -9 2>/dev/null || true`
      ]);
      
      findProcess.on('close', () => {
        console.log('Cleaned up any existing backend processes');
        setTimeout(resolve, 500);
      });
    }
  });
}

// Start the ASP.NET Core backend
async function startBackend(): Promise<void> {
  // First, kill any existing backend processes
  await killExistingBackend();
  
  return new Promise((resolve, reject) => {
    const backendPath = getBackendPath();
    
    console.log('Starting backend from:', backendPath);
    
    if (isDevelopment) {
      backendProcess = spawn('dotnet', ['run'], {
        cwd: backendPath,
        env: {
          ...process.env,
          ASPNETCORE_ENVIRONMENT: 'Production',
          ASPNETCORE_URLS: `http://localhost:${API_PORT}`
        },
        shell: true
      });
    } else {
      // In production, run the compiled executable
      if (!fs.existsSync(backendPath)) {
        reject(new Error(`Backend executable not found at: ${backendPath}`));
        return;
      }
      
      backendProcess = spawn(backendPath, [], {
        env: {
          ...process.env,
          ASPNETCORE_ENVIRONMENT: 'Production',
          ASPNETCORE_URLS: `http://localhost:${API_PORT}`
        },
        shell: false
      });
    }
    
    if (!backendProcess) {
      reject(new Error('Failed to start backend process'));
      return;
    }
    
    backendProcess.stdout?.on('data', (data) => {
      console.log(`[Backend]: ${data.toString()}`);
    });
    
    backendProcess.stderr?.on('data', (data) => {
      console.error(`[Backend Error]: ${data.toString()}`);
    });
    
    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });
    
    backendProcess.on('exit', (code, signal) => {
      console.log(`Backend process exited with code ${code} and signal ${signal}`);
      backendProcess = null;
    });
    
    // Wait for backend to be ready
    waitForBackend().then((ready) => {
      if (ready) {
        console.log('Backend is ready!');
        resolve();
      } else {
        reject(new Error('Backend failed to start within the timeout period'));
      }
    });
  });
}

// Stop the backend process
function stopBackend(): void {
  if (backendProcess && backendProcess.pid) {
    console.log('Stopping backend process...');
    
    if (process.platform === 'win32') {
      // On Windows, use taskkill to ensure child processes are terminated
      spawn('taskkill', ['/pid', backendProcess.pid.toString(), '/f', '/t']);
    } else {
      // On Unix-like systems, send SIGTERM
      backendProcess.kill('SIGTERM');
    }
    
    backendProcess = null;
  }
}

// Create the Electron window
function createWindow(): void {
  const preloadPath = join(__dirname, 'preload.js');
  console.log('========================================');
  console.log('Creating window with preload:', preloadPath);
  console.log('__dirname:', __dirname);
  console.log('Preload file exists:', existsSync(preloadPath));
  console.log('========================================');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  
  // Load the app
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'));
  }
  
  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    console.log('Starting CMAnGOS CMS Desktop Application...');
    
    // Initialize services
    configService = new ConfigService();
    await configService.initialize();
    
    profileService = new ProfileService(configService);
    
    // Initialize IPC handlers
    configHandler = new ConfigHandler(configService);
    profileHandler = new ProfileHandler(profileService);
    
    console.log('Services initialized successfully');
    
    // Start the backend first
    await startBackend();
    
    // Create the window
    createWindow();
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});

// Ensure backend is stopped on app quit
app.on('before-quit', () => {
  stopBackend();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  stopBackend();
  app.quit();
});
