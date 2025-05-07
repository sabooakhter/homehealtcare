import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useLocation } from '../contexts/LocationContext';

interface Visit {
  id: string;
  patient: {
    name: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  scheduledTime: string;
  duration: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function ScheduleScreen() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { location, isWithinRange } = useLocation();

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          scheduled_at,
          duration,
          completed,
          patients (
            name,
            address,
            latitude,
            longitude
          )
        `)
        .eq('caregiver_id', supabase.auth.getUser())
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      setVisits(data.map(item => ({
        id: item.id,
        patient: {
          name: item.patients.name,
          address: item.patients.address,
          location: {
            latitude: item.patients.latitude,
            longitude: item.patients.longitude,
          },
        },
        scheduledTime: item.scheduled_at,
        duration: item.duration,
        status: item.completed ? 'completed' : 'pending',
      })));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (visit: Visit) => {
    if (!location) {
      Alert.alert('Error', 'Unable to get your location');
      return;
    }

    const withinRange = isWithinRange(
      visit.patient.location.latitude,
      visit.patient.location.longitude,
      1 // 1 mile radius
    );

    if (!withinRange) {
      Alert.alert('Error', 'You must be within 1 mile of the patient\'s location to check in');
      return;
    }

    try {
      const { error } = await supabase.rpc('check_in_caregiver', {
        visit_id: visit.id,
        check_in_time: new Date().toISOString(),
      });

      if (error) throw error;

      fetchVisits();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderVisit = ({ item }: { item: Visit }) => (
    <View style={styles.visitCard}>
      <View style={styles.visitHeader}>
        <Text style={styles.patientName}>{item.patient.name}</Text>
        <Text style={[
          styles.status,
          item.status === 'completed' ? styles.statusCompleted :
          item.status === 'in-progress' ? styles.statusInProgress :
          styles.statusPending
        ]}>
          {item.status}
        </Text>
      </View>

      <Text style={styles.time}>
        {format(new Date(item.scheduledTime), 'h:mm a')}
      </Text>
      <Text style={styles.duration}>{item.duration} minutes</Text>
      <Text style={styles.address}>{item.patient.address}</Text>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={() => handleCheckIn(item)}
        >
          <Text style={styles.checkInButtonText}>Check In</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Schedule</Text>
      <FlatList
        data={visits}
        renderItem={renderVisit}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchVisits}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  visitCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusInProgress: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  statusCompleted: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  time: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  checkInButton: {
    backgroundColor: '#0891B2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});