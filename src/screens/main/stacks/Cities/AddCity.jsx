import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import AppHeader from '../../../../components/AppHeader';
import AppText from '../../../../components/AppTextComps/AppText';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive_Dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AppColors from '../../../../utils/AppColors';
import Entypo from 'react-native-vector-icons/Entypo';
import AppButton from '../../../../components/AppButton';
import SocialAuthButton from '../../../../components/SocialAuthButton';
import GooglePlacesTextInput from 'react-native-google-places-textinput';
import BASE_URL from '../../../../utils/BASE_URL';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setAddCity } from '../../../../redux/Slices/MedicationSlice';
import Toast from 'react-native-toast-message';
import moment from 'moment';

const AddCity = ({ navigation }) => {
  const dispatch = useDispatch();
  const userdata = useSelector(state => state.auth.user);
  const allMyCity = useSelector(state => state?.medications?.allMyCity);
  const expireDate = useSelector(state => state.auth.expireDate);
  const isPremium = expireDate ? new Date() <= new Date(expireDate) : false;
  const [detail, setDetil] = useState();
  const [cityLoader, setCityLoader] = useState(false);




  const addNewCity = () => {
    if (!isPremium) {

      const isManualAddedCount = allMyCity.filter(
        state => state?.currentLocation == false,
      );

      if (isManualAddedCount?.length >= 2) {
        Alert.alert('You can only add 2 cities with the free version', 'To add up to 5 cities please subscribe to Premium.');
        return;
      }
    }

    const allMyCityFilter = allMyCity?.filter(
      res => res.currentLocation != true,
    );

    if (allMyCityFilter?.length >= 4) {
      Alert.alert('You can only add 4 cities');
      return;
    }

    setCityLoader(true);
    if (detail) {
      dispatch(
        setAddCity({
          lat: JSON.stringify(detail?.location?.latitude),
          lng: JSON.stringify(detail?.location?.longitude),
          city_name: detail?.displayName?.text,
          currentLocation: false,
        }),
      );

      Toast.show({
        type: 'success',
        text1: 'City added successfully',
        position: 'bottom',
      });
      // setCityLoader(false);
    }
    // setCityLoader(false);

    if (detail) {
      // Alert.alert("city error")
      let data = JSON.stringify({
        // data: {
        lat: JSON.stringify(detail?.location?.latitude),
        lng: JSON.stringify(detail?.location?.longitude),
        city_name: detail?.displayName?.text,
        currentLocation: false,
        // },
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/allergy_data/v1/user/${userdata?.id}/set_cities`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      axios
        .request(config)
        .then(response => {
          // console.log('Response', response.data);
          navigation.navigate('ManageCities');
          setCityLoader(false);
        })
        .catch(error => {
          console.log(error);
          setCityLoader(false);
        });
    } else {
      Alert.alert('Please select a city');
      setCityLoader(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <AppHeader
          heading="Add City"
          subheading="Pollen Forecast"
          icon={
            <Entypo
              name={'location-pin'}
              size={responsiveFontSize(2.5)}
              color={AppColors.BTNCOLOURS}
            />
          }
          goBack
        />

        <GooglePlacesTextInput
          apiKey="AIzaSyD3LZ2CmmJizWJlnW4u3fYb44RJvVuxizc"
          onPlaceSelect={res => {
            // console.log('res', res);
            setDetil(res.details);
          }}
          debounceDelay={200}
          languageCode="en"
          placeHolderText="Enter city"
          fetchDetails={true}
          includedRegionCodes={['CA']}
        />

        <View
          style={{
            borderWidth: 1,
            borderRadius: 10,
            borderColor: AppColors.LIGHTGRAY,
            padding: 10,
            marginTop: 20,
          }}>
          <View style={{ gap: 10 }}>
            <AppButton
              title={'Add city'}
              bgColor={AppColors.BTNCOLOURS}
              buttoWidth={85}
              handlePress={() => addNewCity()}
              isLoading={cityLoader}
            />
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderRadius: 10,
                borderColor: AppColors.BTNCOLOURS,
                height: responsiveHeight(5),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText
                title={'Cancel'}
                textSize={2}
                textColor={AppColors.BTNCOLOURS}
                textFontWeight
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddCity;
