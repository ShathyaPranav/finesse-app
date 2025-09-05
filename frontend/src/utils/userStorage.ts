// Utility for user-scoped localStorage access
// Keys are namespaced by the authenticated user's email to prevent state leaks across accounts.

export const Keys = {
  userXP: 'userXP',
  currentStreak: 'currentStreak',
  lastActiveDate: 'lastActiveDate',
  completedLessons: 'completedLessons',
  dailyChallengeState: 'dailyChallengeState',
  userPoints: 'userPoints',
  userProgress: 'userProgress',
  lastVisitedLesson: 'lastVisitedLesson',
} as const;

export type KeyName = keyof typeof Keys | string;

interface StoredUser {
  id?: number;
  username?: string;
  email?: string;
  token?: string;
}

// Migration: copy any keys under the 'anonymous' namespace into the current user's namespace
export function migrateAnonymousNamespaceToCurrentUser(): void {
  const currentIdent = getUserIdentifier();
  const anonPrefix = `finesse:anonymous:`;
  // Collect keys first to avoid index shifting while removing
  const keysToMigrate: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(anonPrefix)) {
      keysToMigrate.push(key);
    }
  }
  for (const key of keysToMigrate) {
    const base = key.substring(anonPrefix.length);
    const targetKey = `finesse:${currentIdent}:${base}`;
    const targetExists = localStorage.getItem(targetKey);
    if (targetExists === null) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        localStorage.setItem(targetKey, value);
      }
    }
    // Remove the anonymous key after migration to avoid leaking to future logins
    localStorage.removeItem(key);
  }
}

// Call all available migrations. Safe to run multiple times (idempotent where possible)
export function runUserStorageMigrations(): void {
  // IMPORTANT: Only migrate from anonymous -> current user, then clear anonymous keys.
  // Do NOT migrate legacy global keys automatically to avoid leaking one user's data to others.
  migrateAnonymousNamespaceToCurrentUser();
}

export function getCurrentUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getUserIdentifier(): string {
  const u = getCurrentUser();
  // Prefer email, fallback to username; default to 'anonymous'
  return (u?.email || u?.username || 'anonymous').toLowerCase();
}

export function getUserKey(base: KeyName): string {
  const ident = getUserIdentifier();
  return `finesse:${ident}:${String(base)}`;
}

export function getItem(base: KeyName): string | null {
  return localStorage.getItem(getUserKey(base));
}

export function setItem(base: KeyName, value: string): void {
  localStorage.setItem(getUserKey(base), value);
}

export function removeItem(base: KeyName): void {
  localStorage.removeItem(getUserKey(base));
}

export function getItemInt(base: KeyName, defaultValue = 0): number {
  const raw = getItem(base);
  const parsed = parseInt(raw ?? `${defaultValue}`, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export function setItemInt(base: KeyName, value: number): void {
  setItem(base, String(value));
}

export function getItemJSON<T = any>(base: KeyName, defaultValue: T): T {
  try {
    const raw = getItem(base);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItemJSON(base: KeyName, value: any): void {
  setItem(base, JSON.stringify(value));
}

// Helper to compute the exact fully-qualified key string for storage event comparisons
export function fullyQualifiedKey(base: KeyName): string {
  return getUserKey(base);
}

// Remove all keys in localStorage that belong to the given user namespace
// If no identifier is passed, it will use the currently stored user
export function clearUserNamespace(identifier?: string): void {
  const ident = (identifier || getUserIdentifier());
  const prefix = `finesse:${ident}:`;
  // Iterate backwards since we're mutating during iteration
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}

// One-time migration: copy legacy, non-namespaced keys into the current user's namespace
// This preserves data that was stored before the user-scoped refactor.
export function migrateLegacyGlobalToUserNamespace(): void {
  const bases: string[] = [
    Keys.userXP,
    Keys.currentStreak,
    Keys.lastActiveDate,
    Keys.completedLessons,
    Keys.dailyChallengeState,
    Keys.userPoints,
    Keys.userProgress,
    Keys.lastVisitedLesson,
  ] as unknown as string[];

  for (const base of bases) {
    const legacy = localStorage.getItem(String(base));
    if (legacy !== null) {
      const fq = getUserKey(base);
      const already = localStorage.getItem(fq);
      if (already === null) {
        localStorage.setItem(fq, legacy);
      }
      // Optional: remove legacy key to avoid confusion
      // localStorage.removeItem(String(base));
    }
  }
}
