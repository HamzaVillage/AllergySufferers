import RNFS from 'react-native-fs';

const SYMTOMS_FILE = `${RNFS.DocumentDirectoryPath}/forecasts/symtoms_data.json`;
const SYMTOMS_DIR = `${RNFS.DocumentDirectoryPath}/forecasts`;

/**
 * Ensure the directory exists
 */
const ensureDir = async () => {
    const exists = await RNFS.exists(SYMTOMS_DIR);
    if (!exists) {
        await RNFS.mkdir(SYMTOMS_DIR);
    }
};

/**
 * Save symptoms data to a JSON file
 * @param {Array} data - The slides array
 */
export const saveSymtoms = async (data) => {
    try {
        await ensureDir();
        await RNFS.writeFile(SYMTOMS_FILE, JSON.stringify(data), 'utf8');
        console.log('📁 Symptoms data saved to file');
    } catch (error) {
        console.log('❌ Error saving symptoms:', error);
    }
};

/**
 * Load symptoms data from the JSON file
 * @returns {Array|null} Parsed symptoms data or null if not found
 */
export const loadSymtoms = async () => {
    try {
        const exists = await RNFS.exists(SYMTOMS_FILE);
        if (!exists) return null;

        const content = await RNFS.readFile(SYMTOMS_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.log('❌ Error loading symptoms:', error);
        return null;
    }
};

/**
 * Delete symptoms data file
 */
export const deleteSymtoms = async () => {
    try {
        const exists = await RNFS.exists(SYMTOMS_FILE);
        if (exists) {
            await RNFS.unlink(SYMTOMS_FILE);
            console.log('🗑️ Symptoms data deleted');
        }
    } catch (error) {
        console.log('❌ Error deleting symptoms:', error);
    }
};
