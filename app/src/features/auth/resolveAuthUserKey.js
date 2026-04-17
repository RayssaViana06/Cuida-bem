// src/features/auth/resolveAuthUserKey.js
export function resolveAuthUserKey(user) {
  if (!user) return 'anon';

  if (user.id != null) {
    return String(user.id);
  }

  if (user.email) {
    return String(user.email).toLowerCase().trim();
  }

  return 'anon';
}

// opcional: também como default, se quiser usar import default no futuro
export default resolveAuthUserKey;
