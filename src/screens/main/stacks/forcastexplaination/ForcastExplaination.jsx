import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppHeader from '../../../../components/AppHeader';
import Pdf from 'react-native-pdf';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';

const ForcastExplaination = () => {
  const [loading, setLoading] = useState(false);
  const screenWidth = Dimensions.get('screen').width;
  const screenHeigh = Dimensions.get('screen').height;

  const navigation = useNavigation();

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const localFile = `${RNFS.DocumentDirectoryPath}/forecast.pdf`;

        // Download PDF
        const downloadResult = await RNFS.downloadFile({
          fromUrl: 'https://www.allergysufferers.ca/explainforcast.pdf',
          toFile: localFile,
        }).promise;

        if (downloadResult.statusCode === 200) {
          // Open with native viewer
          await FileViewer.open(localFile, {showOpenWithDialog: true});
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Unable to download file.');
        }
      } catch (error) {
        console.log('Error opening PDF:', error);
        Alert.alert('Error', 'Failed to open the PDF file.');
      } finally {
        setLoading(false);
      }
    };

  if(Platform.OS === 'ios') {  
    loadPdf();
    }
  }, []);

  if (Platform.OS === 'ios' && loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View style={{padding: 0, margin: 0}}>
        <View style={{padding: 20, paddingBottom: 0}}>
          <AppHeader goBack={true} heading="Forecast explanation" />
        </View>

        <Pdf
          source={{
            uri: 'https://www.allergysufferers.ca/explainforcast.pdf',
            cache: true,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={error => {
            console.log(error);
          }}
          onPressLink={uri => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={{height: screenHeigh, width: Dimensions.get('window').width}}
          // style={{flex:1, width:Dimensions.get('window').width}}

          spacing={0}
          scale={1.2}
          fitPolicy={0}
          trustAllCerts={false}
        />
      </View>
    );
  }
  return null;
};

export default ForcastExplaination;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: 300,
    height: 500,
  },
});
