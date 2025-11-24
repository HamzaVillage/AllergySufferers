import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import AppHeader from '../../../../components/AppHeader';
import AppColors from '../../../../utils/AppColors';
import { responsiveFontSize } from '../../../../utils/Responsive_Dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AppText from '../../../../components/AppTextComps/AppText';
import { ApiCallWithUserId } from '../../../../global/ApiCall';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../../../../redux/Slices/AuthSlice';
import { clearForaCastSlive } from '../../../../redux/Slices/ForecastSlice';
import { deleteAllData } from '../../../../redux/Slices/MedicationSlice';
const Account = ({ navigation }) => {
  const [loader, setLoader] = useState()
  const userData = useSelector(state => state?.auth?.user);
  const dispatch = useDispatch()


  const pollens = [
    // {
    //   id: 1,
    //   name: 'Cancel Subscription',
    //   top: true,

    // },

    // {
    //   id: 2,
    //   name: 'Refresh Data From Server',


    // },
    {
      id: 1,
      name: 'Delete All Data',
      top: true,
      onPress: () => navigation.navigate('DeleteAllData'),

    },
    { id: 2, name: loader == true ? <ActivityIndicator /> : 'Logout', bottom: true, onPress: () => logoutFunction() },

  ];


  const logoutFunction = async () => {
    try {

      setLoader(true)
      const res = await ApiCallWithUserId('post', 'logout', userData?.id,)


      if (res?.success == true) {
        setLoader(false)
        dispatch(setLogout())
        dispatch(clearForaCastSlive())
        dispatch(deleteAllData())
        navigation.navigate("Auth")
      } else {
        setLoader(false)
      }
    } catch (error) {
      setLoader(false)
      console.log("error", error)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <AppHeader heading="Account" goBack />

      <FlatList
        data={pollens}
        renderItem={({ item }) => {
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
                padding: 20,
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


      <View
        style={{
          flexDirection: 'row',
          marginTop: 10,
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
          <AppText
            title={'Privacy Policy'}
            textColor={AppColors.BLACK}
            textSize={1.5}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("TermsCondition")}>
          <AppText
            title={'Terms & Conditions'}
            textColor={AppColors.BLACK}
            textSize={1.5}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Account;
