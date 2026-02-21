import { supabase } from '../supabaseClient';

export const listComments = async (reportId, { limit = 5, offset = 0 } = {}) => {
  const { data, error, count } = await supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .eq('report_id', reportId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Comments fetch failed: ${error.message}`);

  const rows = (data || []).reverse();
  return { rows, count: count || 0 };
};

export const createComment = async ({ reportId, authorId, authorName, text, parentId = null }) => {
  const payload = {
    report_id: reportId,
    author_id: authorId,
    author_name: authorName,
    text,
    parent_id: parentId
  };

  const { data, error } = await supabase
    .from('comments')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(`Comment create failed: ${error.message}`);
  return data;
};

export const updateComment = async (commentId, text) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ text, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select('*')
    .single();

  if (error) throw new Error(`Comment update failed: ${error.message}`);
  return data;
};

export const deleteComment = async (commentId) => {
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) throw new Error(`Comment delete failed: ${error.message}`);
};
