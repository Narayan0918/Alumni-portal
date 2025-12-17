import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import API from '../api/axios';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/users/me');
      setProfile(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcome}>Hello, {profile?.full_name}!</Text>
        <Text style={styles.subtext}>{profile?.email}</Text>
        <View style={styles.divider} />
        <Text style={styles.info}>🎓 Class of {profile?.graduation_year}</Text>
        <Text style={styles.info}>💼 {profile?.job_title} at {profile?.current_company}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="#EF4444" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
  subtext: { fontSize: 14, color: 'gray', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  info: { fontSize: 16, marginVertical: 5, color: '#333' }
});