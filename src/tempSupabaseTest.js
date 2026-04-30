const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://tosemcloquqdhcarhvch.supabase.co', 'sb_publishable_2nVMGLR4zJKDzkbwrGdAFg_Otk053BS');
(async () => {
  const { data, error } = await supabase.from('jacqueline_projects').select('*');
  console.log(error ? JSON.stringify(error) : data.length);
})();
