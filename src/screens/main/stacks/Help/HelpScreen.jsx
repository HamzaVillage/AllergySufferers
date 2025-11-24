import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import AppHeader from '../../../../components/AppHeader'
import { responsiveFontSize } from '../../../../utils/Responsive_Dimensions';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import AppText from '../../../../components/AppTextComps/AppText';
import AppColors from '../../../../utils/AppColors';
const HelpScreen = ({ navigation }) => {


  const pollens = [
    { id: 1, name: 'View Free App Guide Instructions', onPress: () => navigation.navigate("GuideInstructionSubCatogory", { type: "free" }), top: true, },
    { id: 2, name: 'View Premium App Guide Instructions', onPress: () => navigation.navigate("GuideInstructionSubCatogory", { type: "paid" }), },
    { id: 2, name: 'Tips & Tricks', onPress: () => navigation.navigate("TipsTrick") },
    { id: 4, name: 'Send Feedback', onPress: () => navigation.navigate("FeedBack") },
    { id: 5, name: 'Pollen Information for Canada', bottom: true, onPress: () => navigation.navigate("PollenInfoForCad") },
  ];


  return (
    <View style={{ padding: 20, flex: 1 }}>
      <AppHeader goBack={true} heading="Help" />


      <View style={{ marginBottom: 20 }}>
        <FlatList
          data={pollens}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={item.onPress}
                activeOpacity={0.8}
                style={{
                  borderWidth: 1,
                  borderTopRightRadius: item.top ? 10 : 0,
                  borderTopLeftRadius: item.top ? 10 : 0,
                  borderBottomRightRadius: item.bottom ? 10 : 0,
                  borderBottomLeftRadius: item.bottom ? 10 : 0,
                  paddingVertical: 20,
                  paddingHorizontal: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: item.bottom ? 1 : 0,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}>
                  <AppText
                    title={item.name}
                    textSize={1.8}
                    textColor={AppColors.BLACK}
                    textFontWeight
                  />
                </View>

                <FontAwesome6
                  name={'circle-arrow-right'}
                  size={responsiveFontSize(2.5)}
                  color={'#032198'}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>

    </View>
  )
}

export default HelpScreen