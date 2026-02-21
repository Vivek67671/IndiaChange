import { supabase } from '../supabaseClient';

export const listNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(`Notifications fetch failed: ${error.message}`);
  return data || [];
};

export const markNotificationRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) throw new Error(`Mark read failed: ${error.message}`);
};

export const createNotification = async ({ userId, kind, payload }) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, kind, payload, read: false })
    .select('*')
    .single();

  if (error) throw new Error(`Notification create failed: ${error.message}`);
  return data;
};
