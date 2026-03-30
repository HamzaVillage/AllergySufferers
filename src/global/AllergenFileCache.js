import RNFS from 'react-native-fs';

const ALLERGEN_DIR = `${RNFS.DocumentDirectoryPath}/forecasts`;
const ALLERGEN_FILE_PATH = `${ALLERGEN_DIR}/allergens.json`;

const ensureDir = async () => {
  const exists = await RNFS.exists(ALLERGEN_DIR);
  if (!exists) {
    await RNFS.mkdir(ALLERGEN_DIR);
  }
};

export const saveAllergens = async (allergens) => {
  try {
    await ensureDir();
    const data = JSON.stringify(allergens);
    await RNFS.writeFile(ALLERGEN_FILE_PATH, data, 'utf8');
    console.log('📁 Allergens data saved to file');
  } catch (error) {
    console.log('Error saving allergens to file:', error);
  }
};

export const loadAllergens = async () => {
  try {
    const exists = await RNFS.exists(ALLERGEN_FILE_PATH);
    if (exists) {
      const data = await RNFS.readFile(ALLERGEN_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error loading allergens from file:', error);
  }
  return null;
};
