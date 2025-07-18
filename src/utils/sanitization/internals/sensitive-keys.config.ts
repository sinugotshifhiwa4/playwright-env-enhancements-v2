export const defaultSensitiveKeys = [
  "password",
  "apiKey",
  "secret",
  "secretKey",
  "authorization",
  "auth",
  "token",
  "accessToken",
  "refreshToken",
  "bearerToken",
  "cookie",
  "jwt",
  "dbPassword",
  //"email",
  //"username",
];

export const defaultSensitiveKeysRegex = [
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,

  // JWT tokens
  /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,

  // Base64 encoded strings
  /^[A-Za-z0-9+/]{20,}={0,2}$/,

  // GitHub tokens
  /ghp_[0-9a-zA-Z]{36}/,

  // Stripe API keys
  /sk_[a-zA-Z0-9]{32,}/,
  /pk_[a-zA-Z0-9]{32,}/,

  // Bitbucket app password in URL
  /(?<=bitbucket\.org\/).*:[a-z0-9]{20,}/i,

  // OAuth or Bearer tokens
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/i,
  /access_token=\w{20,}/i,

  // Hypothetical Bitbucket token
  /bbp_[0-9a-zA-Z]{32,}/,
];
