export const baseSecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=()"
};

const resolveAllowedOrigin = (value) => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, "http://localhost");
    return /^[a-z]+:$/i.test(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
};

export const createHtmlSecurityHeaders = ({
  apiBaseUrl = "",
  wsBaseUrl = "",
  mtprotoBaseUrl = "",
  isLanding = false
} = {}) => {
  const connectSources = new Set(["'self'", "ws:", "wss:", "https://cdn.thegrapht.su"]);

  [apiBaseUrl, wsBaseUrl, mtprotoBaseUrl].forEach((value) => {
    const origin = resolveAllowedOrigin(value);
    if (origin) {
      connectSources.add(origin);
    }
  });

  return {
    ...baseSecurityHeaders,
    "Content-Security-Policy": [
      "default-src 'self'",
      "img-src 'self' data: blob: https://cdn.thegrapht.su https://i.giphy.com https://*.giphy.com",
      "media-src 'self' blob: https://cdn.thegrapht.su",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `script-src 'self' https://cdnjs.cloudflare.com${isLanding ? " 'unsafe-inline'" : ""}`,
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src ${Array.from(connectSources).join(" ")} https://api.giphy.com`,
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "object-src 'none'"
    ].join("; ")
  };
};

export const htmlSecurityHeaders = createHtmlSecurityHeaders();

