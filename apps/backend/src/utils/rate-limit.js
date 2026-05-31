const normalizeIp = (rawValue) => {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  if (value.startsWith("::ffff:")) {
    return value.slice("::ffff:".length);
  }

  return value;
};

const isLoopbackIp = (rawValue) => {
  const value = normalizeIp(rawValue).toLowerCase();
  return value === "127.0.0.1" || value === "::1" || value === "localhost";
};

const resolveForwardedAddress = (forwardedForHeader) => {
  if (typeof forwardedForHeader !== "string" || !forwardedForHeader.trim()) {
    return "";
  }

  // For a single trusted reverse-proxy hop (nginx), rightmost IP is the proxy-appended client.
  const candidates = forwardedForHeader
    .split(",")
    .map((item) => normalizeIp(item))
    .filter(Boolean);

  return candidates.length ? candidates[candidates.length - 1] : "";
};

const resolveIpAddress = (request) => {
  const socketAddress = normalizeIp(request.socket.remoteAddress);

  if (isLoopbackIp(socketAddress)) {
    const forwardedAddress = resolveForwardedAddress(request.headers["x-forwarded-for"]);
    if (forwardedAddress) {
      return forwardedAddress;
    }
  }

  return socketAddress || "unknown";
};

export const createRateLimiter = ({ windowMs, max, keyPrefix }) => {
  const buckets = new Map();

  const cleanupExpired = (now) => {
    for (const [key, entry] of buckets.entries()) {
      if (entry.resetAt <= now) {
        buckets.delete(key);
      }
    }
  };

  return (request, scope = "default") => {
    const now = Date.now();
    cleanupExpired(now);

    const bucketKey = `${keyPrefix}:${scope}:${resolveIpAddress(request)}`;
    const currentEntry = buckets.get(bucketKey);

    if (!currentEntry || currentEntry.resetAt <= now) {
      const nextEntry = {
        count: 1,
        resetAt: now + windowMs
      };
      buckets.set(bucketKey, nextEntry);

      return {
        allowed: true,
        remaining: Math.max(0, max - nextEntry.count),
        retryAfterMs: windowMs
      };
    }

    if (currentEntry.count >= max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(1000, currentEntry.resetAt - now)
      };
    }

    currentEntry.count += 1;

    return {
      allowed: true,
      remaining: Math.max(0, max - currentEntry.count),
      retryAfterMs: Math.max(1000, currentEntry.resetAt - now)
    };
  };
};
