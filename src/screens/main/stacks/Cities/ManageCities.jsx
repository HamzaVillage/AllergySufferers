import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
import AppTextInput from '../../../../components/AppTextInput';
import Octicons from 'react-native-vector-icons/Octicons';
import BASE_URL from '../../../../utils/BASE_URL';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
} from 'react-native-draggable-flatlist';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppImages from '../../../../assets/images/AppImages';
import Toast from 'react-native-toast-message';
import { saveCities, loadCities } from '../../../../global/CityFileCache';
import {ApiCallWithUserId} from '../../../../global/ApiCall';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { deleteForecast } from '../../../../global/ForecastFileCache';
const ManageCities = ({navigation}) => {
  const dispatch = useDispatch();
  const userdata = useSelector(state => state.auth.user);
  const [allMyCity, setAllMyCity] = useState([]);
  const [loader, setLoader] = useState(false);
  const [cities, setCities] = useState([]);
  const [activeMedication, setActiveMedication] = useState();
  const [NotifiedCity, setNotifiedCity] = useState()
  const [NotifyLoader, setNotifyLoader] = useState(false)






  useEffect(() => {
    const nav = navigation.addListener('focus', async () => {
      const cached = await loadCities();
      if (cached) setAllMyCity(cached);
      getAllCities();
      const getNotiRes = await ApiCallWithUserId("post", "get_notification_city", userdata?.id);
      setNotifiedCity(getNotiRes.data);
    });

    return nav;
  }, [navigation]);

  useEffect(() => {
    setActiveMedication(allMyCity);
  }, [allMyCity]);

  const getAllCities = () => {
    setLoader(true);
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userdata?.id}/get_cities`,
      headers: {},
    };

    axios
      .request(config)
      .then(response => {
        // console.log(JSON.stringify(response.data));

        setActiveMedication(response?.data?.cities);

        const filterCities = allMyCity.filter(
          res => res.currentLocation === true,
        );

        setLoader(false);

        const apiCities = response?.data?.cities || [];

        // check if currentLocation already exists in API
        const mergedCities = filterCities.length
          ? [
              ...filterCities.filter(
                city =>
                  !apiCities.some(
                    apiCity => apiCity.city_name === city.city_name,
                  ),
              ),
              ...apiCities,
            ]
          : apiCities;
      })
      .catch(error => {
        console.log(error);
        setLoader(false);
      });
  };

  // setLoader(false);
  const deleteActiveMedication = async (item) => {
    deleteForecast(item.city_name);
    setLoader(true);

    const updated = allMyCity.filter(city => city.city_name !== item.city_name);
    setAllMyCity(updated);
    await saveCities(updated);

    let data = JSON.stringify({
      city_id: item.id,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userdata?.id}/delete_city`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    axios
      .request(config)
      .then(response => {
        // We trust the local update, but could refresh from response if API returns full list
        setLoader(false);
        Alert.alert('Success', 'City deleted successfully');
      })
      .catch(error => {
        console.log(error);
        setLoader(false);
      });
  };

  const sortingCities = async data => {
    setAllMyCity(data);
    await saveCities(data);
    await ApiCallWithUserId(
      'post',
      'sort_cities',
      userdata?.id,
      { data: data },
    );
  };

  const NoifyCity = async (cityProps) => {




    setNotifyLoader(true)
    const data = {
       lat: cityProps?.lat,
        lng: cityProps?.lng,
        city_name: cityProps?.city_name,
    }

    const response = await ApiCallWithUserId("post", "set_notification_city", userdata?.id, data )

    setNotifyLoader(false)

    if(response.status == 'success'){
      const getNotiRes =  await ApiCallWithUserId("post", "get_notification_city", userdata?.id  )
      setNotifiedCity(getNotiRes.data)
      // console.log("get", getNotiRes.data)
    }

    setNotifyLoader(false)

  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 200}}>
        <AppHeader
          heading="Manage City"
          icon={
            <Entypo
              name={'location-pin'}
              size={responsiveFontSize(2.5)}
              color={AppColors.BTNCOLOURS}
            />
          }
          goBack
        />

        {loader && <ActivityIndicator size={'large'} color={AppColors.BLACK} />}

        <View style={{marginBottom: 20, gap: 10}}>
          <AppText
            title="Active Notification City"
            textSize={2}
            textFontWeight
          />
          {
            NotifiedCity ? (
              <>
              {
                NotifyLoader ? (
                  <ActivityIndicator size={'small'} color={AppColors.BLACK}/>
                ):(
                  <AppText
                    title={NotifiedCity?.city_name}
                    textSize={3}
                    />

                )
              }
                </>
            ):(

              <AppText
                title="No city selected for notifications"
                textSize={2}
                textAlignment="center"
              />
            )
          }
        </View>

        <AppText title={'Cities'} textSize={2} textFontWeight />

        {activeMedication ? (
          <NestableScrollContainer>
            <NestableDraggableFlatList
              data={activeMedication}
              contentContainerStyle={{gap: 10}}
              renderItem={({item, drag, isActive}, index) => {
                return (
                  <TouchableOpacity onLongPress={drag}>
                    <AppTextInput
                      inputPlaceHolder={item?.city_name}
                      onNotificationPress={()=> NoifyCity(item)}
                      cities={true}
                      arrowDelete={
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              'Delete City',
                              'Are you sure you want to delete this city?',
                              [
                                {
                                  text: 'Cancel',
                                  onPress: () => console.log('Cancel Pressed'),
                                  style: 'cancel',
                                },
                                {
                                  text: 'OK',
                                  onPress: () => deleteActiveMedication(item),
                                },
                              ],
                              {cancelable: false},
                            )
                          }>
                          <MaterialCommunityIcons
                            name={'delete'}
                            size={responsiveFontSize(2.5)}
                            color={AppColors.LIGHTGRAY}
                          />
                        </TouchableOpacity>
                      }
                      rightLogo={
                        <View style={{marginTop: 4, flexDirection: 'row'}}>
                          <Image
                            source={AppImages.updown}
                            style={{
                              height: 14,
                              width: 14,
                              resizeMode: 'contain',
                            }}
                          />
                        </View>
                      }
                    />
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index.toString()}
              onDragEnd={({data}) => {
                sortingCities(data), setActiveMedication(data);
              }}
              dragEnabled={true}
              activationDistance={10}
            />
          </NestableScrollContainer>
        ) : null}

        <View style={{marginTop: 20, gap: 10}}>
            
          <AppButton
            title={'Add city'}
            bgColor={AppColors.BTNCOLOURS}
            RightColour={AppColors.rightArrowCOlor}
            handlePress={() =>  navigation.navigate('AddCity')}
          />
          <AppButton
            title={'Manage pollens'}
            bgColor={AppColors.BTNCOLOURS}
            RightColour={AppColors.rightArrowCOlor}
            handlePress={() => navigation.navigate('ManagePollens')}
          />
          <AppButton
            title={'Manage medications'}
            bgColor={AppColors.BTNCOLOURS}
            RightColour={AppColors.rightArrowCOlor}
            handlePress={() => navigation.navigate('ManageMedications')}
          />
          {/* <AppButton title={'Manage push notifications'} bgColor={AppColors.BTNCOLOURS} RightColour={AppColors.rightArrowCOlor}  /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageCities;
