// Base URL — in dev this hits the Vite proxy, in prod set VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Get the stored token from localStorage
function getToken(): string | null {
  return localStorage.getItem('crewly_token')
}

// Generic fetch wrapper — attaches Authorization header automatically
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Attach token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Parse the JSON body regardless of success/failure
  const data = await response.json()

  // If the response is not OK, throw an error with the server's message
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data as T
}

// Convenience methods
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
