import { supabase } from '../supabaseClient';

const logAdmin = async ({ adminUserId, action, targetType = null, targetId = null, meta = {} }) => {
  const { error } = await supabase
    .from('admin_audit_logs')
    .insert({
      admin_user_id: adminUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      meta
    });

  if (error) throw new Error(`Audit log failed: ${error.message}`);
};

export const deleteReportAdmin = async ({ adminUserId, reportId }) => {
  const { error } = await supabase.from('reports').delete().eq('id', reportId);
  if (error) throw new Error(`Delete report failed: ${error.message}`);
  await logAdmin({ adminUserId, action: 'delete_report', targetType: 'report', targetId: reportId });
};

export const verifyReportAdmin = async ({ adminUserId, reportId }) => {
  const { data, error } = await supabase
    .from('reports')
    .update({ status: 'Verified', updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .select('*')
    .single();

  if (error) throw new Error(`Verify report failed: ${error.message}`);
  await logAdmin({ adminUserId, action: 'verify_report', targetType: 'report', targetId: reportId });
  return data;
};

export const resolveReportAdmin = async ({ adminUserId, reportId, afterImageUrl }) => {
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: 'Resolved',
      image_url: afterImageUrl,
      resolved_at: new Date().toISOString(),
      resolved_by: adminUserId,
      updated_at: new Date().toISOString()
    })
    .eq('id', reportId)
    .select('*')
    .single();

  if (error) throw new Error(`Resolve report failed: ${error.message}`);
  await logAdmin({ adminUserId, action: 'resolve_report', targetType: 'report', targetId: reportId, meta: { afterImageUrl } });
  return data;
};

export const updateSystemSettings = async (settings) => {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({ id: 1, ...settings })
    .select('*')
    .single();

  if (error) throw new Error(`Settings update failed: ${error.message}`);
  return data;
};

export const updateUserStatusAdmin = async ({ adminUserId, userId, status }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new Error(`User status update failed: ${error.message}`);
  await logAdmin({ adminUserId, action: 'update_user_status', targetType: 'user', targetId: userId, meta: { status } });
  return data;
};
