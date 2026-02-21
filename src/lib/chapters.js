import { supabase } from '../supabaseClient';

export const listChapters = async () => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Chapter list failed: ${error.message}`);
  return data || [];
};

export const createChapter = async ({ name, type, city, state = null }, userId) => {
  const { data, error } = await supabase
    .from('chapters')
    .insert({ name, type, city, state, created_by: userId })
    .select('*')
    .single();

  if (error) throw new Error(`Chapter create failed: ${error.message}`);

  await joinChapter(data.id, userId, 'owner');
  return data;
};

export const joinChapter = async (chapterId, userId, role = 'member') => {
  const { data, error } = await supabase
    .from('chapter_members')
    .upsert({ chapter_id: chapterId, user_id: userId, role }, { onConflict: 'chapter_id,user_id' })
    .select('*')
    .single();

  if (error) throw new Error(`Join chapter failed: ${error.message}`);
  return data;
};

export const leaveChapter = async (chapterId, userId) => {
  const { error } = await supabase
    .from('chapter_members')
    .delete()
    .eq('chapter_id', chapterId)
    .eq('user_id', userId);

  if (error) throw new Error(`Leave chapter failed: ${error.message}`);
};

export const listMyChapterIds = async (userId) => {
  const { data, error } = await supabase
    .from('chapter_members')
    .select('chapter_id')
    .eq('user_id', userId);

  if (error) throw new Error(`Membership fetch failed: ${error.message}`);
  return (data || []).map((row) => row.chapter_id);
};
