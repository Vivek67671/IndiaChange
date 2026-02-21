import { supabase } from '../supabaseClient';

const REPORT_BUCKET = 'report-evidence';

const buildFilePath = (reportId, file, prefix) => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `reports/${reportId}/${prefix}-${Date.now()}-${safeName}`;
};

const getPublicUrl = (path) => {
  const { data } = supabase.storage.from(REPORT_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
};

export const uploadEvidence = async (reportId, imageFile, videoFile) => {
  const result = { image_url: null, video_url: null };

  if (imageFile) {
    const imagePath = buildFilePath(reportId, imageFile, 'image');
    const { error } = await supabase.storage.from(REPORT_BUCKET).upload(imagePath, imageFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: imageFile.type || undefined
    });
    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
    result.image_url = getPublicUrl(imagePath);
  }

  if (videoFile) {
    const videoPath = buildFilePath(reportId, videoFile, 'video');
    const { error } = await supabase.storage.from(REPORT_BUCKET).upload(videoPath, videoFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: videoFile.type || undefined
    });
    if (error) {
      throw new Error(`Video upload failed: ${error.message}`);
    }
    result.video_url = getPublicUrl(videoPath);
  }

  return result;
};

export const createReport = async (payload) => {
  const { data, error } = await supabase
    .from('reports')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Report insert failed: ${error.message}`);
  }

  return data;
};

export const updateReport = async (id, updates) => {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Report update failed: ${error.message}`);
  }

  return data;
};

export const fetchReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Report fetch failed: ${error.message}`);
  }

  return data || [];
};

export const listReports = async ({ city, state, status, limit = 100, offset = 0 } = {}) => {
  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (city) query = query.eq('city', city);
  if (state) query = query.eq('state', state);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(`Report list failed: ${error.message}`);
  return data || [];
};

export const resolveReport = async (id, { afterImageUrl, note = 'Resolved by Admin.' }) => {
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: 'Resolved',
      image_url: afterImageUrl,
      resolved_at: new Date().toISOString(),
      timeline: [{ status: 'Resolved', date: new Date().toISOString(), desc: note }]
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Report resolve failed: ${error.message}`);
  return data;
};

export const verifyReport = async (id) => {
  const { data, error } = await supabase
    .from('reports')
    .update({ status: 'Verified' })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Report verify failed: ${error.message}`);
  return data;
};

export const deleteReport = async (id) => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Report delete failed: ${error.message}`);
};

export const mapReportRowToPost = (row) => {
  const createdAt = row?.created_at ? new Date(row.created_at) : new Date();
  const dateLabel = createdAt.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
  const eventDate = row?.event_date ? new Date(`${row.event_date}T00:00:00`) : null;
  const eventDateLabel = eventDate
    ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const timeline = Array.isArray(row?.timeline) && row.timeline.length > 0
    ? row.timeline
    : [{ status: 'Reported', date: dateLabel, desc: 'Issue submitted by user.' }];

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    state: row.state,
    city: row.city,
    location: row.location,
    eventDate: eventDateLabel,
    eventTime: row.event_time,
    image: row.image_url,
    video: row.video_url,
    videoLink: row.video_link,
    author: row.author_name || 'Anonymous',
    authorId: row.author_id || 'anon',
    date: dateLabel,
    status: row.status || 'Open',
    upvotes: row.upvotes || 0,
    vouchCount: row.vouch_count || 0,
    trustScore: 'Low',
    flags: row.flags || 0,
    tags: [row.type],
    isVolunteerDrive: row.type === 'volunteer',
    volunteers: [],
    upvotedBy: [],
    vouchedBy: [],
    flaggedBy: [],
    badges: row.author_name ? ['New Reporter'] : ['Anonymous Reporter'],
    timeline
  };
};
