import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izlnmlruwgpgktrtdxre.supabase.co';
const supabaseKey = 'sb_publishable_cvZEue9oUGawFcbh9XddrQ_FBgaEkCx';

export const supabase = createClient(supabaseUrl, supabaseKey);
