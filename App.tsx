// import {View, Text, SafeAreaView} from 'react-native';
// import React, { useEffect } from 'react';
// import {NavigationContainer} from '@react-navigation/native';
// import Routes from './src/routes/Routes';
// import {store} from './src/redux/store';
// import {Provider} from 'react-redux';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import Toast from 'react-native-toast-message';
// import messaging from '@react-native-firebase/messaging'
// import notifee from '@notifee/react-native';


// const App = () => {
//     useEffect(() => {
//     const unsubscribe = messaging().onMessage(async (message: any) => {

//       console.log("message?.data",message?.notification)
//       if (message?.notification) {
//         await notifee.displayNotification(message?.notification);
//       }
//     });

//     return unsubscribe;
//   }, []);


//   return (

//     <Provider store={store}>
//       <NavigationContainer>
//         <Routes />
//       <Toast/>
//       </NavigationContainer>
//     </Provider>


//   );
// };

// export default App;


import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Routes from './src/routes/Routes';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { Platform, SafeAreaView, StatusBar, View } from 'react-native';
import AppColors from './src/utils/AppColors';
import { responsiveWidth } from './src/utils/Responsive_Dimensions';
import NetInfo from '@react-native-community/netinfo'
import AppText from './src/components/AppTextComps/AppText';
import mobileAds from 'react-native-google-mobile-ads';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';


const App = () => {
  const [isInternetConnected, settInterenetConnected] = useState(true)



  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob initialized');
      });
  }, []);

  useEffect(() => {
    // Create channel on start
    async function setup() {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
        await messaging().requestPermission();
      }
      await notifee.requestPermission();
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: 4, // HIGH
      });
    }
    setup();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async message => {
      if (message?.notification) {
        await notifee.displayNotification({
          title: message.notification.title,
          body: message.notification.body,
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
        });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!isInternetConnected && state.isConnected) {
        // Internet restored!
        console.log('🌐 Internet restored...');
      }
      settInterenetConnected(!!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, [isInternetConnected]);

  // Initial subscription check on mount
  useEffect(() => {
    // Subscription is now handled automatically in Main.jsx restore flow
  }, []);

  // useEffect(() => {

  //   if (Platform.OS === 'ios') {
  //     iosAdsSetup()
  //   }

  // }, [])

  // const iosAdsSetup = async () => {
  //   const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
  //   if (result === RESULTS.DENIED || result === RESULTS.UNAVAILABLE) {
  //     await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
  //   }
  // }


  return (

    <Provider store={store}>
      <StatusBar barStyle={'dark-content'} />
      <NavigationContainer>
        {
          isInternetConnected == false && (

            <View style={{ height: 40, position: 'absolute', zIndex: 1, bottom: 0, backgroundColor: AppColors.DARKGRAY, width: responsiveWidth(100), alignItems: 'center', justifyContent: 'center' }}>
              <AppText title={"No Internet connection"} textColor={AppColors.WHITE} textSize={2} />
            </View>
          )
        }


        <Routes />
        <Toast />
      </NavigationContainer>
    </Provider>

  );
};

export default App;
