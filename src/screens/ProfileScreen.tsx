import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Profile {
  name: string;
  email: string;
  specialty: string;
  hourlyRate: number;
  totalPatients: number;
  status: string;
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('caregivers')
        .select(`
          specialty,
          hourly_rate,
          status,
          users!inner (
            name,
            email
          ),
          patient_caregivers (
            patient_id
          )
        `)
        .eq('user_id', supabase.auth.getUser())
        .single();

      if (error) throw error;

      setProfile({
        name: data.users.name,
        email: data.users.email,
        specialty: data.specialty,
        hourlyRate: data.hourly_rate,
        totalPatients: data.patient_caregivers.length,
        status: data.status,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Professional Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Specialty</Text>
          <Text style={styles.value}>{profile.specialty}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Hourly Rate</Text>
          <Text style={styles.value}>${profile.hourlyRate}/hr</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status</Text>
          <Text style={[
            styles.status,
            profile.status === 'available' ? styles.statusAvailable :
            profile.status === 'checked_in' ? styles.statusCheckedIn :
            styles.statusCheckedOut
          ]}>
            {profile.status.replace('_', ' ')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Assigned Patients</Text>
          <Text style={styles.value}>{profile.totalPatients}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  statusAvailable: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  statusCheckedIn: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  statusCheckedOut: {
    backgroundColor: '#f5f5f5',
    color: '#616161',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});