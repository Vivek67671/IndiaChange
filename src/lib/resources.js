import { supabase } from '../supabaseClient';

export const DEFAULT_RESOURCES = [
  { title: 'Cyber Crime Portal', desc: 'File official cyber fraud complaints', link: 'https://cybercrime.gov.in' },
  { title: 'RTI Online', desc: 'File a Right to Information request', link: 'https://rtionline.gov.in' },
  { title: 'Swachh Bharat App', desc: 'Official government cleaning app', link: 'https://play.google.com/store/apps/details?id=com.ichangemycity.swachhbharat' }
];

export const listResourceLinks = async () => {
  const { data, error } = await supabase
    .from('resource_links')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return DEFAULT_RESOURCES;
  }

  if (!data || data.length === 0) return DEFAULT_RESOURCES;
  return data.map((item) => ({
    title: item.title,
    desc: item.description,
    link: item.url
  }));
};
