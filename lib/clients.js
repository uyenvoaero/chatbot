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

console.log('Supabase URL:', supabaseUrl);
console.log('Using key type:', getEnv('SUPABASE_SERVICE_ROLE_KEY') ? 'SERVICE_ROLE' : 'ANON');

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { openai, supabase };


