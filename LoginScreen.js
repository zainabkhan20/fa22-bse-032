
  // login screen code 
   import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Login function using Firebase
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please fill in both email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login Successful', 'Welcome back!');
      navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});              // Navigate to your Home screen
    } catch (error) {
      if (error.code === 'user-not-found') {
        Alert.alert('Error', 'No user found with this email.');
      } else if (error.code === 'wrong-password') {
        Alert.alert('Error', 'Incorrect password. Try again.');
      } else if (error.code === 'invalid-email') {
        Alert.alert('Error', 'Please enter a valid email address.');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Signup Redirect */}
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>
            Don’t have an account? Signup
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ Styling
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { height: height * 0.1, backgroundColor: '#556B2F' },
  formContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#556B2F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  forgotText: { color: '#556B2F', marginTop: 5, fontSize: 15 },
  signupText: { color: '#556B2F', marginTop: 10, fontSize: 16 },
});
