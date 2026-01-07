import { NextRequest, NextResponse } from "next/server";
import { buildLogoutUrl } from "@/lib/customer-account/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const idToken = cookieStore.get("customer_id_token")?.value;

  const shopId = process.env.SHOPIFY_SHOP_ID;

  // Clear all auth cookies
  cookieStore.delete("customer_access_token");
  cookieStore.delete("customer_refresh_token");
  cookieStore.delete("customer_id_token");

  // If we have an ID token and shop ID, redirect to Shopify logout
  if (idToken && shopId) {
    const origin = request.nextUrl.origin;
    const postLogoutRedirectUri = origin;

    const logoutUrl = buildLogoutUrl(
      { shopId },
      idToken,
      postLogoutRedirectUri
    );

    return NextResponse.redirect(logoutUrl);
  }

  // Otherwise just redirect to home
  return NextResponse.redirect(new URL("/", request.url));
}

