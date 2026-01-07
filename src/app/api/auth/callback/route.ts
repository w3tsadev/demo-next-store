import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/customer-account/auth";
import { cookies, headers } from "next/headers";

// Helper to get the actual origin (handles ngrok/proxies)
function getOrigin(request: NextRequest): string {
  const headersList = headers();
  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto") || "https";
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  
  const host = headersList.get("host");
  if (host) {
    const proto = request.nextUrl.protocol.replace(":", "");
    return `${proto}://${host}`;
  }
  
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?error=Missing+code+or+state", request.url)
    );
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("code_verifier")?.value;

  // Validate state
  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/?error=Invalid+state", request.url)
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL("/?error=Missing+code+verifier", request.url)
    );
  }

  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const shopId = process.env.SHOPIFY_SHOP_ID;

  if (!clientId || !shopId) {
    return NextResponse.redirect(
      new URL("/?error=Missing+configuration", request.url)
    );
  }


  const origin = getOrigin(request);
  const redirectUri = `${origin}/api/auth/callback`;

  try {
    const tokens = await exchangeCodeForToken(
      {
        clientId,
        shopId,
        redirectUri,
      },
      code,
      codeVerifier
    );

    // Clear OAuth cookies
    cookieStore.delete("oauth_state");
    cookieStore.delete("code_verifier");

    // Store tokens in secure cookies
    cookieStore.set("customer_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    });

    cookieStore.set("customer_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    if (tokens.id_token) {
      cookieStore.set("customer_id_token", tokens.id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokens.expires_in,
        path: "/",
      });
    }

    // Redirect to account page or home (use origin to stay on ngrok URL)
    return NextResponse.redirect(new URL("/account", origin));
  } catch (error) {
    console.error("Token exchange failed:", error);
    return NextResponse.redirect(
      new URL("/?error=Token+exchange+failed", origin)
    );
  }
}

