import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppHeader from '../../../components/AppHeader';
import SubscriptionCard from '../../../components/SubscriptionCard';
import AppText from '../../../components/AppTextComps/AppText';
import AppColors from '../../../utils/AppColors';
import { useDispatch, useSelector } from 'react-redux';
import { setSubscription } from '../../../redux/Slices/AuthSlice';
import SubscribeNow from '../../../global/SubscribeNow';
import {
  endConnection,
  initConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  getSubscriptions,
  Subscription,
  presentCodeRedemptionSheetIOS,
  requestSubscription,
  purchaseUpdatedListener,
  finishTransaction,
  purchaseErrorListener,
  acknowledgePurchaseAndroid,
  getAvailablePurchases,
  useIAP,
  getProducts,
} from 'react-native-iap';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { hideNavigationBar } from 'react-native-navigation-bar-color';
import ShowError from '../../../utils/ShowError';

const AppSubscription = ({ navigation }) => {
  const userData = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const expireDate = useSelector(state => state.auth.expireDate);
  const isAndroid = Platform.OS === 'android'; // check platform is android or not

  const androidsubscriptionsId = ['premium_oneyear', 'premium_monthly'];
  const iosProductIds = ['allergy_month', 'allergy_year'];

  const [connection, setConnection] = useState(false); // set in-app purchase is connected or not
  const [subscriptionLocal, setSubscriptionLocal] = useState([]);
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(false);

  // const {
  //     connected,
  //     products,
  //     fetchProducts,
  //     requestPurchase,
  //     validateReceipt,
  //   } = useIAP({
  //     // onPurchaseSuccess: (purchase) => {
  //     //   console.log('Purchase successful:', purchase)
  //     //   // Handle successful purchase
  //     //   validatePurchase(purchase)
  //     // },
  //    onPurchaseError: (error) => {
  //     console.error("❌ Purchase failed:", error);
  //     if (error.code === "E_USER_CANCELLED") {
  //       Alert.alert("Purchase cancelled", "You cancelled the subscription.");
  //     } else {
  //       Alert.alert("Purchase failed", error.message || "Something went wrong");
  //     }
  //   },
  //   })

  // console.log('products ====>',products)

  // useEffect(() => {
  //   if (Platform.OS === 'ios' && connected) {
  //     fetchProducts({ skus: iosProductIds });
  //   }
  // }, [connected]);

  useEffect(() => {
    const setup = async () => {
      const result = await initConnection();
      // console.log('IAP connected?', result);
      setConnection(result);

      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
      }
    };

    setup();

    return () => {
      endConnection();
    };
  }, []);

  useEffect(() => {
    if (connection) {
      if (isAndroid) {
        getSubscriptionInfo();
      } else {
        getSubscriptionInfoIOS();
      }
    }
  }, [connection]);

  // const onRestorePurchase = async () => {
  //   // if (Platform.OS == 'android') {
  //     setLoading(true);
  //     try {
  //       // const purchases = await RNIap.getAvailablePurchases();
  //       const purchases = await getAvailablePurchases();

  //     return  console.log('purchase', purchases);

  //       if (purchases.length > 0) {
  //         navigation.navigate('Login');
  //       } else {
  //         Alert.alert(
  //           'Please buy the subscription',
  //           'You have to buy the subscription first to continue',
  //         );
  //       }
  //     } catch (e) {
  //       console.error('Failed to restore purchases:', e);
  //     } finally {
  //       setLoading(false);
  //     }
  //   // } else {
  //     // setLoading(true);
  //     // try {
  //     //   const customerInfo = await Purchases.restorePurchases();
  //     //   console.log('restore', customerInfo.entitlements.active);
  //     //   if (
  //     //     Object.keys(customerInfo.entitlements.active).length > 0 &&
  //     //     !context?.token
  //     //   ) {
  //     //     // note('Purchases Restored!', 'Your subscription has been restored successfully');
  //     //     navigation.navigate('Message', {
  //     //       theme: 'light',
  //     //       title: 'Login Required',
  //     //       message:
  //     //         'To access your subscription benefits, please create or log in to your account',
  //     //       screen: 'Login',
  //     //     });
  //     //     // navigation.replace('Home');
  //     //   } else if (
  //     //     Object.keys(customerInfo.entitlements.active).length > 0 &&
  //     //     context?.token
  //     //   ) {
  //     //     note(
  //     //       'Purchases Restored!',
  //     //       'Your subscription has been restored successfully',
  //     //     );
  //     //   } else {
  //     //     note(
  //     //       'Please buy the subscription',
  //     //       'You have to buy the subscription first to continue',
  //     //     );
  //     //   }
  //     // } catch (e) {
  //     //   console.error('Failed to restore purchases:', e);
  //     // } finally {
  //     //   setLoading(false);
  //     // }
  //   // }
  // };

  const onRestorePurchase = async () => {
    setLoading(true);
    try {
      const purchases = await getAvailablePurchases({
        onlyIncludeActiveItemsIOS: true,
      });

      // console.log('purchases response', purchases);

      if (purchases.length > 0) {
        // const validPurchases = purchases.filter((p) =>
        //   iosProductIds.includes(p.productId)
        // );
        // for (let purchase of validPurchases) {
        if (userData?.email) {
          try {
            const subscribeApi = await SubscribeNow(
              purchases[0].productId === 'allergy_month' ? 'monthly' : 'yearly',
              userData?.id,
              purchases[0].originalTransactionIdentifierIOS,
            );
            dispatch(
              setSubscription({
                isExpired: false,
                SubscriptionType: purchases[0]?.productId,
                expireDate: subscribeApi.expiry,
                transactionId: purchases[0]?.originalTransactionIdentifierIOS,
              }),
            );
            Toast.show({
              type: 'success',
              text1: 'Your subscription has been restored!',
            });
            navigation.navigate('Home');
          } catch (error) {
            ShowError(error);
          }
        } else {
          Toast.show({
            type: 'success',
            text1: 'Please create or login to enjoy the subscription',
          });
          dispatch(
            setSubscription({
              isExpired: false,
              SubscriptionType: purchases[0].productId,
              expireDate: moment().add(1, 'month').format('YYYY-MM-DD'),
              transactionId: purchases[0].originalTransactionIdentifierIOS,
            }),
          );
          navigation.navigate('GetStarted');
        }
      } else {
        Alert.alert(
          'No Purchases',
          'Please buy a subscription first to continue.',
        );
      }
    } catch (e) {
      console.error('Failed to restore purchases:', e);
      Alert.alert('Error', 'Could not restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  const NoSubscription = () => {
    if (userData?.email) {
      navigation.navigate('Main');
    } else {
      navigation.navigate('Login');
    }
  };

  const getSubscriptionInfoIOS = async () => {
    try {
      const products = await getSubscriptions({ skus: iosProductIds });
      console.log('products from appstore ===>', products);
      setSubscriptionLocal(products);
    } catch (error) {
      console.error('Error fetching iOS products:', error);
    }
  };

  const getSubscriptionInfo = async () => {
    try {
      const subscriptions = await getSubscriptions({
        skus: androidsubscriptionsId,
      });

      setSubscriptionLocal(subscriptions);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };

  const subscribeNow = async (data, isExpired, type) => {
    //  return console.log('item ===>',data)
    try {
      if (Platform.OS == 'android') {
        if (userData?.email) {
          // navigation.navigate('Home');
          // return
          const offerToken = data?.subscriptionOfferDetails[0]?.offerToken;

          const purchaseData = await requestSubscription({
            sku: data?.productId,
            ...(offerToken && {
              subscriptionOffers: [{ sku: data?.productId, offerToken }],
            }),
          });
          // console.log('offerToken', purchaseData);

          if (purchaseData.length > 0) {
            const subscribeApi = await SubscribeNow(
              purchaseData[0]?.productId == 'premium_monthly'
                ? 'monthly'
                : 'yearly',
              userData?.id,
            );

            dispatch(
              setSubscription({
                isExpired: false,
                SubscriptionType: purchaseData[0]?.productId,
                expireDate: subscribeApi.expiry,
              }),
            );
            navigation.navigate('Home');
          }
        } else {
          const offerToken = data?.subscriptionOfferDetails[0]?.offerToken;
          const purchaseData = await requestSubscription({
            sku: data?.productId,
            ...(offerToken && {
              subscriptionOffers: [{ sku: data?.productId, offerToken }],
            }),
          });

          if (purchaseData.length > 0) {
            Toast.show({
              type: 'success',
              text1:
                'Please create or login to account to enjoy the subscription',
            });

            dispatch(
              setSubscription({
                isExpired: false,
                SubscriptionType: purchaseData[0]?.productId,
                expireDate: moment().add(1, 'month').format('YYYY-MM-DD'),
              }),
            );
            navigation.navigate('GetStarted');
          }
        }
      } else {
        const purchaseData = await requestSubscription({
          sku: data?.productId,
        });

        if (purchaseData) {
          console.log('📦 iOS purchase data =>', purchaseData);

          if (userData?.email) {
            const subscribeApi = await SubscribeNow(
              data?.productId === 'allergy_month' ? 'monthly' : 'yearly',
              userData?.id,
              purchaseData?.originalTransactionIdentifierIOS,
            );
            dispatch(
              setSubscription({
                isExpired: false,
                SubscriptionType: data?.productId,
                expireDate: subscribeApi.expiry,
                transactionId: purchaseData?.originalTransactionIdentifierIOS,
              }),
            );
            navigation.navigate('Home');
          } else {
            Toast.show({
              type: 'success',
              text1: 'Please create or login to enjoy the subscription',
            });

            dispatch(
              setSubscription({
                isExpired: false,
                SubscriptionType: data?.productId,
                expireDate: moment().add(1, 'month').format('YYYY-MM-DD'),
                transactionId: purchaseData?.originalTransactionIdentifierIOS,
              }),
            );
            navigation.navigate('GetStarted');
          }
        }
      }
    } catch (error) {
      console.error('Error in subscribeNow:', error);
      Alert.alert('Error', 'Something went wrong during subscription.');
    }

    // return;
  };

  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async purchase => {
        const receipt = purchase.transactionReceipt;

        if (receipt) {
          try {
            if (Platform.OS === 'android') {
              if (!purchase.isAcknowledgedAndroid) {
                await acknowledgePurchaseAndroid({
                  token: purchase.purchaseToken,
                });
                await finishTransaction({ purchase, isConsumable: false });
              }
            } else {
              await finishTransaction({
                purchase: purchase,
                isConsumable: false,
              });
            }

            console.log('Purchase finished/acknowledged ✅');
          } catch (err) {
            console.warn('finishTransaction error', err);
          }
        }
      },
    );

    const purchaseErrorSubscription = purchaseErrorListener(error => {
      console.warn('purchaseErrorListener', error);
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 200 }}>
      <AppHeader goBack={true} heading="Subscription" />

      <View style={{ gap: 20 }}>
        <View style={{ marginTop: 0, gap: 2 }}>
          <AppText
            title={`Benefits`}
            textSize={2}
            textFontWeight
            textColor={AppColors.BLACK}
          />

          <AppText
            title={`- Get 7 day forecasts including today for all pollen and spores in the air`}
            textSize={1.8}
            textColor={AppColors.BLACK}
          />
          <AppText
            title={`- See past forecasts up to 14 days (5 days with everything in the air)`}
            textSize={1.8}
            textColor={AppColors.BLACK}
          />
          <AppText
            title={`- Get push notifications for the pollen and spores you want and levels`}
            textSize={1.8}
            textColor={AppColors.BLACK}
          />

          <AppText
            title={`- Log your symptoms, medication and graph in the data visualizer`}
            textSize={1.8}
            textColor={AppColors.BLACK}
          />

          <AppText
            title={`- Your choice of a yearly subscription ( whole pollen and spore season) or monthly option aswell`}
            textSize={1.8}
            textColor={AppColors.BLACK}
          />
        </View>

        {isAndroid ? (
          <FlatList
            contentContainerStyle={{ gap: 10 }}
            data={subscriptionLocal}
            renderItem={({ item }) => {
              const priceObjectIndex =
                item?.subscriptionOfferDetails[0]?.pricingPhases
                  ?.pricingPhaseList?.length;
              const PriceArray =
                item?.subscriptionOfferDetails[0]?.pricingPhases
                  ?.pricingPhaseList[priceObjectIndex - 1];
              return (
                <SubscriptionCard
                  isAndroid={true}
                  title={item?.displayName}
                  price={PriceArray?.formattedPrice}
                  type={
                    PriceArray?.billingPeriod == 'P1M' ? 'monthly' : 'yearly'
                  }
                  subscribeNow={() => subscribeNow(item, false, 'month')}
                />
              );
            }}
          />
        ) : (
          <FlatList
            contentContainerStyle={{ gap: 10 }}
            data={subscriptionLocal}
            renderItem={({ item }) => {
              const displayName =
                item?.title === '1 month localization'
                  ? 'AllergySufferers - One Month Premium Membership'
                  : 'AllergySufferers - One Year Premium Membership';
              return (
                <SubscriptionCard
                  title={displayName}
                  price={item?.currency + ' ' + item?.price}
                  type={
                    item?.productId === 'allergy_month' ? 'monthly' : 'yearly'
                  }
                  subscribeNow={() => subscribeNow(item, false, 'month')}
                />
              );
            }}
          />
        )}

        {Platform.OS == 'ios' && (
          <>
            {loading == true ? (
              <ActivityIndicator size={'large'} color={AppColors.BLACK} />
            ) : (
              <TouchableOpacity onPress={() => onRestorePurchase()}>
                <AppText
                  title={'Restore Purchase'}
                  textSize={2}
                  textAlignment={'center'}
                  textColor={AppColors.BLUE}
                />
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          onPress={() => NoSubscription()}
          style={{
            marginTop: 20,
            backgroundColor: AppColors.WHITE,
            borderWidth: 1,
            borderColor: AppColors.BLACK,
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 5,
          }}>
          <AppText
            title={'If you already have a subscription please'}
            textSize={1.8}
            textColor={AppColors.BLACK}
          />
          <AppText
            title={'Login'}
            textSize={1.8}
            textFontWeight
            textColor={AppColors.BLUE}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => NoSubscription()}
          style={{
            marginTop: 15,
            backgroundColor: AppColors.BLUE,
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <AppText
            title={'Continue without subscription'}
            textSize={2}
            textFontWeight
            textColor={AppColors.WHITE}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AppSubscription;
