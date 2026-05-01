import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

const { height } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ Signup function
  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Account Created', 'Signup successful!.');
      navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Email Exists', 'This email is already registered.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Weak Password', 'Password should be at least 6 characters.');
      } else {
        Alert.alert('Signup Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Signup</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  loginText: { color: '#556B2F', marginTop: 10, fontSize: 16 },
});
  