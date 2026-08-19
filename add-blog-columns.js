// Add missing columns to blogs table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBlogColumns() {
  try {
    console.log('🔧 Adding missing columns to blogs table...');

    // Add created_by column
    const { error: createdByError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);`
    });

    if (createdByError && !createdByError.message.includes('already exists')) {
      console.error('❌ Error adding created_by column:', createdByError);
    } else {
      console.log('✅ created_by column added (or already exists)');
    }

    // Add updated_by column
    const { error: updatedByError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE blogs ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);`
    });

    if (updatedByError && !updatedByError.message.includes('already exists')) {
      console.error('❌ Error adding updated_by column:', updatedByError);
    } else {
      console.log('✅ updated_by column added (or already exists)');
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_blogs_created_by ON blogs(created_by);
        CREATE INDEX IF NOT EXISTS idx_blogs_updated_by ON blogs(updated_by);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created');
    }

    console.log('🎉 Blog tracking columns added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addBlogColumns();