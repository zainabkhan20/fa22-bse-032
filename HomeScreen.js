// HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/bg1.jpeg')}
        style={styles.background}
        resizeMode="contains"
      />

      <Text style={styles.heading}>Hey You!</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate("BudgetPlan")}>
          <Text style={styles.boxText}>Budget Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate("Recommendations")}>
          <Text style={styles.boxText}>Recommendations</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate("RecipeBook")}>
          <Text style={styles.boxText}>RecipeBook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate("Forecast")}>
          <Text style={styles.boxText}>Budget Forecast</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.boxCenter} onPress={() => navigation.navigate("Shopping")}>
        <Text style={styles.boxText}>Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#556B2F',
    paddingTop: 100,
    alignItems: 'center',
  },
  background: {
    position: 'absolute', // keep it behind all content
    width: 355,
        height: 850,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 20,
  },
  box: {
    width: 140,
    height: 110,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxCenter: {
    width: 200,
    height: 110,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  boxText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#556B2F',
  },
});
