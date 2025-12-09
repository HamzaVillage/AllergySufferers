// import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
// import axios from 'axios';
// import {signOut} from '../../screens/auth/SignInWithGoogle';
// import CheckSubscription from '../../global/CheckSubscription';
// import moment from 'moment';

// const initialState = {
//   user: null,
//   showError: '',
//   loader: false,
//   isExpired: true,
//   expireDate: '',
//   SubscriptionType: '',
//   currentLocation: {
//     Lat: null,
//     Lng: null,
//   },
//   ActiveMedications: [],
//   MyCurrentMeds: [],
// };

// export const CurrentLogin = createAsyncThunk(
//   'user',
//   async (config, {rejectWithValue}) => {
//     try {
//       const {data} = await axios.request(config);
//       console.log('login response ====>', data);

//       const subData = await CheckSubscription(data.id);

//       return {data, subData}; // Return the login response data to the slice
//     } catch (error) {
//       console.log('Error during login:', error);
//       return rejectWithValue(error.response?.data || 'Login failed'); // Handle errors
//     }
//   },
// );

// export const AuthSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setData: (state, action) => {
//       // Redux Toolkit allows us to write "mutating" logic in reducers. It
//       state.user = action.payload;
//     },
//     setLogout: state => {
//       state.user = null;
//       state.expireDate = '';
//       state.isExpired = true;
//       state.currentLocation.Lat = null;
//       state.currentLocation.Lng = null;
//     },
//     setCurrentUserData: (state, action) => {
//       state.user = action.payload;
//     },
//     setLoader: (state, action) => {
//       state.loader = action.payload;
//     },
//     setSubscription: (state, action) => {
//       state.isExpired = action.payload.isExpired;
//       state.expireDate = action.payload.expireDate;
//       state.SubscriptionType = action.payload.SubscriptionType;
//     },
//     setCurrentLatLng: (state, action) => {
//       console.log('act', action.payload);
//       state.currentLocation.Lat = action.payload.Lat;
//       state.currentLocation.Lng = action.payload.Lng;
//     },
//     setCurrentActiveMedication: (state, action) => {
//       const newMed = action.payload;

//       // Ensure it's always an array
//       if (!Array.isArray(state.MyCurrentMeds)) {
//         state.MyCurrentMeds = [];
//       }

//       const exists = state.MyCurrentMeds.some(med => med.id === newMed.id);

//       if (!exists) {
//         state.MyCurrentMeds.push(newMed);
//       }
//     },
//     removeCurrentActiveMedication: (state, action) => {
//       const newMed = action.payload;
//       const exist = state.MyCurrentMeds.some(med => med.id === newMed.id);

//       if (exist) {
//         state.MyCurrentMeds.pop(newMed);
//       }
//     },

//     setActiveMedication: (state, action) => {

//       state.ActiveMedications = action.payload
    
//     },
//     deleteActiveMedication: (state, action) => {
//       const newMed = action.payload;

//       const exists = state.ActiveMedications.some(
//         med => med.id === newMed.id && med.date === newMed.date,
//       );
//       if (exists) {
//         state.ActiveMedications.pop(newMed);

//       }
//     },
//     addUnitToActiveMedicaton: (state, action) => {
//       const newMed = action.payload;


      
//       const indexof = state.ActiveMedications.findIndex(
//         med => med.id === newMed.id && med.date === newMed.date
//       );
//       if (indexof !== -1) {
//         state.ActiveMedications[indexof].units += 1;
//       }
//     },
//     removeUnitToActiveMedicaton: (state, action) => {
//       const newMed = action.payload;

//       const indexof = state.ActiveMedications.findIndex(
//         med => med.id === newMed.id && med.date === newMed.date,
//       );

//       if (indexof !== -1) {
//         if (state.ActiveMedications[indexof].units != 0) {
//           state.ActiveMedications[indexof].units -= 1;
//         }
//       }
//     },

//     deleteAllData : (state, action) => {
//       state.ActiveMedications = []
//       state.MyCurrentMeds = []
//       state.ActiveMedications = []
//     }
//   },

//   extraReducers: builder => {
//     builder
//       .addCase(CurrentLogin.fulfilled, (state, action) => {
//         state.user = action.payload.data;
//         state.loader = false;
//         state.expireDate = action?.payload?.subData?.expiry;
//         if (action?.payload?.subData?.expiry) {
//           state.isExpired = action?.payload?.subData?.false;
//         }
//       })
//       .addCase(CurrentLogin.pending, (state, action) => {})
//       .addCase(CurrentLogin.rejected, (state, action) => {
//         state.loader = false;
//       });
//   },
// });

// // Action creators are generated for each case reducer function
// export const {
//   setData,
//   setLogout,
//   setLoader,
//   setCurrentUserData,
//   setSubscription,
//   setCurrentLatLng,
//   setActiveMedication,
//   deleteActiveMedication,
//   addUnitToActiveMedicaton,
//   removeUnitToActiveMedicaton,

//   setCurrentActiveMedication,
//   removeCurrentActiveMedication,
//   deleteAllData
// } = AuthSlice.actions;

// export default AuthSlice.reducer;


// AuthSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import CheckSubscription from '../../global/CheckSubscription';
import { Alert } from 'react-native';
import ShowError from '../../utils/ShowError';

const initialState = {
  user: null,
  showError: '',
  loader: false,
  isExpired: true,
  expireDate: '',
  transactionId: null,
  SubscriptionType: '',
  currentLocation: {
    Lat: null,
    Lng: null,
  },
  WatchFreeTut: false,
  WatchPaidTut: false,
  LoggedIn: false
};

export const CurrentLogin = createAsyncThunk(
  'auth/login',
  async (config, { rejectWithValue }) => {
    try {
      const { data } = await axios.request(config);
      
      // console.log("data", data.message)
      if(data?.message){
        ShowError(data.message, 1000)
      }else{
        ShowError("Succesfully logged In", 1000)
      }

      return data;
    } catch (error) {
      console.log('Error during login:', error);
      ShowError(error?.response?.data?.message, 1000)
      // ShowError("Your password is incorrect, or this account does not exist.", 2000)
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  },
);

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogout: state => {
      state.LoggedIn = false
      state.user = null;
      state.expireDate = '';
      state.isExpired = true;
      state.currentLocation.Lat = null;
      state.currentLocation.Lng = null;
      state.SubscriptionType = null,
      state.transactionId = null
    },
    setCurrentUserData: (state, action) => {
      state.user = action.payload;
    },
    setLoader: (state, action) => {
      state.loader = action.payload;
    },
    setSubscription: (state, action) => {
      state.isExpired = action.payload.isExpired;
      state.expireDate = action.payload.expireDate;
      state.SubscriptionType = action.payload.SubscriptionType;
      state.transactionId = action.payload.transactionId
    },
    setCurrentLatLng: (state, action) => {
      state.currentLocation.Lat = action.payload.Lat;
      state.currentLocation.Lng = action.payload.Lng;
    },
    setWatchFreeTut: (state, action) => {
      state.WatchFreeTut = action.payload
    },
    setWatchPaidTut: (state, action) => {
      state.WatchPaidTut = action.payload
    },
     
  },
  extraReducers: builder => {
    builder
      .addCase(CurrentLogin.fulfilled, (state, action) => {
        // Alert.alert("action.payload.expiry",action.payload.expiry)
        // ShowError("Succesfully logged In", 1000)
        state.user = action.payload;
        state.loader = false;
        state.LoggedIn = true

        if(action.payload.expiry){
          state.expireDate = action.payload.expiry;
          state.isExpired = false;
        }

      })
      .addCase(CurrentLogin.pending, state => {
        
        state.loader = true;
      })
      .addCase(CurrentLogin.rejected, state => {
        state.loader = false;
      });
  },
});

export const {
  setLogout,
  setCurrentUserData,
  setLoader,
  setSubscription,
  setCurrentLatLng,
  setWatchFreeTut,
  setWatchPaidTut,
} = AuthSlice.actions;

export default AuthSlice.reducer;
