import { supabase } from '../supabaseClient';

export const listSubscriptions = async (userId) => {
  const { data, error } = await supabase
    .from('alert_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true);

  if (error) throw new Error(`Subscriptions fetch failed: ${error.message}`);
  return data || [];
};

export const subscribe = async ({ userId, city, categories = ['all'], channels = ['in_app', 'email'] }) => {
  const payload = {
    user_id: userId,
    city,
    categories,
    channels,
    active: true
  };

  const { data, error } = await supabase
    .from('alert_subscriptions')
    .upsert(payload, { onConflict: 'user_id,city' })
    .select('*')
    .single();

  if (error) throw new Error(`Subscribe failed: ${error.message}`);
  return data;
};

export const unsubscribe = async ({ userId, city }) => {
  const { error } = await supabase
    .from('alert_subscriptions')
    .update({ active: false })
    .eq('user_id', userId)
    .eq('city', city);

  if (error) throw new Error(`Unsubscribe failed: ${error.message}`);
};
