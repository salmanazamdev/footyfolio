import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignore if called from Server Component context
              }
            },
          },
        }
      );

      const { error, data } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        const target = profile?.onboarding_completed ? '/' : '/onboarding';
        
        // Return HTML response that posts message if in popup or redirects
        return new NextResponse(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Successful</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
                .card { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Sign in Successful</h2>
                <p>Redirecting you to FootyFolio...</p>
              </div>
              <script>
                if (window.opener) {
                  try {
                    window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', target: '${target}' }, '*');
                  } catch (e) {}
                  window.close();
                } else {
                  window.location.href = '${target}';
                }
              </script>
            </body>
          </html>`,
          {
            headers: { 'Content-Type': 'text/html' },
          }
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
