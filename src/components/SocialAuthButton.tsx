import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import AppColors from '../utils/AppColors'
import AppText from './AppTextComps/AppText'


type props = {
  title?: any,
  bgColor?: any,
  logo?: any,
  txtColor?: any,
  onPress?: () => void
}
const SocialAuthButton = ({ title, bgColor, logo, txtColor, onPress }: props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: AppColors.WHITE }}>
      {
        logo
      }
      <AppText textColor={txtColor ? txtColor : AppColors.WHITE} textSize={2} title={title} textFontWeight />
    </TouchableOpacity>
  )
}

export default SocialAuthButton