import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase environment variables are missing, allow app to load for configuration setup
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isApiRoute = pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.');

  if (isApiRoute) {
    return supabaseResponse;
  }

  // Check for active guest session cookie
  const guestCookie = request.cookies.get('footyfolio_guest')?.value;
  let guestData: { id?: string; onboardingCompleted?: boolean; role?: string } | null = null;
  if (guestCookie) {
    try {
      guestData = JSON.parse(decodeURIComponent(guestCookie));
    } catch (e) {
      guestData = { id: 'guest-user', onboardingCompleted: true };
    }
  }

  const isGuestLoggedIn = !!(guestData && guestData.id);
  const isAuthenticated = !!user || isGuestLoggedIn;

  // Not logged in (neither Supabase user nor guest session)
  if (!isAuthenticated) {
    if (!isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // User or Guest is logged in -> check onboarding completion status
  let onboardingCompleted = false;

  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        onboardingCompleted = !!profile.onboarding_completed;
      }
    } catch (err) {
      console.error('Middleware profile check error:', err);
    }
  } else if (isGuestLoggedIn) {
    onboardingCompleted = !!guestData?.onboardingCompleted;
  }

  if (isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = onboardingCompleted ? '/' : '/onboarding';
    return NextResponse.redirect(url);
  }

  if (!onboardingCompleted && !isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  if (onboardingCompleted && isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
