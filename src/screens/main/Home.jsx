import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
  StyleSheet,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import AppColors from '../../utils/AppColors';
import AppText from '../../components/AppTextComps/AppText';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppImages from '../../assets/images/AppImages';
import SpeedoMeter from '../../components/SpeedoMeter';
import SelectionButton from '../../components/SelectionButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import BASE_URL from '../../utils/BASE_URL';
import DatePicker from 'react-native-date-picker';
// import {SafeAreaView} from 'react-native-safe-area-context';
import moment from 'moment';
import AppIntroSlider from 'react-native-app-intro-slider';
import * as Animatable from 'react-native-animatable';
import AppButton from '../../components/AppButton';
import PointPollenSpores from '../../components/PointPollenSpores';
// import AddCityApi from '../../global/AddCityApi';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {GetCurrentLocation} from '../../global/GetCurrentLocation';
import {GetCityName} from '../../global/GetCityName';
import {
  setAddCity,
  setAllCityFromApi,
} from '../../redux/Slices/MedicationSlice';
import Geocoder from 'react-native-geocoding';
import GetAllLocation from '../../global/GetAllLocation';
import SubscribeBar from '../../components/SubscribeBar';
import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  setSubscription,
  setWatchFreeTut,
  setWatchPaidTut,
} from '../../redux/Slices/AuthSlice';
import SubscribeNow from '../../global/SubscribeNow';
import {ApiCallWithUserId} from '../../global/ApiCall';
import {saveForecast, loadAllForecasts} from '../../global/ForecastFileCache';
import {saveCities, loadCities} from '../../global/CityFileCache';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

const Home = ({navigation}) => {
  // const bannerAdUnitId = __DEV__
  //   ? TestIds.BANNER
  //   : 'ca-app-pub-8551767929999166/4471222920'; // replace with your real ad id

  const bannerAdUnitId = 'ca-app-pub-8551767929999166/4471222920'; // replace with your real ad id

  Geocoder.init('AIzaSyD3LZ2CmmJizWJlnW4u3fYb44RJvVuxizc'); // use a valid API key
  const [allForecasts, setAllForecasts] = useState([]);
  const dispatch = useDispatch();
  const LoggedIn = useSelector(state => state?.auth?.LoggedIn);
  const userData = useSelector(state => state?.auth?.user);
  const [AllCities, setAllCities] = useState([]);
  const subscriptionType = useSelector(state => state?.auth?.SubscriptionType);
  const transactionId = useSelector(state => state?.auth?.transactionId);
  const transactionDate = useSelector(state => state?.auth?.transactionDate);
  const subscriptionExpire = useSelector(state => state?.auth?.expireDate);
  const isExpired = useSelector(state => state.auth.isExpired);
  const isPremium = !isExpired;

  // console.log("AllForcast", expireDate, isPremium, subscriptionType, transactionId, transactionDate)

  const watchFreeTut = useSelector(state => state?.auth?.WatchFreeTut);
  const watchPaidTut = useSelector(state => state?.auth?.WatchPaidTut);

  const sliderRef = useRef(null);

  // console.log('AllCities', AllCities);
  const sortCities = useMemo(() => {
    return [...AllCities].sort((a, b) => {
      return (
        (b.currentLocation || b.isCurrentLocation ? 1 : 0) -
        (a.currentLocation || a.isCurrentLocation ? 1 : 0)
      );
    });
  }, [AllCities]);

  const [fetchingCurrentLocation, setFechingCurrentLocation] = useState(false);

  const [selected, setSelected] = useState('Today');
  const [PastPollenData, setPastPollenData] = useState();
  const [pollenData, setPollenData] = useState();
  const [FuturePollenData, setFuturePollenData] = useState();

  const [todayPollensData, setTodayPollensData] = useState();
  const [pollenLoader, setPollenLoader] = useState(false);

  //data states
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const [activePollen, setActivePollen] = useState([]);
  const [activeLoader, setActiveLoader] = useState(false);

  const [PastDate, setPastDate] = useState(
    moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD'),
  );
  const [FutureDate, setFutureDate] = useState(
    moment(new Date()).add(1, 'days').format('YYYY-MM-DD'),
  );

  const [ispastArray, setIsPastArray] = useState([]);
  const [isfutureArray, setIsFutureArray] = useState([]);

  // const [AllCities, setAllCities] = useState([]);
  const [loadCities, setLoadCities] = useState(false);

  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [expandedFutureKey, setExpandedFutureKey] = useState(null);

  const [myLocation, setMyLocation] = useState();

  const [message, setMessage] = useState('');

  // console.log('allForeCast===>', AllForcast)

  useEffect(() => {
    if (isPremium) {
      if (LoggedIn) {
        if (!watchPaidTut) {
          navigation.navigate('ViewAppGuide');
          dispatch(setWatchPaidTut(true));
        }
      }
    } else {
      if (LoggedIn) {
        if (!watchFreeTut) {
          navigation.navigate('ViewFreeAppGuide');
          dispatch(setWatchFreeTut(true));
        }
      }
    }
  }, [isExpired]);
  // dispatch(setWatchFreeTut(false))
  // dispatch(clearForaCastSlive(false))

  // console.log('allcities', AllCities);
  useEffect(() => {
    const nav = navigation.addListener('focus', () => {
      // if (hasFetchedOnce) return;

      if (userData) {
        getActivePollens();

        // getAllCities();
        // getCurrentLocation();
      } else {
      }
    });

    return nav;
  }, [navigation, hasFetchedOnce, userData]);

  const getActivePollens = () => {
    setActiveLoader(true);
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_pollens`,
      headers: {},
    };

    axios
      .request(config)
      .then(response => {
        // console.log('active pollen',activePollen)
        setActivePollen(response.data.data);
        setActiveLoader(false);
      })
      .catch(error => {
        console.log(error);
        setActiveLoader(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      const loadOnFocus = async () => {
        // Load cached forecasts from files on focus
        const cachedForecasts = await loadAllForecasts();
        setAllForecasts(cachedForecasts);

        // Always reload cities from cache (picks up cities added in AddCity)
        const {
          loadCities: loadCitiesFromCache,
        } = require('../../global/CityFileCache');
        const cachedCities = await loadCitiesFromCache();
        if (cachedCities && cachedCities.length > 0) {
          setAllCities(cachedCities);
        } else {
          GetLocationFromApi();
        }
      };
      loadOnFocus();
    }, []),
  );

  // When AllCities updates (e.g. from cache reload or API), fetch pollen data
  useEffect(() => {
    if (AllCities && AllCities.length > 0) {
      getPollensData(sortCities, 0);

      const findTheIndex = sortCities?.findIndex(
        res => res.currentLocation == true,
      );

      if (findTheIndex !== -1 && sliderRef?.current) {
        sliderRef?.current?.goToSlide(findTheIndex, false);
      }
    }
  }, [AllCities]);

  // dispatch(removeForeCastSlice())

  const getPollensData = (allcities, newindex) => {
    const targetCityName = allcities[newindex ? newindex : 0]?.city_name;
    const currentDatet = moment().local().format('MMMM Do, YYYY');

    // Robust search for forecast by city name
    const cachedForecast = allForecasts.find(f => {
      const forecastCity = f?.user?.locations?.closest?.name
        ?.toLowerCase()
        ?.trim();
      const searchCity = targetCityName?.toLowerCase()?.trim();
      return (
        forecastCity === searchCity ||
        (forecastCity &&
          searchCity &&
          (forecastCity.includes(searchCity) ||
            searchCity.includes(forecastCity)))
      );
    });

    // Use the actual city name from the cached object for data access
    const apiCityName = cachedForecast?.user?.locations?.closest?.name;
    const LocalSavedUserDate =
      cachedForecast?.forecast?.[apiCityName]?.today?.date_label;

    if (cachedForecast && LocalSavedUserDate === currentDatet) {
      setForcastLocal(JSON.parse(JSON.stringify(cachedForecast)));
      return;
    }

    // Only show loader if we actually need to fetch
    setPollenLoader(true);
    let data = new FormData();
    data.append('lat', allcities[newindex ? newindex : 0]?.lat);
    data.append('lng', allcities[newindex ? newindex : 0]?.lng);
    data.append('email', userData?.email);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/get_allergy_data`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: data,
    };

    axios
      .request(config)
      .then(async response => {
        const res = response.data;
        const city = res?.user?.locations?.closest?.name;

        // Check again if the date is current (safety)
        const isToday =
          res?.forecast?.[city]?.today?.date_label === currentDatet;

        if (isToday && city) {
          // Save to file cache
          await saveForecast(city, res);
          // Update local state
          setAllForecasts(prev => {
            const filtered = prev.filter(
              f => f?.user?.locations?.closest?.name !== city,
            );
            return [...filtered, res];
          });
        }

        setForcastLocal(res);
        setPollenLoader(false);
      })
      .catch(error => {
        console.log('Error fetching pollens data:', error);
        setPollenLoader(false);
      });
  };

  const GetLocationFromApi = async () => {
    if (AllCities.length == 0) {
      const getLocationFromApi = await GetAllLocation(userData?.id);

      // console.log('getLocationFromApi.cities', getLocationFromApi);
      if (getLocationFromApi?.cities?.length > 0) {
        setAllCities(getLocationFromApi.cities);
        saveCities(getLocationFromApi.cities);
      } else {
        console.log('no cities found in cities');
      }
    }
  };

  useEffect(() => {
    SubscribeSubscription();
  }, [isExpired]);

  const getCurrentLocation = async () => {
    // console.log('----------------------------');
    setFechingCurrentLocation(true);
    const gettingCurrentLatlng = await GetCurrentLocation();

    const getCityName = await GetCityName(
      gettingCurrentLatlng.latitude,
      gettingCurrentLatlng.longitude,
    );

    let data = JSON.stringify({
      lat: JSON.stringify(gettingCurrentLatlng?.latitude),
      lng: JSON.stringify(gettingCurrentLatlng?.longitude),
      city_name: getCityName,
      currentLocation: true,
    });

    await ApiCallWithUserId('post', 'set_cities', userData?.id, data);

    const findTheIndex = sortCities?.findIndex(
      res => res?.city_name === getCityName,
    );

    if (findTheIndex !== -1 && sliderRef?.current) {
      sliderRef?.current?.goToSlide(findTheIndex, false);
    }

    const newCity = {
      lat: JSON.stringify(gettingCurrentLatlng?.latitude),
      lng: JSON.stringify(gettingCurrentLatlng?.longitude),
      city_name: getCityName,
      currentLocation: true,
    };

    setAllCities(prev => {
      const filtered = prev.filter(c => c.currentLocation !== true);
      const updated = [...filtered, newCity];
      saveCities(updated);
      return updated;
    });

    setFechingCurrentLocation(false);
  };

  const getThBgColour = level => {
    switch (level) {
      case 'Very High':
        return '#D72626';
      case 'High':
        return '#F26D24';
      case 'Moderate':
        return '#FDEB48';
      case 'Low':
        return '#99C817';
      default:
        return '#99C817';
    }
  };

  const SubscribeSubscription = async () => {
    if (subscriptionType && transactionId) {
      const subscribeApi = await SubscribeNow(
        subscriptionType == 'premium_monthly' || 'allergy_month'
          ? 'monthly'
          : 'yearly',
        userData?.id,
        transactionId,
        transactionDate,
      );

      //  alert('hello')

      // console.log('subscribe api response ===>',subscribeApi)

      dispatch(
        setSubscription({
          isExpired: false,
          SubscriptionType: subscriptionType,
          expireDate: subscribeApi.expiry,
        }),
      );
    }
  };

  const PollenCurrentTodayData = useMemo(() => {
    if (!todayPollensData?.current) return [];

    return todayPollensData.current.filter(
      (item, index, self) =>
        index === self.findIndex(t => t.name === item.name),
    );
  }, [todayPollensData]);

  const sortedPollenData = [...PollenCurrentTodayData].sort((a, b) => {
    // First sort by type: pollen first, then spore
    if (a.type !== b.type) {
      return a.type === 'pollen' ? -1 : 1;
    }
    // Then sort by level descending (4 to 1)
    if (b.level !== a.level) {
      return b.level - a.level;
    }
    // Then sort alphabetically by common_name (fallback to name)
    const nameA = a.common_name || a.name || '';
    const nameB = b.common_name || b.name || '';
    return nameA.localeCompare(nameB);
  });

  const SettingHeaders = () => {
    const Headings = [];
    let pollenHeaderAdded = false;
    let sporesHeaderAdded = false;

    sortedPollenData.forEach((item, index) => {
      // console.log('foreaching', item, index);

      if (item.type === 'pollen' && !pollenHeaderAdded) {
        Headings.push({type: 'header', title: 'Pollen', index: index});
        pollenHeaderAdded = true;
      }

      if (item.type === 'spore' && !sporesHeaderAdded) {
        Headings.push({type: 'header', title: 'Spores', index: index});
        sporesHeaderAdded = true;
      }
    });

    return Headings;
  };

  const settingData = SettingHeaders();

  const freeData = [
    {
      id: 1,
      name: 'Total Spores',
      value: todayPollensData?.total_spores,
      type: 'spore',
      type: 'spore',
    },
    {
      id: 2,
      name: 'Total Trees',
      value: todayPollensData?.total_trees,
      type: 'pollen',
      type: 'pollen',
    },
    {
      id: 3,
      name: 'Total Grasses',
      value: todayPollensData?.total_grasses,
      type: 'pollen',
      type: 'pollen',
    },
    {
      id: 4,
      name: 'Total Weeds',
      value: todayPollensData?.total_weeds,
      type: 'pollen',
      type: 'pollen',
    },
  ];

  const setForcastLocal = isExistInArray => {
    try {
      const res = isExistInArray; //Local data here

      const city = res?.user?.locations?.closest?.name;

      const past = res?.forecast?.[city]?.past;
      const today = res?.forecast?.[city]?.today;
      const future = res?.forecast?.[city]?.future;

      if (!today) {
        // Alert.alert("today us undefined")
        setPastPollenData();
        setTodayPollensData();
        setFuturePollenData();
        setIsPastArray([]);
        setIsFutureArray([]);
        setPollenLoader(false);
        setLoadCities(false);
        // setMessage(
        //   `No data found in ${
        //     allcities[newindex ? newindex : 0]?.city_name
        //   }. Please try another city.`,
        // );

        return;
      }
      setMessage('');

      const pastArray = Object.entries(past).map(([date, data]) => ({
        key: date,
        ...data,
      }));

      const futureArray = Object.entries(future).map(([date, data]) => ({
        key: date,
        ...data,
      }));

      // console.log("pastArray.....", city, pastArray)
      setPastPollenData(past);
      setTodayPollensData(today);
      setFuturePollenData(future);

      setIsPastArray(pastArray);
      setIsFutureArray(futureArray);

      setPollenLoader(false);
      setLoadCities(false);
      setHasFetchedOnce(true);
    } catch (error) {
      console.log('error in local function', error);
    }
  };

  return (
    <>
      <LinearGradient
        colors={[getThBgColour(todayPollensData?.label), AppColors.WHITE]}
        // colors={[animatedColor, AppColors.WHITE]} // 🎯 animated start, static end
        style={{
          height: responsiveHeight(100),
          width: responsiveWidth(100),
        }}>
        {loadCities == true ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}>
            <ActivityIndicator size={'large'} color={AppColors.BLACK} />
            {userData ? (
              <AppText
                title={'Fetching pollen data please wait...'}
                textSize={2}
              />
            ) : (
              <AppText
                title={'Fetching current location data please wait...'}
                textSize={2}
              />
            )}
          </View>
        ) : (
          <>
            {AllCities.length > 0 ? (
              <View style={{flex: 1}}>
                <ScrollView
                  nestedScrollEnabled
                  contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: responsiveHeight(15),
                    padding: 20,
                    marginTop: 30,
                  }}
                  showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                      marginTop: 20,
                    }}>
                    <TouchableOpacity
                      onPress={() => getCurrentLocation()}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                      }}>
                      {fetchingCurrentLocation == true ? (
                        <ActivityIndicator
                          size={'small'}
                          color={AppColors.BLUE}
                        />
                      ) : (
                        <FontAwesome6
                          name={'location-crosshairs'}
                          size={responsiveFontSize(2)}
                          color={AppColors.BLUE}
                        />
                      )}
                      <AppText
                        title={'Fetch current location'}
                        textSize={1.7}
                        textColor={AppColors.BLUE}
                      />
                    </TouchableOpacity>
                  </View>
                  {loadCities == true ? (
                    <>
                      <ActivityIndicator
                        size={'large'}
                        color={AppColors.BLACK}
                      />
                    </>
                  ) : (
                    <AppIntroSlider
                      ref={sliderRef}
                      data={sortCities}
                      activeDotStyle={{
                        backgroundColor: AppColors.BLUE,
                        marginTop: 20,
                      }}
                      dotStyle={{
                        backgroundColor: AppColors.LIGHTGRAY,
                        marginTop: 20,
                      }}
                      showDoneButton={false}
                      showNextButton={false}
                      onSlideChange={index => getPollensData(sortCities, index)}
                      renderItem={({item, index}) => {
                        return (
                          <>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}>
                              <View style={{flexDirection: 'row', gap: 5}}>
                                {item?.currentLocation ? (
                                  <FontAwesome6
                                    name={'location-dot'}
                                    size={responsiveFontSize(2)}
                                    color={AppColors.BLUE}
                                    style={{marginTop: 6}}
                                  />
                                ) : (
                                  <FontAwesome
                                    name={'map'}
                                    size={responsiveFontSize(2)}
                                    color={AppColors.BLUE}
                                    style={{marginTop: 6}}
                                  />
                                )}
                                <View>
                                  <AppText
                                    title={
                                      // pollenData?.user?.locations?.closest?.name
                                      item.city_name
                                    }
                                    textSize={2.5}
                                    textFontWeight
                                  />
                                  {/* )} */}
                                  <AppText
                                    title={'Allergen Forecast'}
                                    textSize={2}
                                    textColor={'#777777'}
                                  />
                                </View>
                              </View>

                              <View>
                                <AppText
                                  title={'Today'}
                                  textFontWeight
                                  textSize={2}
                                />
                                {/* {pollenLoader == true ? (
                                <ActivityIndicator
                                  size={'small'}
                                  color={AppColors.BLACK}
                                />
                              ) : ( */}
                                <AppText
                                  // title={pollenData?.today?.text}
                                  title={moment()
                                    .local()
                                    .format('MMMM Do, YYYY')}
                                  textColor={'#777777'}
                                />
                                {/* )} */}
                              </View>
                            </View>

                            <View
                              style={{
                                marginTop: 20,
                                gap: 20,
                                height: responsiveHeight(35),
                              }}>
                              <AppText
                                title={'Total Accumulated Pollen'}
                                textAlignment={'center'}
                                textSize={2.5}
                                textColor={AppColors.BLACK}
                                textFontWeight
                              />

                              <SpeedoMeter
                                TextBottom={todayPollensData?.label}
                              />
                            </View>
                          </>
                        );
                      }}
                    />
                  )}

                  <View style={{flexDirection: 'row', gap: 5}}>
                    {activeLoader == true ? (
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: responsiveWidth(90),
                          marginTop: 50,
                        }}>
                        <ActivityIndicator
                          size={'large'}
                          color={AppColors.BLACK}
                          style={{alignSelf: 'center'}}
                        />
                      </View>
                    ) : (
                      <View style={{flexDirection: 'row'}}>
                        {/* {console.log('activeDataForDials', activeDataForDials)} */}
                        {isPremium ? (
                          <>
                            {todayPollensData?.current?.length > 0 ? (
                              <FlatList
                                data={activePollen}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                  gap: 20,
                                  flexDirection: 'row',
                                }}
                                renderItem={({item}) => {
                                  const activeDataForDials =
                                    todayPollensData?.current;
                                  console.log(
                                    'todayPollensData?.current',
                                    item,
                                  );

                                  const index = (
                                    activeDataForDials || []
                                  ).findIndex(
                                    p =>
                                      p?.scientific_name?.toLowerCase() ===
                                        item.name?.toLowerCase() ||
                                      p.name?.toLowerCase() ===
                                        item.common_name?.toLowerCase() ||
                                      p?.scientific_name?.toLowerCase() ===
                                        item?.common_name?.toLowerCase() ||
                                      (item.common_name
                                        ?.toLowerCase()
                                        .includes('cedar') &&
                                        p.name
                                          ?.toLowerCase()
                                          .includes('cedar')) ||
                                      (item.common_name
                                        ?.toLowerCase()
                                        .includes('alder') &&
                                        p.name
                                          ?.toLowerCase()
                                          .includes('alder')) ||
                                      (item.common_name
                                        ?.toLowerCase()
                                        .includes('birch') &&
                                        p.name
                                          ?.toLowerCase()
                                          .includes('birch')) ||
                                      (item.common_name
                                        ?.toLowerCase()
                                        .includes('oak') &&
                                        p.name?.toLowerCase().includes('oak')),
                                  );
                                  const todayPollenInAir = activeDataForDials;

                                  return (
                                    <View style={{gap: 10}}>
                                      <AppText
                                        title={item.common_name}
                                        textAlignment={'center'}
                                        textSize={1.5}
                                        textColor={AppColors.BLACK}
                                        textFontWeight
                                        textwidth={40}
                                        textHeight={6}
                                      />

                                      <SpeedoMeter
                                        imgWeight={30}
                                        imgHeight={10}
                                        speedometerWidth={30}
                                        imageTop={-10}
                                        TextBottom={
                                          todayPollenInAir[index]?.level == 1
                                            ? 'Low'
                                            : todayPollenInAir[index]?.level ==
                                              2
                                            ? 'Moderate'
                                            : todayPollenInAir[index]?.level ==
                                              3
                                            ? 'High'
                                            : todayPollenInAir[index]?.level ==
                                              4
                                            ? 'Very High'
                                            : 'None'
                                        }
                                        isPollenorSpores={
                                          todayPollenInAir[index]?.type
                                        }
                                        TempreaturePriorityFontSize={1.6}
                                      />
                                    </View>
                                  );
                                }}
                              />
                            ) : (
                              <FlatList
                                data={activePollen}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                  gap: 20,
                                  flexDirection: 'row',
                                }}
                                renderItem={({item}) => {
                                  return (
                                    <View style={{gap: 10}}>
                                      <AppText
                                        title={item.name}
                                        textAlignment={'center'}
                                        textSize={1.5}
                                        textColor={AppColors.BLACK}
                                        textFontWeight
                                      />

                                      <SpeedoMeter
                                        imgWeight={30}
                                        imgHeight={10}
                                        speedometerWidth={30}
                                        imageTop={-10}
                                        TextBottom={'None'}
                                        TempreaturePriorityFontSize={1.6}
                                      />
                                    </View>
                                  );
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <FlatList
                              data={freeData}
                              horizontal
                              renderItem={({item}) => {
                                return (
                                  <View style={{gap: 10}}>
                                    <AppText
                                      title={item.name}
                                      textAlignment={'center'}
                                      textSize={1.5}
                                      textColor={AppColors.BLACK}
                                      textFontWeight
                                      textwidth={40}
                                      textHeight={6}
                                    />

                                    <SpeedoMeter
                                      imgWeight={30}
                                      imgHeight={10}
                                      speedometerWidth={30}
                                      imageTop={-10}
                                      TextBottom={
                                        item.value == 1
                                          ? 'Low'
                                          : item.value == 2
                                          ? 'Moderate'
                                          : item.value == 3
                                          ? 'High'
                                          : item.value == 4
                                          ? 'Very High'
                                          : 'None'
                                      }
                                      isPollenorSpores={item.type}
                                      TempreaturePriorityFontSize={1.6}
                                    />
                                  </View>
                                );
                              }}
                            />
                          </>
                        )}
                      </View>
                    )}
                  </View>

                  <View
                    style={{flexDirection: 'row', gap: 10, marginBottom: 20}}>
                    <SelectionButton
                      title="Past"
                      setSelected={() => setSelected('Past')}
                      selected={selected}
                    />

                    <SelectionButton
                      title="Today"
                      setSelected={() => setSelected('Today')}
                      selected={selected}
                    />

                    <SelectionButton
                      title="Future"
                      setSelected={() => setSelected('Future')}
                      selected={selected}
                    />
                  </View>

                  <AppText
                    title={
                      'Report displays all pollen and spores currently in the air.'
                    }
                    textAlignment={'center'}
                    textSize={2}
                    textwidth={70}
                    textColor={AppColors.TEXTCOLOR}
                  />

                  {pollenLoader == true ? (
                    <ActivityIndicator size={'large'} color={AppColors.BLACK} />
                  ) : (
                    <>
                      {message && (
                        <AppText
                          title={message}
                          textSize={2}
                          textColor={AppColors.BLACK}
                          textAlignment={'center'}
                          marginTop={10}
                        />
                      )}
                      {selected == 'Past' ? (
                        <>
                          {isPremium ? (
                            <FlatList
                              data={ispastArray}
                              contentContainerStyle={{paddingTop: 100}}
                              inverted
                              renderItem={({item, index}) => {
                                const pastPollenAndSpores = item?.current?.sort(
                                  (a, b) => {
                                    if (a.type !== b.type) {
                                      return a.type === 'pollen' ? -1 : 1;
                                    }
                                    if (b.level !== a.level) {
                                      return b.level - a.level;
                                    }
                                    const nameA = a.common_name || a.name || '';
                                    const nameB = b.common_name || b.name || '';
                                    return nameA.localeCompare(nameB);
                                  },
                                );

                                const pastpollenHeaderIndex =
                                  pastPollenAndSpores.findIndex(
                                    i => i.type === 'pollen',
                                  );
                                const sporesHeaderIndex =
                                  pastPollenAndSpores.findIndex(
                                    i => i.type === 'spore',
                                  );

                                return (
                                  <View
                                    style={{
                                      borderWidth: 1,
                                      borderTopRightRadius:
                                        index == ispastArray?.length - 1
                                          ? 10
                                          : 0,
                                      borderTopLeftRadius:
                                        index == ispastArray?.length - 1
                                          ? 10
                                          : 0,
                                      borderBottomRightRadius:
                                        index == 0 ? 10 : 0,
                                      borderBottomLeftRadius:
                                        index == 0 ? 10 : 0,
                                      padding: 20,

                                      alignItems: 'flex-start',
                                      justifyContent: 'space-between',
                                      borderBottomWidth: index == 0 ? 1 : 0,
                                    }}>
                                    {index >= ispastArray?.length - 5 ? (
                                      <TouchableOpacity
                                        onPress={() => {
                                          if (expandedFutureKey === item.key) {
                                            setExpandedFutureKey(null); // Collapse if already expanded
                                          } else {
                                            setExpandedFutureKey(item.key); // Expand only this one
                                          }
                                        }}
                                        style={{
                                          flexDirection: 'row',
                                          gap: 10,
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          width: responsiveWidth(80),
                                        }}>
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 5,
                                          }}>
                                          <View
                                            style={{
                                              height: 20,
                                              width: 20,
                                              borderRadius: 200,
                                              borderWidth: 1,
                                              borderColor: getThBgColour(
                                                item?.label,
                                              ),
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            }}>
                                            <View
                                              style={{
                                                height: 15,
                                                width: 15,
                                                borderRadius: 200,
                                                backgroundColor: getThBgColour(
                                                  item?.label,
                                                ),
                                              }}
                                            />
                                          </View>

                                          <AppText
                                            title={item.key}
                                            textSize={2}
                                            textColor={AppColors.BLACK}
                                            textFontWeight
                                          />
                                        </View>
                                        <AntDesign
                                          name={'plus'}
                                          size={responsiveFontSize(3)}
                                          color={AppColors.BLACK}
                                        />
                                      </TouchableOpacity>
                                    ) : (
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          gap: 10,
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          width: responsiveWidth(80),
                                        }}>
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 5,
                                          }}>
                                          <View
                                            style={{
                                              height: 20,
                                              width: 20,
                                              borderRadius: 200,
                                              borderWidth: 1,
                                              borderColor: getThBgColour(
                                                item?.label,
                                              ),
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            }}>
                                            <View
                                              style={{
                                                height: 15,
                                                width: 15,
                                                borderRadius: 200,
                                                backgroundColor: getThBgColour(
                                                  item?.label,
                                                ),
                                              }}
                                            />
                                          </View>

                                          <AppText
                                            title={item.key}
                                            textSize={2}
                                            textColor={AppColors.BLACK}
                                            textFontWeight
                                          />
                                        </View>
                                      </View>
                                    )}

                                    {/* <ScrollView
                                    horizontal
                                    style={{
                                      flexDirection: 'row',
                                      marginTop: 20,
                                      rowGap: 20,
                                    }}>
                                    <View style={{gap: 10}}>
                                      <AppText
                                        title={'Total Spores'}
                                        textAlignment={'center'}
                                        textSize={1.5}
                                        textColor={AppColors.BLACK}
                                        textFontWeight
                                      />
    
                                      <SpeedoMeter
                                        imgWeight={30}
                                        imgHeight={10}
                                        speedometerWidth={30}
                                        imageTop={-10}
                                        TextBottom={
                                          item.total_spores == 1
                                            ? 'Low'
                                            : item.total_spores == 2
                                            ? 'Moderate'
                                            : item.total_spores == 3
                                            ? 'High'
                                            : item.total_spores == 4
                                            ? 'Very High'
                                            : 'Low'
                                        }
                                        TempreaturePriorityFontSize={1.6}
                                      />
                                    </View>
    
                                    <View style={{gap: 10, marginLeft: 20}}>
                                      <AppText
                                        title={'Total Trees'}
                                        textAlignment={'center'}
                                        textSize={1.5}
                                        textColor={AppColors.BLACK}
                                        textFontWeight
                                      />
    
                                      <SpeedoMeter
                                        imgWeight={30}
                                        imgHeight={10}
                                        speedometerWidth={30}
                                        imageTop={-10}
                                        TextBottom={
                                          item.total_trees == 1
                                            ? 'Low'
                                            : item.total_trees == 2
                                            ? 'Moderate'
                                            : item.total_trees == 3
                                            ? 'High'
                                            : item.total_trees == 4
                                            ? 'Very High'
                                            : 'Low'
                                        }
                                        TempreaturePriorityFontSize={1.6}
                                      />
                                    </View>
    
                                    <View style={{gap: 10, marginLeft: 20}}>
                                      <AppText
                                        title={'Total Grasses'}
                                        textAlignment={'center'}
                                        textSize={1.5}
                                        textColor={AppColors.BLACK}
                                        textFontWeight
                                      />
    
                                      <SpeedoMeter
                                        imgWeight={30}
                                        imgHeight={10}
                                        speedometerWidth={30}
                                        imageTop={-10}
                                        TextBottom={
                                          item.total_grasses == 1
                                            ? 'Low'
                                            : item.total_grasses == 2
                                            ? 'Moderate'
                                            : item.total_grasses == 3
                                            ? 'High'
                                            : item.total_grasses == 4
                                            ? 'Very High'
                                            : 'Low'
                                        }
                                        TempreaturePriorityFontSize={1.6}
                                      />
                                    </View>
    
                                    <View style={{gap: 10, marginLeft: 20}}>
                                      <AppText
                                        title={'Total Weeds'}
                                        textAlignment={'center'}
                                        textSize={1.5}
                                        textColor={AppColors.BLACK}
                                        textFontWeight
                                      />
    
                                      <SpeedoMeter
                                        imgWeight={30}
                                        imgHeight={10}
                                        speedometerWidth={30}
                                        imageTop={-10}
                                        TextBottom={
                                          item.total_weeds == 1
                                            ? 'Low'
                                            : item.total_weeds == 2
                                            ? 'Moderate'
                                            : item.total_weeds == 3
                                            ? 'High'
                                            : item.total_weeds == 4
                                            ? 'Very High'
                                            : 'Low'
                                        }
                                        TempreaturePriorityFontSize={1.6}
                                      />
                                    </View>
                                  </ScrollView> */}

                                    <ScrollView
                                      horizontal
                                      contentContainerStyle={{
                                        gap: 10,
                                        marginTop: 20,
                                      }}>
                                      {activePollen?.map(newItem => {
                                        const indexes = item.current.findIndex(
                                          active =>
                                            active.scientific_name?.toLowerCase() ===
                                              newItem.name?.toLowerCase() ||
                                            active.name?.toLowerCase() ===
                                              newItem.common_name?.toLowerCase() ||
                                            (newItem.common_name
                                              ?.toLowerCase()
                                              .includes('cedar') &&
                                              active.name
                                                ?.toLowerCase()
                                                .includes('cedar')) ||
                                            (newItem.common_name
                                              ?.toLowerCase()
                                              .includes('alder') &&
                                              active.name
                                                ?.toLowerCase()
                                                .includes('alder')) ||
                                            (newItem.common_name
                                              ?.toLowerCase()
                                              .includes('birch') &&
                                              active.name
                                                ?.toLowerCase()
                                                .includes('birch')) ||
                                            (newItem.common_name
                                              ?.toLowerCase()
                                              .includes('oak') &&
                                              active.name
                                                ?.toLowerCase()
                                                .includes('oak')),
                                        );

                                        return (
                                          <View
                                            style={{
                                              gap: 10,
                                              alignItems: 'center',
                                            }}>
                                            <AppText
                                              title={newItem.common_name}
                                              textAlignment={'center'}
                                              textSize={1.5}
                                              textColor={AppColors.BLACK}
                                              textFontWeight
                                              textwidth={40}
                                              textHeight={5}
                                            />

                                            <SpeedoMeter
                                              imgWeight={30}
                                              imgHeight={10}
                                              speedometerWidth={30}
                                              imageTop={-10}
                                              TextBottom={
                                                item?.current[indexes]?.level ==
                                                1
                                                  ? 'Low'
                                                  : item?.current[indexes]
                                                      ?.level == 2
                                                  ? 'Moderate'
                                                  : item?.current[indexes]
                                                      ?.level == 3
                                                  ? 'High'
                                                  : item?.current[indexes]
                                                      ?.level == 4
                                                  ? 'Very High'
                                                  : 'None'
                                              }
                                              isPollenorSpores={
                                                item?.current[indexes]?.type
                                              }
                                              TempreaturePriorityFontSize={1.6}
                                            />
                                          </View>
                                        );
                                      })}
                                    </ScrollView>

                                    {expandedFutureKey === item.key && (
                                      <View style={{marginTop: 20}}>
                                        <FlatList
                                          data={pastPollenAndSpores}
                                          renderItem={({item, index}) => {
                                            return (
                                              <View style={{gap: 5}}>
                                                {index ===
                                                  pastpollenHeaderIndex && (
                                                  <AppText
                                                    title="Pollen"
                                                    textSize={2}
                                                    textFontWeight
                                                  />
                                                )}

                                                {index ===
                                                  sporesHeaderIndex && (
                                                  <AppText
                                                    title="Spores"
                                                    textSize={2}
                                                    marginTop={2}
                                                    textFontWeight
                                                  />
                                                )}

                                                <PointPollenSpores
                                                  PollenSporesArr={
                                                    pastPollenAndSpores
                                                  }
                                                  index={index}
                                                  item={item}
                                                  selected={selected}
                                                  containerwidth={responsiveWidth(
                                                    80,
                                                  )}
                                                />
                                              </View>
                                            );
                                          }}
                                        />
                                      </View>
                                    )}
                                  </View>
                                );
                              }}
                            />
                          ) : (
                            <View
                              style={{
                                justifyContent: 'center',
                              }}>
                              <SubscribeBar
                                title="Subscribe now to see past forecasts"
                                title2={
                                  'Upgrade to a premium subscription today to unlock past forecasts for all pollen and spores in the air for the past 14 days (First 5 days include all pollen and spores in the air. The next 9 days will show past forecasts for pollen and spores in the quick access dials).'
                                }
                                handlePress={() =>
                                  navigation.navigate('Subscription')
                                }
                              />
                            </View>
                          )}
                        </>
                      ) : selected == 'Today' ? (
                        <>
                          {isPremium ? (
                            <FlatList
                              data={sortedPollenData}
                              contentContainerStyle={{paddingBottom: 50}}
                              renderItem={({item, index}) => {
                                // console.log('setting data ===>',sortedPollenData)
                                const pollenHeaderIndex = settingData.find(
                                  h => h.title === 'Pollen',
                                )?.index;
                                const sporesHeaderIndex = settingData.find(
                                  h => h.title === 'Spores',
                                )?.index;

                                return (
                                  <View style={{gap: 8}}>
                                    {index === pollenHeaderIndex && (
                                      <AppText
                                        title="Pollen"
                                        textSize={2}
                                        textFontWeight
                                      />
                                    )}

                                    {index === sporesHeaderIndex && (
                                      <AppText
                                        title="Spores"
                                        textSize={2}
                                        marginTop={2}
                                        textFontWeight
                                      />
                                    )}

                                    <PointPollenSpores
                                      PollenSporesArr={sortedPollenData}
                                      index={index}
                                      item={item}
                                      selected={selected}
                                    />
                                  </View>
                                );
                              }}
                            />
                          ) : (
                            <>
                              <View
                                style={{
                                  justifyContent: 'center',
                                }}>
                                <SubscribeBar
                                  title="Subscribe now to see all individual pollen and spores in the air today."
                                  title2={
                                    'Upgrade to a premium subscription today to unlock forecasts for all pollen and spores in the air today and the next 3 days (example birch, grass, ragweed, Cladosporium, Alternaria and 70 more pollen and spore types).'
                                  }
                                  handlePress={() =>
                                    navigation.navigate('Subscription')
                                  }
                                />
                              </View>
                            </>
                          )}
                        </>
                      ) : selected == 'Future' ? (
                        <>
                          {isfutureArray?.length > 0 && (
                            <FlatList
                              data={isfutureArray}
                              contentContainerStyle={{paddingBottom: 50}}
                              renderItem={({item, index}) => {
                                const futurePollenAndSpores =
                                  item?.current?.sort((a, b) => {
                                    if (a.type !== b.type) {
                                      return a.type === 'pollen' ? -1 : 1;
                                    }
                                    if (b.level !== a.level) {
                                      return b.level - a.level;
                                    }
                                    const nameA = a.common_name || a.name || '';
                                    const nameB = b.common_name || b.name || '';
                                    return nameA.localeCompare(nameB);
                                  });

                                // console.log('item, future', item);

                                const FuturefreeData = [
                                  {
                                    id: 0,
                                    name: 'Total Pollen',
                                    value: item?.average,
                                    type: 'pollen',
                                  },
                                  {
                                    id: 1,
                                    name: 'Total Spores',
                                    value: item?.total_spores,
                                    type: 'spore',
                                  },
                                  {
                                    id: 2,
                                    name: 'Total Trees',
                                    value: item?.total_trees,
                                    type: 'pollen',
                                  },
                                  {
                                    id: 3,
                                    name: 'Total Grasses',
                                    value: item?.total_grasses,
                                    type: 'pollen',
                                  },
                                  {
                                    id: 4,
                                    name: 'Total Weeds',
                                    value: item?.total_weeds,
                                    type: 'pollen',
                                  },
                                ];

                                const pollenHeaderIndex =
                                  futurePollenAndSpores.findIndex(
                                    i => i.type === 'pollen',
                                  );
                                const sporesHeaderIndex =
                                  futurePollenAndSpores.findIndex(
                                    i => i.type === 'spore',
                                  );

                                return (
                                  <View
                                    style={{
                                      borderWidth: 1,
                                      borderTopRightRadius: index == 0 ? 10 : 0,
                                      borderTopLeftRadius: index == 0 ? 10 : 0,
                                      borderBottomRightRadius:
                                        index == isfutureArray?.length - 1
                                          ? 10
                                          : 0,
                                      borderBottomLeftRadius:
                                        index == isfutureArray?.length - 1
                                          ? 10
                                          : 0,
                                      padding: 20,
                                      alignItems: 'flex-start',
                                      justifyContent: 'space-between',
                                      borderBottomWidth:
                                        index == isfutureArray?.length - 1
                                          ? 1
                                          : 0,
                                    }}>
                                    <TouchableOpacity
                                      onPress={() => {
                                        if (isPremium) {
                                          if (expandedFutureKey === item.key) {
                                            setExpandedFutureKey(null); // Collapse if already expanded
                                          } else {
                                            setExpandedFutureKey(item.key); // Expand only this one
                                          }
                                        } else {
                                          console.log('Please Subscribe');
                                        }
                                      }}
                                      style={{
                                        flexDirection: 'row',
                                        gap: 10,
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: responsiveWidth(80),
                                      }}>
                                      <View
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          gap: 5,
                                        }}>
                                        <View
                                          style={{
                                            height: 20,
                                            width: 20,
                                            borderRadius: 200,
                                            borderWidth: 1,
                                            borderColor: getThBgColour(
                                              item?.label,
                                            ),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}>
                                          <View
                                            style={{
                                              height: 15,
                                              width: 15,
                                              borderRadius: 200,
                                              backgroundColor: getThBgColour(
                                                item?.label,
                                              ),
                                            }}
                                          />
                                        </View>

                                        <AppText
                                          title={item.key}
                                          textSize={2}
                                          textColor={AppColors.BLACK}
                                          textFontWeight
                                        />
                                      </View>

                                      <AntDesign
                                        name={'plus'}
                                        size={responsiveFontSize(3)}
                                        color={AppColors.BLACK}
                                      />
                                    </TouchableOpacity>

                                    <ScrollView
                                      horizontal
                                      contentContainerStyle={{
                                        gap: 10,
                                        marginTop: 20,
                                      }}>
                                      {isPremium ? (
                                        <>
                                          {activePollen?.map(newItem => {
                                            const indexes =
                                              item.current.findIndex(
                                                active =>
                                                  active.scientific_name?.toLowerCase() ===
                                                    newItem.name?.toLowerCase() ||
                                                  active.name?.toLowerCase() ===
                                                    newItem.common_name?.toLowerCase() ||
                                                  (newItem.common_name
                                                    ?.toLowerCase()
                                                    .includes('cedar') &&
                                                    active.name
                                                      ?.toLowerCase()
                                                      .includes('cedar')) ||
                                                  (newItem.common_name
                                                    ?.toLowerCase()
                                                    .includes('alder') &&
                                                    active.name
                                                      ?.toLowerCase()
                                                      .includes('alder')) ||
                                                  (newItem.common_name
                                                    ?.toLowerCase()
                                                    .includes('birch') &&
                                                    active.name
                                                      ?.toLowerCase()
                                                      .includes('birch')) ||
                                                  (newItem.common_name
                                                    ?.toLowerCase()
                                                    .includes('oak') &&
                                                    active.name
                                                      ?.toLowerCase()
                                                      .includes('oak')),
                                              );

                                            return (
                                              <View
                                                style={{
                                                  gap: 10,
                                                  alignItems: 'center',
                                                }}>
                                                <AppText
                                                  title={newItem.common_name}
                                                  textAlignment={'center'}
                                                  textSize={1.5}
                                                  textColor={AppColors.BLACK}
                                                  textFontWeight
                                                  textwidth={40}
                                                  textHeight={5}
                                                />

                                                <SpeedoMeter
                                                  imgWeight={30}
                                                  imgHeight={10}
                                                  speedometerWidth={30}
                                                  imageTop={-10}
                                                  TextBottom={
                                                    item?.current[indexes]
                                                      ?.level == 1
                                                      ? 'Low'
                                                      : item?.current[indexes]
                                                          ?.level == 2
                                                      ? 'Moderate'
                                                      : item?.current[indexes]
                                                          ?.level == 3
                                                      ? 'High'
                                                      : item?.current[indexes]
                                                          ?.level == 4
                                                      ? 'Very High'
                                                      : 'None'
                                                  }
                                                  isPollenorSpores={
                                                    item?.current[indexes]?.type
                                                  }
                                                  TempreaturePriorityFontSize={
                                                    1.6
                                                  }
                                                />
                                              </View>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        <>
                                          {FuturefreeData.map(newItem => {
                                            return (
                                              <View style={{gap: 10}}>
                                                <AppText
                                                  title={newItem?.name}
                                                  textAlignment={'center'}
                                                  textSize={1.5}
                                                  textColor={AppColors.BLACK}
                                                  textFontWeight
                                                  textwidth={40}
                                                  textHeight={6}
                                                />

                                                <SpeedoMeter
                                                  imgWeight={30}
                                                  imgHeight={10}
                                                  speedometerWidth={30}
                                                  imageTop={-10}
                                                  TextBottom={
                                                    newItem?.value == 1
                                                      ? 'Low'
                                                      : newItem?.value == 2
                                                      ? 'Moderate'
                                                      : newItem?.value == 3
                                                      ? 'High'
                                                      : newItem?.value == 4
                                                      ? 'Very High'
                                                      : 'None'
                                                  }
                                                  isPollenorSpores={
                                                    newItem.type
                                                  }
                                                  TempreaturePriorityFontSize={
                                                    1.6
                                                  }
                                                />
                                              </View>
                                            );
                                          })}
                                        </>
                                      )}
                                    </ScrollView>

                                    {expandedFutureKey === item.key && (
                                      <View style={{marginTop: 20}}>
                                        <FlatList
                                          data={futurePollenAndSpores}
                                          renderItem={({item, index}) => {
                                            return (
                                              <View style={{gap: 5}}>
                                                {index ===
                                                  pollenHeaderIndex && (
                                                  <AppText
                                                    title="Pollen"
                                                    textSize={2}
                                                    textFontWeight
                                                  />
                                                )}

                                                {index ===
                                                  sporesHeaderIndex && (
                                                  <AppText
                                                    title="Spores"
                                                    textSize={2}
                                                    marginTop={2}
                                                    textFontWeight
                                                  />
                                                )}

                                                <PointPollenSpores
                                                  PollenSporesArr={
                                                    futurePollenAndSpores
                                                  }
                                                  index={index}
                                                  item={item}
                                                  selected={selected}
                                                  containerwidth={responsiveWidth(
                                                    80,
                                                  )}
                                                />
                                              </View>
                                            );
                                          }}
                                        />
                                      </View>
                                    )}
                                  </View>
                                );
                              }}
                            />
                          )}
                        </>
                      ) : null}
                    </>
                  )}
                </ScrollView>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 15,
                }}>
                <AppText
                  title={'No Cities Found'}
                  textSize={2.5}
                  textColor={AppColors.BLACK}
                />
                <AppButton
                  textColor={AppColors.WHITE}
                  textFontWeight
                  title={'Please add city'}
                  textSize={2}
                  handlePress={() => navigation.navigate('AddCity')}
                />

                <AppButton
                  textColor={AppColors.WHITE}
                  textFontWeight
                  title={'Get Current Location'}
                  textSize={2}
                  isLoading={fetchingCurrentLocation}
                  loadingColour={AppColors.WHITE}
                  handlePress={() => getCurrentLocation()}
                />
                {fetchingCurrentLocation && (
                  <AppText
                    title={'Fetching current location please wait...'}
                    textSize={2}
                    textColor={AppColors.BLACK}
                    textAlignment={'center'}
                  />
                )}
              </View>
            )}
          </>
        )}
        {!isPremium && (
          <View style={styles.adContainer}>
            <BannerAd
              unitId={bannerAdUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
              onAdLoaded={() => {
                console.log('Banner ad loaded');
              }}
              onAdFailedToLoad={error => {
                console.error('Banner ad failed to load: ', error);
              }}
            />
          </View>
        )}
      </LinearGradient>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
