import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import AppText from '../../components/AppTextComps/AppText';
import AppColors from '../../utils/AppColors';
import { BarChart } from 'react-native-gifted-charts';
import AppButton from '../../components/AppButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BASE_URL from '../../utils/BASE_URL';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
// import moment from 'moment';
import moment from 'moment-timezone'; // includes all moment features + timezone

import DatePicker from 'react-native-date-picker';
import AppIntroSlider from 'react-native-app-intro-slider';
import SubscribeBar from '../../components/SubscribeBar';
import { ApiCallWithUserId } from '../../global/ApiCall';
import {
  addUnitToActiveMedicaton,
  removeUnitToActiveMedicaton,
  setActiveMedication,
  setAllMedicationFromApi,
} from '../../redux/Slices/MedicationSlice';
import { useFocusEffect } from '@react-navigation/native';
import AppImages from '../../assets/images/AppImages';

const MedicationSample = ({ navigation }) => {
  const sliderRef = useRef(null);
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.user);

  const expireDate = useSelector(state => state.auth.expireDate);

  const allActiveMedicationRedux = useSelector(
    state => state.medications.ActiveMedications,
  );

  const allMyCurrentMeds = useSelector(
    state => state.medications.MyCurrentMeds,
  );

  // console.log("allActiveMedicationRedux",allActiveMedicationRedux)

  const [MedicationnRecord, setMedicationnRecord] = useState([]);
  const [medicationLoadingMap, setMedicationLoadingMap] = useState({});
  const [loader, setLoader] = useState(false);
  const [Medicationloader, setMedicationLoader] = useState(false);
  const [activeDate, setActiveDate] = useState(
    allActiveMedicationRedux.length > 0
      ? new Date(allActiveMedicationRedux[0].date)
      : new Date(),
  );

  const [date, setDate] = useState(new Date());
  const [selecteddate, setSelectedDate] = useState(
    moment().local().format('YYYY-MM-DD'),
  );
  const [open, setOpen] = useState(false);

  const [sliderScrollEnabled, setSliderScrollEnabled] = useState(false);
  const [savingDataLoader, setSavingDataLoader] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(
    MedicationnRecord.length - 1,
  ); // start at latest week

  // console.log('currentIndex', currentIndex, MedicationnRecord.length);

  useEffect(() => {
    generateMedicationSlides(selecteddate, allActiveMedicationRedux);
  }, [selecteddate, allActiveMedicationRedux]);

  // useEffect(() => {
  //   // const nav = navigation.addListener('focus', () => {
  //   getApiDataAndSaveToRedux(allActiveMedicationRedux);
  //   // getMedApiDataAndSaveToRedux();
  //   // });
  //   // return nav;
  // }, [allActiveMedicationRedux]);

  useFocusEffect(
    useCallback(() => {
      if (allMyCurrentMeds && allMyCurrentMeds.length > 0) {
        setAllMedicationToRedux();
      } else {
        getMedApiDataAndSaveToRedux(allMyCurrentMeds, allActiveMedicationRedux);
        if (allActiveMedicationRedux.length === 0) {
          getApiDataAndSaveToRedux(allActiveMedicationRedux);
        }
      }

      // Alert.alert("runninnng use focus")
    }, [allMyCurrentMeds, allActiveMedicationRedux]),
  );

  const getMedApiDataAndSaveToRedux = async () => {
    const currentDate = moment().local().format('YYYY-MM-DD');

    if (
      allMyCurrentMeds.length > 0 ||
      moment(
        allActiveMedicationRedux[allActiveMedicationRedux.length - 1].date,
      ).format('YYYY-MM-DD') === currentDate
    ) {
      // Alert.alert("Called in return")
      return;
    }

    const response = await ApiCallWithUserId(
      'post',
      'get_medications_active',
      userData?.id,
    );

    if (response?.data?.length > 0) {
      // console.log('get_medications_active....');
      dispatch(setAllMedicationFromApi(response?.data));
    }
  };

  const getApiDataAndSaveToRedux = async () => {
    if (allActiveMedicationRedux.length === 0) {
      setSavingDataLoader(true);

      // Alert.alert("This function calls getApiDataAndSaveToRedux")
      const getActiveMedicationData = await ApiCallWithUserId(
        'post',
        'get_medication_records',
        userData?.id,
      );
      setSavingDataLoader(false);
      // const filt =getActiveMedicationData?.entries?.items.filter(med => moment(med.date).format("YYYY MM DD") === moment(new Date()).local().format("YYYY MM DD"))
      // console.log("filt", filt)
      // const filt = getActiveMedicationData.filter(med => med.date == moment("2025-09-29").local().format("YYYY MM DD"))

      if (getActiveMedicationData?.entries?.items?.length > 0) {
        // console.log(
        //   'getActiveMedicationData',
        //   getActiveMedicationData?.entries?.items,
        // );
        dispatch(setActiveMedication(getActiveMedicationData?.entries?.items));
        setSavingDataLoader(false);
      } else {
        setSavingDataLoader(false);
      }
      return;
    }
  };

  const SaveMedicationDataInApi = async allActiveMedicationRedux => {
    // setSavingDataLoader(true);
    const AllActiveArray = allActiveMedicationRedux.map(res => ({
      date: res.date,
      units: res.units,
      medication_id: res.id,
    }));

    // console.log("AllActiveArray", AllActiveArray);
    if (AllActiveArray) {
      const dataSaved = await ApiCallWithUserId(
        'post',
        'update_medication_units',
        userData?.id,
        { data: AllActiveArray },
      );
      // setSavingDataLoader(false);
      console.log('dataSaved');
    } else {
      // setSavingDataLoader(false);
    }
  };

  const setAllMedicationToRedux = async () => {
    const currentDate = moment().local().format('YYYY-MM-DD');

    setLoader(true);

    // Alert.alert('currentDate', currentDate,       allActiveMedicationRedux[allActiveMedicationRedux?.length - 1]?.date );
    // return

    // Alert.alert("currentDate", currentDate, allActiveMedicationRedux.length  )

    if (allActiveMedicationRedux.length > 0) {
      const allergenLastDate =
        allActiveMedicationRedux[allActiveMedicationRedux?.length - 1]?.date;

      // Alert.alert("Calling...",allergenLastDate,currentDate )
      // if (moment(allergenLastDate).isAfter(moment(currentDate))) {
      //   // allergenLastDate is greater than currentDate
      //   console.log('Allergen last date is in the future');
      //   setLoader(false);
      //   return;
      // }

      if (allergenLastDate == currentDate) {
        setLoader(false);
      } else {
        // Alert.alert("runnig the medication alert")
        // const dateArray = skipLastDateAndReturnDateRangeArray(
        //   allergenLastDate,
        //   currentDate,
        // )
        // // console.log("currentDate",currentDate, allActiveMedicationRedux.length, allActiveMedicationRedux[allActiveMedicationRedux?.length - 1]?.date, dateArray, allMyCurrentMeds)

        // const toAdd = [];

        // dateArray.forEach(date => {
        //   allMyCurrentMeds.forEach(med => {
        //     toAdd.push({
        //       ...med,
        //       date: date,
        //       units: 0,
        //     });
        //   });
        // });

        // const mergeDates = [...allActiveMedicationRedux, ...toAdd];

        // console.log('mergeDates', toAdd);

        // dispatch(setActiveMedication(mergeDates));
        // setLoader(false);

        const dateArray = skipLastDateAndReturnDateRangeArray(
          allergenLastDate,
          currentDate,
        );

        // Create a set of existing date+id combos
        const existingMap = new Set(
          allActiveMedicationRedux.map(med => `${med.date}_${med.id}`),
        );

        const toAdd = [];

        dateArray.forEach(date => {
          allMyCurrentMeds.forEach(med => {
            const key = `${date}_${med.id}`;
            if (!existingMap.has(key)) {
              // ✅ Only add if it doesn’t already exist
              toAdd.push({
                ...med,
                date,
                units: 0,
              });
            }
          });
        });

        const mergeDates = [...allActiveMedicationRedux, ...toAdd];
        dispatch(setActiveMedication(mergeDates));
      }
    } else {
      const activeDateStr = moment(new Date()).format('YYYY-MM-DD');
      const dateArray = generateDateRangeArray(activeDateStr, currentDate);

      const toAdd = [];

      dateArray.forEach(date => {
        allMyCurrentMeds.forEach(med => {
          toAdd.push({
            ...med,
            date: activeDateStr,
            units: 0,
          });
        });
      });

      // console.log("toAdd",toAdd,"allMyCurrentMeds..", allMyCurrentMeds)

      dispatch(setActiveMedication(toAdd));
      setLoader(false);
    }
  };

  const generateMedicationSlides = async (
    selectedDate,
    allActiveMedicationRedux,
  ) => {
    setMedicationLoader(true);
    if (allActiveMedicationRedux?.length == 0) {
      setMedicationLoader(false);
      return;
    }

    try {
      const activeDateStr =
        allActiveMedicationRedux?.[0]?.date ||
        moment(new Date()).format('YYYY-MM-DD');

      setActiveDate(new Date(activeDateStr));

      const activeDate = moment(activeDateStr, 'YYYY-MM-DD');
      const baseDate = moment(
        selectedDate ? selectedDate : new Date(),
        'YYYY-MM-DD',
      );

      // Step 2: Calculate number of weeks
      const diffInDays = baseDate.diff(activeDate, 'days');
      const numberOfWeeks = Math.ceil((diffInDays + 1) / 7);

      const slides = [];

      for (let i = 0; i < numberOfWeeks; i++) {
        let end = moment(baseDate).subtract(i * 7, 'days');
        let start = moment(baseDate).subtract(i * 7 + 6, 'days');

        // 🔹 Ensure start never goes before activeDate
        if (start.isBefore(activeDate)) {
          start = activeDate.clone();
        }

        // Filter medications for the current week
        const entries = allActiveMedicationRedux.filter(item => {
          const itemDate = moment(item.date, 'YYYY-MM-DD');
          return itemDate.isBetween(
            start.clone().subtract(1, 'day'),
            end.clone().add(1, 'day'),
          );
        });

        // const seenDates = new Set();
        // const barData = [];

        // entries.forEach(entry => {
        //   const formattedLabel = moment(entry.date, 'YYYY-MM-DD').format('D');
        //   const value = parseInt(entry.units) || 0;

        //   if (!seenDates.has(entry.date)) {
        //     seenDates.add(entry.date);
        //     barData.push({
        //       value,
        //       label: formattedLabel,
        //       spacing: 0,
        //       frontColor: entry.frontColor || '#E23131',
        //       labelWidth: 0,
        //     });
        //   } else {
        //     barData.push({
        //       value,
        //       spacing: 0,
        //       frontColor: entry.frontColor || '#E23131',
        //       labelWidth: 0,
        //     });
        //   }
        // });
        const seenDates = new Set();
        const barData = [];

        // group by date
        const grouped = {};
        entries.forEach(entry => {
          if (!grouped[entry.date]) {
            grouped[entry.date] = [];
          }
          grouped[entry.date].push(entry);
        });

        // now process each group
        Object.keys(grouped).forEach(date => {
          const group = grouped[date];
          group.forEach((entry, idx) => {
            const formattedLabel = moment(entry.date, 'YYYY-MM-DD').format('D');
            const value = parseInt(entry.units) || 0;
            const isLast = idx === group.length - 1; // ✅ last of this date

            barData.push({
              value,
              ...(idx === 0 && { label: formattedLabel }), // 👈 sirf idx==0 pe hi label add hoga
              spacing: isLast ? responsiveWidth(2.5) : 0, // ✅ spacing only for last of this date
              frontColor: entry.frontColor || '#E23131',
              labelWidth: 0,
            });
          });
        });

        slides.unshift({
          key: `${i}`,
          // 🔹 If start and end are same → show single day
          title: start.isSame(end, 'day')
            ? start.format('DD MMM')
            : `${start.format('DD MMM')} - ${end.format('DD MMM')}`,
          barData,
        });
      }

      setCurrentIndex(slides.length - 1);

      setMedicationnRecord(slides);

      setMedicationLoader(false);
    } catch (error) {
      setMedicationLoader(false);
      console.log('generateMedicationSlides error:', error);
    }
  };

  const generateDateRangeArray = (startDateStr, endDateStr) => {
    const startDate = moment(startDateStr, 'YYYY-MM-DD');
    const endDate = moment(endDateStr, 'YYYY-MM-DD');

    const dateArray = [];

    while (startDate.isSameOrBefore(endDate)) {
      dateArray.push(startDate.format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

    return dateArray;
  };

  const skipLastDateAndReturnDateRangeArray = (startDateStr, endDateStr) => {
    const startDate = moment(startDateStr, 'YYYY-MM-DD').add(1, 'day'); // ⬅️ Skip start date
    const endDate = moment(endDateStr, 'YYYY-MM-DD');

    const dateArray = [];

    while (startDate.isSameOrBefore(endDate)) {
      dateArray.push(startDate.format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

    return dateArray;
  };

  const addMedication = async item => {
    dispatch(addUnitToActiveMedicaton(item));
    SaveMedicationDataInApi(allActiveMedicationRedux);
  };

  const removeMedication = async item => {
    dispatch(removeUnitToActiveMedicaton(item));
    SaveMedicationDataInApi(allActiveMedicationRedux);
  };

  const goNext = () => {
    if (currentIndex < MedicationnRecord.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (sliderRef.current && MedicationnRecord.length > 0) {
      // Jump to the last slide
      sliderRef.current.goToSlide(MedicationnRecord.length - 1, false); // false = don't trigger onSlideChange
    }
  }, [MedicationnRecord]);

  useEffect(() => {
    if (sliderScrollEnabled) {
      const timeout = setTimeout(() => {
        setSliderScrollEnabled(true);
      }, 300); // smooth delay
      return () => clearTimeout(timeout);
    }
  }, [sliderScrollEnabled]);

  const memoizedMedicationList = () => {
    if (allActiveMedicationRedux.length === 0) return null;

    // console.log("allActiveMedicationRedux",allActiveMedicationRedux)

    const filteredMedication = allActiveMedicationRedux.filter(
      item => item.date === selecteddate,
    );

    // console.log('filteredMedication', filteredMedication);

    return (
      <FlatList
        data={filteredMedication}
        contentContainerStyle={{
          gap: 10,
          marginTop: 20,
          marginBottom: 20,
        }}
        keyExtractor={item => item?.id?.toString()}
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
                <ActivityIndicator size={'small'} color={AppColors.BLACK} />
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                  <TouchableOpacity onPress={() => removeMedication(item)}>
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

                  <TouchableOpacity onPress={() => addMedication(item)}>
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
    );
  };

  // const memoizedSlider = () => {
  //   // useMemo(() => {
  //   if (MedicationnRecord.length === 0) return null;

  //   const screenWidth = Dimensions.get('window').width;

  //   return (
  //     <View style={{height: responsiveHeight(35)}}>
  //             <Text style={{fontSize: 16, alignSelf:'center'}}>{MedicationnRecord[0]?.title}</Text>
  //       <ScrollView  horizontal style={{paddingRight:100}}>

  //        {/* <View style={{alignItems: 'center'}}> */}
  //             <BarChart
  //               data={MedicationnRecord[0]?.barData}
  //               barWidth={7}
  //               frontColor="#E23131"
  //               showLine={false}
  //               initialSpacing={0}
  //               xAxisLabelTextStyle={{
  //                 fontSize: 10,
  //                 color: '#000',
  //                 fontWeight: '400',
  //                 width: 20,
  //               }}
  //               // width={screenWidth * 0.9}
  //               barBorderRadius={2}
  //               isAnimated={true}
  //               maxValue={8}
  //               stepValue={1}
  //               hideDataPoints={false}
  //               spacing={7}
  //               formatYLabel={label => parseFloat(label).toFixed(0)}
  //             />
  //             </ScrollView>
  //           {/* </View> */}

  //       {/* <AppIntroSlider
  //         ref={sliderRef}
  //         data={MedicationnRecord}
  //         showNextButton={false}
  //         showPrevButton={false}
  //         showDoneButton={false}
  //         nestedScrollEnabled={true}
  //         scrollEnabled={true}
  //         renderItem={({item}) => (
  //           <View style={{alignItems: 'center'}}>
  //             <Text style={{fontSize: 16}}>{item.title}</Text>
  //             <BarChart
  //               data={item.barData}
  //               barWidth={7}
  //               frontColor="#E23131"
  //               showLine={false}
  //               initialSpacing={0}
  //               xAxisLabelTextStyle={{
  //                 fontSize: 10,
  //                 color: '#000',
  //                 fontWeight: '400',
  //                 width: 20,
  //               }}
  //               width={screenWidth * 0.9}
  //               barBorderRadius={2}
  //               isAnimated={true}
  //               maxValue={8}
  //               stepValue={1}
  //               hideDataPoints={false}
  //               spacing={7}
  //               formatYLabel={label => parseFloat(label).toFixed(0)}
  //             />
  //           </View>
  //         )}
  //         dotStyle={{backgroundColor: '#ccc', marginTop: 50}}
  //         activeDotStyle={{backgroundColor: AppColors.BLACK, marginTop: 50}}
  //       /> */}

  //     </View>
  //   );
  // };

  //   const memoizedSlider = () => {
  //   if (MedicationnRecord.length === 0) return null;

  //   const screenWidth = Dimensions.get('window').width;
  //   const currentSlide = MedicationnRecord[0];
  //   const barWidth = 7;
  //   const spacing = 7; // same as your chart spacing

  //   // Calculate needed width for all bars
  //   const chartWidth =
  //     currentSlide?.barData?.length * (barWidth + spacing) + spacing;

  //   return (
  //     <View style={{ height: responsiveHeight(35) }}>
  //       <Text style={{ fontSize: 16, alignSelf: 'center' }}>
  //         {currentSlide?.title}
  //       </Text>
  //       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  //         <BarChart
  //           data={currentSlide?.barData}
  //           barWidth={barWidth}
  //           frontColor="#E23131"
  //           showLine={false}
  //           initialSpacing={0}
  //           xAxisLabelTextStyle={{
  //             fontSize: 10,
  //             color: '#000',
  //             fontWeight: '400',
  //             width: 20,
  //           }}
  //           width={chartWidth} // ✅ fix: dynamically sized
  //           barBorderRadius={2}
  //           isAnimated={true}
  //           maxValue={8}
  //           stepValue={1}
  //           hideDataPoints={false}
  //           spacing={spacing}
  //           formatYLabel={(label) => parseFloat(label).toFixed(0)}
  //         />
  //       </ScrollView>
  //     </View>
  //   );
  // };

  const memoizedSlider = () => {
    if (MedicationnRecord.length === 0) return null;

    const screenWidth = Dimensions.get('window').width;
    const barWidth = 7;
    const spacing = 7;

    const currentSlide =
      MedicationnRecord[currentIndex == -1 ? 0 : currentIndex];

    const chartWidth =
      currentSlide?.barData?.length * (barWidth + spacing) + spacing;

    return (
      <View style={{ height: responsiveHeight(35), alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>{currentSlide?.title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={goPrev}
            disabled={currentIndex === 0}
            style={{
              height: responsiveHeight(18),
              justifyContent: 'center',
              marginRight: 10,
            }}>
            <AntDesign
              name="left"
              size={20}
              color={currentIndex === 0 ? AppColors.LIGHTGRAY : AppColors.BLACK}
            />
          </TouchableOpacity>

          <View
            style={{
              position: 'absolute',
              zIndex: 10,
              // bottom: responsiveHeight(1),
              // backgroundColor: AppColors.rightArrowCOlor,
              left: responsiveWidth(2.5),
              gap: Platform.OS == 'ios' ? 16 : 15,
              justifyContent: 'space-between',
              borderRightWidth: 1,
              paddingRight: 5,
              marginBottom: 14,
              marginLeft: 12,
            }}>
            {/* <AppText title={8} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
            <AppText title={7} textSize={1.5} textColor={AppColors.LIGHTGRAY} /> */}
            <AppText title={6} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
            <AppText title={5} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
            <AppText title={4} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
            <AppText title={3} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
            <AppText title={2} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
            <AppText title={1} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
            <AppText title={0} textSize={1.5} textColor={AppColors.LIGHTGRAY} />
          </View>

          {/* Chart */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={currentSlide?.barData}
              barWidth={barWidth}
              frontColor="#E23131"
              showLine={false}
              initialSpacing={0}
              xAxisLabelTextStyle={{
                fontSize: 10,
                color: '#000',
                fontWeight: '400',
                width: 20,
              }}
              width={chartWidth}
              barBorderRadius={2}
              isAnimated={true}
              maxValue={6}
              stepValue={1}

              hideDataPoints={false}
              spacing={spacing}
              formatYLabel={label => parseFloat(label).toFixed(0)}
              //hiding verticle line
              showYAxisIndices={false}
              showVerticalLines={false}
              hideYAxisText={true}
              yAxisThickness={0}
            />
          </ScrollView>

          {/* Right arrow */}
          <TouchableOpacity
            onPress={goNext}
            disabled={currentIndex === MedicationnRecord.length - 1}
            style={{ height: responsiveHeight(18), justifyContent: 'center' }}>
            <AntDesign
              name="right"
              size={20}
              color={
                currentIndex === MedicationnRecord.length - 1
                  ? AppColors.LIGHTGRAY
                  : AppColors.BLACK
              }
            />
          </TouchableOpacity>
        </View>

        {/* Dots */}
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          {MedicationnRecord.map((_, index) => (
            <View
              key={index}
              style={{
                height: 8,
                width: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor:
                  index === currentIndex ? AppColors.BLACK : '#ccc',
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  // console.log("MedicationnRecord", MedicationnRecord.length)
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: AppColors.WHITE, paddingTop: 20 }}>
      <StatusBar barStyle={'dark-content'} />
      <View style={{ padding: 20, backgroundColor: AppColors.WHITE, flex: 1 }}>
        <AppHeader
          heading="Medication"
          Rightheading="Today"
          subheading="Tracker"
          selecteddate={selecteddate}
          setOpen={() => setOpen(true)}
        />

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          // minimumDate={!activeDate ? new Date() : activeDate}
          minimumDate={
            allActiveMedicationRedux.length > 0
              ? moment(allActiveMedicationRedux[0]?.date).local()
              : moment().local()
          }
          maximumDate={new Date(moment().local())}
          onConfirm={selectedDate => {
            setDate(selectedDate);
            setOpen(false);
            const picked = moment(selectedDate).startOf('day');
            const formattedDate = picked.format('YYYY-MM-DD');
            setSelectedDate(formattedDate);
            // generateMedicationSlides(formattedDate);
          }}
          onCancel={() => {
            setOpen(false);
          }}
          onTouchCancel={() => {
            setOpen(false);
          }}
          onPointerCancel={() => {
            setOpen(false);
          }}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
          nestedScrollEnabled>
          {savingDataLoader && (
            <ActivityIndicator size={'small'} color={AppColors.BLACK} />
          )}
          {expireDate ? (
            <>
              {memoizedMedicationList()}

              {loader && (
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              )}
              <>
                {Medicationloader && (
                  <ActivityIndicator size={'large'} color={AppColors.BLACK} />
                )}
              </>
              {MedicationnRecord.length > 0 && <>{memoizedSlider()}</>}
            </>
          ) : (
            <View style={{ justifyContent: 'center', marginTop: 20 }}>
              <SubscribeBar
                title="Subscribe now to log your daily medication intake"
                title2={
                  "Upgrade to premium and start logging your medication to better understand its impact on your daily life. By tracking your dosage, you can easily see how your medication is affecting your quality of life. This information is also valuable to share with your doctors, helping them identify if you're developing a tolerance to certain medications. You can even use this feature to track your home remedies."
                }
                handlePress={() => navigation.navigate('Subscription')}
                img={AppImages.MedicationGraph}
              />
            </View>
          )}

          {expireDate && (
            <View style={{ marginTop: 20, gap: 20 }}>
              <AppButton
                title={'GO TO DATA VISUALIZER'}
                RightColour={AppColors.rightArrowCOlor}
                handlePress={() => navigation.navigate('Data Visualizer')}
              />

              <AppButton
                title={'Add Medication'}
                RightColour={AppColors.rightArrowCOlor}
                handlePress={() => navigation.navigate('ManageMedications')}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MedicationSample;
