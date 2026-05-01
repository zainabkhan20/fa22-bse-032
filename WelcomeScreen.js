import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) { 
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    
    Animated.timing(progress, {
      toValue: width * 0.8,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      
      navigation.replace('Login'); 
    });
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/bg.png')} 
        style={styles.background}
        resizeMode="contain"
      >
        <View style={styles.centerContent}>
          <Text style={styles.title}>WELCOME!</Text>
          <Text style={styles.subtitle}>Your Budget Bot Is Ready</Text>

          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingBar, { width: progress }]} />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#556B2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    marginTop: height * 0.35,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    marginTop: 8,
    marginBottom: 25,
  },
  loadingContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#fff3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  loadingBar: {
    height: 8,
    backgroundColor: '#EAECEC',
    borderRadius: 5,
  },
});
