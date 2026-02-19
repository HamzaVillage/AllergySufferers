import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Animated,
  Image,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import AppHeader from '../../../components/AppHeader';
// import {BarChart, LineChart} from 'react-native-chart-kit';
import AppColors from '../../../utils/AppColors';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils/Responsive_Dimensions';
import AppText from '../../../components/AppTextComps/AppText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BASE_URL from '../../../utils/BASE_URL';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
  RadarChart,
} from 'react-native-gifted-charts';
import AppImages from '../../../assets/images/AppImages';
import SubscribeBar from '../../../components/SubscribeBar';
import GetAllLocation from '../../../global/GetAllLocation';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiCallWithUserId } from '../../../global/ApiCall';

const DataVisualizer = ({ navigation }) => {
  const screenWidth = Dimensions.get('window').width;
  const userData = useSelector(state => state.auth.user);
  const expireDate = useSelector(state => state.auth.expireDate);
  const isPremium = expireDate ? new Date() <= new Date(expireDate) : false;

  const [type, setType] = useState('allergens');
  const [medicationData, setMedicationsData] = useState();

  const [takingMedications, setTakingMedications] = useState([]);
  const [todayPollensData, setTodayPollensData] = useState([]);
  const [MedicationnRecord, setMedicationnRecord] = useState([]);

  const [pollenLoader, setPollenLoader] = useState(false);

  const [date, setDate] = useState(new Date());
  const [selecteddate, setSelectedDate] = useState(
    moment().local().format('YYYY-MM-DD'),
  );

  const colours = ['lightblue', 'lightgreen'];

  const [open, setOpen] = useState(false);

  const [PrimaryLineData, setPrimaryLineData] = useState([]);
  const [SecondaryLineData, setSecondaryLineData] = useState([]);

  const [medicationLoadingMap, setMedicationLoadingMap] = useState({});

  const [loadingItemId, setLoadingItemId] = useState(null);

  const [DataVisualizerLoader, setDataVisualizerLoader] = useState(false);
  const [allSymtoms, setAllSymtoms] = useState([]);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [allCities, setAllCities] = useState([]);
  const [pickedCity, setPickedCity] = useState();
  const [AllDayNumber, setAllDayNumber] = useState([]);
  const [activeDate, setActiveDate] = useState(null);

  useEffect(() => {
    const nav = navigation.addListener('focus', () => {
      getAllAllergens();
      getMedicationRecords();
      getSelectedAllergens();
    });

    return nav;
  }, [navigation]);

  useEffect(() => {
    getSelectedAllergens();

    if (type == 'medication') {
      getMedicationApi();
    }
  }, [selecteddate]);

  const setMedicationLoading = (id, isLoading) => {
    setMedicationLoadingMap(prev => ({ ...prev, [id]: isLoading }));
  };

  const getAllAllergens = () => {
    setType('allergens');
    setActiveDate(null);
    setPollenLoader(true);

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_all_allergens`,
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
    };

    axios
      .request(config)
      .then(response => {
        // console.log(JSON.stringify(response.data));
        setPollenLoader(false);
        setTodayPollensData(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getMedicationApi = () => {
    setType('medication');
    setPollenLoader(true);

    let data = JSON.stringify({
      date: moment(selecteddate).format('YYYY-MM-DD'),
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_medications_active`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    axios
      .request(config)
      .then(async response => {
        setMedicationsData(response?.data?.data);
        setPollenLoader(false);
        const MedicationData = await ApiCallWithUserId(
          'post',
          'get_active_date',
          userData?.id,
        );
        const activeDateStr = MedicationData?.active_date
          ? MedicationData?.active_date
          : moment(new Date()).format('YYYY-MM-DD');
        setActiveDate(new Date(activeDateStr));
        // console.log("Active Date:", activeDateStr);
      })
      .catch(error => {
        setPollenLoader(false);
        console.log(error);
      });
  };

  // const getMedicationRecords = ewformateddate => {
  //   const end = moment(ewformateddate ? ewformateddate : new Date());
  //   const start = moment(ewformateddate ? ewformateddate : new Date()).subtract(
  //     6,
  //     'days',
  //   );

  //   setStartDate(start);
  //   setEndDate(end);

  //   const data = JSON.stringify({
  //     start_date: start.format('YYYY-MM-DD'),
  //     end_date: end.format('YYYY-MM-DD'),
  //   });

  //   let config = {
  //     method: 'post',
  //     maxBodyLength: Infinity,
  //     url: `${BASE_URL}/allergy_data/v1/user/${userData.id}/get_medication_records`,
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     data: data,
  //   };

  //   axios
  //     .request(config)
  //     .then(response => {
  //       const allentriesArr = response.data.entries.items || [];

  //       const seenDates = new Set();
  //       const barData = [];

  //       allentriesArr.forEach(entry => {
  //         const formattedDate = moment(entry.date, 'MMMM, DD YYYY').format('D');
  //         const value = parseInt(entry.units) || 0;

  //         if (!seenDates.has(entry.date)) {
  //           seenDates.add(entry.date);
  //           barData.push({
  //             value,
  //             label: formattedDate,
  //             // spacing: 0,
  //             frontColor: entry.frontColor,
  //               labelWidth: 30, // ✅ Ensures each column takes 30px

  //           });
  //         } else {
  //           barData.push({
  //             value,
  //             // spacing: 0,
  //             frontColor: entry.frontColor,
  //               labelWidth: 30, // ✅ Still assign width for alignment

  //           });
  //         }
  //       });

  //       for (let i = 0; i < barData.length - 1; i++) {
  //         const current = barData[i];
  //         const next = barData[i + 1];

  //         if (!current.label && next.label && 'spacing' in current) {
  //           delete current.spacing;
  //         }
  //       }

  //       const lastItem = barData[barData.length - 1];
  //       if (lastItem && !lastItem.label && 'spacing' in lastItem) {
  //         delete lastItem.spacing;
  //       }

  //       for (let i = 0; i < barData.length; i++) {
  //         const current = barData[i];
  //         const next = barData[i + 1];

  //         if (current.label && (!next || next.label)) {
  //           // Insert a dummy
  //           barData.splice(i + 1, 0, {
  //             value: 0,
  //             frontColor: 'transparent',
  //           });
  //         }
  //       }

  //       setMedicationnRecord(barData);
  //     })
  //     .catch(error => {
  //       // setLoader(false)
  //       console.log('what no found ?', error);
  //     });
  // };

  const MAX_BARS_PER_DATE = 10;

  const getMedicationRecords = ewformateddate => {
    const end = moment(ewformateddate || new Date());
    const start = moment(ewformateddate || new Date()).subtract(6, 'days');

    setStartDate(start);
    setEndDate(end);

    const dayNumbers = [];
    let current = start.clone();

    while (current.isSameOrBefore(end)) {
      dayNumbers.push(current.date()); // e.g. returns 1, 2, 3, … for the day of the month
      current.add(1, 'day');
    }

    setAllDayNumber(dayNumbers);

    const data = JSON.stringify({
      start_date: start.format('YYYY-MM-DD'),
      end_date: end.format('YYYY-MM-DD'),
    });

    axios
      .post(
        `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_medication_records`,
        data,
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then(response => {
        const allentriesArr = response.data.entries.items || [];

        console.log(
          'allentriesArr',
          start.format('YYYY-MM-DD'),
          end.format('YYYY-MM-DD'),
        );
        const groupedByDate = {};

        // Group all bars by date
        allentriesArr.forEach(entry => {
          const formattedDate = moment(entry.date, 'MMMM, DD YYYY').format('D');
          if (!groupedByDate[formattedDate]) {
            groupedByDate[formattedDate] = [];
          }
          groupedByDate[formattedDate].push({
            value: parseInt(entry.units) || 0,
            frontColor: entry.frontColor,
          });
        });

        const barData = [];

        Object.entries(groupedByDate).forEach(([dateLabel, bars]) => {
          const group = [];

          bars.forEach((bar, index) => {
            group.push({
              value: bar.value,
              frontColor: bar.frontColor,
              label: index === 0 ? dateLabel : '',
              // labelWidth: chartSpacing,
              labelWidth: 20,
              labelTextStyle: { color: 'gray' },
              // spacing: 10,
              spacing: responsiveWidth(1.25),
            });
          });

          // Add padding bars if less than MAX_BARS_PER_DATE
          const paddingCount = MAX_BARS_PER_DATE - group.length;
          for (let i = 0; i < paddingCount; i++) {
            group.push({
              value: 0,
              frontColor: 'transparent',
              // spacing: 10,
              // labelWidth: chartSpacing,
              spacing: responsiveWidth(1.25),
              labelWidth: 20,
            });
          }

          barData.push(...group);
        });

        setMedicationnRecord(barData);
      })
      .catch(error => {
        console.log('Error fetching medication records', error);
      });
  };

  const getDataVisualizer = async selecallergens => {
    if (!selecallergens || selecallergens.length === 0) {
      // no allergens selected, clear chart data
      setPrimaryLineData([]);
      setSecondaryLineData([]);
      return;
    }

    const getCity = await AsyncStorage.getItem('isCity');
    const parseCity = JSON.parse(getCity);

    setPickedCity(parseCity);

    if (getCity) {
      setDataVisualizerLoader(true);
      const allergenParams = selecallergens
        .map(
          item =>
            `scientific_names[]=${encodeURIComponent(item.allergen_name)}`,
        )
        .join('&');
      // console.log('selecteddate', selecteddate, 'allergenParams', allergenParams);

      const dateis = moment(selecteddate)
        .subtract('days', 6)
        .format('YYYY-MM-DD');

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/data_visualizer?lat=${parseCity?.lat}&lng=${parseCity?.lng}&start_date=${dateis}&${allergenParams}`,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      };

      axios
        .request(config)
        .then(response => {
          const apiData = response.data;
          // console.log('api data of symptoms', apiData);
          setAllSymtoms(apiData.symptom_level);
          const chartLineData = {};
          Object.keys(apiData).forEach(key => {
            if (key !== 'dates' && key !== 'symptom_level') {
              chartLineData[key] = apiData[key].map(val => ({ value: val }));
            }
          });

          //edited code
          const first = selecallergens[0];
          const second = selecallergens[1];

          setPrimaryLineData(chartLineData[first?.allergen_name] || []);
          setSecondaryLineData(chartLineData[second?.allergen_name] || []);

          colours[0] = first?.chartColor || 'lightblue';
          colours[1] = second?.chartColor || 'lightgreen';

          // ....................

          setDataVisualizerLoader(false);
        })
        .then(response => {
          setDataVisualizerLoader(false);
        })
        .catch(error => {
          setDataVisualizerLoader(false);
          console.log(error);
        });
    } else {
      console.log('add city');
    }
  };

  const addAllergens = item => {
    setPollenLoader(true);

    if (takingMedications.length == 2) {
      setPollenLoader(false);
      return Alert.alert(
        'Limit Reached',
        `You can only view 2 allergens at a time. Please remove one of: ${takingMedications
          .map(item => item.allergen_name)
          .join(', ')}.`,
      );
    }

    let data = JSON.stringify({
      data: {
        allergen_name: item.name,
      },
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/set_allergens`,
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
        setPollenLoader(false);
        getSelectedAllergens();
      })
      .catch(error => {
        console.log(error);
        setPollenLoader(false);
      });
  };

  const getSelectedAllergens = () => {
    // setActiveDate(null)
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_allergens`,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    };

    axios
      .request(config)
      .then(response => {


        //edited code
        const coloredAllergens = assignColorsToAllergens(
          response.data.allergens,
          colours,
        );

        // getDataVisualizer(response.data.allergens);
        // setTakingMedications(response.data.allergens);

        //edited code
        getDataVisualizer(coloredAllergens);
        setTakingMedications(coloredAllergens);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const deleteAllergens = async item => {
    // console.log("item", item, takingMedications,"Primarylinedata", PrimaryLineData, "SecondaryLineData", SecondaryLineData)
    // return
    if (!item?.id) {
      console.warn('Invalid allergen item. Skipping delete.');
      return;
    }

    setLoadingItemId(item.id);

    try {
      const data = JSON.stringify({
        allergen_id: item.id,
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/delete_allergen`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      await axios.request(config);

      const updatedAllergens = takingMedications.filter(
        med => med.id !== item.id,
      );

      setTakingMedications(updatedAllergens);

      // console.log('updatedAllergens', updatedAllergens);

      // 🧠 Update graph based on remaining allergens
      if (updatedAllergens.length === 0) {
        setPrimaryLineData([]);
        setSecondaryLineData([]);
      } else {
        getDataVisualizer(updatedAllergens);
      }
    } catch (error) {
      console.error('Error deleting allergen:', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const addMedication = async item => {
    setMedicationLoading(item.id, true);
    try {
      const data = JSON.stringify({
        medication_id: item.id,
        active_id: item.active_id,
        start_date: moment(selecteddate).format('YYYY-MM-DD'),
        end_date: moment(selecteddate).subtract('days', 7).format('YYYY-MM-DD'),
        units: 1,
      });

      await axios.post(
        `${BASE_URL}/allergy_data/v1/user/${userData?.id}/add_medication_units`,
        data,
        { headers: { 'Content-Type': 'application/json' } },
      );

      await getMedicationApi();
      await getMedicationRecords(selecteddate);
    } catch (error) {
      console.log(error);
    }
    setMedicationLoading(item.id, false);
  };

  const removeMedication = async item => {
    setMedicationLoading(item.id, true);

    // console.log('item', item);
    try {
      const data = JSON.stringify({
        medication_id: item.id,
        active_id: item.active_id,
        start_date: moment(selecteddate).format('YYYY-MM-DD'),
        end_date: moment(selecteddate).subtract('days', 7).format('YYYY-MM-DD'),
        units: 1,
      });

      await axios.post(
        `${BASE_URL}/allergy_data/v1/user/${userData?.id}/remove_medication_units`,
        data,
        { headers: { 'Content-Type': 'application/json' } },
      );

      await getMedicationApi();
      await getMedicationRecords(selecteddate);
    } catch (error) {
      console.log(error);
    }
    setMedicationLoading(item.id, false);
  };

  const assignColorsToAllergens = (allergens, colors) => {
    return allergens.map((item, index) => ({
      ...item,
      chartColor: colors[index % colors.length],
    }));
  };

  const getLocation = async type => {
    setType(type);
    if (userData.email) {
      const res = await GetAllLocation(userData?.id);
      // console.log('res', res);

      setAllCities(res.cities);
    } else {
      setAllCities();
    }
  };

  const SelectLocation = async city => {
    await AsyncStorage.setItem('isCity', JSON.stringify(city));
    getSelectedAllergens();
  };

  const removeCity = async () => {
    console.log('remove citu');
    await AsyncStorage.removeItem('isCity');
    getSelectedAllergens();
  };

  const chartSpacing = responsiveWidth(28); // You can tweak this value as needed

  const emojiMap = {
    1: AppImages.Hello,
    2: AppImages.Mask,
    3: AppImages.Pain,
    4: AppImages.Star,
    5: AppImages.Bored,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
          backgroundColor: AppColors.WHITE,
        }}>
        <AppHeader
          heading="Data Visualizer"
          Rightheading="Today"
          subheading="Your Data, Visualized"
          goBack
          selecteddate={selecteddate}
          setOpen={() => setOpen(true)}
        />

        {startDate && endDate && (
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <AppText
              title={`${moment(startDate).format('MMM DD')} - ${moment(
                endDate,
              ).format('MMM DD')}`}
              textSize={2}
              textColor={AppColors.BLACK}
              textAlignment={'center'}
            />
          </View>
        )}

        {isPremium ? (
          <>
            {DataVisualizerLoader == true ? (
              <View
                style={{
                  height: responsiveHeight(30),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              </View>
            ) : (
              <View>
                {MedicationnRecord?.length > 0 ? (
                  <View>
                    <ScrollView
                      horizontal={true}
                      style={{ height: responsiveHeight(30) }}>
                      {/* <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          marginLeft: responsiveWidth(20),

                          flexDirection: 'row',
                          zIndex: 100,
                        }}>
                        {allSymtoms.map(item => {
                          const emojiMap = {
                            1: AppImages.Hello,
                            2: AppImages.Mask,
                            3: AppImages.Pain,
                            4: AppImages.Star,
                            5: AppImages.Bored,
                          };

                          return (
                            <View style={{width: responsiveWidth(13.5)}}>
                              <Image
                                source={
                                  item == 1
                                    ? emojiMap[1]
                                    : item == 2
                                    ? emojiMap[2]
                                    : item == 3
                                    ? emojiMap[3]
                                    : item == 4
                                    ? emojiMap[4]
                                    : item == 5
                                    ? emojiMap[5]
                                    : null
                                }
                                style={{
                                  height: 30,
                                  width: 30,
                                  resizeMode: 'contain',
                                }}
                              />
                            </View>
                          );
                        })}
                      </View> */}
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          marginLeft: responsiveWidth(15),
                          flexDirection: 'row',
                          zIndex: 100,
                        }}>
                        {allSymtoms.map(item => {
                          const emojiMap = {
                            1: AppImages.Hello,
                            2: AppImages.Mask,
                            3: AppImages.Pain,
                            4: AppImages.Star,
                            5: AppImages.Bored,
                          };

                          return (
                            // <View
                            //   style={{
                            //     width: chartSpacing,
                            //     alignItems: 'center',
                            //   }}>
                            <View
                              style={{
                                width: responsiveWidth(30),

                                alignItems: 'flex-start',
                                // borderWidth:1,
                              }}>
                              <Image
                                source={emojiMap[item]}
                                style={{
                                  height: 30,
                                  width: 30,
                                  resizeMode: 'contain',
                                }}
                              />
                            </View>
                          );
                        })}
                      </View>

                      <BarChart
                        data={MedicationnRecord || []}
                        barWidth={7}
                        frontColor="#E23131" // bar color
                        showLine={
                          PrimaryLineData.length > 0 ||
                          SecondaryLineData.length > 0
                        }
                        // xAxisLabelTexts={[]}
                        lineData={PrimaryLineData || []}
                        lineData2={SecondaryLineData || []}
                        lineConfig={{
                          color: colours[0],
                          thickness: 2,
                          curved: false,
                          dataPointsColor: colours[0],
                          spacing: chartSpacing,
                          // textColor: 'red',
                          initialSpacing: responsiveWidth(10),
                        }}
                        lineConfig2={{
                          color: colours[1],
                          thickness: 2,
                          curved: false,
                          dataPointsColor: colours[1],
                          spacing: chartSpacing,
                          initialSpacing: responsiveWidth(10),
                        }}
                        // xAxisIndicesWidth={responsiveWidth(28)}
                        yAxisLabelTexts={[
                          '0',
                          ' ',
                          '2',
                          ' ',
                          '4',
                          ' ',
                          '6',
                          ' ',
                          '8',
                        ]}
                        // hideXAxisText={true}
                        // xAxisLabelTexts={[]} // extra safety
                        // xAxisLabelTextStyle={{
                        //   color: 'transparent',
                        //   fontSize: 0,
                        // }}
                        barBorderRadius={2}
                        isAnimated={true}
                        noOfSections={8}
                        spacing={responsiveWidth(7.5)}
                        formatYLabel={label => parseFloat(label).toFixed(0)}
                        stepValue={1}
                      />
                      <View style={{ flexDirection: 'row', position: 'absolute', zIndex: 100, bottom: 0, marginLeft: responsiveWidth(17.5), }}>

                        {

                          AllDayNumber?.map((item) => {
                            return (
                              <View style={{ backgroundColor: 'white', width: responsiveWidth(30), }}>
                                <AppText title={item} textSize={2} />
                              </View>
                            )
                          })
                        }
                      </View>
                    </ScrollView>

                    <View
                      style={{
                        position: 'absolute',
                        zIndex: 1,
                        right: 0,
                        height: responsiveHeight(30),
                        gap: 25,
                      }}>
                      <AppText title={'Very \nHigh'} textSize={1.5} />
                      <AppText title={'High'} textSize={1.5} />

                      <AppText title={'Moderate'} textSize={1.5} />
                      <AppText title={'Low'} textSize={1.5} />
                    </View>
                  </View>
                ) : (
                  <AppText title={'No data available'} textSize={2} />
                )}
              </View>
            )}

            <DatePicker
              modal
              open={open}
              date={date}
              mode="date"
              minimumDate={activeDate && activeDate}
              maximumDate={new Date()}
              onConfirm={selectedDate => {
                setDate(selectedDate);
                setOpen(false);
                const today = moment().startOf('day');
                const picked = moment(selectedDate).startOf('day');
                const formattedDate = picked.format('YYYY-MM-DD');

                setSelectedDate(formattedDate);
                getMedicationRecords(formattedDate);
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />

            <View style={{ gap: 20 }}>
              <View>
                <AppText title={'Allergens'} textSize={2} textFontWeight />
                <FlatList
                  data={takingMedications}
                  keyExtractor={item => item?.id?.toString()}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        height: responsiveHeight(6),
                        width: responsiveWidth(90),
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: AppColors.LIGHTGRAY,
                        marginTop: 5,
                        backgroundColor: colours[index],
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                      }}>
                      <AppText title={item.allergen_name} textSize={1.5} />

                      {loadingItemId === item.id ? (
                        <ActivityIndicator
                          size="small"
                          color={AppColors.LIGHTGRAY}
                        />
                      ) : (
                        <TouchableOpacity onPress={() => deleteAllergens(item)}>
                          <AntDesign
                            name="minus"
                            size={responsiveFontSize(2)}
                            color={AppColors.LIGHTGRAY}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              </View>

              {pickedCity && (
                <View style={{ gap: 10 }}>
                  <AppText title={'City'} textSize={2} textFontWeight />
                  <View
                    style={{
                      height: 50,
                      width: responsiveWidth(90),
                      alignSelf: 'center',
                      backgroundColor: AppColors.PEACHCOLOUR,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      paddingHorizontal: 20,
                    }}>
                    <AppText
                      title={pickedCity?.city_name}
                      textSize={2}
                      textFontWeight
                      textColor={AppColors.BLACK}
                    />

                    <TouchableOpacity onPress={() => removeCity()}>
                      <AntDesign
                        name="minus"
                        size={responsiveFontSize(2)}
                        color={AppColors.LIGHTGRAY}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View>
              <View
                style={{
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <TouchableOpacity
                  onPress={() => getAllAllergens()}
                  style={{
                    height: responsiveHeight(5),
                    width: responsiveWidth(44),
                    backgroundColor:
                      type == 'allergens'
                        ? AppColors.BTNCOLOURS
                        : AppColors.WHITE,
                    borderRadius: 10,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <AppText
                    title={'ALLERGENS'}
                    textColor={
                      type == 'allergens' ? AppColors.WHITE : AppColors.BLACK
                    }
                    textSize={2}
                    textFontWeight
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => getMedicationApi()}
                  style={{
                    height: responsiveHeight(5),
                    width: responsiveWidth(44),
                    borderWidth: 1,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      type == 'medication'
                        ? AppColors.BTNCOLOURS
                        : AppColors.WHITE,
                  }}>
                  <AppText
                    title={'MEDICATIONS'}
                    textColor={
                      type == 'medication' ? AppColors.WHITE : AppColors.BLACK
                    }
                    textSize={2}
                    textFontWeight
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => getLocation('Add Location')}
                style={{
                  height: responsiveHeight(5),
                  width: responsiveWidth(90),
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    type == 'Add Location'
                      ? AppColors.BTNCOLOURS
                      : AppColors.WHITE,
                  marginTop: 10,
                }}>
                <AppText
                  title={'Add Location'}
                  textColor={
                    type == 'Add Location' ? AppColors.WHITE : AppColors.BLACK
                  }
                  textSize={2}
                  textFontWeight
                />
              </TouchableOpacity>
            </View>

            {pollenLoader && (
              <View style={{ marginTop: 30 }}>
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              </View>
            )}
            {type == 'medication' ? (
              <View>
                <FlatList
                  data={medicationData}
                  contentContainerStyle={{
                    gap: 10,
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                  renderItem={({ item }) => {
                    return (
                      <View
                        style={{
                          borderWidth: 2.5,
                          borderRadius: 10,
                          borderColor: item.frontColor,
                          height: responsiveHeight(6),
                          alignItems: 'center',
                          flexDirection: 'row',
                          paddingHorizontal: 10,
                          justifyContent: 'space-between',
                        }}>
                        <AppText
                          title={item.name}
                          textSize={1.6}
                          textColor={AppColors.BLACK}
                        />

                        {medicationLoadingMap[item?.id] ? (
                          <ActivityIndicator
                            size={'small'}
                            color={AppColors.BLACK}
                          />
                        ) : (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 10,
                            }}>
                            <TouchableOpacity
                              onPress={() => removeMedication(item)}>
                              <AntDesign
                                name={'minus'}
                                size={responsiveFontSize(2)}
                                color={AppColors.LIGHTGRAY}
                              />
                            </TouchableOpacity>

                            <AppText
                              title={item?.units || 0}
                              textColor={AppColors.LIGHTGRAY}
                              textSize={2.5}
                            />

                            <TouchableOpacity
                              onPress={() => addMedication(item)}>
                              <AntDesign
                                name={'plus'}
                                size={responsiveFontSize(2)}
                                color={AppColors.LIGHTGRAY}
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  }}
                />
              </View>
            ) : type == 'allergens' ? (
              <View>
                <FlatList
                  data={todayPollensData}
                  renderItem={({ item }) => {
                    return (
                      <TouchableOpacity
                        onPress={() => addAllergens(item)}
                        style={{
                          height: responsiveHeight(6),
                          width: responsiveWidth(90),
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: AppColors.LIGHTGRAY,
                          marginTop: 5,
                          flexDirection: 'row',
                          gap: 10,
                          alignItems: 'center',
                          paddingHorizontal: 20,
                        }}>
                        <AntDesign
                          name={'pluscircle'}
                          size={responsiveFontSize(2.5)}
                          color={AppColors.BTNCOLOURS}
                        />
                        <AppText title={item.common_name} textSize={1.5} />
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            ) : (
              <View>
                <FlatList
                  data={allCities}
                  renderItem={({ item }) => {
                    return (
                      <TouchableOpacity
                        onPress={() => SelectLocation(item)}
                        style={{
                          height: responsiveHeight(6),
                          width: responsiveWidth(90),
                          borderWidth: 1,
                          borderRadius: 10,
                          borderColor: AppColors.LIGHTGRAY,
                          marginTop: 5,
                          flexDirection: 'row',
                          gap: 10,
                          alignItems: 'center',
                          paddingHorizontal: 20,
                        }}>
                        <AntDesign
                          name={'pluscircle'}
                          size={responsiveFontSize(2.5)}
                          color={AppColors.BTNCOLOURS}
                        />

                        <AppText title={item.city_name} textSize={1.5} />
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </>
        ) : (
          <View
            style={{ height: responsiveHeight(30), justifyContent: 'center' }}>
            <SubscribeBar
              title="Subscribe Now to access data visualizer"
              title2={'Unlock Full Access to data visualizer'}
              handlePress={() => navigation.navigate('Subscription')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DataVisualizer;
