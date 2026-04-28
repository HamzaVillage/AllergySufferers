import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import VersionCheck from 'react-native-version-check';
import AppHeader from '../../components/AppHeader';
import AppText from '../../components/AppTextComps/AppText';
import AppColors from '../../utils/AppColors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {responsiveFontSize} from '../../utils/Responsive_Dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AppButton from '../../components/AppButton';
import Entypo from 'react-native-vector-icons/Entypo';
import {useSelector} from 'react-redux';
const More = ({navigation}) => {
  const userData = useSelector(state => state.auth.user);
  const expiry = useSelector(state => state.auth.expireDate);

  const [currentVersion, setCurrentVersion] = useState('');
  const [storeVersion, setStoreVersion] = useState('Checking...');

  useEffect(() => {
    // Get current local version
    // setCurrentVersion(VersionCheck.getCurrentVersion());

    // Fetch latest version based on platform
    if (Platform.OS === 'android') {
      VersionCheck.getLatestVersion({
        provider: 'playStore',
        packageName: 'org.aerobiology.allergySufferersV2',
      })
        .then(latestVersion => {
          setStoreVersion(latestVersion || 'N/A');
        })
        .catch(() => setStoreVersion('Error'));
    } else {
      VersionCheck.getLatestVersion({
        provider: 'appStore',
        bundleId: 'ca.aerobiology.allergysufferers',
      })
        .then(latestVersion => {
          console.log('latestVersion', latestVersion);
          setStoreVersion(latestVersion || 'N/A');
        })
        .catch(() => setStoreVersion('Error'));
    }
  }, []);

  // console.log('exipiry',expiry ? 'hello' : 'no')

  const pollens = [
    {
      id: 1,
      name: 'App Settings',
      top: true,
      onPress: () => navigation.navigate('AppSetting'),
    },
    {
      id: 2,
      name: 'Data Visualizer',
      onPress: () => navigation.navigate('Data Visualizer'),
    },
    {
      id: 3,
      name: 'Tips & Tricks',
      onPress: () => navigation.navigate('TipsTrick'),
    },
    {
      id: 4,
      name: 'Pollen Information',
      onPress: () => navigation.navigate('PollenInfoForCad'),
    },
    {id: 5, name: 'Help', onPress: () => navigation.navigate('HelpScreen')},
    {
      id: 6,
      name: 'Account',
      bottom: true,
      onPress: () => navigation.navigate('Account'),
    },
  ];

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={'dark-content'} />
      <View style={{padding: 20}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppHeader
            heading="More"
            icon={
              <Entypo
                name={'location-pin'}
                size={responsiveFontSize(2.5)}
                color={AppColors.BTNCOLOURS}
              />
            }
          />

          <View style={{gap: 10}}>
            <View style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
              <AppText title={`Name: ${userData?.user_name}`} textSize={2} />
              <AppText title={`App Version: (${storeVersion})`} textSize={2} />
            </View>
          </View>

          <View
            style={{
              padding: 10,
              backgroundColor: '#3D56F0',
              borderRadius: 10,
              marginTop: 20,
              marginBottom: 20,
            }}>
            <AppText
              title={`Subscription Status: ${expiry ? 'Premium' : 'Free'}`}
              textColor={AppColors.WHITE}
              textSize={2}
              textFontWeight
            />
          </View>

          <View style={{marginBottom: 20}}>
            <FlatList
              data={pollens}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onPress={item.onPress}
                    activeOpacity={0.8}
                    style={{
                      borderWidth: 1,
                      borderTopRightRadius: item.top ? 10 : 0,
                      borderTopLeftRadius: item.top ? 10 : 0,
                      borderBottomRightRadius: item.bottom ? 10 : 0,
                      borderBottomLeftRadius: item.bottom ? 10 : 0,
                      paddingVertical: 20,
                      paddingHorizontal: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottomWidth: item.bottom ? 1 : 0,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'center',
                      }}>
                      <AppText
                        title={item.name}
                        textSize={2}
                        textColor={AppColors.BLACK}
                        textFontWeight
                      />
                    </View>

                    <FontAwesome6
                      name={'circle-arrow-right'}
                      size={responsiveFontSize(2.5)}
                      color={'#032198'}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <AppButton
            title={'Forecast explanation'}
            bgColor={AppColors.BTNCOLOURS}
            RightColour={'#3D56F0'}
            handlePress={() => navigation.navigate('ForcastExplaination')}
          />

          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacyPolicy')}>
              <AppText
                title={'Privacy Policy'}
                textColor={AppColors.BLACK}
                textSize={1.5}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('TermsCondition')}>
              <AppText
                title={'Terms & Conditions'}
                textColor={AppColors.BLACK}
                textSize={1.5}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default More;
