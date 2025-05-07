import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  notes: string | null;
  type: 'visit' | 'medication' | 'therapy' | 'checkup';
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('caregiver_id', supabase.auth.getUser())
        .eq('completed', false)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      setTasks(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          notes: notes || null,
        })
        .eq('id', task.id);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== task.id));
      setSelectedTask(null);
      setNotes('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => setSelectedTask(item)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={[styles.taskType, styles[`type${item.type}`]]}>
          {item.type}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Tasks</Text>
      
      {selectedTask ? (
        <View style={styles.taskDetails}>
          <Text style={styles.detailsTitle}>{selectedTask.title}</Text>
          
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setSelectedTask(null);
                setNotes('');
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={() => handleCompleteTask(selectedTask)}
            >
              <Text style={styles.buttonText}>Complete Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchTasks}
        />
      )}
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
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  taskType: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  typevisit: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  typemedication: {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
  },
  typetherapy: {
    backgroundColor: '#e8f5e9',
    color: '#388e3c',
  },
  typecheckup: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  },
  taskDetails: {
    backgroundColor: '#fff',
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
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    marginRight: 10,
  },
  completeButton: {
    backgroundColor: '#4caf50',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});