import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {act, useEffect, useState} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LoaderMode from '../../../../components/LoaderMode';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {ApiCallWithUserId} from '../../../../global/ApiCall';
import {
  saveCurrentMeds,
  loadCurrentMeds,
  saveActiveMedications,
  loadActiveMedications,
} from '../../../../global/MedicationFileCache';
import {GetAllMedicationFromApi} from '../../../../redux/Slices/MedicationSlice';

const AddMedications = ({navigation}) => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.user);
  const [allActiveMedicationRedux, setAllActiveMedicationRedux] = useState([]); // This maps to MyCurrentMeds in the original code
  const [ActiveMedications, setActiveMedications] = useState([]); // This maps to daily records
  const allMedication = useSelector(state => state.medications.AllMedication);

  const currentDate = moment().local().format('YYYY-MM-DD');
  const currentDateMeds = ActiveMedications?.filter(
    item => item.date === currentDate,
  );

  const isExpired = useSelector(state => state.auth.isExpired);
  const isPremium = !isExpired;

  const [medicationData, setMedicationsData] = useState([]);
  const [MedicationLoader, setMedciationLoader] = useState(false);

  const [search, setSearch] = useState('');

  const [customMecication, setCustomMedication] = useState('');
  const [customMecicationLoader, setCustomMedicationLoader] = useState(false);
  const [addYourMedication, SetAddYourMedication] = useState(false);
  const [activeDate, setActiveDate] = useState(null);

  const [date, setDate] = useState(new Date());
  const [selecteddate, setSelectedDate] = useState(
    moment().local().format('YYYY-MM-DD'),
  );
  const [open, setOpen] = useState(false);

  // console.log('selectd date ====>',selecteddate)

  useEffect(() => {
    const nav = navigation.addListener('focus', async () => {
      getMedicationApi();
      const cachedCurrentMeds = await loadCurrentMeds();
      const cachedActiveMeds = await loadActiveMedications();
      if (cachedCurrentMeds) setAllActiveMedicationRedux(cachedCurrentMeds);
      if (cachedActiveMeds) setActiveMedications(cachedActiveMeds);
    });
    return nav;
  }, [navigation]);

  const getMedicationApi = () => {
    if (allMedication.length > 0) {
      setMedciationLoader(false);
    } else {
      setMedciationLoader(true);
    }

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_medications`,
      headers: {},
    };

    axios
      .request(config)
      .then(async response => {
        // console.log(JSON.stringify(response.data));
        dispatch(GetAllMedicationFromApi(response.data.data));
        setMedicationsData(response.data.data);
        setMedciationLoader(false);
        const MedicationData = await ApiCallWithUserId(
          'post',
          'get_active_date',
          userData?.id,
        );
        const activeDateStr = MedicationData?.active_date
          ? MedicationData?.active_date
          : moment(new Date()).format('YYYY-MM-DD');
        setActiveDate(new Date(activeDateStr));
      })
      .catch(error => {
        console.log(error);
        setMedciationLoader(false);
      });
  };

  // const AddMedicationActive = medicationdata => {
  //   if (medicationdata.id === 6082) {
  //     console.log('other', medicationdata);
  //     SetAddYourMedication(true);
  //     return;
  //   }

  //   setMedciationLoader(true);
  //   let data = JSON.stringify({
  //     data: [medicationdata.id],
  //   });

  //   let config = {
  //     method: 'post',
  //     maxBodyLength: Infinity,
  //     url: `${BASE_URL}/allergy_data/v1/user/${userData.id}/set_medications`,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Cache-Control': 'no-cache',
  //       Pragma: 'no-cache',
  //       Expires: '0',
  //     },
  //     data: data,
  //   };

  //   axios
  //     .request(config)
  //     .then(response => {
  //       console.log(JSON.stringify(response.data));
  //       setMedciationLoader(false);
  //       Toast.show({
  //         type: 'success',
  //         text1: 'Medication added successfully',
  //       });
  //     })
  //     .catch(error => {
  //       setMedciationLoader(false);
  //       console.log(error);
  //     });
  // };

  const AddMedicationActive = medicationdata => {
    // console.log("expireDate",expireDate)

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
            onPress: () => navigation.navigate('Subscription'),
            // You can replace the above with your subscription logic
          },
        ],
        {cancelable: false},
      );
      return;
    }

    if (medicationdata.id === 6082) {
      SetAddYourMedication(true);
      return;
    }

    if (allActiveMedicationRedux.length >= 7) {
      Toast.show({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'You can only have 7 medications. Please delete one first.',
        position: 'bottom',
        visibilityTime: 1500,
      });
      return;
    }

    // Show confirmation alert
    Alert.alert(
      'Confirm Medication',
      `Are you sure you want to add "${medicationdata.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            setMedciationLoader(true);

            let data = JSON.stringify({
              data: [medicationdata.id],
              date: selecteddate, // <- Send selected date to API if needed
            });

            let config = {
              method: 'post',
              maxBodyLength: Infinity,
              url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/set_medications`,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Expires: '0',
              },
              data: data,
            };

            axios
              .request(config)
              .then(response => {
                // console.log(JSON.stringify(response.data));
                setMedciationLoader(false);
                Toast.show({
                  type: 'success',
                  text1: 'Medication added successfully',
                  position: 'bottom',
                  visibilityTime: 800,
                });
              })
              .catch(error => {
                setMedciationLoader(false);
                console.log(error);
              });
          },
        },
      ],
    );
  };

  const AddCustomMedication = () => {
    if (customMecication == '') {
      return Alert.alert('Please type a medication name');
    }

    if (allActiveMedicationRedux.length >= 7) {
      SetAddYourMedication(false);
      Toast.show({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'You can only have 7 medications. Please delete one first.',
        position: 'bottom',
        visibilityTime: 1500,
      });
      return;
    }

    setCustomMedicationLoader(true);

    let data = JSON.stringify({
      custom_medication: customMecication,
      date: selecteddate,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/set_medication_custom`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    axios
      .request(config)
      .then(response => {
        // console.log('what just happened', JSON.stringify(response.data));
        setCustomMedicationLoader(false);
        SetAddYourMedication(false);
        getMedicationApi();
        setCustomMedication('');
        Toast.show({
          type: 'success',
          text1: 'Custom medication added to your list.',
          position: 'bottom',
          visibilityTime: 800,
        });
      })
      .catch(error => {
        console.log('error adding custom medication', error);
        setCustomMedicationLoader(false);
        // SetAddYourMedication(false);
        Alert.alert('Some problem occured');
        // getMedicationApi();
      });
  };

  // local functionality
  const AddMedicationActiveToLocal = async medData => {
    if (!isPremium) {
      Alert.alert(
        'Subscribe',
        'Subscribe to add the pollens',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'Subscribe Now',
            onPress: () => navigation.navigate('Subscription'),
          },
        ],
        {cancelable: false},
      );
      return;
    }

    if (medData.id === 6082) {
      AddMedicationActive(medData);
      return;
    }

    if (allActiveMedicationRedux.length >= 7) {
      Toast.show({
        type: 'error',
        text1: 'Limit Reached',
        text2: 'You can only have 7 medications. Please delete one first.',
        position: 'bottom',
        visibilityTime: 1500,
      });
      return;
    }

    const exists = allActiveMedicationRedux.some(med => med.id === medData.id);
    if (exists) {
      Toast.show({
        type: 'info',
        text1: 'Already Added',
        text2: 'This medication is already in your list.',
        position: 'bottom',
        visibilityTime: 1500,
      });
      return;
    }

    // Read fresh data from cache to avoid overwriting other screens' data
    const freshCurrentMeds = (await loadCurrentMeds()) || [];
    const freshActiveMeds = (await loadActiveMedications()) || [];

    const updatedCurrentMeds = [...freshCurrentMeds, medData];
    setAllActiveMedicationRedux(updatedCurrentMeds);
    await saveCurrentMeds(updatedCurrentMeds);

    // Add to daily records for today
    const currentDay = moment().local().format('YYYY-MM-DD');
    const recordExists = freshActiveMeds.some(
      med => (med.medication_id || med.id) === medData.id && med.date === currentDay,
    );

    if (!recordExists) {
      const updatedActiveMeds = [...freshActiveMeds, {
        ...medData,
        date: currentDay,
        units: 0,
      }];
      setActiveMedications(updatedActiveMeds);
      await saveActiveMedications(updatedActiveMeds);
    }

    Toast.show({
      type: 'success',
      text1: 'Medication added to your list',
      position: 'bottom',
      visibilityTime: 800,
    });

    await ApiCallWithUserId('post', 'set_medications', userData?.id, {
      data: [medData.id],
    });
  };

  const AddMedicationToPreviousDates = medData => {
    dispatch(UpdateMedicationListOnEveryDate(medData));
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{padding: 20}}>
        <View style={{marginBottom: 10}}>
          <AppHeader heading={`Add ${'\n'}Medications`} goBack />
        </View>

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          minimumDate={activeDate ? activeDate : new Date()}
          maximumDate={new Date()}
          onConfirm={selectedDate => {
            setDate(selectedDate);
            setOpen(false);
            const picked = moment(selectedDate).startOf('day');
            const formattedDate = picked.format('YYYY-MM-DD');
            setSelectedDate(formattedDate);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />

        {MedicationLoader && <LoaderMode />}

        <Modal
          visible={addYourMedication}
          style={{padding: 20}}
          animationType="fade">
          <View style={{padding: 20}}>
            <TouchableOpacity
              style={{height: 30, width: 30}}
              onPress={() => SetAddYourMedication(false)}>
              <AppText title={'X'} textSize={3} />
            </TouchableOpacity>
            <AppText title={'Add Medication'} textSize={3} textFontWeight />

            <TextInput
              placeholder="Enter your medication name here"
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 10,
                color: AppColors.BLACK,
                marginTop: 20,
              }}
              onChangeText={txt => {
                setCustomMedication(txt);
              }}
              value={customMecication}
            />

            <View style={{marginTop: 20}}>
              <AppButton
                title={'Add Medication'}
                handlePress={() => AddCustomMedication()}
                isLoading={customMecicationLoader}
              />
            </View>
          </View>
        </Modal>

        <View style={{gap: 10}}>
          <AppTextInput
            inputPlaceHolder={'Search Medications'}
            textInput={true}
            onChangeText={text => setSearch(text)}
          />

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: responsiveHeight(80),
            }}>
            {MedicationLoader ? (
              <View style={{alignItems: 'center', marginTop: 20}}>
                <ActivityIndicator size="large" color={AppColors.BTNCOLOURS} />
                <AppText title={'Loading medications...'} marginTop={10} />
              </View>
            ) : allMedication?.length > 0 ? (
              <>
                {allMedication
                  ?.filter(item =>
                    item.name
                      ?.toLowerCase()
                      .includes(search.trim().toLowerCase()),
                  )
                  .map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === allMedication.length - 1;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => AddMedicationActiveToLocal(item)}
                        style={{
                          borderWidth: 1,
                          borderTopRightRadius: isFirst ? 10 : 0,
                          borderTopLeftRadius: isFirst ? 10 : 0,
                          borderBottomRightRadius: isLast ? 10 : 0,
                          borderBottomLeftRadius: isLast ? 10 : 0,
                          padding: 20,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderColor: AppColors.LIGHTGRAY,
                          marginTop: isFirst ? 0 : -1, // collapse borders
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 10,
                            alignItems: 'center',
                          }}>
                          <AntDesign
                            name={'pluscircle'}
                            size={responsiveFontSize(2.5)}
                            color={AppColors.BTNCOLOURS}
                          />
                          <AppText
                            title={item.name}
                            textSize={2}
                            textColor={AppColors.BLACK}
                            textFontWeight
                            textwidth={70}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 20,
                }}>
                <AppText
                  title={
                    !isPremium
                      ? 'Please buy a subscription to add medications'
                      : 'No medications found'
                  }
                  textSize={2.2}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddMedications;
