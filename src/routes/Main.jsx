import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Home from '../screens/main/Home';
import AppColors from '../utils/AppColors';
import Symptom from '../screens/main/Symptom';
import More from '../screens/main/More';
import AppSetting from '../screens/main/stacks/AppSetting';
import AddCity from '../screens/main/stacks/Cities/AddCity';
import ManageCities from '../screens/main/stacks/Cities/ManageCities';
import ManagePollens from '../screens/main/stacks/Pollens/ManagePollens';
import AddPollens from '../screens/main/stacks/Pollens/AddPollens';
import ManageMedications from '../screens/main/stacks/Medications/ManageMedications';
import AddMedications from '../screens/main/stacks/Medications/AddMedications';
import FeedBack from '../screens/main/stacks/info/FeedBack';
import PrivacyPolicy from '../screens/main/stacks/info/PrivacyPolicy';
import TermsCondition from '../screens/main/stacks/info/TermsCondition';

import DeleteAllData from '../screens/main/stacks/info/DeleteAllData';
import Medication from '../screens/main/Medication';
import AppImages from '../assets/images/AppImages';
import DataVisualizer from '../screens/main/stacks/DataVisualizer';
import Account from '../screens/main/stacks/accounts/Account';
import TipsTrick from '../screens/main/stacks/Help/TipsTrick';
import PollenInfoForCad from '../screens/main/stacks/Help/PollenInfoForCad';
import HelpScreen from '../screens/main/stacks/Help/HelpScreen';
import Notification from '../screens/main/stacks/notification/Notification';
// import Subscription from '../screens/main/subscription/AppSubscription';
import ForcastExplaination from '../screens/main/stacks/forcastexplaination/ForcastExplaination';
import MedicationSample from '../screens/main/MedicationSample';
import DatavisualizerSample from '../screens/main/stacks/DatavisualizerSample';
import {responsiveHeight} from '../utils/Responsive_Dimensions';
import AppSubscription from '../screens/main/subscription/AppSubscription';
import ViewAppGuide from '../screens/main/stacks/Help/ViewAppGuide';
import ViewFreeAppGuide from '../screens/main/stacks/Help/ViewFreeAppGuide';
import {getMessaging} from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import GuideInstructionSubCatogory from '../screens/main/stacks/Help/GuideInstructionSubCatogory';
import ViewSubGuideInstruction from '../screens/main/stacks/Help/ViewSubGuideInstruction';
import {useDispatch, useSelector} from 'react-redux';
import {
  initConnection,
  getAvailablePurchases,
  endConnection,
} from 'react-native-iap';
import VerifyRestoreSubscription from '../global/VerifyRestoreSubscription';
import {setSubscription, setLogout} from '../redux/Slices/AuthSlice';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Main = () => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.user);

  useEffect(() => {
    const restorePurchases = async () => {
      try {
        console.log('🔄 Checking for available purchases to restore...');
        await initConnection();
        const purchases = await getAvailablePurchases();

        if (purchases && purchases.length > 0) {
          console.log(`📦 Found ${purchases} available purchases`);
          for (const purchase of purchases) {
            const payload =
              Platform.OS === 'android'
                ? {
                    platform: 'google',
                    purchaseToken: purchase.purchaseToken,
                    productId: purchase.productId,
                  }
                : {
                    platform: 'apple',
                    signedTransactionInfo: purchase.transactionReceipt,
                  };

            console.log('payload>>>>>>>>', payload);

            if (userData?.id) {
              try {
                const result = await VerifyRestoreSubscription(
                  userData.id,
                  payload,
                );
                console.log('Verification Result:', result);
                if (result && (result.status === 'success' || result.attached_to_user)) {
                  const expiryDate = result.user?.expiry || result.expiry;
                  dispatch(
                    setSubscription({
                      isExpired: false,
                      expireDate: expiryDate,
                      SubscriptionType: purchase.productId,
                      transactionId:
                        Platform.OS === 'ios'
                          ? purchase.transactionId
                          : purchase.purchaseToken,
                    }),
                  );
                  console.log(
                    '✅ Subscription restored and verified for product:',
                    purchase.productId,
                  );
                } else {
                  console.log('ℹ️ Subscription verification failed or not attached');
                }
              } catch (verifyError) {
                console.error(
                  '❌ Verification failed for purchase:',
                  purchase.productId,
                  verifyError.message,
                );
                
                const errorData = verifyError.response?.data;
                if (errorData?.code === 'subscription-owned-by-another-user') {
                  Alert.alert(
                    "Subscription Already Linked",
                    "This Google subscription is already linked to another account. Proceed to link the subscription to the current account which you logged in?",
                    [
                      {
                        text: "Don't proceed",
                        style: "cancel",
                        onPress: async () => {
                          const { clearAllLocalCaches } = require('../global/ClearLocalCaches');
                          await clearAllLocalCaches();
                          dispatch(setLogout());
                        }
                      },
                      {
                        text: "Proceed",
                        onPress: async () => {
                          try {
                            const proceedPayload = { ...payload, type: 'proceed' };
                            const proceedResult = await VerifyRestoreSubscription(userData.id, proceedPayload);
                            if (proceedResult && (proceedResult.status === 'success' || proceedResult.attached_to_user)) {
                              const expiryDate = proceedResult.user?.expiry || proceedResult.expiry;
                              dispatch(
                                setSubscription({
                                  isExpired: false,
                                  expireDate: expiryDate,
                                  SubscriptionType: purchase.productId,
                                  transactionId:
                                    Platform.OS === 'ios'
                                      ? purchase.transactionId
                                      : purchase.purchaseToken,
                                }),
                              );
                              console.log('✅ Subscription restored and verified after proceed.');
                            }
                          } catch (proceedError) {
                            console.error('❌ Verification failed after proceed:', proceedError?.response?.data || proceedError.message);
                          }
                        }
                      }
                    ]
                  );
                }
              }
            }
          }
        } else {
          console.log('ℹ️ No available purchases found to restore');
        }
      } catch (err) {
        console.error('❌ Error in automated restorePurchases:', err);
      }
    };

    if (userData?.id) {
      restorePurchases();
    }
  }, [userData?.id]);

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={MyTabs} />

      <Stack.Screen name="FeedBack" component={HomeWithSafeArea(FeedBack)} />
      <Stack.Screen
        name="PrivacyPolicy"
        component={HomeWithSafeArea(PrivacyPolicy)}
      />
      <Stack.Screen
        name="TermsCondition"
        component={HomeWithSafeArea(TermsCondition)}
      />
      <Stack.Screen
        name="PollenInfoForCad"
        component={HomeWithSafeArea(PollenInfoForCad)}
      />
      <Stack.Screen
        name="DeleteAllData"
        component={HomeWithSafeArea(DeleteAllData)}
      />
      <Stack.Screen
        name="DataVisualizer"
        component={HomeWithSafeArea(DatavisualizerSample)}
      />
      <Stack.Screen
        name="ForcastExplaination"
        component={HomeWithSafeArea(ForcastExplaination)}
      />
      <Stack.Screen
        name="Subscription"
        component={HomeWithSafeArea(AppSubscription)}
      />

      {/* setting screen */}
      <Stack.Screen name="More" component={HomeWithSafeArea(More)} />
      <Stack.Screen name="Account" component={HomeWithSafeArea(Account)} />
      <Stack.Screen
        name="ViewAppGuide"
        component={HomeWithSafeArea(ViewAppGuide)}
      />
      <Stack.Screen
        name="ViewFreeAppGuide"
        component={HomeWithSafeArea(ViewFreeAppGuide)}
      />

      <Stack.Screen
        name="HelpScreen"
        component={HomeWithSafeArea(HelpScreen)}
      />

      <Stack.Screen
        name="Notification"
        component={HomeWithSafeArea(Notification)}
      />

      <Stack.Screen
        name="AppSetting"
        component={HomeWithSafeArea(AppSetting)}
      />
      <Stack.Screen name="AddCity" component={HomeWithSafeArea(AddCity)} />
      <Stack.Screen
        name="ManageCities"
        component={HomeWithSafeArea(ManageCities)}
      />
      <Stack.Screen
        name="ManagePollens"
        component={HomeWithSafeArea(ManagePollens)}
      />
      <Stack.Screen
        name="AddPollens"
        component={HomeWithSafeArea(AddPollens)}
      />
      <Stack.Screen
        name="ManageMedications"
        component={HomeWithSafeArea(ManageMedications)}
      />
      <Stack.Screen
        name="AddMedications"
        component={HomeWithSafeArea(AddMedications)}
      />
      <Stack.Screen name="TipsTrick" component={HomeWithSafeArea(TipsTrick)} />
      <Stack.Screen
        name="GuideInstructionSubCatogory"
        component={HomeWithSafeArea(GuideInstructionSubCatogory)}
      />
      <Stack.Screen
        name="ViewSubGuideInstruction"
        component={HomeWithSafeArea(ViewSubGuideInstruction)}
      />
    </Stack.Navigator>
  );
};

function MyTabs() {
  const navigationRef = useNavigation();
  useEffect(() => {
    // When app is in background

    const unsubscribe = getMessaging().onNotificationOpenedApp(
      remoteMessage => {
        // console.log("remoteMessage",remoteMessage)
        navigationRef.reset({
          index: 0,
          routes: [{name: 'Home'}], // Always open Home
        });
      },
    );

    // // When app is opened from quit state
    // getMessaging()
    //   .getInitialNotification()
    //   .then(remoteMessage => {
    //     if (remoteMessage) {
    //       console.log("iital remoteMessage",remoteMessage)
    //       navigationRef.reset({
    //         index: 0,
    //         routes: [{ name: 'Home' }],
    //       });
    //     }
    //   });

    return unsubscribe;
  }, []);

  // const   = useSafeAreaInsets();
  return (
    // <SafeAreaView style={{flex:1}}>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: AppColors.BTNCOLOURS,
          height: 90,
          paddingTop: 10,
          position: 'absolute',
          // paddingBottom: insets.bottom + 80 ,

          bottom: 0,
          zIndex: 100,
        },
      }}>
      <Tab.Screen
        name="Forecast"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => {
            return (
              <View>
                <Image
                  source={AppImages.Forcast}
                  style={{height: 30, width: 30}}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Symptoms"
        component={Symptom}
        options={{
          tabBarIcon: () => {
            return (
              <Image
                source={AppImages.SYMPTOMS}
                style={{height: 30, width: 30}}
              />
            );
          },
        }}
      />
      {/* <Tab.Screen
        name="Medication"
        component={Medication}
        options={{
          tabBarIcon: () => {
            return (
              <Image
                source={AppImages.Medication}
                style={{height: 30, width: 30}}
              />
            );
          },
        }}
      /> */}

      <Tab.Screen
        name="Medication"
        component={MedicationSample}
        options={{
          tabBarIcon: () => {
            return (
              <Image
                source={AppImages.Medication}
                style={{height: 30, width: 30}}
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="Data Visualizer"
        component={DatavisualizerSample}
        options={{
          tabBarIcon: () => {
            return (
              <Image
                source={AppImages.visualizer}
                style={{height: 30, width: 30}}
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="More"
        component={SettingTabScreen}
        options={{
          tabBarIcon: () => {
            return (
              <Image source={AppImages.More} style={{height: 30, width: 30}} />
            );
          },
        }}
      />
    </Tab.Navigator>
    // </SafeAreaView>
  );
}

// If needed, wrap MyTabs too:
const HomeWithSafeArea = Component => props => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={'light-content'} />
      <Component {...props} />
    </SafeAreaView>
  );
};

const SettingTabScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="More"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="More" component={HomeWithSafeArea(More)} />
      <Stack.Screen name="Account" component={HomeWithSafeArea(Account)} />
      <Stack.Screen
        name="HelpScreen"
        component={HomeWithSafeArea(HelpScreen)}
      />

      <Stack.Screen
        name="Notification"
        component={HomeWithSafeArea(Notification)}
      />

      <Stack.Screen
        name="AppSetting"
        component={HomeWithSafeArea(AppSetting)}
      />
      <Stack.Screen name="AddCity" component={HomeWithSafeArea(AddCity)} />
      <Stack.Screen
        name="ManageCities"
        component={HomeWithSafeArea(ManageCities)}
      />
      <Stack.Screen
        name="ManagePollens"
        component={HomeWithSafeArea(ManagePollens)}
      />
      <Stack.Screen
        name="AddPollens"
        component={HomeWithSafeArea(AddPollens)}
      />
      <Stack.Screen
        name="ManageMedications"
        component={HomeWithSafeArea(ManageMedications)}
      />
      <Stack.Screen
        name="AddMedications"
        component={HomeWithSafeArea(AddMedications)}
      />
      <Stack.Screen name="TipsTrick" component={HomeWithSafeArea(TipsTrick)} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // or AppColors.BACKGROUND
    color: AppColors.BLACK,
  },
});

export default Main;
