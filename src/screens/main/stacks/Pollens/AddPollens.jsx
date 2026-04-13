import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
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
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

const AddPollens = ({ navigation }) => {
  const userData = useSelector(state => state.auth.user);
  const [allPollens, setALlPollens] = useState([]);
  const [search, setSearch] = useState('');
  const [loader, setLoader] = useState(false);

  const isExpired = useSelector(state => state.auth.isExpired);
  const isPremium = !isExpired;

  const [PollenLoader, setPollenApiLoader] = useState(false);
  useEffect(() => {
    const nav = navigation.addListener('focus', () => {
      getAllPollens();
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

  const setPollenApi = item => {
    if (!isPremium) {
      Alert.alert(
        'Subscribe', // Title of the alert
        'Subscribe to add the pollens', // Message
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'Subscribe Now',
            onPress: () => navigation.navigate("Subscription"),
            // You can replace the above with your subscription logic
          },
        ],
        { cancelable: false },
      );
      return;
    }

    setPollenApiLoader(true);
    let data = JSON.stringify({
      data: item.id,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/set_pollens`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    axios
      .request(config)
      .then(response => {
        setPollenApiLoader(false);

        if (response.data.code == 'max-limit') {
          Toast.show({
            type: 'error',
            text1:
              'You have reached the maximum number of allowed pollen entries.',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Pollen added successfully',
            position: 'top',
          });
        }
      })
      .catch(error => {
        console.log(error.response.data.message);
        setPollenApiLoader(false);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <AppHeader heading="Add pollen and spores" goBack />

        <View style={{ gap: 10 }}>
          <AppTextInput
            inputPlaceHolder={'Search Pollens'}
            textInput={true}
            onChangeText={res => setSearch(res)}
            value={search}
          />
        </View>

        {loader && (
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: responsiveHeight(35) }}>
          {allPollens
            .filter(
              item =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.common_name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((item, index) => (
              <TouchableOpacity
                onPress={() => setPollenApi(item)}
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
                  <AppText
                    title={item.common_name}
                    textSize={1.8}
                    textwidth={70}
                  />
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
        </ScrollView>
        <Toast />
      </View>
    </SafeAreaView>
  );
};

export default AddPollens;
