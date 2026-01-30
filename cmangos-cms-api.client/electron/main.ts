import { app, BrowserWindow, shell } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const API_PORT = 5023;
const API_URL = `http://localhost:${API_PORT}`;
const isDevelopment = process.env.NODE_ENV === 'development';

// Path to the backend executable
function getBackendPath(): string {
  if (isDevelopment) {
    // In development, we need to find the backend project
    const projectRoot = join(__dirname, '..', '..');
    return join(projectRoot, 'CMAnGOS-CMS-API.Server');
  } else {
    // In production, backend should be bundled with the app
    const resourcesPath = process.resourcesPath;
    const backendPath = join(resourcesPath, 'backend');
    
    // Check for different OS executables
    if (process.platform === 'win32') {
      return join(backendPath, 'CMAnGOS-CMS-API.Server.exe');
    } else {
      return join(backendPath, 'CMAnGOS-CMS-API.Server');
    }
  }
}

// Check if backend is running
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

// Start the ASP.NET Core backend
async function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    const backendPath = getBackendPath();
    
    console.log('Starting backend from:', backendPath);
    
    if (isDevelopment) {
      // In development, run using dotnet
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
  if (backendProcess) {
    console.log('Stopping backend process...');
    
    if (process.platform === 'win32') {
      // On Windows, use taskkill to ensure child processes are terminated
      spawn('taskkill', ['/pid', backendProcess.pid!.toString(), '/f', '/t']);
    } else {
      // On Unix-like systems, send SIGTERM
      backendProcess.kill('SIGTERM');
    }
    
    backendProcess = null;
  }
}

// Create the Electron window
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: join(__dirname, '..', 'public', 'vite.svg')
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
