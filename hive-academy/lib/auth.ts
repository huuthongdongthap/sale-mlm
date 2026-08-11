import Cookies from 'js-cookie';

const TOKEN_KEY = 'hive_token';
const USER_KEY = 'hive_user';

export function getToken(): string | undefined {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY) || undefined;
  }
  return Cookies.get(TOKEN_KEY);
}

export function getUser(): any | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function setAuth(token: string, user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  Cookies.set(TOKEN_KEY, token, { expires: 7 });
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  Cookies.remove(TOKEN_KEY);
}

export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
