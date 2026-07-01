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
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import BASE_URL from '../../../utils/BASE_URL';
import {useDispatch, useSelector} from 'react-redux';
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
import {saveAllergens, loadAllergens} from '../../../global/AllergenFileCache';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {ApiCallWithUserId} from '../../../global/ApiCall';
import {
  saveCurrentMeds,
  loadCurrentMeds,
  saveActiveMedications,
  loadActiveMedications,
} from '../../../global/MedicationFileCache';
import {
  saveCities,
  loadCities,
  saveActiveCity,
  loadActiveCity,
} from '../../../global/CityFileCache';
import {useFocusEffect} from '@react-navigation/native';
import Svg, {Circle, G, Line, Polyline, Rect} from 'react-native-svg';
import SvgDashLine from '../../../components/SvgDashLine';

const colours = ['#FF9999', '#66B2FF', '#99FF66', '#FFD966', '#CC99FF'];

const DatavisualizerSample = ({navigation}) => {
  const dispatch = useDispatch();
  const saveTimeoutRef = useRef(null);

  const userData = useSelector(state => state?.auth?.user);
  const isExpired = useSelector(state => state?.auth?.isExpired);
  const isPremium = !isExpired;
  const [allActiveMedicationRedux, setAllActiveMedicationRedux] = useState([]);
  const [allMyCurrentMeds, setAllMyCurrentMeds] = useState([]);
  const [AllCities, setAllCities] = useState([]);
  const [activeCity, setActiveCityLocal] = useState(null);

  // console.log("userData", userData)
  // console.log("expireDate", expireDate)
  // console.log("allActiveMedicationRedux", allActiveMedicationRedux)
  // console.log("AllCities", AllCities)
  // console.log("activeCity", activeCity)

  const [type, setType] = useState('allergens');
  const [medicationData, setMedicationsData] = useState();

  const [activeCityLocalState, setactiveCityLocalState] = useState();

  const [takingMedications, setTakingMedications] = useState([]);
  const [todayPollensData, setTodayPollensData] = useState([]);
  const [MedicationnRecord, setMedicationnRecord] = useState([]);

  console.log('todayPollensData', todayPollensData);

  const [pollenLoader, setPollenLoader] = useState(false);

  const [date, setDate] = useState(new Date());
  const [selecteddate, setSelectedDate] = useState(
    moment().local().format('YYYY-MM-DD'),
  );

  const [open, setOpen] = useState(false);

  const [PrimaryLineData, setPrimaryLineData] = useState([]);
  const [SecondaryLineData, setSecondaryLineData] = useState([]);

  // ew
  const [thirdLineData, setthirdLineData] = useState([]);
  const [fourthLineData, setfourthLineData] = useState([]);
  const [FifthLineData, setFifthLineData] = useState([]);

  const [medicationLoadingMap, setMedicationLoadingMap] = useState({});

  const [loadingItemId, setLoadingItemId] = useState(null);

  const [DataVisualizerLoader, setDataVisualizerLoader] = useState(false);
  const [allSymtoms, setAllSymtoms] = useState([]);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [pickedCity, setPickedCity] = useState();
  const [AllDayNumber, setAllDayNumber] = useState([]);
  const [activeDate, setActiveDate] = useState(null);

  const [savingDataLoader, setSavingDataLoader] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const nav = navigation.addListener('focus', () => {
      getAllAllergens();

      // getSelectedAllergens(activeCity);

      if (!activeCity) {
        NewActiveCity();
      } else {
        // getSelectedAllergens(activeCity);
      }
    });

    return nav;
  }, [navigation, getAllAllergens, activeCity, NewActiveCity]);

  useEffect(() => {
    getSelectedAllergens(activeCity);
  }, [activeCity, MedicationnRecord, allActiveMedicationRedux, getSelectedAllergens]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        let cachedActiveMeds = await loadActiveMedications();
        let cachedCurrentMeds = await loadCurrentMeds();
        const cachedCities = await loadCities();
        const cachedActiveCity = await loadActiveCity();
        const cachedAllergens = await loadAllergens();

        if (cachedActiveMeds) setAllActiveMedicationRedux(cachedActiveMeds);
        if (cachedCurrentMeds) setAllMyCurrentMeds(cachedCurrentMeds);

        let finalCities = cachedCities;
        if (!cachedCities || cachedCities.length === 0) {
          const apiCities = await GetAllLocation(userData?.id);
          if (apiCities?.cities) {
            finalCities = apiCities.cities;
            setAllCities(apiCities.cities);
            saveCities(apiCities.cities);
          }
        } else {
          setAllCities(cachedCities);
        }

        const finalActiveCity =
          cachedActiveCity || (finalCities ? finalCities[0] : null);
        if (finalActiveCity) {
          setActiveCityLocal(finalActiveCity);
          saveActiveCity(finalActiveCity);
        }

        if (cachedAllergens) {
          setTodayPollensData(cachedAllergens);
        } else {
          getAllAllergens();
        }

        // Fetch medications if missing from cache
        if (!cachedCurrentMeds || cachedCurrentMeds.length === 0) {
          const response = await ApiCallWithUserId(
            'post',
            'get_medications_active',
            userData?.id,
          );
          if (response?.data?.length > 0) {
            cachedCurrentMeds = response.data;
            setAllMyCurrentMeds(cachedCurrentMeds);
            saveCurrentMeds(cachedCurrentMeds);
          }
        }

        // Fetch records if missing from cache
        if (!cachedActiveMeds || cachedActiveMeds.length === 0) {
          const getActiveMedicationData = await ApiCallWithUserId(
            'post',
            'get_medication_records',
            userData?.id,
          );
          if (getActiveMedicationData?.entries?.items?.length > 0) {
            cachedActiveMeds = Array.from(
              new Map(
                getActiveMedicationData.entries.items.map(item => [
                  `${item.date}_${item.medication_id || item.id}`,
                  { ...item, id: item.medication_id || item.id }
                ]),
              ).values(),
            );
            setAllActiveMedicationRedux(cachedActiveMeds);
            saveActiveMedications(cachedActiveMeds);
          }
        }

        // Sync and prepare data
        if (cachedCurrentMeds && cachedCurrentMeds.length > 0) {
          await setAllMedicationToFile(cachedCurrentMeds, cachedActiveMeds || []);
        }

        getDataVisualizer(finalActiveCity);
      };
      loadData();
    }, [userData?.id, setAllMedicationToFile, getDataVisualizer, getAllAllergens]),
  );

  useFocusEffect(
    useCallback(() => {
      getSelectedAllergens(activeCity);
    }, [activeCity, getSelectedAllergens]),
  );

  // console.log("allActiveMedicationRedux",allActiveMedicationRedux)

  // Alert.alert("activeCity",activeCity.city_name)

  useEffect(() => {
    if (allActiveMedicationRedux.length > 0) {
      getMedicationRecords(selecteddate, allActiveMedicationRedux);
    }
  }, [allActiveMedicationRedux, selecteddate, getMedicationRecords]);

  useEffect(() => {
    // getSelectedAllergens(activeCity);

    if (type == 'medication') {
      getMedicationApi();
    }
  }, [selecteddate, activeCity, type, getMedicationApi]);

  const NewActiveCity = useCallback(cities => {
    const list = cities || AllCities;
    if (!activeCity && list.length > 0) {
      setActiveCityLocal(list[0]);
      saveActiveCity(list[0]);
    } else {
      console.log('active city exists or no cities');
    }
  }, [AllCities, activeCity]);

  const getMedApiDataAndSaveToFile = async (currentMeds, activeMeds) => {
    const currentDate = moment().local().format('YYYY-MM-DD');

    if (
      currentMeds.length > 0 ||
      (activeMeds.length > 0 &&
        moment(activeMeds[activeMeds.length - 1].date).format('YYYY-MM-DD') ===
          currentDate)
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

  const getApiDataAndSaveToFile = async activeMeds => {
    if (activeMeds.length === 0) {
      setSavingDataLoader(true);

      const getActiveMedicationData = await ApiCallWithUserId(
        'post',
        'get_medication_records',
        userData?.id,
      );

      if (getActiveMedicationData?.entries?.items?.length > 0) {
        const uniqueItems = Array.from(
          new Map(
            getActiveMedicationData.entries.items.map(item => [
              `${item.date}_${item.medication_id || item.id}`,
              {...item, id: item.medication_id || item.id},
            ]),
          ).values(),
        );
        setAllActiveMedicationRedux(uniqueItems);
        saveActiveMedications(uniqueItems);
        setSavingDataLoader(false);
      } else {
        setSavingDataLoader(false);
      }
      return;
    }
  };

  const setAllMedicationToFile = useCallback(async (currentMeds, activeMeds) => {
    const currentDate = moment().local().format('YYYY-MM-DD');

    if (activeMeds.length > 0) {
      const allergenLastDate = activeMeds[activeMeds?.length - 1]?.date;

      if (allergenLastDate !== currentDate) {
        const startDate = moment(allergenLastDate, 'YYYY-MM-DD').add(1, 'day');
        const endDate = moment(currentDate, 'YYYY-MM-DD');
        const dateArray = [];
        while (startDate.isSameOrBefore(endDate)) {
          dateArray.push(startDate.format('YYYY-MM-DD'));
          startDate.add(1, 'day');
        }

        const existingMap = new Set(
          activeMeds.map(med => `${med.date}_${med.medication_id || med.id}`),
        );

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

        if (toAdd.length > 0) {
          const updated = [...activeMeds, ...toAdd];
          setAllActiveMedicationRedux(updated);
          await saveActiveMedications(updated);
        }
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
  }, []);

  const getAllAllergens = useCallback(() => {
    setType('allergens');
    setActiveDate(null);
    setPollenLoader(true);

    console.log('userData', userData);
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_all_allergens`,
      headers: {'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0'},
    };

    axios
      .request(config)
      .then(response => {
        // console.log(JSON.stringify(response.data));
        setPollenLoader(false);
        console.log('response.data', response.data);
        // Extract the allergens array from the response object
        const allergens = response.data?.allergens || response.data || [];
        const finalAllergens = Array.isArray(allergens) ? allergens : [];
        setTodayPollensData(finalAllergens);
        saveAllergens(finalAllergens);
      })
      .catch(error => {
        console.log(error);
        setPollenLoader(false);
      });
  }, [userData]);

  const getMedicationApi = useCallback(() => {
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
  }, [selecteddate, userData?.id]);

  // working ********
  // const getMedicationRecords = (ewformateddate, allActiveMedicationRedux) => {
  //   if (!allActiveMedicationRedux || allActiveMedicationRedux.length === 0) {
  //     setMedicationnRecord([]);
  //     return;
  //   }

  //   const end = moment(); // today
  //   const start = moment().local().subtract(6, 'day'); // last 7 days

  //   setStartDate(start);
  //   setEndDate(end);

  //   // ✅ sirf last 7 din ka data lo
  //   const filteredData = allActiveMedicationRedux.filter(entry =>
  //     moment(entry.date, 'YYYY-MM-DD').isBetween(start, end, 'day', '[]'),
  //   );

  //   setStartDate(filteredData[0]?.date);
  //   // console.log('filteredData', filteredData);

  //   const dayNumbers = [];
  //   let current = start.clone();

  //   while (current.isSameOrBefore(end)) {
  //     dayNumbers.push(current.date());
  //     current.add(1, 'day');
  //   }

  //   setAllDayNumber(dayNumbers);

  //   // ✅ Group by date
  //   const grouped = {};
  //   filteredData.forEach(entry => {
  //     if (!grouped[entry.date]) {
  //       grouped[entry.date] = [];
  //     }
  //     grouped[entry.date].push(entry);
  //   });

  //   const barData = [];

  //   Object.keys(grouped).forEach(date => {
  //     const group = grouped[date];
  //     group.forEach((entry, idx) => {
  //       const formattedLabel = moment(entry.date, 'YYYY-MM-DD').format('D');
  //       const value = parseInt(entry.units) || 0;
  //       const isLast = idx === group.length - 1;

  //       barData.push({
  //         value,
  //         ...(idx === 0 && {label: formattedLabel}), // ✅ only first entry of date gets label
  //         spacing: isLast ? 30 : 0, // ✅ spacing after last entry of that date
  //         frontColor: entry.frontColor || '#E23131',

  //         labelWidth: 30,
  //       });
  //     });
  //   });

  //   setMedicationnRecord(barData);
  // };

  // console.log("medicationRecord",MedicationnRecord)

  const getMedicationRecords = useCallback((ewformateddate, allActiveMedicationRedux) => {
    if (!allActiveMedicationRedux || allActiveMedicationRedux.length === 0) {
      setMedicationnRecord([]);
      return;
    }

    const end = moment(); // today
    const start = moment().local().subtract(20, 'day'); // last 21 days

    setStartDate(start);
    setEndDate(end);

    // ✅ sirf last 21 din ka data lo
    const filteredData = allActiveMedicationRedux.filter(entry =>
      moment(entry.date, 'YYYY-MM-DD').isBetween(start, end, 'day', '[]'),
    );

    setStartDate(filteredData[0]?.date);

    // ✅ Group by date
    const grouped = {};
    filteredData.forEach(entry => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = [];
      }
      grouped[entry.date].push(entry);
    });

    // ✅ Ab proper grouped structure banao
    const barData = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map(date => {
        const group = grouped[date];
        const formattedLabel = moment(date, 'YYYY-MM-DD').format('D');

        return {
          date: date,
          label: formattedLabel,
          meds: group.map((entry, idx) => ({
            value: parseInt(entry.units) || 0,
            spacing: idx === group.length - 1 ? 30 : 0,
            frontColor: entry.frontColor || '#E23131',
            labelWidth: 30,
          })),
        };
      });

    setMedicationnRecord(barData);
  }, []);

  const getDataVisualizer = useCallback(async (selecallergens, city) => {
    // console.log("city ? city : AllCities[0]", city ? city : AllCities[0])

    // console.log("city",city)
    if (!selecallergens || selecallergens.length === 0) {
      // no allergens selected, clear chart data
      setPrimaryLineData([]);
      setSecondaryLineData([]);
      setthirdLineData([]);
      setfourthLineData([]);
      setFifthLineData([]);
      setLoadingItemId(null);
      return;
    }

    // const getCity = await AsyncStorage.getItem('isCity');
    // const parseCity = JSON.parse(getCity);

    setPickedCity(AllCities[0]);

    // if (getCity) {
    setDataVisualizerLoader(true);
    const allergenParams = selecallergens
      .map(
        item => `scientific_names[]=${encodeURIComponent(item.allergen_name)}`,
      )
      .join('&');

    // Get date 21 days ago (start point)
    const previousSevenDate = moment().local().subtract(20, 'days');
    // Convert your API date to moment
    const targetDate = moment(allActiveMedicationRedux[0]?.date).local();
    // Check if it's before 21 days ago
    const checkDateIsBefore = targetDate.isBefore(previousSevenDate);

    const dateis =
      allActiveMedicationRedux.length > 0 && !checkDateIsBefore
        ? moment(allActiveMedicationRedux[0]?.date).local().format('YYYY-MM-DD')
        : moment().local().subtract(20, 'day').format('YYYY-MM-DD');

    const pickLat = city
      ? city?.lat
      : activeCity
      ? activeCity.lat
      : AllCities[0]?.lat;
    const pickLng = city
      ? city?.lng
      : activeCity
      ? activeCity.lng
      : AllCities[0]?.lng;

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}/allergy_data/v1/user/${
        userData?.id
      }/data_visualizer?lat=${
        activeCityLocalState
          ? activeCityLocalState?.lat
          : city
          ? city?.lat
          : activeCity
          ? activeCity.lat
          : AllCities[0]?.lat
      }&lng=${
        activeCityLocalState
          ? activeCityLocalState?.lng
          : city
          ? city?.lng
          : activeCity
          ? activeCity.lng
          : AllCities[0]?.lng
      }&start_date=${dateis}&${allergenParams}`,
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

        const chartLineData = {};
        Object.keys(apiData).forEach(key => {
          if (key !== 'dates' && key !== 'symptom_level') {
            chartLineData[key] = apiData[key].map(val => ({value: val}));
          }
        });

        // console.log('selecallergens', selecallergens);
        //edited code
        const first = selecallergens[0];
        const second = selecallergens[1];
        const third = selecallergens[2];
        const fourth = selecallergens[3];
        const fifth = selecallergens[4];

        // console.log("first",first, second )

        const ambrosiaData = buildLineData(
          chartLineData[first?.allergen_name],
          MedicationnRecord,
          apiData.dates,
        );
        const miscData = buildLineData(
          chartLineData[second?.allergen_name],
          MedicationnRecord,
          apiData.dates,
        );
        // new
        const FRAXINUSData = buildLineData(
          chartLineData[third?.allergen_name],
          MedicationnRecord,
          apiData.dates,
        );
        const HELICOMYCESData = buildLineData(
          chartLineData[fourth?.allergen_name],
          MedicationnRecord,
          apiData.dates,
        );
        const MISCELLANEOUSData = buildLineData(
          chartLineData[fifth?.allergen_name],
          MedicationnRecord,
          apiData.dates,
        );

        const getSymtomsData = buildSymtomsData(
          apiData.symptom_level,
          MedicationnRecord,
          apiData.dates,
        );

        // setAllSymtoms(apiData.symptom_level);
        setAllSymtoms(getSymtomsData);
        // console.log( " ambrosiaData",  ambrosiaData, "miscData",miscData )

        setPrimaryLineData(ambrosiaData || []);
        setSecondaryLineData(miscData || []);
        setthirdLineData(FRAXINUSData || []);
        setfourthLineData(HELICOMYCESData || []);
        setFifthLineData(MISCELLANEOUSData || []);

        colours[0] = first?.chartColor || '#4A90E2';
        colours[1] = second?.chartColor || '#50E3C2';
        colours[2] = third?.chartColor || '#F5A623';
        colours[3] = fourth?.chartColor || '#D0021B';
        colours[4] = fifth?.chartColor || '#7ED321';

        setLoadingItemId(null);
        // ....................

        setDataVisualizerLoader(false);
      })
      .then(response => {
        setDataVisualizerLoader(false);
        setLoadingItemId(null);
      })
      .catch(error => {
        setDataVisualizerLoader(false);
        setLoadingItemId(null);
        console.log(error);
      });
    // } else {
    //   console.log('add city');
    // }
  }, [AllCities, activeCity, activeCityLocalState, allActiveMedicationRedux, MedicationnRecord, userData?.id]);

  const buildLineData = (pollenArray, medicationRecord, apiDates) => {
    const lineData = [];
    let currentDateMeds = 0;

    medicationRecord.forEach(bar => {
      currentDateMeds++;

      if (bar.label) {
        const idx = apiDates ? apiDates.indexOf(bar.date) : -1;
        if (idx !== -1 && pollenArray && pollenArray[idx] !== undefined) {
          lineData.push({
            value: pollenArray[idx].value,
            spacing: currentDateMeds == 1 ? 0 : currentDateMeds,
          });
        }
        currentDateMeds = 0; // reset counter for next date
      }
    });

    return lineData;
  };

  const buildSymtomsData = (pollenArray, medicationRecord, apiDates) => {
    const lineData = [];
    let currentDateMeds = 0;

    medicationRecord.forEach(bar => {
      currentDateMeds++;

      if (bar.label) {
        const idx = apiDates ? apiDates.indexOf(bar.date) : -1;
        if (idx !== -1 && pollenArray && pollenArray[idx] !== undefined) {
          lineData.push({
            value: pollenArray[idx],
            spacing: currentDateMeds == 1 ? 0 : currentDateMeds,
          });
        }
        currentDateMeds = 0; // reset counter for next date
      }
    });

    return lineData;
  };

  const addAllergens = item => {
    setPollenLoader(true);

    if (takingMedications.length == 5) {
      setPollenLoader(false);
      return Alert.alert(
        'Limit Reached',
        `You can only view 5 allergens at a time. Please remove one of: ${takingMedications
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
        getSelectedAllergens(activeCity);
      })
      .catch(error => {
        console.log(error);
        setPollenLoader(false);
      });
  };

  const getSelectedAllergens = useCallback(city => {
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
        getDataVisualizer(coloredAllergens, city);
        setTakingMedications(coloredAllergens);
      })
      .catch(error => {
        console.log(error);
      });
  }, [userData?.id, getDataVisualizer]);

  const deleteAllergens = async item => {
    setLoadingItemId(item.id);
    if (!item?.id) {
      console.warn('Invalid allergen item. Skipping delete.');
      return;
    }

    const updatedAllergens = takingMedications.filter(
      med => med.id !== item.id,
    );

    setTakingMedications(updatedAllergens);

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
      setLoadingItemId(null);
    } finally {
      // setLoadingItemId(null);
    }
  };

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

  const addMedication = async item => {
    const medID = item.medication_id || item.id;
    const updated = allActiveMedicationRedux.map(med =>
      (med.medication_id || med.id) === medID && med.date === item.date
        ? {...med, units: (parseInt(med.units) || 0) + 1}
        : med,
    );
    setAllActiveMedicationRedux(updated);
    saveActiveMedications(updated);
    SaveMedicationDataInApi(updated);
  };

  const removeMedication = async item => {
    const medID = item.medication_id || item.id;
    const updated = allActiveMedicationRedux.map(med =>
      (med.medication_id || med.id) === medID &&
      med.date === item.date &&
      (parseInt(med.units) || 0) > 0
        ? {...med, units: (parseInt(med.units) || 0) - 1}
        : med,
    );
    setAllActiveMedicationRedux(updated);
    saveActiveMedications(updated);
    SaveMedicationDataInApi(updated);
  };

  const assignColorsToAllergens = (allergens, colors) => {
    return allergens.map((item, index) => ({
      ...item,
      chartColor: colors[index % colors.length],
    }));
  };

  const getLocation = async type => {
    setType(type);

    // if (userData.email) {
    //   const res = await GetAllLocation(userData.id);
    //   console.log('res', res);

    //   setAllCities(res.cities);
    // } else {
    //   setAllCities();
    // }
  };

  // console.log("loadingItemId",loadingItemId)

  const SelectLocation = async city => {
    setactiveCityLocalState(city);
    setActiveCityLocal(city);
    saveActiveCity(city);
  };

  const chartSpacing = responsiveWidth(20); // You can tweak this value as needed

  const emojiMap = {
    1: AppImages.Hello,
    2: AppImages.Mask,
    3: AppImages.Pain,
    4: AppImages.Star,
    5: AppImages.Bored,
  };

  const NewPro = [{value: 0}, {value: 2}, {value: 3}];

  // Chart height in px (same as <Svg height>)
  const chartHeight = 200;

  // Y scale → converts value (0–8) to pixel (bottom → top)
  const maxYValue = 8; // highest pollen/medication level
  const scaleY = value => chartHeight - (value / maxYValue) * chartHeight;

  const lineData = PrimaryLineData?.map((d, i) => ({
    x: (i + 0.5) * responsiveWidth(29),
    y: scaleY(d.value),
  }));

  // Convert to string for Polyline
  const points = lineData?.map(p => `${p.x},${p.y}`).join(' ');

  const secondLineData = SecondaryLineData?.map((d, i) => ({
    x: (i + 0.5) * responsiveWidth(29),
    y: scaleY(d.value),
  }));
  const secondpoints = secondLineData?.map(p => `${p.x},${p.y}`).join(' ');

  //third
  const newthirdLineData = thirdLineData?.map((d, i) => ({
    x: (i + 0.5) * responsiveWidth(29),
    y: scaleY(d.value),
  }));
  const thirdpoints = newthirdLineData?.map(p => `${p.x},${p.y}`).join(' ');

  //fourth
  const newfourthLineData = fourthLineData?.map((d, i) => ({
    x: (i + 0.5) * responsiveWidth(29),
    y: scaleY(d.value),
  }));
  const fourthpoints = newfourthLineData?.map(p => `${p.x},${p.y}`).join(' ');

  //fifth
  const newfifithLineData = FifthLineData?.map((d, i) => ({
    x: (i + 0.5) * responsiveWidth(29),
    y: scaleY(d.value),
  }));
  const fifthpoints = newfifithLineData?.map(p => `${p.x},${p.y}`).join(' ');

  const symtomsData = allSymtoms?.map((d, i) => ({
    value: d?.value,
    spacing: d?.spacing + 80,
  }));

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: AppColors.WHITE}}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
          backgroundColor: AppColors.WHITE,
          paddingBottom: 400,
          // paddingBottom: insets.bottom + 40,
        }}>
        <AppHeader
          heading="Data Visualizer"
          Rightheading="Today"
          subheading="Your Data, Visualized"
          goBack
          selecteddate={selecteddate}
        />

        {savingDataLoader && (
          <ActivityIndicator size={'small'} color={AppColors.BLACK} />
        )}

        {isPremium ? (
          <>
            {startDate && endDate && (
              <View
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <AppText
                  title={`${moment(startDate).format('MMM DD')} - ${moment(
                    endDate,
                  ).format('MMM DD')}`}
                  textSize={2}
                  textColor={AppColors.BLACK}
                  textAlignment={'center'}
                />

                <TouchableOpacity
                  style={{padding: 20}}
                  onPress={() => getSelectedAllergens(activeCity)}>
                  <Ionicons
                    name="reload"
                    size={responsiveFontSize(3)}
                    color={AppColors.BLACK}
                  />
                </TouchableOpacity>
              </View>
            )}

            {DataVisualizerLoader == true ? (
              <View
                style={{
                  // height: responsiveHeight(30),
                  minHeight: responsiveHeight(30),
                  position: 'relative',
                  paddingBottom: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              </View>
            ) : (
              <View
                style={{
                  minHeight: responsiveHeight(30),
                  paddingBottom: 20,
                  // position: 'absolute',
                }}>
                {MedicationnRecord?.length > 0 ? (
                  <View style={{}}>
                    <View
                      style={{
                        minHeight: responsiveHeight(30),
                        width: responsiveWidth(100),
                        position: 'absolute',
                        gap: 1.5,
                      }}>
                      <SvgDashLine />
                      <SvgDashLine />
                      <SvgDashLine />
                      <SvgDashLine />
                      <SvgDashLine />
                      <SvgDashLine />
                      <SvgDashLine />
                      <SvgDashLine />
                      <SvgDashLine />
                      <Svg height={22} width="100%">
                        <Line
                          x1="0"
                          y1="10"
                          x2="100%"
                          y2="10"
                          stroke="black"
                          strokeWidth="2"
                        />
                      </Svg>
                    </View>
                    <ScrollView
                      contentContainerStyle={{}}
                      style={{marginLeft: 10}}
                      horizontal={true}>
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          marginLeft: responsiveWidth(3.5),
                          flexDirection: 'row',
                          zIndex: 100,
                        }}>
                        {symtomsData.map((item, index) => {
                          const emojiMap = {
                            1: AppImages.Mask,
                            2: AppImages.Pain,
                            3: AppImages.Bored,
                            4: AppImages.Hello,
                            5: AppImages.Star,
                          };

                          return (
                            <View
                              key={index}
                              style={{
                                width: responsiveWidth(29),
                                alignItems: 'center',
                              }}>
                              <Image
                                source={emojiMap[item.value]}
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

                      <View>
                        <FlatList
                          data={MedicationnRecord} // [{label: '11', meds: [...]}, {label: '12', meds: [...]}]
                          horizontal
                          keyExtractor={item => item.label}
                          contentContainerStyle={{
                            width: responsiveWidth(650),
                            spacing: 20,
                            height: 220,
                            alignItems: 'flex-end',
                            marginBottom: 20,
                            marginLeft: responsiveWidth(3.5),
                          }}
                          renderItem={({item}) => (
                            <View
                              style={{
                                width: responsiveWidth(29), // fixed slot per day
                                alignItems: 'center',
                              }}>
                              {/* Bars */}
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'flex-end',
                                }}>
                                {item?.meds?.map((m, idx) => (
                                  <View
                                    key={idx}
                                    style={{
                                      height:
                                        m.value > 0
                                          ? responsiveHeight(m.value * 3.4)
                                          : 0,
                                      width: 8,
                                      marginRight: m.spacing,
                                      backgroundColor:
                                        m.value > 0
                                          ? m.frontColor
                                          : 'transparent',
                                    }}
                                  />
                                ))}
                              </View>
                            </View>
                          )}
                        />
                      </View>

                      <View
                        style={{
                          position: 'absolute',
                          zIndex: 100,
                          marginLeft: responsiveWidth(3.5),
                          bottom: -0,
                        }}>
                        <FlatList
                          data={MedicationnRecord?.filter(res => res.label)}
                          contentContainerStyle={{}}
                          horizontal
                          renderItem={({item, index}) => {
                            return (
                              <View
                                style={{
                                  width: responsiveWidth(29),
                                  alignItems: 'center',
                                }}>
                                <AppText title={item.label} textSize={2} />
                              </View>
                            );
                          }}
                        />
                      </View>

                      {
                        //graph lines
                      }
                      <View
                        style={{
                          position: 'absolute',
                          zIndex: 11,
                          marginLeft: responsiveWidth(3.5),
                        }}>
                        <Svg
                          width={responsiveWidth(650)}
                          height={responsiveHeight(28)}>
                          <Polyline
                            points={points}
                            stroke={colours[0]}
                            strokeWidth="2"
                            fill="none"
                          />
                          {lineData.map((p, i) => (
                            <Circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              fill={colours[0]}
                            />
                          ))}
                        </Svg>
                      </View>

                      <View
                        style={{
                          position: 'absolute',
                          zIndex: 11,
                          marginLeft: responsiveWidth(3.5),
                        }}>
                        <Svg
                          width={responsiveWidth(650)}
                          height={responsiveHeight(28)}>
                          <Polyline
                            points={secondpoints}
                            stroke={colours[1]}
                            strokeWidth="2"
                            fill="none"
                          />
                          {secondLineData.map((p, i) => (
                            <Circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              fill={colours[1]}
                            />
                          ))}
                        </Svg>
                      </View>

                      {
                        //third graph lines
                      }
                      <View
                        style={{
                          position: 'absolute',
                          zIndex: 11,
                          marginLeft: responsiveWidth(3.5),
                        }}>
                        <Svg
                          width={responsiveWidth(650)}
                          height={responsiveHeight(28)}>
                          <Polyline
                            points={thirdpoints}
                            stroke={colours[2]}
                            strokeWidth="2"
                            fill="none"
                          />
                          {newthirdLineData.map((p, i) => (
                            <>
                              <Circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill={colours[2]}
                              />
                            </>
                          ))}
                        </Svg>
                      </View>

                      {
                        //fourth graph lines
                      }
                      <View
                        style={{
                          position: 'absolute',
                          zIndex: 11,
                          marginLeft: responsiveWidth(3.5),
                        }}>
                        <Svg
                          width={responsiveWidth(650)}
                          height={responsiveHeight(28)}>
                          <Polyline
                            points={fourthpoints}
                            stroke={colours[3]}
                            strokeWidth="2"
                            fill="none"
                          />
                          {newfourthLineData.map((p, i) => (
                            <Circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              fill={colours[3]}
                            />
                          ))}
                        </Svg>
                      </View>

                      {
                        //fifth graph lines
                      }
                      <View
                        style={{
                          position: 'absolute',
                          zIndex: 11,
                          marginLeft: responsiveWidth(3.5),
                        }}>
                        <Svg
                          width={responsiveWidth(650)}
                          height={responsiveHeight(28)}>
                          <Polyline
                            points={fifthpoints}
                            stroke={colours[4]}
                            strokeWidth="2"
                            fill="none"
                          />
                          {newfifithLineData.map((p, i) => (
                            <Circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              fill={colours[4]}
                            />
                          ))}
                        </Svg>
                      </View>
                    </ScrollView>

                    <View
                      style={{
                        position: 'absolute',
                        zIndex: 10,
                        bottom:
                          Platform.OS === 'ios'
                            ? responsiveHeight(3.5)
                            : responsiveHeight(3),
                        left: responsiveWidth(1.9),
                        gap: Platform.OS == 'ios' ? 32 : 30,
                        flexDirection: 'column-reverse',
                        borderRightWidth: 1,
                        paddingRight: 5,
                      }}>
                      <AppText
                        title={0}
                        textSize={2}
                        textColor={AppColors.LIGHTGRAY}
                      />
                      <AppText
                        title={2}
                        textSize={2}
                        textColor={AppColors.LIGHTGRAY}
                      />
                      <AppText
                        title={4}
                        textSize={2}
                        textColor={AppColors.LIGHTGRAY}
                      />
                      <AppText
                        title={6}
                        textSize={2}
                        textColor={AppColors.LIGHTGRAY}
                      />
                    </View>

                    <View
                      style={{
                        position: 'absolute',
                        zIndex: 1,
                        right: 0,
                        // minWidth: responsiveWidth(13.5),
                        //  justifyContent: 'space-between',
                        // paddingVertical: responsiveHeight(1),
                        // justifyContent: 'flex-start',,
                        height: responsiveHeight(30),
                        top: '30%',
                        gap: 10,
                      }}>
                      <AppText
                        // style={{
                        //   position: 'absolute',
                        //   top: '31%',
                        // }}
                        title={'Very \nHigh'}
                        textSize={1.5}
                      />
                      <AppText
                        //                   style={{
                        //   position: 'absolute',
                        //   top: '44.5%',
                        // }}
                        title={'High'}
                        textSize={1.5}
                      />

                      <AppText
                        //                    style={{
                        //   position: 'absolute',
                        //   top: '53%',
                        // }}
                        title={'Moderate'}
                        textSize={1.5}
                      />
                      <AppText
                        // style={{
                        //   position: 'absolute',
                        //   top: '62%'
                        // }}
                        title={'Low'}
                        textSize={1.5}
                      />

                      <AppText
                        // style={{
                        //   position: 'absolute',
                        //   top: '62%'
                        // }}
                        title={'None'}
                        textSize={1.5}
                      />
                    </View>
                  </View>
                ) : (
                  <AppText title={'No data available'} textSize={2} />
                )}
              </View>
            )}

            <View style={{gap: 20}}>
              <View>
                <AppText title={'Allergens'} textSize={2} textFontWeight />
                <FlatList
                  data={takingMedications}
                  keyExtractor={item => item?.id?.toString()}
                  renderItem={({item, index}) => (
                    <View
                      style={{
                        minHeight: responsiveHeight(5),
                        width: responsiveWidth(87),
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderColor: AppColors.LIGHTGRAY,
                        backgroundColor: colours[index],
                        flexDirection: 'row',
                        marginTop: 5,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        alignSelf: 'center',
                        paddingRight: 0,
                        paddingLeft: 5,
                        borderWidth: 1,
                      }}>
                      <AppText
                        title={item.allergen_name}
                        textSize={1.5}
                        textwidth={60}
                      />

                      {loadingItemId == item?.id ? (
                        <View style={{paddingRight: 20}}>
                          <ActivityIndicator
                            size={'large'}
                            color={AppColors.WHITE}
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => deleteAllergens(item)}
                          style={{
                            padding: 10,
                            width: responsiveWidth(25),
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingRight: 30,
                            minHeight: responsiveHeight(6),
                          }}>
                          <AntDesign
                            name="minus"
                            size={responsiveFontSize(3)}
                            color={AppColors.LIGHTGRAY}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              </View>

              {activeCity && (
                <View style={{gap: 10}}>
                  <AppText title={'City'} textSize={2} textFontWeight />
                  <View
                    style={{
                      // height: 50,
                      minHeight: responsiveHeight(6),
                      width: responsiveWidth(90),
                      // maxWidth: 400,
                      alignSelf: 'center',
                      backgroundColor: AppColors.PEACHCOLOUR,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      paddingHorizontal: 20,
                    }}>
                    <AppText
                      title={
                        activeCityLocalState
                          ? activeCityLocalState?.city_name
                          : activeCity?.city_name
                          ? activeCity?.city_name
                          : AllCities[0]?.city_name
                      }
                      textSize={2}
                      textFontWeight
                      textColor={AppColors.BLACK}
                    />
                  </View>
                </View>
              )}
            </View>

            <View>
              <View
                style={{
                  marginVertical: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <TouchableOpacity
                  onPress={() => getAllAllergens()}
                  style={{
                    minHeight: responsiveHeight(5.5),
                    paddingVertical: 10,
                    width: '48%',
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
                    // height: responsiveHeight(5),
                    // width: responsiveWidth(44),
                    minHeight: responsiveHeight(5.5),
                    paddingVertical: 10,
                    width: '48%',
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
                  width: responsiveWidth(90),
                  // maxWidth: 400,
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    type === 'Add Location'
                      ? AppColors.BTNCOLOURS
                      : AppColors.WHITE,
                  marginTop: 10,
                  paddingVertical: 12,
                }}
                // style={{
                //   height: responsiveHeight(5),
                //   width: responsiveWidth(90),
                //   borderWidth: 1,
                //   borderRadius: 10,
                //   alignItems: 'center',
                //   justifyContent: 'center',
                //   backgroundColor:
                //     type == 'Add Location'
                //       ? AppColors.BTNCOLOURS
                //       : AppColors.WHITE,
                //   marginTop: 10,
                // }}
              >
                <AppText
                  title={'Change Location'}
                  textColor={
                    type == 'Add Location' ? AppColors.WHITE : AppColors.BLACK
                  }
                  textSize={2}
                  textFontWeight
                />
              </TouchableOpacity>
            </View>

            {pollenLoader && (
              <View style={{marginTop: 30}}>
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              </View>
            )}
            {type == 'medication' ? (
              <View>
                <FlatList
                  data={allActiveMedicationRedux.filter(
                    item => item.date === selecteddate,
                  )}
                  contentContainerStyle={{
                    gap: 10,
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                  renderItem={({item}) => {
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: AppColors.WHITE,
                    borderWidth: 1,
                    borderColor: AppColors.LIGHTGRAY,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                    height: responsiveHeight(6),
                    marginTop: 10,
                  }}>
                  <Ionicons
                    name="search"
                    size={responsiveFontSize(2.5)}
                    color={AppColors.LIGHTGRAY}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      color: AppColors.BLACK,
                      fontSize: responsiveFontSize(2),
                    }}
                    placeholder="Search Allergens..."
                    placeholderTextColor={AppColors.LIGHTGRAY}
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>
                <FlatList
                  data={todayPollensData
                    ?.filter(
                      item =>
                        item.common_name
                          ?.toLowerCase()
                          .includes(searchText.toLowerCase()) ||
                        item.name
                          ?.toLowerCase()
                          .includes(searchText.toLowerCase()),
                    )
                    ?.sort((a, b) =>
                      a.common_name.localeCompare(b.common_name),
                    )}
                  renderItem={({item}) => {
                    return (
                      <TouchableOpacity
                        onPress={() =>
                          pollenLoader == true
                            ? console.log('adding')
                            : addAllergens(item)
                        }
                        style={{
                          // height: responsiveHeight(6),
                          minHeight: responsiveHeight(6),
                          maxWidth: 400,
                          // width: responsiveWidth(90),
                          width: '100%',
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
                        <View>
                          <AppText title={item.common_name} textSize={1.5} />
                          <AppText title={item.name} textSize={1.5} />
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            ) : (
              <View>
                <FlatList
                  data={AllCities}
                  renderItem={({item}) => {
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
          <View style={{justifyContent: 'center', marginTop: 20}}>
            <SubscribeBar
              title="Subscribe now to correlate pollen and spore levels with medication and symptoms"
              title2={
                'With a premium subscription, overly daily symptoms and medication intake with local pollen and spore data, which can help you uncover hidden connections between environmental triggers and your health. By analyzing these correlations, you can see what might be causing your allergies or triggers. Understanding these patterns is key to managing your symptoms more effectively and improving your quality of life.'
              }
              handlePress={() => navigation.navigate('Subscription')}
              img={AppImages.Datavisiualizer}
            />
          </View>
        )}
      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        minimumDate={
          allActiveMedicationRedux.length > 0
            ? moment(allActiveMedicationRedux[0]?.date).local()
            : moment().local()
        }
        // minimumDate={allActiveMedicationRedux[0]?.date ? new Date(allActiveMedicationRedux[0]?.date) :  new Date() }
        maximumDate={new Date(moment().local())}
        onConfirm={selectedDate => {
          setDate(selectedDate);
          setOpen(false);
          const today = moment().startOf('day');
          const picked = moment(selectedDate).startOf('day');
          const formattedDate = picked.format('YYYY-MM-DD');

          setSelectedDate(formattedDate);
          // getMedicationRecords(formattedDate);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </SafeAreaView>
  );
};

export default DatavisualizerSample;
