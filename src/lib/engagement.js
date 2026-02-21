import { supabase } from '../supabaseClient';

const getReportCounters = async (reportId) => {
  const { data, error } = await supabase
    .from('reports')
    .select('upvotes, vouch_count, flags')
    .eq('id', reportId)
    .single();

  if (error) throw new Error(`Counter fetch failed: ${error.message}`);
  return data;
};

const toggleUniqueAction = async (table, reportId, userId, extra = {}) => {
  const { data: existing, error: findError } = await supabase
    .from(table)
    .select('report_id,user_id')
    .eq('report_id', reportId)
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) throw new Error(`Action lookup failed: ${findError.message}`);

  if (existing) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('report_id', reportId)
      .eq('user_id', userId);

    if (error) throw new Error(`Action remove failed: ${error.message}`);
    return { active: false };
  }

  const { error } = await supabase
    .from(table)
    .insert({ report_id: reportId, user_id: userId, ...extra });

  if (error) throw new Error(`Action create failed: ${error.message}`);
  return { active: true };
};

export const toggleVote = async (reportId, userId) => {
  const result = await toggleUniqueAction('report_votes', reportId, userId);
  const counters = await getReportCounters(reportId);
  return { ...result, counters };
};

export const toggleVouch = async (reportId, userId) => {
  const result = await toggleUniqueAction('report_vouches', reportId, userId);
  const counters = await getReportCounters(reportId);
  return { ...result, counters };
};

export const flagReport = async (reportId, userId, reason = null) => {
  const { data: existing, error: findError } = await supabase
    .from('report_flags')
    .select('report_id,user_id')
    .eq('report_id', reportId)
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) throw new Error(`Flag lookup failed: ${findError.message}`);
  if (existing) {
    return { alreadyFlagged: true, counters: await getReportCounters(reportId) };
  }

  const { error } = await supabase
    .from('report_flags')
    .insert({ report_id: reportId, user_id: userId, reason });

  if (error) throw new Error(`Flag failed: ${error.message}`);

  return { alreadyFlagged: false, counters: await getReportCounters(reportId) };
};
