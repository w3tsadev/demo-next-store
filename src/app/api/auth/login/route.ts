import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  generateRandomString,
} from "@/lib/customer-account/auth";
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
    const proto = host.includes("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }
  
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
  const shopId = process.env.SHOPIFY_SHOP_ID;

  if (!clientId || !shopId) {
    return NextResponse.json(
      { error: "Missing configuration: SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID and SHOPIFY_SHOP_ID are required" },
      { status: 500 }
    );
  }

  // Get the redirect URI from the request origin (handles ngrok/proxies)
  const origin = getOrigin(request);
  const redirectUri = `${origin}/api/auth/callback`;

  // Generate state and code verifier for PKCE
  const state = generateRandomString(32);
  const codeVerifier = generateRandomString(64);

  // Store state and code verifier in cookies for validation
  const cookieStore = cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  cookieStore.set("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  try {
    const authUrl = await buildAuthorizationUrl(
      {
        clientId,
        shopId,
        redirectUri,
      },
      state,
      codeVerifier
    );

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Failed to build authorization URL:", error);
    return NextResponse.json(
      { error: "Failed to initiate login" },
      { status: 500 }
    );
  }
}

