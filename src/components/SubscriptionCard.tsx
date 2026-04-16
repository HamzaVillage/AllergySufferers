import {View, Text} from 'react-native';
import React from 'react';
import AppColors from '../utils/AppColors';
import {
  responsiveHeight,
  responsiveWidth,
} from '../utils/Responsive_Dimensions';
import AppText from './AppTextComps/AppText';
import AppButton from './AppButton';

type props = {
  title?: String;
  price?: String;
  type?: String;
  isAndroid?: boolean;
  subscribeNow?: () => void;
};

const SubscriptionCard = ({price, title, type, isAndroid, subscribeNow}: props) => {
  return (
    <View
      style={{
        backgroundColor: AppColors.PRIMARY,
        width: responsiveWidth(90),
        borderRadius: 20,
        padding: 20,
        gap: 20,
      }}>
      <View>
        <AppText
          title={title}
          textSize={2}
          textFontWeight
          textColor={AppColors.WHITE}
          textAlignment={'center'}
        />

        <View style={{flexDirection:'row', alignItems:'flex-end', justifyContent:'center', gap:2 , marginTop:10}}>
        <AppText
          title={`${price}/`}
          textSize={4}
          textFontWeight
          textColor={AppColors.WHITE}
          textAlignment={'center'}
        />
        <AppText
          title={type}
          textSize={2}
          textColor={AppColors.WHITE}
          
        />
        </View>

        {isAndroid && (
          <View style={{ marginTop: 15, paddingHorizontal: 5 }}>
            <AppText
              title={`7-day free trial. After 7 days, your subscription will automatically renew at ${price} per ${type === 'monthly' ? 'month' : 'year'}. Cancel anytime in Google Play Subscriptions to avoid charges.`}
              textSize={1.4}
              textColor={AppColors.WHITE}
              textAlignment={'center'}
            />
          </View>
        )}
      </View>

      <AppButton
        title={'SUBSCRIBE'}
        textColor={AppColors.PRIMARY}
        textFontWeight={false}
        textSize={2}
        bgColor={AppColors.WHITE}
        buttoWidth={80}
        handlePress={subscribeNow}
      />
    </View>
  );
};

export default SubscriptionCard;
