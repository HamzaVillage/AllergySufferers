import RNFS from 'react-native-fs';

const CACHE_DIR = `${RNFS.DocumentDirectoryPath}/user_data`;
const SUBSCRIPTION_CACHE_FILE = `${CACHE_DIR}/subscription_info.json`;

/**
 * Ensure the directory exists
 */
const ensureDir = async () => {
    const exists = await RNFS.exists(CACHE_DIR);
    if (!exists) {
        await RNFS.mkdir(CACHE_DIR);
    }
};

/**
 * Save subscription info to local cache
 * @param {object} data - { isExpired, expireDate, SubscriptionType, transactionId }
 */
export const saveSubscriptionCache = async (data) => {
    try {
        await ensureDir();
        await RNFS.writeFile(SUBSCRIPTION_CACHE_FILE, JSON.stringify(data), 'utf8');
        console.log('📁 Subscription cache saved');
    } catch (error) {
        console.log('❌ Error saving subscription cache:', error);
    }
};

/**
 * Load subscription info from local cache
 * @returns {object|null}
 */
export const loadSubscriptionCache = async () => {
    try {
        const exists = await RNFS.exists(SUBSCRIPTION_CACHE_FILE);
        if (!exists) return null;
        const content = await RNFS.readFile(SUBSCRIPTION_CACHE_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.log('❌ Error loading subscription cache:', error);
        return null;
    }
};

/**
 * Clear cached subscription info
 */
export const clearSubscriptionCache = async () => {
    try {
        const exists = await RNFS.exists(SUBSCRIPTION_CACHE_FILE);
        if (exists) {
            await RNFS.unlink(SUBSCRIPTION_CACHE_FILE);
            console.log('🗑️ Subscription cache cleared');
        }
    } catch (error) {
        console.log('❌ Error clearing subscription cache:', error);
    }
};
