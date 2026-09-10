const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and either SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or SUPABASE_KEY in your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

module.exports = {
    supabase,
    supabaseUrl,
    supabaseKey,
};