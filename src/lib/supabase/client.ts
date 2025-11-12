import { createBrowserClient } from '@supabase/ssr'

// This client is used in the Next.js Client Components throughout the app to interact with Supabase.
// It does not handle cookies since those are only available on the server.
export function createClient() {

	// Create a single Supabase client for interacting with your database
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	)
}