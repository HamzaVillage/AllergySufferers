import RNFS from 'react-native-fs';

// const FORECAST_DIR = `${RNFS.DocumentDirectoryPath}/forecasts`;
const FORECAST_DIR = `${RNFS.DocumentDirectoryPath}/forecasts`;

/**
 * Sanitize city name for use as a filename
 */
const sanitizeName = cityName =>
  cityName?.replace(/[^a-zA-Z0-9_\- ]/g, '_')?.trim() || 'unknown';

/**
 * Ensure the forecasts directory exists
 */
const ensureDir = async () => {
  const exists = await RNFS.exists(FORECAST_DIR);
  if (!exists) {
    await RNFS.mkdir(FORECAST_DIR);
  }
};

/**
 * Save forecast data for a city to a JSON file
 * @param {string} cityName
 * @param {object} data - Full API response for the city
 */
export const saveForecast = async (cityName, data) => {
  try {
    await ensureDir();
    const filePath = `${FORECAST_DIR}/${sanitizeName(cityName)}.json`;
    await RNFS.writeFile(filePath, JSON.stringify(data), 'utf8');
    console.log(`📁 Forecast saved for: ${cityName}`);
  } catch (error) {
    console.log('❌ Error saving forecast:', error);
  }
};

/**
 * Load forecast data for a specific city
 * @param {string} cityName
 * @returns {object|null} Parsed forecast data or null if not found
 */
export const loadForecast = async cityName => {
  try {
    const filePath = `${FORECAST_DIR}/${sanitizeName(cityName)}.json`;
    const exists = await RNFS.exists(filePath);
    if (!exists) return null;

    const content = await RNFS.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log('❌ Error loading forecast:', error);
    return null;
  }
};

/**
 * Load all saved forecast files into an array
 * @returns {Array} Array of forecast objects (same shape as old AllForcast)
 */
export const loadAllForecasts = async () => {
  try {
    await ensureDir();
    const files = await RNFS.readDir(FORECAST_DIR);
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    const forecasts = [];
    for (const file of jsonFiles) {
      try {
        const content = await RNFS.readFile(file.path, 'utf8');
        forecasts.push(JSON.parse(content));
      } catch (err) {
        console.log(`⚠️ Skipping corrupt file: ${file.name}`, err);
      }
    }
    return forecasts;
  } catch (error) {
    console.log('❌ Error loading all forecasts:', error);
    return [];
  }
};

/**
 * Delete forecast file for a specific city
 * @param {string} cityName
 */
export const deleteForecast = async cityName => {
  try {
    const filePath = `${FORECAST_DIR}/${sanitizeName(cityName)}.json`;
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
      console.log(`🗑️ Forecast deleted for: ${cityName}`);
    }
  } catch (error) {
    console.log('❌ Error deleting forecast:', error);
  }
};

/**
 * Clear all cached forecast files
 */
export const clearAllForecasts = async () => {
  try {
    const exists = await RNFS.exists(FORECAST_DIR);
    if (exists) {
      await RNFS.unlink(FORECAST_DIR);
      console.log('🗑️ All forecasts cleared');
    }
  } catch (error) {
    console.log('❌ Error clearing forecasts:', error);
  }
};
