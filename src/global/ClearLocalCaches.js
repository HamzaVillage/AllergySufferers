import RNFS from 'react-native-fs';

export const clearAllLocalCaches = async () => {
    try {
        const CITIES_DIR = `${RNFS.DocumentDirectoryPath}/forecasts`;
        const USER_DATA_DIR = `${RNFS.DocumentDirectoryPath}/user_data`;
        
        const dirsToClear = [CITIES_DIR, USER_DATA_DIR];

        for (const dir of dirsToClear) {
            const exists = await RNFS.exists(dir);
            if (exists) {
                await RNFS.unlink(dir);
                console.log(`✅ Cleared cache directory: ${dir}`);
            }
        }
    } catch (error) {
        console.log('❌ Error clearing local caches:', error);
    }
};
