import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppHeader from '../../../../components/AppHeader';
import AppText from '../../../../components/AppTextComps/AppText';
import {
  responsiveFontSize,
  responsiveWidth,
} from '../../../../utils/Responsive_Dimensions';
import AppColors from '../../../../utils/AppColors';
import axios from 'axios';
import AppTextInput from '../../../../components/AppTextInput';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BASE_URL from '../../../../utils/BASE_URL';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
// import MaterialDesignIcons from 'react-native-vector-icons/MaterialDesignIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppButton from '../../../../components/AppButton';
const Notification = ({navigation}) => {
  const userData = useSelector(state => state?.auth?.user);
  const expireDate = useSelector(state => state?.auth?.expireDate);
  const allMyCity = useSelector(state => state?.medications?.allMyCity);
  const [allPollens, setALlPollens] = useState([]);
  const [search, setSearch] = useState('');
  const [loader, setLoader] = useState(false);
  const [NotificationLoader, setNotificationLoader] = useState(false);
  const [AllNotification, setAllNotification] = useState([]);
  const [PollenLoader, setPollenApiLoader] = useState(false);
  useEffect(() => {
    const nav = navigation.addListener('focus', () => {
      if (expireDate) {
        getAllPollens();
      }
      getNewNotification();
    });
    return nav;
  }, [navigation]);
  const getAllPollens = () => {
    setLoader(true);
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/get_allergy_data`,
      headers: {},
    };
    axios
      .request(config)
      .then(response => {
        setALlPollens(response?.data?.pollens_list);
        setLoader(false);
      })
      .catch(error => {
        console.log(error);
        setLoader(false);
      });
  };
  const setNewNotification = (item, level) => {
    setNotificationLoader(true);
    let data = JSON.stringify({
      level: level ? level : 1,
      scientific_name: item.name == "Total Pollen" ? "Average" : item.name,
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/set_notification`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    axios
      .request(config)
      .then(response => {
        console.log(JSON.stringify(response.data));
        setNotificationLoader(false);
        Toast.show({
          type: 'success',
          text1: 'Notification set successfully',
        });
        getNewNotification();
      })
      .catch(error => {
        console.log(error);
        setNotificationLoader(false);
      });
  };
  const getNewNotification = item => {
    setNotificationLoader(true);

    console.log("userData?.id",userData?.id)
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_notifications`,
      headers: {},
    };
    axios
      .request(config)
      .then(response => {
        console.log(JSON.stringify(response.data));
        const objectConvertArr = Object.entries(response.data.data).map(
          ([key, value]) => {
            return {name: key, count: value};
          },
        );
        setAllNotification(objectConvertArr);
        setNotificationLoader(false);
      })
      .catch(error => {
        console.log(error);
        setNotificationLoader(false);
      });
  };
  const deleteNotification = item => {
    setNotificationLoader(true);
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://www.allergysufferers.ca/wp-json/allergy_data/v1/user/${userData?.id}/remove_notification?scientific_name=${item.name}`,
      headers: {},
    };
    axios
      .request(config)
      .then(response => {
        console.log(JSON.stringify(response.data));
        getNewNotification();
      })
      .catch(error => {
        console.log(error);
        setNotificationLoader(false);
      });
  };
  const freeUserNotifications = [
    {id: 1, name: 'Total Spores'},
    {id: 2, name: 'Total Trees'},
    {id: 3, name: 'Total Grasses'},
    {id: 4, name: 'Total Weeds'},
    {id: 5, name: 'Total Pollen'},
    {id: 5, name: 'Total Pollen'},
  ];
  // console.log('all pollens list =====>', allPollens)
  return (
    <View style={{padding: 20}}>
      <AppHeader heading="Push Notification" goBack={true} />
      {/* <FlatList
    data={[]}
    /> */}
      <ScrollView
        contentContainerStyle={{flexGrow: 1, paddingBottom: 200}}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        <AppButton
          title={'Pick your city for push notification'}
          handlePress={() => navigation.navigate('ManageCities')}
        />
        {NotificationLoader == true ? (
          <ActivityIndicator size={'large'} color={AppColors.BLACK} />
        ) : (
          <View>
            <FlatList
              data={AllNotification}
              contentContainerStyle={{gap: 10, paddingBottom: 20}}
              keyExtractor={(item, index) => index.toString()}
              inverted
              renderItem={({item}) => {
                return (
                  <View
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      gap: 10,
                    }}>
                    {/* Delete Bar */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      {/* Main Title */}
                      <AppText title={item.name == "Average" ? "Total Pollen" : item.name } textSize={2} textFontWeight />
                      <TouchableOpacity
                        onPress={() => deleteNotification(item)}>
                        <MaterialIcons
                          name={'delete'}
                          size={responsiveFontSize(2.5)}
                          color={AppColors.BLACK}
                        />
                      </TouchableOpacity>
                    </View>
                    {/* Horizontal FlatList inside each notification */}
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={[
                        {id: 1, name: 'Low'},
                        {id: 2, name: 'Moderate'},
                        {id: 3, name: 'High'},
                        {id: 4, name: 'Very High'},
                      ]}
                      keyExtractor={subItem => subItem.id.toString()}
                      contentContainerStyle={{gap: 5}}
                      renderItem={({item: subItem}) => {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setNewNotification(item, subItem.id);
                            }}
                            style={{
                              height: 30,
                              paddingHorizontal: 20,
                              borderColor: AppColors.BLACK,
                              borderWidth: 1,
                              borderRadius: 200,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor:
                                subItem.id === item.count
                                  ? AppColors.BGCOLOURS
                                  : null,
                            }}>
                            <AppText title={subItem.name} textSize={1.7} />
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                );
              }}
            />
          </View>
        )}
        <View style={{marginTop: 20}} />
        <AppTextInput
          inputPlaceHolder={'Search Pollens'}
          textInput={true}
          onChangeText={res => setSearch(res)}
          value={search}
        />
        {loader && (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size={'large'} color={AppColors.BLACK} />
          </View>
        )}
        {PollenLoader && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 40,
              marginBottom: 40,
            }}>
            <ActivityIndicator size={'large'} color={AppColors.BLACK} />
          </View>
        )}
        <View contentContainerStyle={{flexGrow: 1, paddingBottom: 100}}>
          {(expireDate ? allPollens : freeUserNotifications)
            .filter(item => {
              const searchLower = search.toLowerCase();
              return (
                item?.name?.toLowerCase().includes(searchLower) ||
                (item?.common_name &&
                  item?.common_name?.toLowerCase()?.includes(searchLower))
              );
            })
            .map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setNewNotification(item)}
                style={{
                  padding: 20,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: AppColors.BLACK,
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View>
                  <AppText
                    title={item.name}
                    textSize={2}
                    textFontWeight
                    textwidth={70}
                  />
                  {item?.common_name && (
                    <AppText
                      title={item.common_name}
                      textSize={1.8}
                      textwidth={70}
                    />
                  )}
                </View>
                <View>
                  <AntDesign
                    name={'pluscircle'}
                    size={responsiveFontSize(3)}
                    color={AppColors.BTNCOLOURS}
                  />
                </View>
              </TouchableOpacity>
            ))}
        </View>
        <Toast />
      </ScrollView>
    </View>
  );
};
export default Notification;
















