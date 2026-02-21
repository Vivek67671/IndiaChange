const requireEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const getSupabaseConfig = () => ({
  url: requireEnv('VITE_SUPABASE_URL'),
  anonKey: requireEnv('VITE_SUPABASE_ANON_KEY')
});

export const FEATURE_FLAGS = {
  useBackend: import.meta.env.VITE_USE_BACKEND !== 'false'
};
