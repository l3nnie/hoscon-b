import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Initializing Supabase client...');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('SERVICE_KEY:', supabaseServiceKey ? `✅ Present (length: ${supabaseServiceKey.length})` : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
}

// Create admin client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Test connection immediately
(async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📦 Available buckets:', data.map(b => b.name).join(', ') || 'none');
      
      // Check if hostel-images bucket exists
      const targetBucket = 'hostel-images';
      const bucketExists = data.some(b => b.name === targetBucket);
      if (!bucketExists) {
        console.warn(`⚠️  Bucket '${targetBucket}' not found. Uploads will fail.`);
      } else {
        console.log(`✅ Bucket '${targetBucket}' is ready`);
      }
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
  }
})();

export const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);