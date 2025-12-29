import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gbryrqcyrsscufclwfan.supabase.co'
const supabaseAnonKey = 'sb_publishable_E9HANLcu4RoKjahiwGpVgQ_uDzgQbKr'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
