const CacheSystem = {
    set(key, value, expirationInMinutes = 60) {
        const item = {
            value: value,
            timestamp: new Date().getTime(),
            expiresIn: expirationInMinutes * 60 * 1000
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    get(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const parsedItem = JSON.parse(item);
        const now = new Date().getTime();

        if (now - parsedItem.timestamp > parsedItem.expiresIn) {
            localStorage.removeItem(key);
            return null;
        }

        return parsedItem.value;
    },

    clear() {
        localStorage.clear();
    }
};

window.CacheSystem = CacheSystem;
