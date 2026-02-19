import { View, Text, Image } from 'react-native';
import React from 'react';
import AppImages from '../assets/images/AppImages';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';
import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
  DangerPath,
} from 'react-native-cool-speedometer';
import AppText from './AppTextComps/AppText';
import AppColors from '../utils/AppColors';

type props = {
  imgWeight?: Number;
  imgHeight?: Number;
  speedometerWidth?: Number;
  imageTop?: Number;
  TextBottom?: Number;
  TempreaturePriority?: string;
  isPollenorSpores?: string;
};

const isPollenorSporesVal = (val: any, TextBottom: any) => {
  if (val == 'pollen') {
    if (val == 'pollen' && TextBottom == 'Low') {
      return '1 - 20 grains/m³';
    } else if (val == 'pollen' && TextBottom == 'Moderate') {
      return '21 - 80 grains/m³';
    } else if (val == 'pollen' && TextBottom == 'High') {
      return '81 – 200 grains/m³';
    } else if (val == 'pollen' && TextBottom == 'Very High') {
      return '201+ grains/m³';
    }
  } else {
    if (val == 'spore' && TextBottom == 'Low') {
      return '1-1000 grains/m³';
    } else if (val == 'spore' && TextBottom == 'Moderate') {
      return '1001-2500 grains/m³';
    } else if (val == 'spore' && TextBottom == 'High') {
      return '2501 – 8000 grains/m³';
    } else if (val == 'spore' && TextBottom == 'Very High') {
      return '8001+ grains/m³';
    }
  }
  return;
};

const SpeedoMeter = ({
  imgWeight = 90,
  imgHeight = 20,
  TempreaturePriority,
  TextBottom,
  imageTop,
  speedometerWidth,
  isPollenorSpores,
}: props) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={
          TextBottom == 'Very High'
            ? AppImages.meterdarkred
            : TextBottom == 'High'
              ? AppImages.meterred
              : TextBottom == 'Moderate'
                ? AppImages.meteryellow
                : TextBottom == 'Low'
                  ? AppImages.metergreen
                  : TextBottom == 'None'
                    ? AppImages.meternone
                    : AppImages.meternone
        }
        style={{
          // position: 'absolute',
          // zIndex: 1,
          height: responsiveHeight(imgHeight),
          width: responsiveWidth(imgWeight),
          resizeMode: 'contain',
          // top: imageTop,
        }}
      />

      <AppText title={TextBottom} textColor={AppColors.BLACK} textSize={2} />
      <AppText
        title={isPollenorSporesVal(isPollenorSpores, TextBottom)}
        textColor={AppColors.BLACK}
        textSize={1.5}
      />

      {/* <Speedometer
                value={50}
                min={0}
                max={100}
                angle={180}
                rotation={-90}
                width={responsiveWidth(speedometerWidth)}
                fontFamily="Arial">
                <Arc arcWidth={0} color="url(#grad)" />
    
                <Needle
                  color="black"
                  baseOffset={20}
                  baseWidth={6}
                  circleRadius={12}
                  circleColor="black"
                />
    
                <Progress color="#99C817" arcWidth={0} />
    
                <Indicator fixValue={false}>
                  {(value, textProps) => (
                    <Text
                      style={{
                        position: 'absolute',
                        zIndex: 10,
                        bottom: TextBottom  ,
                        alignSelf: 'center',
                        fontSize: responsiveFontSize(TempreaturePriorityFontSize),
                        fontWeight: 'bold',
                      }}>
                      {TempreaturePriority}
                    </Text>
                  )}
                </Indicator>
              </Speedometer> */}
    </View>
  );
};

export default SpeedoMeter;
