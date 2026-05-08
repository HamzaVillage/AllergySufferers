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
import { saveCurrentMeds, loadCurrentMeds, saveActiveMedications, loadActiveMedications } from '../../global/MedicationFileCache';
import { useFocusEffect } from '@react-navigation/native';
import AppImages from '../../assets/images/AppImages';

const MedicationSample = ({ navigation }) => {
  const sliderRef = useRef(null);
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.user);

  const isExpired = useSelector(state => state.auth.isExpired);
  const isPremium = !isExpired;

  const [allActiveMedicationRedux, setAllActiveMedicationRedux] = useState([]);
  const [allMyCurrentMeds, setAllMyCurrentMeds] = useState([]);

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
      const loadData = async () => {
        setLoader(true);
        let currentMeds = await loadCurrentMeds();
        let activeMeds = await loadActiveMedications();

        if (currentMeds) setAllMyCurrentMeds(currentMeds);
        if (activeMeds) setAllActiveMedicationRedux(activeMeds);

        // If currentMeds are missing, fetch them from API first
        if (!currentMeds || currentMeds.length === 0) {
          const response = await ApiCallWithUserId(
            'post',
            'get_medications_active',
            userData?.id,
          );
          if (response?.data?.length > 0) {
            currentMeds = response.data;
            setAllMyCurrentMeds(currentMeds);
            saveCurrentMeds(currentMeds);
          }
        }

        // If activeMeds (records) are missing, fetch them from API
        if (!activeMeds || activeMeds.length === 0) {
          const getActiveMedicationData = await ApiCallWithUserId(
            'post',
            'get_medication_records',
            userData?.id,
          );
          if (getActiveMedicationData?.entries?.items?.length > 0) {
            activeMeds = Array.from(
              new Map(
                getActiveMedicationData.entries.items.map(item => [
                  `${item.date}_${item.medication_id || item.id}`,
                  { ...item, id: item.medication_id || item.id }
                ]),
              ).values(),
            );
            setAllActiveMedicationRedux(activeMeds);
            saveActiveMedications(activeMeds);
          }
        }

        // Now that we (hopefully) have both, sync them (prepare today's entries)
        if (currentMeds && currentMeds.length > 0) {
          await setAllMedicationToRedux(currentMeds, activeMeds || []);
        }
        
        setLoader(false);
      };
      loadData();
    }, [userData?.id]),
  );

  const getMedApiDataAndSaveToRedux = async (currentMeds, activeMeds) => {
    const currentDate = moment().local().format('YYYY-MM-DD');

    if (
      currentMeds.length > 0 ||
      (activeMeds.length > 0 &&
        moment(activeMeds[activeMeds.length - 1].date).format('YYYY-MM-DD') === currentDate)
    ) {
      return;
    }

    const response = await ApiCallWithUserId(
      'post',
      'get_medications_active',
      userData?.id,
    );

    if (response?.data?.length > 0) {
      setAllMyCurrentMeds(response?.data);
      saveCurrentMeds(response?.data);
    }
  };

  const saveTimeoutRef = useRef(null);

  const SaveMedicationDataInApi = useCallback(async allActiveMedicationRedux => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const AllActiveArray = allActiveMedicationRedux.map(res => ({
        date: res.date,
        units: res.units,
        medication_id: res.id,
      }));

      if (AllActiveArray.length > 0) {
        try {
          await ApiCallWithUserId(
            'post',
            'update_medication_units',
            userData?.id,
            { data: AllActiveArray },
          );
          console.log('Medication data saved successfully to API');
          saveActiveMedications(allActiveMedicationRedux);
        } catch (error) {
          console.log('Error saving medication data:', error);
        }
      }
    }, 1000); // 1 second debounce
  }, [userData?.id]);

  const getApiDataAndSaveToRedux = async (activeMeds) => {
    if (activeMeds.length === 0) {
      setSavingDataLoader(true);
      const getActiveMedicationData = await ApiCallWithUserId(
        'post',
        'get_medication_records',
        userData?.id,
      );
      setSavingDataLoader(false);

      if (getActiveMedicationData?.entries?.items?.length > 0) {
        // De-duplicate items from API (key: date_id)
        const uniqueItems = Array.from(
          new Map(
            getActiveMedicationData.entries.items.map(item => [
              `${item.date}_${item.medication_id || item.id}`,
              { ...item, id: item.medication_id || item.id }
            ]),
          ).values(),
        );
        setAllActiveMedicationRedux(uniqueItems);
        saveActiveMedications(uniqueItems);
      }
    }
  };



  const setAllMedicationToRedux = async (currentMeds, activeMeds) => {
    const currentDate = moment().local().format('YYYY-MM-DD');

    if (activeMeds.length > 0) {
      // Build a set of all existing records for quick lookup
      const existingMap = new Set(
        activeMeds.map(med => `${med.date}_${med.medication_id || med.id}`),
      );

      // Find the earliest date in records
      const firstDate = activeMeds[0]?.date || currentDate;

      // Generate date range from the day after the earliest to today
      const allergenLastDate = activeMeds[activeMeds.length - 1]?.date;
      const endDate = allergenLastDate && allergenLastDate < currentDate ? currentDate : allergenLastDate;
      const dateArray = skipLastDateAndReturnDateRangeArray(
        firstDate,
        endDate || currentDate,
      );
      // Always include today
      if (!dateArray.includes(currentDate)) {
        dateArray.push(currentDate);
      }

      const toAdd = [];
      dateArray.forEach(date => {
        currentMeds.forEach(med => {
          const medID = med.medication_id || med.id;
          const key = `${date}_${medID}`;
          if (!existingMap.has(key)) {
            toAdd.push({
              ...med,
              id: medID,
              date: date,
              units: 0,
            });
          }
        });
      });

      // Also ensure today has records for all current meds
      currentMeds.forEach(med => {
        const medID = med.medication_id || med.id;
        const todayKey = `${currentDate}_${medID}`;
        if (!existingMap.has(todayKey) && !toAdd.some(t => t.date === currentDate && (t.medication_id || t.id) === medID)) {
          toAdd.push({
            ...med,
            id: medID,
            date: currentDate,
            units: 0,
          });
        }
      });

      if (toAdd.length > 0) {
        const merged = [...activeMeds, ...toAdd];
        // De-duplicate by date + medication ID, keeping the one with higher units
        const deduped = Array.from(
          new Map(
            merged.map(med => [
              `${med.date}_${med.medication_id || med.id}`,
              med,
            ]),
          ).values(),
        );
        setAllActiveMedicationRedux(deduped);
        await saveActiveMedications(deduped);
      }
    } else {
      const activeDateStr = moment().local().format('YYYY-MM-DD');
      const toAdd = [];
      currentMeds.forEach(med => {
        toAdd.push({
          ...med,
          id: med.medication_id || med.id,
          date: activeDateStr,
          units: 0,
        });
      });

      setAllActiveMedicationRedux(toAdd);
      await saveActiveMedications(toAdd);
    }
  };

  const generateMedicationSlides = useCallback(async (
    selectedDate,
    allActiveMedicationRedux,
  ) => {
    setMedicationLoader(true);
    if (!allActiveMedicationRedux || allActiveMedicationRedux.length === 0) {
      setMedicationLoader(false);
      return;
    }

    try {
      const activeDateStr =
        allActiveMedicationRedux[0]?.date ||
        moment().local().format('YYYY-MM-DD');

      setActiveDate(new Date(activeDateStr));

      const activeDateMoment = moment(activeDateStr, 'YYYY-MM-DD').startOf('day');
      const baseDateMoment = moment(
        selectedDate || new Date(),
        'YYYY-MM-DD',
      ).startOf('day');

      const diffInDays = baseDateMoment.diff(activeDateMoment, 'days');
      const numberOfWeeks = Math.ceil((diffInDays + 1) / 7);

      const slides = [];

      // Pre-group medications by date for O(N) lookup
      const groupedByDate = new Map();
      allActiveMedicationRedux.forEach(item => {
        if (!groupedByDate.has(item.date)) {
          groupedByDate.set(item.date, []);
        }
        groupedByDate.get(item.date).push(item);
      });

      for (let i = 0; i < numberOfWeeks; i++) {
        let end = moment(baseDateMoment).subtract(i * 7, 'days');
        let start = moment(baseDateMoment).subtract(i * 7 + 6, 'days');

        if (start.isBefore(activeDateMoment)) {
          start = activeDateMoment.clone();
        }

        const barData = [];
        let current = start.clone();
        while (current.isSameOrBefore(end, 'day')) {
          const dateKey = current.format('YYYY-MM-DD');
          const dayEntries = groupedByDate.get(dateKey) || [];
          const formattedLabel = current.format('D');

          dayEntries.forEach((entry, idx) => {
            const value = parseInt(entry.units) || 0;
            const isLastOfDate = idx === dayEntries.length - 1;

            barData.push({
              value,
              ...(idx === 0 && { label: formattedLabel }),
              spacing: isLastOfDate ? responsiveWidth(2.5) : 0,
              frontColor: entry.frontColor || '#E23131',
              labelWidth: 0,
            });
          });

          current.add(1, 'day');
        }

        slides.unshift({
          key: `${i}`,
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
  }, []);

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

  const addMedication = useCallback(async item => {
    const medID = item.medication_id || item.id;
    const updated = allActiveMedicationRedux.map(med =>
      (med.medication_id || med.id) === medID && med.date === item.date
        ? { ...med, units: (parseInt(med.units) || 0) + 1 }
        : med
    );
    setAllActiveMedicationRedux(updated);
    saveActiveMedications(updated);
    SaveMedicationDataInApi(updated);
  }, [allActiveMedicationRedux, SaveMedicationDataInApi]);

  const removeMedication = useCallback(async item => {
    const medID = item.medication_id || item.id;
    const updated = allActiveMedicationRedux.map(med =>
      (med.medication_id || med.id) === medID && med.date === item.date && (parseInt(med.units) || 0) > 0
        ? { ...med, units: (parseInt(med.units) || 0) - 1 }
        : med
    );
    setAllActiveMedicationRedux(updated);
    saveActiveMedications(updated);
    SaveMedicationDataInApi(updated);
  }, [allActiveMedicationRedux, SaveMedicationDataInApi]);

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

  const memoizedMedicationList = useMemo(() => {
    if (allActiveMedicationRedux.length === 0) return null;

    const filteredMedication = allActiveMedicationRedux.filter(
      item => item.date === selecteddate,
    );

    // De-duplicate by medication ID for the displayed list
    const uniqueMedication = Array.from(
      new Map(
        filteredMedication.map(med => [
          med.medication_id || med.id,
          med,
        ]),
      ).values(),
    );

    return (
      <FlatList
        data={uniqueMedication}
        contentContainerStyle={{
          gap: 10,
          marginTop: 20,
          marginBottom: 20,
        }}
        keyExtractor={item => `${item.id}_${item.date}`}
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
  }, [allActiveMedicationRedux, selecteddate, medicationLoadingMap, addMedication, removeMedication]);

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

  const memoizedSlider = useMemo(() => {
    if (MedicationnRecord.length === 0) return null;

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
              left: responsiveWidth(2.5),
              gap: Platform.OS == 'ios' ? 16 : 15,
              justifyContent: 'space-between',
              borderRightWidth: 1,
              paddingRight: 5,
              marginBottom: 14,
              marginLeft: 12,
            }}>
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
              isAnimated={false}
              maxValue={6}
              stepValue={1}
              hideDataPoints={false}
              spacing={spacing}
              formatYLabel={label => parseFloat(label).toFixed(0)}
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
  }, [MedicationnRecord, currentIndex, goNext, goPrev]);

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
              ? moment(allActiveMedicationRedux[0]?.date).local().toDate()
              : moment().local().toDate()
          }
          maximumDate={moment().local().toDate()}
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
          {isPremium ? (
            <>
              {memoizedMedicationList}

              {loader && (
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              )}
              <>
                {Medicationloader && (
                  <ActivityIndicator size={'large'} color={AppColors.BLACK} />
                )}
              </>
              {MedicationnRecord.length > 0 && <>{memoizedSlider}</>}
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

          {isPremium && (
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
