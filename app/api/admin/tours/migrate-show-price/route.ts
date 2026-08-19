import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';

const SQL = `
ALTER TABLE tours ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;
UPDATE tours SET show_price = true WHERE show_price IS NULL;
`;

/**
 * Ensures tours.show_price exists.
 * Prefer running migrations/20260719_add_show_price.sql in the Supabase SQL Editor.
 * This route verifies the column and returns SQL if it is still missing.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('tours').select('show_price').limit(1);

    if (!error) {
      return NextResponse.json({
        ok: true,
        message: 'show_price column already exists',
      });
    }

    // Attempt via rpc helper if the project has one installed
    const { error: rpcError } = await supabase.rpc('exec_sql', { query: SQL });
    if (!rpcError) {
      const recheck = await supabase.from('tours').select('show_price').limit(1);
      if (!recheck.error) {
        return NextResponse.json({ ok: true, message: 'show_price column created via rpc' });
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        sql: SQL.trim(),
        hint: 'Run the SQL above in Supabase → SQL Editor, then retry saving a tour.',
      },
      { status: 409 }
    );
  } catch (err) {
    console.error('migrate-show-price error:', err);
    return NextResponse.json({ error: 'Migration check failed' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
