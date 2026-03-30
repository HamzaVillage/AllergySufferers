// MedicationSlice.js
import {createSlice} from '@reduxjs/toolkit';
import moment from 'moment';
import {Alert} from 'react-native';

const initialState = {
  AllSymtoms: [],
};

const SymtomsSlice = createSlice({
  name: 'symtoms',
  initialState,
  reducers: {
    setAllSymtomsToReduxFromApi: (state, action) => {
      state.AllSymtoms = action.payload
    },
    UpdateSymtoms: (state, action) => {
      
    },
    ClearSymtoms:  (state, action) => {
      
    },
  },
});

export const {setAllSymtomsToReduxFromApi} =
  SymtomsSlice.actions;

export default SymtomsSlice.reducer;
