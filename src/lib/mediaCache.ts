
const CACHE_NAME = 'echomasters-media-vault-v1';

/**
 * Caches a media resource (audio/image) for offline use and faster loading.
 */
export const cacheMedia = async (url: string): Promise<string> => {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) return url;

    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);
        
        if (cachedResponse) {
            const blob = await cachedResponse.blob();
            return URL.createObjectURL(blob);
        }

        // Fetch and cache
        const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (response.ok) {
            await cache.put(url, response.clone());
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    } catch (e) {
        console.warn(`Failed to cache media: ${url}`, e);
    }
    
    return url;
};

/**
 * Checks if a resource is already cached.
 */
export const isMediaCached = async (url: string): Promise<boolean> => {
    try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(url);
        return !!match;
    } catch {
        return false;
    }
};

/**
 * Pre-caches an array of URLs.
 */
export const preCacheMedia = async (urls: string[]): Promise<void> => {
    const cache = await caches.open(CACHE_NAME);
    const uniqueUrls = [...new Set(urls)].filter(url => url && !url.startsWith('blob:') && !url.startsWith('data:'));
    
    for (const url of uniqueUrls) {
        try {
            const match = await cache.match(url);
            if (!match) {
                const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
                if (response.ok) {
                    await cache.put(url, response);
                }
            }
        } catch (e) {
            console.warn(`Pre-cache failed for: ${url}`, e);
        }
    }
};

/**
 * Clears the entire media cache.
 */
export const clearMediaCache = async (): Promise<void> => {
    try {
        await caches.delete(CACHE_NAME);
        console.log("Media cache cleared.");
    } catch (e) {
        console.error("Failed to clear media cache", e);
    }
};

/**
 * Estimates the cache size in bytes.
 */
export const getCacheSize = async (): Promise<number> => {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        let totalSize = 0;
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
        return totalSize;
    } catch (e) {
        console.error("Failed to calculate cache size", e);
        return 0;
    }
};
