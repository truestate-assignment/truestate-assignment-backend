const NodeCache = require('node-cache');

// Standard TTL 60 seconds, checkperiod 120 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = {
    get: (key) => cache.get(key),
    set: (key, val, ttl) => cache.set(key, val, ttl),
    del: (key) => cache.del(key),
    flush: () => cache.flushAll(),
    stats: () => cache.getStats()
};
