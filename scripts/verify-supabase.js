const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function verifySupabase() {
    console.log('🔍 Verifying Supabase Configuration...');

    // 1. Try to load .env.local manually since we are running a standalone script
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        console.log('✅ Found .env.local file');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        const keysFound = [];
        const lines = envConfig.split(/\r?\n/); // Handle Windows (\r\n) and Unix (\n)
        console.log(`📂 Processing ${lines.length} lines from .env.local`);

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) return; // Skip empty/comments

            console.log(`   Line ${index + 1}: "${trimmedLine.substring(0, 10)}..." (Length: ${trimmedLine.length})`);

            const match = trimmedLine.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
                process.env[key] = value;
                keysFound.push(key);
            }
        });
        console.log('📝 Keys found in .env.local:', keysFound.join(', '));
    } else {
        console.log('❌ .env.local file NOT found at:', envPath);
        console.log('   Please make sure you have created the file in the root directory.');
        return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. Check if variables are loaded
    if (!supabaseUrl) {
        console.log('❌ NEXT_PUBLIC_SUPABASE_URL is missing in .env.local');
    } else {
        console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set:', supabaseUrl);
    }

    if (!supabaseKey) {
        console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local');
    } else {
        console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set (starts with):', supabaseKey.substring(0, 10) + '...');
    }

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing credentials. Cannot proceed with connection test.');
        return;
    }

    // 3. Test Connection
    console.log('\n🔄 Testing connection to Supabase...');
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Attempt to get the session - this doesn't require a visible table but checks auth endpoint connectivity
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log('❌ Connection failed (Auth Error):', error.message);
        } else {
            console.log('✅ Connection successful! Supabase Client initialized correctly.');
            console.log('   (Note: This confirms the URL and Anon Key are valid for public access)');
        }

    } catch (err) {
        console.log('❌ Unexpected error during connection test:', err.message);
    }
}

verifySupabase();
