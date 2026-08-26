const cache = new Map();

/**
 * A simple in-memory cache middleware.
 * @param {number} duration - The cache duration in seconds.
 */
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse && cachedResponse.expiry > Date.now()) {
      return res.json(cachedResponse.data);
    } else if (cachedResponse) {
      // Clear expired cache
      cache.delete(key);
    }

    // Wrap res.json to capture the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Cache the response body
      cache.set(key, {
        data: body,
        expiry: Date.now() + duration * 1000
      });
      return originalJson(body);
    };

    next();
  };
};

export { cache, cacheMiddleware };
