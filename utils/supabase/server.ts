import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createClient = async () => {
  const cookieStore = await cookies();

  // Debug logging for production
  console.log('[createClient] Creating Supabase client...');
  console.log('[createClient] Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('[createClient] Service Role Key:', supabaseKey ? '✅ Set (length: ' + supabaseKey.length + ')' : '❌ Missing');

  if (!supabaseUrl || !supabaseKey) {
    console.error('[createClient] Missing required credentials!');
  }

  const client = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  console.log('[createClient] Client created successfully');
  return client;
};