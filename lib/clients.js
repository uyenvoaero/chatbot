const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

function getEnv(name, fallback) {
    return process.env[name] || fallback;
}

const openai = new OpenAI({
    apiKey: getEnv('OPENAI_API_KEY')
});

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_ANON_KEY');

console.log('=== SUPABASE CLIENT INIT ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase URL exists:', !!supabaseUrl);
console.log('Service role key exists:', !!getEnv('SUPABASE_SERVICE_ROLE_KEY'));
console.log('Anon key exists:', !!getEnv('SUPABASE_ANON_KEY'));
console.log('Using key type:', getEnv('SUPABASE_SERVICE_ROLE_KEY') ? 'SERVICE_ROLE' : 'ANON');
console.log('Supabase key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration!');
    console.error('URL:', supabaseUrl);
    console.error('Key:', supabaseKey ? 'SET' : 'NOT SET');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { openai, supabase };


