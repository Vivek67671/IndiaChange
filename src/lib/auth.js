import { supabase } from '../supabaseClient';

const DEFAULT_PROFILE = {
  role: 'user',
  status: 'active',
  points: 0
};

const toAppUser = (authUser, profile) => {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    name: profile?.name || meta.name || authUser.email?.split('@')[0] || 'Citizen',
    email: authUser.email,
    phone: profile?.phone || meta.phone || '',
    city: profile?.city || meta.city || '',
    occupation: profile?.occupation || meta.occupation || '',
    role: profile?.role || DEFAULT_PROFILE.role,
    status: profile?.status || DEFAULT_PROFILE.status,
    points: profile?.points || 0,
    joinedDate: profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };
};

export const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`Profile fetch failed: ${error.message}`);
  return data;
};

export const upsertProfile = async (profile) => {
  const payload = {
    ...DEFAULT_PROFILE,
    ...profile,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload)
    .select('*')
    .single();

  if (error) throw new Error(`Profile upsert failed: ${error.message}`);
  return data;
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Login failed: ${error.message}`);

  const authUser = data.user;
  const profile = await fetchProfile(authUser.id);
  return toAppUser(authUser, profile);
};

export const signUp = async ({ name, email, password, phone, city, occupation }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, city, occupation }
    }
  });
  if (error) throw new Error(`Signup failed: ${error.message}`);

  const authUser = data.user;
  if (!authUser) {
    throw new Error('Signup succeeded but no user returned.');
  }

  const profile = await upsertProfile({
    id: authUser.id,
    name,
    email,
    phone,
    city,
    occupation,
    role: 'user',
    status: 'active',
    points: 0
  });

  return toAppUser(authUser, profile);
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Logout failed: ${error.message}`);
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Auth user fetch failed: ${error.message}`);
  const authUser = data?.user;
  if (!authUser) return null;

  const profile = await fetchProfile(authUser.id);
  return toAppUser(authUser, profile);
};

export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    const authUser = session?.user || null;
    if (!authUser) {
      callback(null);
      return;
    }
    try {
      const profile = await fetchProfile(authUser.id);
      callback(toAppUser(authUser, profile));
    } catch {
      callback(toAppUser(authUser, null));
    }
  });

  return () => {
    data.subscription.unsubscribe();
  };
};

export const updateMyProfile = async (userId, updates) => {
  const current = await fetchProfile(userId);
  const payload = {
    ...(current || { id: userId }),
    ...updates
  };
  return upsertProfile(payload);
};

export const listProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Profile list failed: ${error.message}`);
  return data || [];
};

export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw new Error(`${provider} login failed: ${error.message}`);
  return data;
};
