/**
 * Shopify Customer Account OAuth 2.0 Authentication
 * Based on: https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started
 */

// Generate a random string for state and code verifier
export function generateRandomString(length: number = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// Generate code challenge from verifier (S256)
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export type AuthConfig = {
  clientId: string;
  shopId: string;
  redirectUri: string;
  scopes?: string[];
};

/**
 * Build the authorization URL for Shopify Customer Account OAuth
 */
export async function buildAuthorizationUrl(
  config: AuthConfig,
  state: string,
  codeVerifier: string
): Promise<string> {
  const { clientId, shopId, redirectUri, scopes = ["openid", "email", "customer-account-api:full"] } = config;

  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Shopify uses: https://shopify.com/authentication/{shop_id}/oauth/authorize
  const authorizationEndpoint = `https://shopify.com/authentication/${shopId}/oauth/authorize`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${authorizationEndpoint}?${params.toString()}`;
}

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  token_type: string;
};

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  config: AuthConfig,
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const { clientId, shopId, redirectUri } = config;

  const tokenEndpoint = `https://shopify.com/authentication/${shopId}/oauth/token`;

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  config: Pick<AuthConfig, "clientId" | "shopId">,
  refreshToken: string
): Promise<TokenResponse> {
  const { clientId, shopId } = config;

  // Shopify uses: https://shopify.com/authentication/{shop_id}/oauth/token
  const tokenEndpoint = `https://shopify.com/authentication/${shopId}/oauth/token`;

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return response.json();
}

/**
 * Build the logout URL
 */
export function buildLogoutUrl(
  config: Pick<AuthConfig, "shopId">,
  idToken: string,
  postLogoutRedirectUri: string
): string {
  const { shopId } = config;

  // Shopify uses: https://shopify.com/authentication/{shop_id}/oauth/logout
  const logoutEndpoint = `https://shopify.com/authentication/${shopId}/oauth/logout`;

  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: postLogoutRedirectUri,
  });

  return `${logoutEndpoint}?${params.toString()}`;
}

