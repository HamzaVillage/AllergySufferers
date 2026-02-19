// MedicationSlice.js
import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';
import { Alert } from 'react-native';

const initialState = {
  ActiveMedications: [],
  MyCurrentMeds: [],
  allMyCity: [],
  ActiveCity: null,
  AllMedication: []
};

const MedicationSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    GetAllMedicationFromApi: (state, action) => {
      state.AllMedication = action.payload
    },
    setActiveMedication: (state, action) => {
      // Safeguard: De-duplicate records by date and medication id
      const uniqueItems = Array.from(
        new Map(
          action.payload.map(item => [
            `${item.date}_${item.medication_id || item.id}`,
            item,
          ]),
        ).values(),
      );
      state.ActiveMedications = uniqueItems;
    },
    deleteActiveMedication: (state, action) => {
      const newMed = action.payload;
      state.ActiveMedications = state.ActiveMedications.filter(
        med => !(med.id === newMed.id && med.date === newMed.date),
      );
    },
    addUnitToActiveMedicaton: (state, action) => {
      const newMed = action.payload;
      const index = state.ActiveMedications.findIndex(
        med => med.id === newMed.id && med.date === newMed.date,
      );
      if (index !== -1) {
        state.ActiveMedications[index].units += 1;
      }
    },
    removeUnitToActiveMedicaton: (state, action) => {
      const newMed = action.payload;
      const index = state.ActiveMedications.findIndex(
        med => med.id === newMed.id && med.date === newMed.date,
      );
      if (index !== -1 && state.ActiveMedications[index].units > 0) {
        state.ActiveMedications[index].units -= 1;
      }
    },
    setCurrentActiveMedication: (state, action) => {
      const newMed = action.payload;
      const exists = state.MyCurrentMeds.some(med => med.id === newMed.id);
      if (!exists && state.MyCurrentMeds.length < 7) {
        state.MyCurrentMeds.push(newMed);
      }
    },
    setAllMedicationFromApi: (state, action) => {
      // Alert.alert("sadasdas redux")

      const newMed = action.payload;

      state.MyCurrentMeds = newMed;
    },
    UpdateMedicationListOnEveryDate: (state, action) => {
      const curretDate = moment(new Date()).format('YYYY-MM-DD');
      const allMedRecords = state.ActiveMedications;
      const newMed = action.payload;



      const existMed = allMedRecords.find(
        med => med.id == newMed.id && med.date == curretDate,
      );

      if (existMed) {
        // console.log('this med is already exist');
      } else {
        // console.log('We are adding the medication');
        state.ActiveMedications.push({
          ...newMed,
          date: curretDate,
          units: 0,
        });
      }
    },
    RemoveUpdateMedicationListOnEveryDate: (state, action) => {
      const curretDate = moment(new Date()).format('YYYY-MM-DD');
      const medToRemove = action.payload;




      // Find index of the matching medication
      const index = state.ActiveMedications.findIndex(
        med => med.id == medToRemove.id && med.date == curretDate,
      );

      // console.log("medToRemove",index, state.ActiveMedications)
      // return

      if (index !== -1) {
        state.ActiveMedications.splice(index, 1); // remove 1 element at index
        // console.log('medication removed successfully');
      } else {
        // console.log('no matching medication found to remove');
      }
    },
    removeCurrentActiveMedication: (state, action) => {
      const newMed = action.payload;


      state.MyCurrentMeds = state.MyCurrentMeds.filter(
        med => med.id !== newMed.id,
      );
    },
    deleteAllData: state => {
      state.ActiveMedications = [];
      state.MyCurrentMeds = [];
      state.allMyCity = []
      state.ActiveCity = null

    },

    //add city flow
    // setAddCity: (state, action) => {
    //   const newCity = action.payload;

    //   console.log("newCity",newCity)

    //   // Alert.alert("...........")

    //   // console.log("state.allMyCity",state.allMyCity)
    //   // Ensure it's initialized — this is optional if your initialState is correct
    //   if (!Array.isArray(state.allMyCity)) {
    //     state.allMyCity = [];
    //   }

    //   const exists = state.allMyCity.find(
    //     city => city.city_name === newCity.city_name,
    //   );
    //   if (!exists) {
    //     state.allMyCity.push(newCity);
    //     console.log('City added:', newCity);
    //   } else {
    //     console.log('City already exists, no update needed.');
    //   }
    // },

    setAddCity: (state, action) => {
      const newCity = action.payload;

      // console.log("state.allMyCity",newCity)
      if (newCity.currentLocation === true) {
        // ✅ Remove old current location
        state.allMyCity = state.allMyCity.filter(
          city => city.currentLocation !== true,
        );

        // ✅ Always add the new current location
        state.allMyCity.push(newCity);
        // console.log('New current location set:', newCity);
      } else {
        // ✅ Normal city logic (avoid duplicate by city_name)
        const exists = state.allMyCity.find(
          city => city.city_name === newCity.city_name,
        );

        if (!exists) {
          state.allMyCity.push(newCity);
          // console.log('City added:', newCity);
        } else {
          // console.log('City already exists, no update needed.');
        }
      }
    },

    setAllCityFromApi: (state, action) => {
      const newCity = action.payload;

      state.allMyCity = newCity;
    },
    setRemoveCity: (state, action) => {
      const cityToRemove = action.payload;
      state.allMyCity = state.allMyCity.filter(
        city => city.city_name !== cityToRemove.city_name,
      );
      // console.log('City removed successfully');
    },
    setActiveCity: (state, action) => {
      state.ActiveCity = action.payload
    },
    setSortCity: (state, action) => {


      state.allMyCity = action.payload
    },

  },
});

export const {
  GetAllMedicationFromApi,
  setActiveMedication,
  deleteActiveMedication,
  addUnitToActiveMedicaton,
  removeUnitToActiveMedicaton,
  setCurrentActiveMedication,
  setAllMedicationFromApi,
  removeCurrentActiveMedication,
  deleteAllData,
  UpdateMedicationListOnEveryDate,
  RemoveUpdateMedicationListOnEveryDate,

  //add city
  setAddCity,
  setAllCityFromApi,
  setRemoveCity,
  setActiveCity,
  setSortCity,

} = MedicationSlice.actions;

export default MedicationSlice.reducer;
