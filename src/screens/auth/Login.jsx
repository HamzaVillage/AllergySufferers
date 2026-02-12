import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
  PermissionsAndroid,
  Keyboard,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppColors from '../../utils/AppColors';
import AppText from '../../components/AppTextComps/AppText';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import BASE_URL from '../../utils/BASE_URL';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { CurrentLogin, setLoader } from '../../redux/Slices/AuthSlice';
import {
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { responsiveFontSize } from '../../utils/Responsive_Dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import ShowError from '../../utils/ShowError';
import SocialAuthButton from '../../components/SocialAuthButton';
import AppImages from '../../assets/images/AppImages';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import appleAuth, { AppleButton } from '@invertase/react-native-apple-authentication';


const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [SecurePassword, setSecurePassword] = useState(true)
  const loading = useSelector(state => state.auth.loader);
  const userData = useSelector(state => state.auth.user);
  const expireDate = useSelector(state => state.auth.expireDate);
  const internetConnection = useSelector(state => state?.blacklist?.isInternetConnected)


  const dispatch = useDispatch();



  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '883289455736-tnnhgadpjcv2vrn6b549583ivsicss06.apps.googleusercontent.com',
      iosClientId: '883289455736-rb0irdnv4sqo5oadkb8c1m27ohq4gshp.apps.googleusercontent.com'
    });

    if (userData?.email) {
      navigation.navigate('Main');
    }
  }, [userData]);

  // dispatch(setLoader(false))

  const LoginUser = async () => {

    if (email === '' || password === '') {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
      } else {
        Alert.prompt('Please fill all fields');
      }
      return;
    }

    if (!internetConnection) {

      return ShowError("No Internet connection", 2000)
    }
    try {

      // const token = await messaging().getToken();
      const token = await getToken(getMessaging());

      dispatch(setLoader(true));
      let data = new FormData();
      data.append('email', email);
      data.append('password', password);
      data.append('fcm_token', token);

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/allergy_data/v1/user/signin`,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: data,
      };
      if (Platform.OS == 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Allergy Sufferers',
            message: 'Allergy sufferers want to access your location',
          },
        );
      }

      dispatch(CurrentLogin(config));

    } catch (error) {
      console.log("error", error)
    }
  };

  async function onAppleButtonPress() {
    try {
      if (!internetConnection) {
        return ShowError("No Internet connection", 2000)
      }

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

      const { identityToken, fullName } = appleAuthRequestResponse;
      const name = fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : '';

      const fcmToken = await getToken(getMessaging());

      console.log("fcmToken", identityToken, name, fcmToken, credentialState)
      dispatch(setLoader(true));

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/allergy_data/v1/user/apple-auth`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          identity_token: identityToken,
          full_name: name,
          fcm_token: fcmToken,
        },
      };

      dispatch(CurrentLogin(config));
    }
    catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.log("User cancelled the login flow");
      } else {
        console.log("Apple sign in error", error);
        ShowError("Apple sign in failed", 2000);
      }
    }
  }

  const signInWithGoogle = async () => {
    try {
      if (!internetConnection) {
        return ShowError("No Internet connection", 2000)
      }
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data.idToken;

      const fcmToken = await getToken(getMessaging());

      dispatch(setLoader(true));
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/allergy_data/v1/user/google-auth`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          id_token: idToken,
          fcm_token: fcmToken,
        },
      };

      dispatch(CurrentLogin(config));

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Signing in");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available");
      } else {
        console.log("Some other error happened", error);
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS == "ios" ? 'padding' : 'height'} style={{ flex: 1 }}>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 20,
        }}>
        <AppText
          title={'Allergy Sufferers'}
          textColor={AppColors.BTNCOLOURS}
          textSize={4}
          textFontWeight
        />

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <AppText
            title={'Let’s get started'}
            textColor={AppColors.BLACK}
            textSize={2.5}
            textFontWeight
          />
          <AppText
            title={'Create an account or login to explore the most accurate pollen and spore forecasts in Canada'}
            textColor={AppColors.LIGHTGRAY}
            textSize={1.8}
            textAlignment={'center'}
          />
        </View>

        <View style={{ gap: 20, }}>
          <AppTextInput
            title="Email Address"
            inputPlaceHolder={'Enter email'}
            onChangeText={txt => setEmail(txt)}
            value={email}
            textInput={true}
          />
          <View style={{ gap: 5 }}>
            <AppTextInput
              title="Password"
              inputPlaceHolder={'Enter password'}
              onChangeText={txt => setPassword(txt)}
              value={password}
              inputWidth={72}
              secure={SecurePassword}
              textInput={true}
              password={<Ionicons name={!SecurePassword == true ? "eye" : "eye-off"} size={responsiveFontSize(2)} />}
              onEyePress={() => setSecurePassword(!SecurePassword)}
              eye={SecurePassword}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgetPassword')}>
              <AppText
                title={'Forgot Password'}
                textColor={AppColors.BLUE}
                textSize={1.8}
                textAlignment={'flex-end'}

              />
            </TouchableOpacity>
          </View>
          <View style={{ gap: 10 }}>
            <AppButton
              title={'LOGIN'}
              RightColour={AppColors.WHITE}
              handlePress={() => LoginUser()}
              isLoading={loading}
            />
            <AppButton
              title={'Create Account'}
              RightColour={AppColors.WHITE}
              handlePress={() => navigation.navigate('CreateAccount')}
            />

            <View style={{ marginVertical: 10 }}>
              <AppText
                title={'OR'}
                textAlignment={'center'}
                textSize={1.8}
                textColor={AppColors.LIGHTGRAY}
              />
            </View>

            <View style={{ gap: 15 }}>
              <SocialAuthButton
                title={'Continue with Google'}
                onPress={() => signInWithGoogle()}
                bgColor={AppColors.WHITE}
                txtColor={AppColors.BLACK}
                logo={
                  <Image
                    source={AppImages.GOOGLE}
                    style={{ height: 20, width: 20, resizeMode: 'contain' }}
                  />
                }
              />

              {Platform.OS === 'ios' && (
                // <SocialAuthButton
                //   title={'Continue with Apple'}
                //   bgColor={AppColors.BLACK}
                //   logo={
                //     <Image
                //       source={AppImages.APPLE}
                //       style={{
                //         height: 20,
                //         width: 20,
                //         resizeMode: 'contain',
                //         tintColor: 'white',
                //       }}
                //     />
                //   }
                // />
                <AppleButton
                  buttonStyle={AppleButton.Style.BLACK}
                  buttonType={AppleButton.Type.CONTINUE}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 10
                  }}
                  onPress={() => onAppleButtonPress()}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
};

export default Login;
