import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import AppImages from '../../assets/images/AppImages';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils/Responsive_Dimensions';
import AppText from '../../components/AppTextComps/AppText';
import AppColors from '../../utils/AppColors';
import { LineChart } from 'react-native-chart-kit';
import AppButton from '../../components/AppButton';
import axios from 'axios';
import BASE_URL from '../../utils/BASE_URL';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import LoaderMode from '../../components/LoaderMode';
import DatePicker from 'react-native-date-picker';
import { AllergyTips } from '../../utils/AllergyTips';
import AppIntroSlider from 'react-native-app-intro-slider';
import SubscribeBar from '../../components/SubscribeBar';
import { saveSymtoms, loadSymtoms } from '../../global/SymtomsFileCache';

const Symptom = ({ navigation }) => {
  const screenWidth = Dimensions.get('window').width;
  const sliderRef = useRef(null);
  const dispatch = useDispatch();

  const expireDate = useSelector(state => state.auth.expireDate);
  const isPremium = expireDate ? new Date() <= new Date(expireDate) : false;
  const [loader, setLoader] = useState(false);
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [endopen, setEndOpen] = useState(false);
  const [graphSlides, setGraphSlides] = useState([]);

  const [randomTip, setRandomTip] = useState(null);

  const [symtomsData, setSymtomsData] = useState();
  const [systomsNumber, setSymtomsNumber] = useState();

  //start date states
  const [open, setOpen] = useState(false);
  const [selecteddate, setSelectedDate] = useState(
    moment().local().format('YYYY-MM-DD'),
  );

  const [date, setDate] = useState(new Date(moment().local()));
  //start date states
  const userData = useSelector(state => state?.auth?.user);


  const mojis = [
    { id: 1, img: AppImages.Mask, title: 'Very Bad' },
    { id: 2, img: AppImages.Pain, title: 'Bad' },
    { id: 3, img: AppImages.Bored, title: 'Okay' },
    { id: 4, img: AppImages.Hello, title: 'Good' },
    { id: 5, img: AppImages.Star, title: 'Very Good' },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#FFFFFF',
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `black`,
    strokeWidth: 0, // optional, default 3
    barPercentage: 0,
    useShadowColorFromDataset: false, // optional
    propsForBackgroundLines: {
      strokeDasharray: '', // solid background lines
    },
  };



  useEffect(() => {
    const nav = navigation.addListener('focus', async () => {
      setLoader(true);
      // Load from file cache on focus
      const cached = await loadSymtoms();
      if (cached) {
        setGraphSlides(cached);
      }

      generateGraphSlides(selecteddate, cached); // Pass cached data to avoid re-fetch Check

      const random =
        AllergyTips[Math.floor(Math.random() * AllergyTips.length)];
      setRandomTip(random);
    });

    return nav;
  }, [navigation, selecteddate]);

  useEffect(() => {
    const nav = navigation.addListener('focus', () => {

      // Alert.alert("slide")

      if (sliderRef.current && graphSlides.length > 0) {
        // Jump to the last slide
        sliderRef.current.goToSlide(graphSlides.length - 1, false); // false = don't trigger onSlideChange
        setSelectedDate(moment().local().format('YYYY-MM-DD'))
        // scrollToDateSlide(moment(selecteddate).format('D'))
      }
    })
    return nav;
  }, [navigation]);

  const setApiSymtomsData = id => {
    const day = moment(selecteddate).format('D'); // returns "26"

    const updateDatalocal = updateData(graphSlides, day, id);

    if (updateDatalocal.length > 0) {
      setGraphSlides(updateDatalocal);
      saveSymtoms(updateDatalocal);
      setSymtomsNumber(id);
      scrollToDateSlide(day)
      // sliderRef?.current?.goToSlide(graphSlides?.length - 1, false);

      // return
    }

    // console.log("emoji id", id)
    // return
    setSymtomsNumber(id);

    setLoader(true);
    try {
      const todayDate = moment().format('YYYY-MM-DD');

      let data = JSON.stringify({
        level: id,
        date: selecteddate,
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/allergy_data/v1/user/${userData?.id}/set_symptom_record`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      axios
        .request(config)
        .then(response => {
          // getSymtomsData();
          generateGraphSlides(selecteddate, true); // force re-fetch if needed after API post or just let it be updated locally above

        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log('error', error);
    }
  };

  // console.log("AllSymtomsDataFromRedux",AllSymtomsDataFromRedux)
  const generateGraphSlides = async (selectedDate, currentSlidesProp, forceFetch = false) => {
    const currentSlides = currentSlidesProp || graphSlides;

    if (currentSlides?.length > 0 && !forceFetch) {
      const lastName = currentSlides?.at(-1)?.chartData?.labels?.at(-1);
      const currentDate = moment(new Date()).local().format('D');

      if (lastName === currentDate) {
        setLoader(false);
        return;
      }
    }

    setLoader(true);
    const slides = [];
    const today = moment(selectedDate ? selectedDate : new Date());

    for (let i = 0; i < 3; i++) {
      const end = moment(today)
        .subtract(i * 7, 'days')
        .format('YYYY-MM-DD');
      const start = moment(today)
        .subtract(i * 7 + 6, 'days')
        .format('YYYY-MM-DD');

      const response = await axios.post(
        `${BASE_URL}/allergy_data/v1/user/${userData?.id}/get_symptom_records`,
        JSON.stringify({
          start_date: start,
          end_date: end,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response?.data?.symptoms || [];

      const labels = data.map(item =>
        moment(item.date, 'MMM, DD YYYY').format('D'),
      );

      const values = data.map(item => parseInt(item.symptom_level));

      const chartData = {
        labels: labels,
        datasets: [
          { data: values },
          { data: [1], withDots: false },
          { data: [5], withDots: false },
        ],
      };

      slides.unshift({
        key: `${i}`,
        title: `${moment(start).format('DD MMMM')} - ${moment(end).format(
          'DD MMMM',
        )}`,
        chartData,
      });
    }

    const toDayDate = moment(new Date()).local().format('D');
    const selectedDateCopy = moment(selectedDate).local().format('D');

    setGraphSlides(slides);
    await saveSymtoms(slides);

    setGraphSlides(slides);
    setLoader(false);
  };


  const updateData = (allData, targetDate, newValue) => {
    return allData.map(item => {
      const index = item.chartData.labels.indexOf(String(targetDate));
      if (index !== -1) {
        return {
          ...item,
          chartData: {
            ...item.chartData,
            datasets: item.chartData.datasets.map((dataset, i) => {
              // Only update dataset[0], keep others as they are
              if (i === 0) {
                const newData = [...dataset.data];
                newData[index] = newValue;
                return { ...dataset, data: newData };
              }
              return dataset;
            }),
          },
        };
      }
      return item;
    });
  };

  const scrollToDateSlide = (targetDay) => {

    const foundIndex = graphSlides.findIndex(slide =>
      slide?.chartData?.labels?.includes(String(parseInt(targetDay)))
    );

    if (foundIndex !== -1 && sliderRef.current) {
      // scroll to that week’s slide
      sliderRef.current.goToSlide(foundIndex, true);
    }
  };


  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: AppColors.WHITE, paddingTop: 30 }}>
      <View style={{ backgroundColor: AppColors.WHITE, flex: 1 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <AppHeader
            heading="Symptom"
            Rightheading="Today"
            subheading="Tracker"
            selecteddate={selecteddate}
            setOpen={() => setOpen(!open)}
          />
        </View>
        {
          //start date
        }
        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          maximumDate={new Date(moment().local())}
          onConfirm={selectedDate => {
            setDate(selectedDate);
            setOpen(false);
            const today = moment().startOf('day');
            const picked = moment(selectedDate).startOf('day');
            const formattedDate = picked.format('YYYY-MM-DD');
            setSelectedDate(formattedDate);
            scrollToDateSlide(moment(formattedDate).format('D'))
            // getSymtomsData(formattedDate);
            // generateGraphSlides(formattedDate);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />

        {
          //End date
        }
        <DatePicker
          modal
          open={endopen}
          date={date}
          mode="date"
          maximumDate={new Date()}
          onConfirm={selectedDate => {
            setEndOpen(false);
            const today = moment().startOf('day');
            const picked = moment(selectedDate).startOf('day');
            const formattedDate = picked.format('YYYY-MM-DD');
            setEndDate(formattedDate);

            // getSymtomsData(formattedDate);
            generateGraphSlides(formattedDate);
          }}
          onCancel={() => {
            setEndOpen(false);
          }}
        />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}>
          {isPremium ? (
            <>
              <View style={{ padding: 20 }}>
                {/* {loader ? (
                <ActivityIndicator size={'large'} color={AppColors.BLACK} />
              ) : ( */}
                <FlatList
                  data={mojis}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 10,
                    marginTop: 20,
                    backgroundColor: AppColors.WHITE,
                  }}
                  renderItem={({ item }) => {
                    // console.log("emojis data", graphSlides[0])
                    return (
                      <TouchableOpacity
                        onPress={() => setApiSymtomsData(item.id)}
                        style={{ backgroundColor: AppColors.WHITE }}>
                        <Image
                          source={item.img}
                          style={{
                            height: responsiveHeight(
                              item.id == systomsNumber ? 8 : 6,
                            ),
                            width: responsiveHeight(
                              item.id == systomsNumber ? 9 : 7,
                            ),
                            resizeMode: 'contain',
                          }}
                        />
                        <AppText
                          title={item.title}
                          textAlignment={'center'}
                          textSize={1.5}
                          textFontWeight
                        />
                      </TouchableOpacity>
                    );
                  }}
                />
                {/* )} */}
              </View>

              <View style={{ height: responsiveHeight(45) }}>
                <AppIntroSlider
                  ref={sliderRef}
                  data={graphSlides}
                  showNextButton={false}
                  showDoneButton={false}
                  showPrevButton={false}
                  activeDotStyle={{ backgroundColor: AppColors.PRIMARY }}
                  dotStyle={{ backgroundColor: AppColors.LIGHTGRAY }}
                  style={{ width: responsiveWidth(90), alignSelf: 'center' }}
                  // onSlideChange={index => console.log('index ii', index)}
                  renderItem={({ item, index }) => {
                    return (
                      <>
                        <View style={{ marginTop: 10 }}>
                          <AppText
                            title={item.title}
                            textSize={2}
                            textColor={AppColors.BLACK}
                            textFontWeight
                            textAlignment={'center'}
                          />
                        </View>
                        <View
                          style={{
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 20,
                            paddingTop: 20,
                            marginTop: 20,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                          }}>
                          <LineChart
                            data={
                              item?.chartData || {
                                labels: [],
                                datasets: [{ data: [] }],
                              }
                            }
                            width={screenWidth * 0.89}
                            height={responsiveHeight(30)}
                            verticalLabelRotation={0}
                            chartConfig={chartConfig}
                            withShadow={false}
                            withVerticalLines={false}
                            bezier
                            withHorizontalLabels={false}
                            segments={5}
                            yAxisInterval={5}
                            fromZero={true}
                            yAxisLabel="0"
                          />

                          <View
                            style={{
                              position: 'absolute',
                              zIndex: 10,
                              height: responsiveHeight(25),
                              width: responsiveWidth(10),
                              left: 10,
                            }}>
                            <FlatList
                              data={mojis}
                              inverted
                              contentContainerStyle={{ gap: 5 }}
                              renderItem={({ item }) => {
                                return (
                                  <Image
                                    source={item.img}
                                    style={{
                                      height: responsiveHeight(4),
                                      width: responsiveHeight(4),
                                      resizeMode: 'contain',
                                      alignSelf: 'center',
                                    }}
                                  />
                                );
                              }}
                            />
                          </View>
                        </View>
                      </>
                    );
                  }}
                />
              </View>
            </>
          ) : (
            <View style={{ justifyContent: 'center', padding: 20 }}>
              <SubscribeBar
                title="Subscribe now to log how you feel in the Symptom Tracker"
                title2={
                  'Tracking your daily symptoms is a great way to see how pollen, spore levels, and medication affect your well-being. This is also valuable information to share with your doctor.'
                }
                handlePress={() => navigation.navigate('Subscription')}
                img={AppImages.SymtomsGraph}
              />
            </View>
          )}

          <View style={{ paddingHorizontal: 20 }}>
            {isPremium && (
              <View style={{ marginTop: 0 }}>
                <AppButton
                  title={'Go TO DATA VISUALIZER'}
                  RightColour={AppColors.rightArrowCOlor}
                  handlePress={() => navigation.navigate('Data Visualizer')}
                />
              </View>
            )}
            <View style={{ marginTop: 10 }}>
              <AppText
                title={'Tips & Tricks'}
                textSize={3}
                textColor={AppColors.BLACK}
                textFontWeight
                textAlignment={'center'}
              />
            </View>

            {randomTip?.id == 26 ? null : (
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(2),
                    fontWeight: 'bold',
                    marginBottom: 5,
                  }}>
                  Allergy tip
                </Text>
                <Text
                  style={{ fontSize: responsiveFontSize(1.8), color: '#333' }}>
                  {randomTip?.tip}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Symptom;
