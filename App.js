import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';

import HomeScreen from './HomeScreen';
import BudgetPlan from './BudgetPlan';
import Recommendations from './Recommendations';
import RecipeBook from './RecipeBook';
import Forecast from './Forecast';
import Shopping from './Shopping';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* NEW */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BudgetPlan" component={BudgetPlan} />
        <Stack.Screen name="Recommendations" component={Recommendations} />
        <Stack.Screen name="RecipeBook" component={RecipeBook} />
        <Stack.Screen name="Forecast" component={Forecast} />
        <Stack.Screen name="Shopping" component={Shopping} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
