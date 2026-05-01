import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  // ✅ Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your registered email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Reset Email Sent',
        'Please check your inbox or spam folder for the password reset link.'
      );
      navigation.navigate('Login'); // Go back to login after sending
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('User Not Found', 'No account found with this email.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.infoText}>
          Enter your registered email below and we'll send you a reset link.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Send Reset Email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { height: height * 0.1, backgroundColor: '#556B2F' },
  formContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
  infoText: { textAlign: 'center', color: '#555', marginBottom: 20 },
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
  backText: { color: '#556B2F', marginTop: 10, fontSize: 16 },
});
