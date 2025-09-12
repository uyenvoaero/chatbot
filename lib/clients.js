const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

function getEnv(name, fallback) {
    return process.env[name] || fallback;
}

const openai = new OpenAI({
    apiKey: getEnv('OPENAI_API_KEY')
});

const supabase = createClient(
    getEnv('SUPABASE_URL'),
    getEnv('SUPABASE_ANON_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY')
);

module.exports = { openai, supabase };


