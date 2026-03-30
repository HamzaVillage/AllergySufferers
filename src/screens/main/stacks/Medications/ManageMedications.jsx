import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
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
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  NestableScrollContainer,
  NestableDraggableFlatList,
} from 'react-native-draggable-flatlist';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppImages from '../../../../assets/images/AppImages';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import { ApiCallWithUserId } from '../../../../global/ApiCall';
import { saveCurrentMeds, loadCurrentMeds, saveActiveMedications, loadActiveMedications } from '../../../../global/MedicationFileCache';
import Toast from 'react-native-toast-message';
import SubscribeBar from '../../../../components/SubscribeBar';
// import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist"

const ManageMedications = ({ navigation }) => {
  const userData = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [allActiveMedicationRedux, setAllActiveMedicationRedux] = useState([]); // Maps to MyCurrentMeds
  const [ActiveMedications, setActiveMedications] = useState([]); // Maps to Records

  const isExpired = useSelector(state => state.auth.isExpired);
  const isPremium = !isExpired;
  const [savingDataLoader, setSavingDataLoader] = useState(false);

  // console.log('ActiveMedications', ActiveMedications); 

  // const [activeMedication, setActiveMedication] = useState(
  //   allActiveMedicationRedux,
  // );

  const [data3, setData3] = useState([1, 2, 3, 4]);

  const [date, setDate] = useState(new Date());
  const [activeDate, setActiveDate] = useState(null);
  const [selecteddate, setSelectedDate] = useState(
    moment().local().format('YYYY-MM-DD'),
  );
  const [open, setOpen] = useState(false);

  const [loader, setLoader] = useState(true)
  const [OtherLoader, setOtherLoader] = useState(false)

  useEffect(() => {
    const nav = navigation.addListener('focus', async () => {
      setLoader(true);
      const cachedCurrent = await loadCurrentMeds();
      const cachedActive = await loadActiveMedications();
      if (cachedCurrent) setAllActiveMedicationRedux(cachedCurrent);
      if (cachedActive) setActiveMedications(cachedActive);
      setLoader(false);
    });
    return nav;
  }, [navigation]);

  useEffect(() => {
    if (isPremium) {
      if (allActiveMedicationRedux?.length === 0) {
        getActiveMedicationsApi();
      }
      if (ActiveMedications?.length === 0) {
        getMedicationRecordsApi();
      }
    }
  }, [allActiveMedicationRedux, ActiveMedications, isPremium]);

  const deleteActiveMedicationLocal = async medData => {
    const updatedCurrent = allActiveMedicationRedux.filter(med => med.id !== medData.id);
    const updatedActive = ActiveMedications.filter(med => (med.medication_id || med.id) !== medData.id);
    
    setAllActiveMedicationRedux(updatedCurrent);
    setActiveMedications(updatedActive);
    
    await saveCurrentMeds(updatedCurrent);
    await saveActiveMedications(updatedActive);

    await ApiCallWithUserId(
      'post',
      'delete_medication',
      userData?.id,
      { data: medData.id },
    );

    Toast.show({
      type: 'success',
      text1: 'Medication Deleted',
      position: 'bottom',
      visibilityTime: 800,
    });
  };


  const sortMedication = async data => {
    setOtherLoader(true);
    const sortnow = await updateSortedCurrentDateMedsInList(ActiveMedications, data);
    setActiveMedications(sortnow);
    await saveActiveMedications(sortnow);
    setOtherLoader(false);
  };



  const updateSortedCurrentDateMedsInList = async (fullList, sortedCurrentMeds) => {
    const currentIndexes = await getCurrentDateIndexes(fullList, selecteddate);

    const newList = [...fullList]; // copy full list

    currentIndexes.forEach(({ index }, i) => {
      newList[index] = sortedCurrentMeds[i]; // replace only current date items
    });

    return newList;
  };


  const getCurrentDateIndexes = (array, dateToMatch) => {
    const targetDate = dateToMatch || moment(new Date()).format('YYYY-MM-DD');

    return array
      .map((item, index) => ({ item, index })) // attach index to each item
      .filter(({ item }) => item.date == targetDate); // keep only target date items
  };

  const currentDateMeds = ActiveMedications?.filter(
    item => item.date === selecteddate,
  );




  const getMedicationRecordsApi = async () => {
    setSavingDataLoader(true);
    try {
      const getActiveMedicationData = await ApiCallWithUserId(
        'post',
        'get_medication_records',
        userData?.id,
      );

      if (getActiveMedicationData?.entries?.items?.length > 0) {
        setActiveMedications(getActiveMedicationData?.entries?.items);
        await saveActiveMedications(getActiveMedicationData?.entries?.items);
      }
    } catch (error) {
      console.log('Error fetching medication records:', error);
    } finally {
      setSavingDataLoader(false);
    }
  };

  const getActiveMedicationsApi = async () => {
    setSavingDataLoader(true);
    try {
      const response = await ApiCallWithUserId(
        'post',
        'get_medications_active',
        userData?.id,
      );

      if (response?.data?.length > 0) {
        setAllActiveMedicationRedux(response?.data);
        await saveCurrentMeds(response?.data);
      }
    } catch (error) {
      console.log('Error fetching active medications:', error);
    } finally {
      setSavingDataLoader(false);
    }
  };




  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}>
        <View>
          {
            savingDataLoader && (
              <View>
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              </View>
            )
          }

          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
              <AppHeader heading={`Manage ${'\n'}Medications`} goBack />



              <View style={{ gap: 10 }}>
                <AppText
                  title={'Active Medication'}
                  textColor={AppColors.BLACK}
                  textFontWeight
                />

                {loader && (
                  <ActivityIndicator size={'large'} color={AppColors.BLACK} />
                )}

                {isPremium ? (
                  <>
                    {allActiveMedicationRedux?.length > 0 ? (
                      <NestableScrollContainer>
                        <NestableDraggableFlatList
                          data={allActiveMedicationRedux}
                          contentContainerStyle={{ gap: 10 }}
                          renderItem={({ item, drag, isActive }) => {
                            return (
                              <TouchableOpacity onLongPress={drag}>
                                <AppTextInput
                                  inputPlaceHolder={item.name}
                                  inputWidth={75}
                                  arrowDelete={
                                    <TouchableOpacity
                                      onPress={() =>
                                        Alert.alert(
                                          'Delete Medication',
                                          'Are you sure you want to delete this medication?',
                                          [
                                            {
                                              text: 'Cancel',
                                              onPress: () =>
                                                console.log('Cancel Pressed'),
                                              style: 'cancel',
                                            },
                                            {
                                              text: 'OK',
                                              onPress: () =>
                                                deleteActiveMedicationLocal(
                                                  item,
                                                ),
                                            },
                                          ],
                                          { cancelable: false },
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
                                    <View style={{ marginTop: 4 }}>
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
                          keyExtractor={(item, index) => (item.id || index).toString()}
                          onDragEnd={({ data }) => {
                            setAllActiveMedicationRedux(data);
                            saveCurrentMeds(data);
                          }}
                          dragEnabled={true}
                          activationDistance={10}
                        />
                      </NestableScrollContainer>
                    ) : null}
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        justifyContent: 'center',
                      }}>
                      <SubscribeBar
                        title="Subscribe now to log your medication intake as well as your own personal remedies"
                        title2={'With a premium subscription you can add and input medication you take. You can also add any unique medication or home remedies you use to the list. You can choose up to 7 medications.'}
                        handlePress={() => navigation.navigate('Subscription')}

                      />
                    </View>
                  </>
                )}
              </View>

              <View style={{ marginTop: 20, gap: 10 }}>
                {isPremium && (

                  <AppButton
                    title={'Click here to see medication list'}

                    bgColor={AppColors.BTNCOLOURS}
                    RightColour={AppColors.rightArrowCOlor}
                    handlePress={() => navigation.navigate('AddMedications')}
                    isLoading={savingDataLoader}
                  />
                )}
              </View>
            </View>
          </GestureHandlerRootView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageMedications;


