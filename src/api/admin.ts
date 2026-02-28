interface LoginResponse {
  ok: boolean
  expiresIn: number
}

interface MeResponse {
  authenticated: boolean
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const fallback = `Request failed with status ${res.status}`
    let message = fallback
    try {
      const payload = await res.json() as { error?: string }
      message = payload.error || fallback
    } catch {
      // Keep fallback message.
    }
    throw new Error(message)
  }
  return res.json()
}

export async function loginAdmin(password: string): Promise<LoginResponse> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    credentials: 'include',
  })
  return parseJsonResponse<LoginResponse>(res)
}

export async function logoutAdmin() {
  const res = await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  })
  return parseJsonResponse<{ ok: boolean }>(res)
}

export async function getAdminSession(): Promise<MeResponse> {
  const res = await fetch('/api/admin/me', {
    credentials: 'include',
  })
  return parseJsonResponse<MeResponse>(res)
}
