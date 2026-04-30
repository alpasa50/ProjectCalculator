import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tosemcloquqdhcarhvch.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2nVMGLR4zJKDzkbwrGdAFg_Otk053BS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
