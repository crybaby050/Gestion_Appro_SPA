const SESSION_KEY = "appro_session";

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function setSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdmin() {
  return getSession()?.role === "admin";
}

export function isFournisseur() {
  return getSession()?.role === "fournisseur";
}


export function requireAuth() {
  return getSession() !== null;
}