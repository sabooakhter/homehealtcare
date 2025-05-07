import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  BarChart3, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '../../lib/supabase';

interface Caregiver {
  id: string;
  name: string;
  hourlyRate: number;
  monthlyHours: {
    regular: number;
    overtime: number;
  };
  patients: number;
}

interface TimeLog {
  id: string;
  caregiver_id: string;
  check_in_time: string;
  check_out_time: string;
  duration: number;
}

const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: '1',
    name: 'Michael Davis',
    hourlyRate: 25,
    monthlyHours: {
      regular: 140,
      overtime: 12
    },
    patients: 4
  },
  {
    id: '2',
    name: 'Emma Wilson',
    hourlyRate: 28,
    monthlyHours: {
      regular: 152,
      overtime: 8
    },
    patients: 3
  },
  {
    id: '3',
    name: 'David Lee',
    hourlyRate: 26,
    monthlyHours: {
      regular: 160,
      overtime: 0
    },
    patients: 5
  },
  {
    id: '4',
    name: 'Amanda White',
    hourlyRate: 24,
    monthlyHours: {
      regular: 120,
      overtime: 0
    },
    patients: 2
  },
  {
    id: '5',
    name: 'James Martin',
    hourlyRate: 23,
    monthlyHours: {
      regular: 80,
      overtime: 0
    },
    patients: 2
  },
  {
    id: '6',
    name: 'Olivia Brown',
    hourlyRate: 30,
    monthlyHours: {
      regular: 136,
      overtime: 16
    },
    patients: 4
  },
];

// Mock months data
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentMonthIndex = 2; // March (0-indexed)

const Accounting: React.FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(MOCK_CAREGIVERS);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonthIndex]);
  const [selectedCaregivers, setSelectedCaregivers] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  
  // Initialize with all caregivers selected
  useEffect(() => {
    setSelectedCaregivers(caregivers.map(c => c.id));
  }, []);
  
  useEffect(() => {
    // Subscribe to real-time updates for caregiver status changes
    const channel = supabase
      .channel('caregiver-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'caregivers'
        },
        (payload) => {
          // Update caregiver status in the UI
          const updatedCaregiver = payload.new as Caregiver;
          setCaregivers(prev =>
            prev.map(c =>
              c.id === updatedCaregiver.id ? { ...c, ...updatedCaregiver } : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Fetch time logs for the selected month
    const fetchTimeLogs = async () => {
      const startOfMonth = new Date(selectedMonth);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(selectedMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('caregiver_time_logs')
        .select(`
          id,
          caregiver_id,
          check_in_time,
          check_out_time,
          duration
        `)
        .gte('check_in_time', startOfMonth.toISOString())
        .lte('check_out_time', endOfMonth.toISOString())
        .order('check_in_time', { ascending: true });

      if (error) {
        console.error('Error fetching time logs:', error);
        return;
      }

      setTimeLogs(data);
      updateChartData(data);
    };

    fetchTimeLogs();
  }, [selectedMonth]);

  const updateChartData = (logs: TimeLog[]) => {
    if (selectedCaregivers.length === 0) {
      setChartData([]);
      return;
    }

    const filteredLogs = logs.filter(log =>
      selectedCaregivers.includes(log.caregiver_id)
    );

    const caregiverData = selectedCaregivers.map(caregiverId => {
      const caregiver = caregivers.find(c => c.id === caregiverId);
      const caregiverLogs = filteredLogs.filter(log => log.caregiver_id === caregiverId);
      
      const regularHours = Math.floor(
        caregiverLogs.reduce((sum, log) => sum + log.duration, 0) / 60
      );
      const overtimeHours = Math.max(0, regularHours - 160); // Assuming 160 hours is regular time
      const regularPay = (regularHours - overtimeHours) * caregiver!.hourlyRate;
      const overtimePay = overtimeHours * (caregiver!.hourlyRate * 1.5);

      return {
        name: caregiver!.name,
        'Regular Hours': regularHours - overtimeHours,
        'Overtime Hours': overtimeHours,
        'Regular Pay': regularPay,
        'Overtime Pay': overtimePay,
        'Total Pay': regularPay + overtimePay,
      };
    });

    setChartData(caregiverData);
  };
  
  const handlePrevMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(MONTHS[currentIndex - 1]);
    }
  };
  
  const handleNextMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    if (currentIndex < MONTHS.length - 1) {
      setSelectedMonth(MONTHS[currentIndex + 1]);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };
  
  const handleExport = () => {
    // In a real app, this would generate and download a CSV or PDF
    alert('Exporting payroll data...');
  };
  
  const handleToggleCaregiver = (id: string) => {
    if (selectedCaregivers.includes(id)) {
      // Remove if already selected
      setSelectedCaregivers(selectedCaregivers.filter(cId => cId !== id));
    } else {
      // Add if not selected
      setSelectedCaregivers([...selectedCaregivers, id]);
    }
  };
  
  const handleSelectAllCaregivers = () => {
    if (selectedCaregivers.length === caregivers.length) {
      // Deselect all if all are selected
      setSelectedCaregivers([]);
    } else {
      // Select all
      setSelectedCaregivers(caregivers.map(c => c.id));
    }
  };
  
  // Calculate totals
  const totalRegularHours = chartData.reduce((sum, item) => sum + item['Regular Hours'], 0);
  const totalOvertimeHours = chartData.reduce((sum, item) => sum + item['Overtime Hours'], 0);
  const totalRegularPay = chartData.reduce((sum, item) => sum + item['Regular Pay'], 0);
  const totalOvertimePay = chartData.reduce((sum, item) => sum + item['Overtime Pay'], 0);
  const totalPay = totalRegularPay + totalOvertimePay;
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-primary mr-2 rounded-sm"></span>
            Regular Hours: {payload[0].value}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-accent mr-2 rounded-sm"></span>
            Overtime Hours: {payload[1].value}
          </p>
          <p className="text-sm font-medium mt-1">
            Total Pay: ${payload[0].payload['Total Pay'].toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Accounting</h1>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button 
            onClick={handleRefresh}
            className="btn btn-outline flex items-center"
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleExport}
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-semibold">{totalRegularHours + totalOvertimeHours}</p>
              <p className="text-xs text-gray-500">{totalRegularHours} regular, {totalOvertimeHours} overtime</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-700">
              <DollarSign size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-2xl font-semibold">${totalPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs text-gray-500">For {selectedMonth} {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-700">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Caregivers</p>
              <p className="text-2xl font-semibold">{caregivers.filter(c => c.monthlyHours.regular > 0).length}</p>
              <p className="text-xs text-gray-500">Out of {caregivers.length} total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-700">
              <FileText size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Hourly Rate</p>
              <p className="text-2xl font-semibold">
                ${chartData.length > 0 
                  ? (totalPay / (totalRegularHours + totalOvertimeHours)).toFixed(2) 
                  : '0.00'}
              </p>
              <p className="text-xs text-gray-500">Across all caregivers</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium">Hours & Payroll Analysis</h2>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-gray-100"
                disabled={MONTHS.indexOf(selectedMonth) === 0}
              >
                <ChevronLeft size={20} className={`${MONTHS.indexOf(selectedMonth) === 0 ? 'text-gray-300' : 'text-gray-500'}`} />
              </button>
              
              <div className="flex items-center space-x-1">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm font-medium">{selectedMonth} {new Date().getFullYear()}</span>
              </div>
              
              <button 
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-gray-100"
                disabled={MONTHS.indexOf(selectedMonth) === MONTHS.length - 1}
              >
                <ChevronRight size={20} className={`${MONTHS.indexOf(selectedMonth) === MONTHS.length - 1 ? 'text-gray-300' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-primary mr-2 rounded-sm"></span>
                  <span className="text-sm">Regular Hours</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-accent mr-2 rounded-sm"></span>
                  <span className="text-sm">Overtime Hours</span>
                </div>
              </div>
              
              <div className="ml-auto text-right">
                <span className="text-xs text-gray-500">
                  Showing data for {selectedCaregivers.length} caregiver{selectedCaregivers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="w-full h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Pay ($)', angle: 90, position: 'insideRight' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Regular Hours" fill="#0891B2" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="Overtime Hours" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data to display. Please select at least one caregiver.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Caregiver Selection */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-medium">Caregivers</h2>
            
            <button
              onClick={handleSelectAllCaregivers}
              className="text-sm text-primary hover:underline"
            >
              {selectedCaregivers.length === caregivers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-96">
            <ul className="space-y-2">
              {caregivers.map((caregiver) => {
                const isSelected = selectedCaregivers.includes(caregiver.id);
                const totalEarnings = (caregiver.monthlyHours.regular * caregiver.hourlyRate) + 
                                     (caregiver.monthlyHours.overtime * caregiver.hourlyRate * 1.5);
                
                return (
                  <li 
                    key={caregiver.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors border ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleCaregiver(caregiver.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Controlled via the li onClick
                          className="h-4 w-4 text-primary"
                        />
                        <span className="ml-2 font-medium">{caregiver.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        ${caregiver.hourlyRate}/hr
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
                      <div>
                        Regular: {caregiver.monthlyHours.regular} hrs
                      </div>
                      <div>
                        Overtime: {caregiver.monthlyHours.overtime} hrs
                      </div>
                      <div>
                        Patients: {caregiver.patients}
                      </div>
                      <div className="font-medium text-gray-700">
                        ${totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Total Hours</p>
                <p className="font-medium">{totalRegularHours + totalOvertimeHours}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Pay</p>
                <p className="font-medium">${totalPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounting;