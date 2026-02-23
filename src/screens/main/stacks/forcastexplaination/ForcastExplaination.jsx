import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
} from 'react-native';
import React from 'react';
import AppHeader from '../../../../components/AppHeader';
import AppText from '../../../../components/AppTextComps/AppText';
import AppColors from '../../../../utils/AppColors';
import { responsiveFontSize } from '../../../../utils/Responsive_Dimensions';

const ForcastExplaination = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.WHITE }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
        <AppHeader goBack={true} heading="Forecast explanation" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.paragraph}>
          Aerobiology Research Laboratories established in 1992, operates <Text style={styles.boldText}>30 pollen and spore monitoring stations across Canada</Text>, strategically located in both highly populated cities and diverse rural regions. This network allows us to provide accurate aeroallergen data and pollen and spore forecasts for the majority of Canadians.
        </Text>

        <View style={styles.separator} />

        <AppText
          title="Our Monitoring Process"
          textSize={2}
          textFontWeight
          textColor={AppColors.BLACK}
          style={styles.heading}
        />

        <Text style={styles.paragraph}>
          We utilize <Text style={styles.boldText}>innovative aeroallergen rotation impaction samplers</Text>, specifically our redesigned GRIPST-2009 models. These samplers capture pollen and spore specimens on plastic rods that spin at 2400 RPMs. These rods are collected daily by field associates and shipped weekly to our laboratory.
        </Text>

        <Image
          source={require('../../../../assets/pdfimage.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.paragraph}>
          Upon arrival, our highly trained laboratory staff microscopically analyze the samples. Our staff undergo a rigorous <Text style={styles.boldText}>six-month training and testing program</Text> to accurately identify and quantify over 80 pollen and spore types.
        </Text>

        <View style={styles.separator} />

        <AppText
          title="Advancements in Automation"
          textSize={2}
          textFontWeight
          textColor={AppColors.BLACK}
          style={styles.heading}
        />

        <Text style={styles.paragraph}>
          In 2025, we introduced <Text style={styles.boldText}>automated samplers</Text> to our network. These new units transmit digital images to our lab, allowing technicians to identify, quantify, and validate pollen counts more efficiently.
        </Text>

        <Text style={styles.paragraph}>
          It's important to note that automated samplers are still in their early stages within our industry. Currently, only samplers costing <Text style={styles.boldText}>above $80,000 CAD per unit</Text> can provide reliable counts, and even these are limited in their identification capabilities, typically recognizing less than 10 pollen and spore types compared to our 80+. Less expensive automated samplers require significant validation and human oversight to ensure accurate data which drives up the cost of analysis dramatically.
        </Text>

        <View style={styles.separator} />

        <AppText
          title="Data and Science-Driven Forecasting"
          textSize={2}
          textFontWeight
          textColor={AppColors.BLACK}
          style={styles.heading}
        />

        <Text style={styles.paragraph}>
          We maintain an extensive <Text style={styles.boldText}>data warehouse with over 32 years of historical pollen and spore counts</Text>. This robust database, which records the total number of particles per cubic meter of air for each identified type, enables us to efficiently query and summarize current and historical allergen levels.
        </Text>

        <Text style={styles.paragraph}>
          This wealth of data is crucial for our research and forecasting operations, as well as for meeting our clients' data needs. Our forecasts consistently achieve an <Text style={styles.boldText}>accuracy rate of around 80%</Text> for the season, a testament to our methodology, which combines current and historical data with weather variables.
        </Text>

        <Text style={styles.paragraph}>
          In contrast, other companies claiming to provide pollen and spore forecasts in Canada often lack foundational data, resulting in accuracy rates below 30%. Without verifiable data, it's impossible to formulate and validate accurate forecasts. Relying on such forecasts is akin to guessing the weather without any scientific basis, especially since pollen is largely invisible to the naked eye.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForcastExplaination;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: AppColors.WHITE,
  },
  heading: {
    marginBottom: 10,
    marginTop: 10,
  },
  paragraph: {
    marginBottom: 15,
    lineHeight: 22,
    fontSize: responsiveFontSize(1.6),
    color: AppColors.BLACK,
  },
  boldText: {
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 250,
    marginVertical: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
});
