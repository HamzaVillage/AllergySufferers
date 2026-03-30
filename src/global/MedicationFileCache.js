import RNFS from 'react-native-fs';

const MEDICATIONS_DIR = `${RNFS.DocumentDirectoryPath}/forecasts`;
const CURRENT_MEDS_FILE = `${MEDICATIONS_DIR}/current_medications.json`;
const ACTIVE_MEDICATIONS_FILE = `${MEDICATIONS_DIR}/active_medications_records.json`;

/**
 * Ensure the directory exists
 */
const ensureDir = async () => {
    const exists = await RNFS.exists(MEDICATIONS_DIR);
    if (!exists) {
        await RNFS.mkdir(MEDICATIONS_DIR);
    }
};

/**
 * Save current medications list (the medications the user is taking)
 * @param {Array} data 
 */
export const saveCurrentMeds = async (data) => {
    try {
        await ensureDir();
        await RNFS.writeFile(CURRENT_MEDS_FILE, JSON.stringify(data), 'utf8');
        console.log('📁 Current medications saved');
    } catch (error) {
        console.log('❌ Error saving current meds:', error);
    }
};

/**
 * Load current medications list
 * @returns {Array|null}
 */
export const loadCurrentMeds = async () => {
    try {
        const exists = await RNFS.exists(CURRENT_MEDS_FILE);
        if (!exists) return null;
        const content = await RNFS.readFile(CURRENT_MEDS_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.log('❌ Error loading current meds:', error);
        return null;
    }
};

/**
 * Save active medication records (daily unit logs)
 * @param {Array} data 
 */
export const saveActiveMedications = async (data) => {
    try {
        await ensureDir();
        await RNFS.writeFile(ACTIVE_MEDICATIONS_FILE, JSON.stringify(data), 'utf8');
        console.log('📁 Active medication records saved');
    } catch (error) {
        console.log('❌ Error saving active medications:', error);
    }
};

/**
 * Load active medication records
 * @returns {Array|null}
 */
export const loadActiveMedications = async () => {
    try {
        const exists = await RNFS.exists(ACTIVE_MEDICATIONS_FILE);
        if (!exists) return null;
        const content = await RNFS.readFile(ACTIVE_MEDICATIONS_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.log('❌ Error loading active medications:', error);
        return null;
    }
};
