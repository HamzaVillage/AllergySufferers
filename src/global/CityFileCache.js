import RNFS from 'react-native-fs';

const CITIES_DIR = `${RNFS.DocumentDirectoryPath}/forecasts`;
const CITIES_FILE = `${CITIES_DIR}/added_cities.json`;
const ACTIVE_CITY_FILE = `${CITIES_DIR}/active_city.json`;

/**
 * Ensure the directory exists
 */
const ensureDir = async () => {
    const exists = await RNFS.exists(CITIES_DIR);
    if (!exists) {
        await RNFS.mkdir(CITIES_DIR);
    }
};

/**
 * Save all added cities
 * @param {Array} data 
 */
export const saveCities = async (data) => {
    try {
        await ensureDir();
        await RNFS.writeFile(CITIES_FILE, JSON.stringify(data), 'utf8');
        console.log('📁 Cities list saved');
    } catch (error) {
        console.log('❌ Error saving cities:', error);
    }
};

/**
 * Load all added cities
 * @returns {Array|null}
 */
export const loadCities = async () => {
    try {
        const exists = await RNFS.exists(CITIES_FILE);
        if (!exists) return null;
        const content = await RNFS.readFile(CITIES_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.log('❌ Error loading cities:', error);
        return null;
    }
};

/**
 * Save currently selected city
 * @param {object} city 
 */
export const saveActiveCity = async (city) => {
    try {
        await ensureDir();
        await RNFS.writeFile(ACTIVE_CITY_FILE, JSON.stringify(city), 'utf8');
        console.log('📁 Active city saved');
    } catch (error) {
        console.log('❌ Error saving active city:', error);
    }
};

/**
 * Load currently selected city
 * @returns {object|null}
 */
export const loadActiveCity = async () => {
    try {
        const exists = await RNFS.exists(ACTIVE_CITY_FILE);
        if (!exists) return null;
        const content = await RNFS.readFile(ACTIVE_CITY_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.log('❌ Error loading active city:', error);
        return null;
    }
};
