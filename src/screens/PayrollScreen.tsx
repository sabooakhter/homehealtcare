import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { supabase } from '../lib/supabase';

interface PayrollSummary {
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
}

interface TimeLog {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: number;
  isOvertime: boolean;
}

export default function PayrollScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [summary, setSummary] = useState<PayrollSummary>({
    regularHours: 0,
    overtimeHours: 0,
    regularPay: 0,
    overtimePay: 0,
    totalPay: 0,
  });
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  const fetchPayrollData = async () => {
    try {
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);

      const { data, error } = await supabase
        .from('caregiver_time_logs')
        .select(`
          check_in_time,
          check_out_time,
          duration
        `)
        .eq('caregiver_id', supabase.auth.getUser())
        .gte('check_in_time', start.toISOString())
        .lte('check_out_time', end.toISOString())
        .order('check_in_time', { ascending: true });

      if (error) throw error;

      // Process time logs
      const logs = data.map(log => ({
        date: format(new Date(log.check_in_time), 'MMM d, yyyy'),
        checkIn: format(new Date(log.check_in_time), 'h:mm a'),
        checkOut: format(new Date(log.check_out_time), 'h:mm a'),
        duration: log.duration,
        isOvertime: false, // This would be calculated based on weekly hours
      }));

      setTimeLogs(logs);

      // Calculate summary
      const totalMinutes = data.reduce((sum, log) => sum + log.duration, 0);
      const totalHours = totalMinutes / 60;
      const regularHours = Math.min(totalHours, 160); // Assuming 160 regular hours per month
      const overtimeHours = Math.max(0, totalHours - 160);
      const hourlyRate = 25; // This should come from the caregiver's profile

      setSummary({
        regularHours,
        overtimeHours,
        regularPay: regularHours * hourlyRate,
        overtimePay: overtimeHours * (hourlyRate * 1.5),
        totalPay: (regularHours * hourlyRate) + (overtimeHours * (hourlyRate * 1.5)),
      });
    } catch (error: any) {
      console.error('Error fetching payroll data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(current => 
      direction === 'prev' ? addMonths(current, -1) : addMonths(current, 1)
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Text style={styles.navigationButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(selectedMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Text style={styles.navigationButton}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Regular Hours</Text>
            <Text style={styles.summaryValue}>
              {summary.regularHours.toFixed(1)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Overtime Hours</Text>
            <Text style={styles.summaryValue}>
              {summary.overtimeHours.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Regular Pay</Text>
            <Text style={styles.summaryValue}>
              ${summary.regularPay.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Overtime Pay</Text>
            <Text style={styles.summaryValue}>
              ${summary.overtimePay.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.totalPay}>
          <Text style={styles.totalPayLabel}>Total Pay</Text>
          <Text style={styles.totalPayValue}>
            ${summary.totalPay.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.timeLogsSection}>
        <Text style={styles.timeLogsTitle}>Time Logs</Text>
        
        {timeLogs.map((log, index) => (
          <View key={index} style={styles.timeLogCard}>
            <Text style={styles.logDate}>{log.date}</Text>
            <View style={styles.logDetails}>
              <View style={styles.logTime}>
                <Text style={styles.logLabel}>Check In</Text>
                <Text style={styles.logValue}>{log.checkIn}</Text>
              </View>
              <View style={styles.logTime}>
                <Text style={styles.logLabel}>Check Out</Text>
                <Text style={styles.logValue}>{log.checkOut}</Text>
              </View>
              <View style={styles.logDuration}>
                <Text style={styles.logLabel}>Duration</Text>
                <Text style={styles.logValue}>
                  {(log.duration / 60).toFixed(1)} hrs
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  navigationButton: {
    fontSize: 24,
    color: '#0891B2',
    padding: 10,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalPay: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 15,
  },
  totalPayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPayValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891B2',
    marginTop: 5,
  },
  timeLogsSection: {
    padding: 20,
  },
  timeLogsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  timeLogCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logDate: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logTime: {
    flex: 1,
  },
  logDuration: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  logValue: {
    fontSize: 14,
    color: '#333',
  },
});