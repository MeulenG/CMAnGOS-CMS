const API_BASE_URL = 'http://localhost:5023/api';
const API_KEY = '9853040984598034508924350834589';

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const getClientSource = (): string | undefined => {
  const stack = new Error().stack;
  if (!stack) {
    return undefined;
  }

  const lines = stack.split('\n').slice(1);
  for (const line of lines) {
    if (line.includes('api.ts') || line.includes('requestJson')) {
      continue;
    }

    const match = line.match(/\((.*?):(\d+):(\d+)\)/) || line.match(/at (.*?):(\d+):(\d+)/);
    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  return undefined;
};

const buildHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }
  const source = getClientSource();
  if (source) {
    headers['X-Client-Source'] = source;
  }
  return headers;
};

const requestJson = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      errorMessage = errorBody.error || errorBody.message || errorMessage;
    } catch {
      // Ignore JSON parsing errors and fall back to status text.
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const getJson = async <T>(path: string): Promise<T> => requestJson<T>('GET', path);
export const postJson = async <T>(path: string, body: unknown): Promise<T> => requestJson<T>('POST', path, body);
export const putJson = async <T>(path: string, body: unknown): Promise<T> => requestJson<T>('PUT', path, body);
export const patchJson = async <T>(path: string, body?: unknown): Promise<T> => requestJson<T>('PATCH', path, body);
export const deleteJson = async (path: string): Promise<void> => {
  await requestJson<void>('DELETE', path);
};
