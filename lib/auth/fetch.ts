/**
 * Utility function for making authenticated API calls with automatic token refresh
 * This handles 401 errors by attempting to refresh the access token
 */

interface AuthFetchOptions extends RequestInit {
  skipAuthCheck?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'same-origin',
        });
        return refreshResponse.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** Proactive keepalive used by AdminLayout while the dashboard is open. */
export async function keepAdminSessionAlive(): Promise<boolean> {
  return tryRefreshSession();
}

export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
  const { skipAuthCheck = false, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...fetchOptions,
    });

    if (response.ok || skipAuthCheck || response.status !== 401) {
      return response;
    }

    const refreshed = await tryRefreshSession();
    if (!refreshed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-session-expired'));
      }
      return response;
    }

    return await fetch(url, {
      credentials: 'same-origin',
      ...fetchOptions,
    });
  } catch (error) {
    console.error('Auth fetch error:', error);
    throw error;
  }
}

export async function authPost(url: string, data: unknown): Promise<Response> {
  return authFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function authPut(url: string, data: unknown): Promise<Response> {
  return authFetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function authDelete(url: string): Promise<Response> {
  return authFetch(url, {
    method: 'DELETE',
  });
}

export async function authGet(url: string): Promise<Response> {
  return authFetch(url, {
    method: 'GET',
  });
}

export async function authPatch(url: string, data: unknown): Promise<Response> {
  return authFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
