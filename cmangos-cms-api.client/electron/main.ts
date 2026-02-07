import { app, BrowserWindow, shell } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import { existsSync } from 'fs';
import { ConfigService } from './services/ConfigService.js';
import { ProfileService } from './services/ProfileService.js';
import { WowService } from './services/WowService.js';
import { ServerControlService } from './services/ServerControlService.js';
import { ConfigHandler } from './ipc/config-handler.js';
import { ProfileHandler } from './ipc/profile-handler.js';
import { WowHandler } from './ipc/wow-handler.js';
import { ServerHandler } from './ipc/server-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

// Services
let configService: ConfigService;
let profileService: ProfileService;
let wowService: WowService;
let serverControlService: ServerControlService;
let configHandler: ConfigHandler;
let profileHandler: ProfileHandler;
let wowHandler: WowHandler;
let serverHandler: ServerHandler;

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
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000)
      });
      if (response.ok || response.status === 404 || response.status === 401) {
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
        // Wait a bit for the port to be released
        setTimeout(resolve, 500);
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

// Start the backend
async function startBackend(): Promise<void> {
  // First, kill any existing backend processes
  await killExistingBackend();
  
  return new Promise((resolve, reject) => {
    const backendPath = getBackendPath();
    
    console.log('Starting backend from:', backendPath);
    
    let backendExited = false;
    
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
      backendExited = true;
      reject(error);
    });
    
    backendProcess.on('exit', (code, signal) => {
      console.log(`Backend process exited with code ${code} and signal ${signal}`);
      backendExited = true;
      backendProcess = null;
      
      // If exit happened during startup with error, reject the promise
      if (code !== 0 && code !== null) {
        reject(new Error(`Backend process exited with code ${code} during startup`));
      }
    });
    
    // Wait for backend to be ready
    waitForBackend().then((ready) => {
      // Check if backend exited during wait
      if (backendExited) {
        reject(new Error('Backend process exited before it was ready'));
        return;
      }
      
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
function stopBackend(): Promise<void> {
  if (!backendProcess || !backendProcess.pid) {
    return Promise.resolve();
  }

  console.log('Stopping backend process...');

  const processToStop: ChildProcess = backendProcess;
  const pid = processToStop.pid;
  const timeoutMs = 5000;

  return new Promise((resolve) => {
    let timeout: NodeJS.Timeout | null = null;

    const clearAndResolve = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      // Only clear backendProcess if it still refers to the process we stopped
      if (backendProcess === processToStop) {
        backendProcess = null;
      }
      resolve();
    };

    const forceKill = (signal: NodeJS.Signals = 'SIGKILL') => {
      try {
        if (!processToStop.killed) {
          console.warn(`Forcefully killing backend process (pid=${pid}) with ${signal}`);
          processToStop.kill(signal);
        }
      } catch (err) {
        console.error('Error while forcefully killing backend process:', err);
      }
    };

    timeout = setTimeout(() => {
      console.warn(`Backend process (pid=${pid}) did not exit within ${timeoutMs}ms, forcing termination.`);
      // Attempt a forceful kill on timeout
      if (process.platform === 'win32') {
        // On Windows, ChildProcess.kill() will translate to TerminateProcess
        forceKill();
      } else {
        forceKill('SIGKILL');
      }
      clearAndResolve();
    }, timeoutMs);

    if (process.platform === 'win32') {
      // On Windows, use taskkill to ensure child processes are terminated
      if (pid) {
        const taskkill = spawn('taskkill', ['/pid', pid.toString(), '/f', '/t']);

        taskkill.on('error', (error) => {
          console.error('Failed to run taskkill for backend process:', error);
          // Fall back to killing the process directly
          forceKill();
          clearAndResolve();
        });

        taskkill.on('close', (code) => {
          if (code !== 0) {
            console.warn(`taskkill exited with code ${code} for backend process (pid=${pid}).`);
          } else {
            console.log(`Backend process (pid=${pid}) terminated via taskkill.`);
          }
          clearAndResolve();
        });
      } else {
        console.warn('Backend process PID is undefined; cannot use taskkill.');
        clearAndResolve();
      }
    } else {
      // On Unix-like systems, send SIGTERM and wait for exit
      processToStop.once('exit', (code, signal) => {
        console.log(`Backend process (pid=${pid}) exited with code=${code}, signal=${signal}.`);
        clearAndResolve();
      });

      try {
        processToStop.kill('SIGTERM');
      } catch (err) {
        console.error('Error while sending SIGTERM to backend process:', err);
        // If we cannot send SIGTERM, attempt a forceful kill immediately
        forceKill('SIGKILL');
        clearAndResolve();
      }
    }
  });
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
    wowService = new WowService();
    serverControlService = new ServerControlService();
    
    // Initialize IPC handlers
    configHandler = new ConfigHandler(configService);
    profileHandler = new ProfileHandler(profileService);
    wowHandler = new WowHandler(wowService);
    serverHandler = new ServerHandler(serverControlService);
    
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
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await stopBackend();
    app.quit();
  }
});

// Ensure backend is stopped on app quit
app.on('before-quit', async (event) => {
  if (backendProcess) {
    event.preventDefault();
    await stopBackend();
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  await stopBackend();
  app.quit();
});
