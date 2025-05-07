import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { 
  Search, 
  Plus, 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  User, 
  Pill,
  Activity,
  Clipboard,
  Clock8 
} from 'lucide-react';
import { format, parseISO, isToday, isWithinInterval, addDays } from 'date-fns';

// Import react-calendar styles
import 'react-calendar/dist/Calendar.css';

interface Patient {
  id: string;
  name: string;
  age: number;
  address: string;
  phone: string;
  medicalConditions: string[];
  caregivers: string[];
}

interface Task {
  id: string;
  patientId: string;
  title: string;
  type: 'visit' | 'medication' | 'therapy' | 'checkup';
  dateTime: string;
  duration: number; // in minutes
  caregiver: string;
  notes?: string;
  completed: boolean;
}

// Mock patients data
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Eleanor Thompson',
    age: 78,
    address: '123 Main St, Apt 4B, New York, NY',
    phone: '(555) 123-4567',
    medicalConditions: ['Hypertension', 'Arthritis', 'Type 2 Diabetes'],
    caregivers: ['Michael Davis', 'Emma Wilson']
  },
  {
    id: '2',
    name: 'Robert Johnson',
    age: 65,
    address: '456 Park Ave, New York, NY',
    phone: '(555) 234-5678',
    medicalConditions: ['COPD', 'Heart Disease'],
    caregivers: ['Emma Wilson']
  },
  {
    id: '3',
    name: 'Martha Lewis',
    age: 72,
    address: '789 Broadway, Brooklyn, NY',
    phone: '(555) 345-6789',
    medicalConditions: ['Post-surgery recovery', 'Hypertension'],
    caregivers: ['David Lee', 'Amanda White']
  },
  {
    id: '4',
    name: 'George Walker',
    age: 82,
    address: '101 Hudson St, Jersey City, NJ',
    phone: '(555) 456-7890',
    medicalConditions: ['Alzheimer\'s', 'Osteoporosis'],
    caregivers: ['Michael Davis']
  },
  {
    id: '5',
    name: 'William Harris',
    age: 60,
    address: '222 W 14th St, New York, NY',
    phone: '(555) 567-8901',
    medicalConditions: ['Depression', 'Anxiety', 'Chronic Pain'],
    caregivers: ['Olivia Brown']
  }
];

// Mock tasks data
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    patientId: '1',
    title: 'Morning Medication',
    type: 'medication',
    dateTime: '2025-03-15T08:00:00',
    duration: 15,
    caregiver: 'Michael Davis',
    notes: 'Administer blood pressure medication',
    completed: true
  },
  {
    id: '2',
    patientId: '1',
    title: 'Routine Check',
    type: 'visit',
    dateTime: '2025-03-15T10:30:00',
    duration: 60,
    caregiver: 'Michael Davis',
    completed: false
  },
  {
    id: '3',
    patientId: '2',
    title: 'Administer Insulin',
    type: 'medication',
    dateTime: '2025-03-15T11:45:00',
    duration: 15,
    caregiver: 'Emma Wilson',
    notes: 'Check blood sugar before administration',
    completed: false
  },
  {
    id: '4',
    patientId: '3',
    title: 'Physical Therapy',
    type: 'therapy',
    dateTime: '2025-03-15T13:15:00',
    duration: 45,
    caregiver: 'David Lee',
    notes: 'Focus on knee mobility exercises',
    completed: false
  },
  {
    id: '5',
    patientId: '4',
    title: 'Post-Surgery Check',
    type: 'checkup',
    dateTime: '2025-03-15T14:30:00',
    duration: 30,
    caregiver: 'Amanda White',
    notes: 'Check incision site, change dressing',
    completed: false
  },
  {
    id: '6',
    patientId: '5',
    title: 'Mental Health Session',
    type: 'therapy',
    dateTime: '2025-03-15T16:00:00',
    duration: 60,
    caregiver: 'Olivia Brown',
    completed: false
  },
  {
    id: '7',
    patientId: '1',
    title: 'Evening Medication',
    type: 'medication',
    dateTime: '2025-03-15T20:00:00',
    duration: 15,
    caregiver: 'Emma Wilson',
    notes: 'Administer sleep medication',
    completed: false
  },
  // Tasks for the next day
  {
    id: '8',
    patientId: '2',
    title: 'Morning Check',
    type: 'visit',
    dateTime: '2025-03-16T09:00:00',
    duration: 30,
    caregiver: 'Michael Davis',
    completed: false
  },
  {
    id: '9',
    patientId: '3',
    title: 'Wound Care',
    type: 'checkup',
    dateTime: '2025-03-16T11:00:00',
    duration: 45,
    caregiver: 'Amanda White',
    notes: 'Clean wound and change dressing',
    completed: false
  }
];

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'visit',
    completed: false
  });
  
  // Filter patients based on search
  const filteredPatients = patients.filter(patient => 
    searchTerm === '' || 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get tasks for selected patient and date
  const getPatientTasksForDate = (patientId: string, date: Date) => {
    return tasks.filter(task => {
      const taskDate = parseISO(task.dateTime);
      return task.patientId === patientId && 
        isWithinInterval(taskDate, {
          start: new Date(date.setHours(0, 0, 0, 0)),
          end: new Date(date.setHours(23, 59, 59, 999))
        });
    }).sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  };
  
  // Get all tasks for the selected date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = parseISO(task.dateTime);
      return isWithinInterval(taskDate, {
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999))
      });
    }).sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  };
  
  // Calendar tile content - show number of tasks per day
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dayTasks = tasks.filter(task => {
      const taskDate = parseISO(task.dateTime);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
    
    if (dayTasks.length === 0) return null;
    
    return (
      <div className="text-xs mt-1 w-full flex justify-center">
        <span className="bg-primary/20 text-primary px-1 rounded-full">
          {dayTasks.length}
        </span>
      </div>
    );
  };
  
  // Handle selecting a patient
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };
  
  // Open modal to add a task
  const handleAddTask = () => {
    if (!selectedPatient) return;
    
    // Initialize with current date and patient
    setNewTask({
      patientId: selectedPatient.id,
      type: 'visit',
      dateTime: new Date().toISOString(),
      duration: 30,
      completed: false
    });
    
    setIsModalOpen(true);
  };
  
  // Save a new task
  const handleSaveTask = () => {
    if (!newTask.title || !newTask.patientId || !newTask.caregiver || !newTask.dateTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    const task: Task = {
      id: `task-${Date.now()}`,
      patientId: newTask.patientId!,
      title: newTask.title,
      type: newTask.type as 'visit' | 'medication' | 'therapy' | 'checkup',
      dateTime: newTask.dateTime,
      duration: newTask.duration || 30,
      caregiver: newTask.caregiver,
      notes: newTask.notes,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setIsModalOpen(false);
    setNewTask({
      type: 'visit',
      completed: false
    });
  };
  
  // Get icon for task type
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return <User size={16} />;
      case 'medication':
        return <Pill size={16} />;
      case 'therapy':
        return <Activity size={16} />;
      case 'checkup':
        return <Clipboard size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  // Get class for task type
  const getTaskTypeClass = (type: string) => {
    switch (type) {
      case 'visit':
        return 'bg-blue-100 text-blue-800';
      case 'medication':
        return 'bg-purple-100 text-purple-800';
      case 'therapy':
        return 'bg-green-100 text-green-800';
      case 'checkup':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Patient Management</h1>
      </div>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            {filteredPatients.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => {
                  const patientTasks = getPatientTasksForDate(patient.id, selectedDate);
                  const hasTasksToday = patientTasks.length > 0;
                  
                  return (
                    <li
                      key={patient.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                        selectedPatient?.id === patient.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                      }`}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={20} className="text-primary" />
                          </div>
                        </div>
                        
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                            <span className="text-xs text-gray-500">{patient.age} yrs</span>
                          </div>
                          
                          <div className="flex flex-wrap mt-1 gap-1">
                            {patient.medicalConditions.slice(0, 2).map((condition, index) => (
                              <span 
                                key={index} 
                                className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                              >
                                {condition}
                              </span>
                            ))}
                            {patient.medicalConditions.length > 2 && (
                              <span className="inline-block text-xs text-gray-500">
                                +{patient.medicalConditions.length - 2}
                              </span>
                            )}
                          </div>
                          
                          {hasTasksToday && (
                            <div className="mt-2 text-xs text-primary flex items-center">
                              <Clock8 size={14} className="mr-1" />
                              {patientTasks.length} task{patientTasks.length !== 1 ? 's' : ''} today
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <p className="text-gray-500">No patients found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Calendar and Tasks */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">Schedule Calendar</h2>
            </div>
            
            <div className="p-4">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={getTileContent}
                className="w-full border-0"
                prev2Label={null}
                next2Label={null}
              />
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-medium">
                  Selected: {format(selectedDate, 'MMMM d, yyyy')}
                </div>
                
                {selectedPatient && (
                  <button
                    onClick={handleAddTask}
                    className="btn btn-primary flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Task
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Tasks for Selected Date */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">
                {selectedPatient 
                  ? `${selectedPatient.name}'s Tasks` 
                  : `All Tasks for ${format(selectedDate, 'MMMM d, yyyy')}`
                }
              </h2>
            </div>
            
            <div className="overflow-y-auto flex-grow p-4">
              {selectedPatient ? (
                // Show tasks for selected patient
                (() => {
                  const patientTasks = getPatientTasksForDate(selectedPatient.id, selectedDate);
                  
                  if (patientTasks.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <CalendarIcon size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No tasks scheduled for this date</p>
                        <button
                          onClick={handleAddTask}
                          className="mt-4 btn btn-outline flex items-center mx-auto"
                        >
                          <Plus size={16} className="mr-2" />
                          Add New Task
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <ul className="space-y-4">
                      {patientTasks.map((task) => (
                        <li 
                          key={task.id} 
                          className={`p-3 rounded-lg border ${
                            task.completed 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTaskTypeClass(task.type)}`}>
                              {getTaskTypeIcon(task.type)}
                              <span className="ml-1 capitalize">{task.type}</span>
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center text-gray-500">
                              <Clock size={14} className="mr-1 flex-shrink-0" />
                              <span>{format(parseISO(task.dateTime), 'h:mm a')}</span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Clock8 size={14} className="mr-1 flex-shrink-0" />
                              <span>{task.duration} min</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center text-gray-500 text-sm">
                            <User size={14} className="mr-1 flex-shrink-0" />
                            <span>{task.caregiver}</span>
                          </div>
                          
                          {task.notes && (
                            <p className="mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                              {task.notes}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  );
                })()
              ) : (
                // Show all tasks for the date
                (() => {
                  const dateTasks = getTasksForDate(selectedDate);
                  
                  if (dateTasks.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <CalendarIcon size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No tasks scheduled for this date</p>
                      </div>
                    );
                  }
                  
                  return (
                    <ul className="space-y-4">
                      {dateTasks.map((task) => {
                        const patient = patients.find(p => p.id === task.patientId);
                        
                        return (
                          <li 
                            key={task.id} 
                            className={`p-3 rounded-lg border ${
                              task.completed 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{task.title}</h3>
                                <p className="text-xs text-primary mt-0.5">
                                  {patient?.name}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTaskTypeClass(task.type)}`}>
                                {getTaskTypeIcon(task.type)}
                                <span className="ml-1 capitalize">{task.type}</span>
                              </span>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-gray-500">
                                <Clock size={14} className="mr-1 flex-shrink-0" />
                                <span>{format(parseISO(task.dateTime), 'h:mm a')}</span>
                              </div>
                              <div className="flex items-center text-gray-500">
                                <User size={14} className="mr-1 flex-shrink-0" />
                                <span>{task.caregiver}</span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold">Add New Task</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="form-label">Task Title</label>
                  <input
                    id="title"
                    className="form-input"
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="form-label">Task Type</label>
                  <select
                    id="type"
                    className="form-input"
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value as any})}
                  >
                    <option value="visit">Visit</option>
                    <option value="medication">Medication</option>
                    <option value="therapy">Therapy</option>
                    <option value="checkup">Checkup</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                      id="date"
                      type="date"
                      className="form-input"
                      value={newTask.dateTime ? format(new Date(newTask.dateTime), 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const time = newTask.dateTime 
                          ? format(new Date(newTask.dateTime), 'HH:mm:ss')
                          : '09:00:00';
                        setNewTask({
                          ...newTask, 
                          dateTime: `${e.target.value}T${time}`
                        });
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="form-label">Time</label>
                    <input
                      id="time"
                      type="time"
                      className="form-input"
                      value={newTask.dateTime ? format(new Date(newTask.dateTime), 'HH:mm') : ''}
                      onChange={(e) => {
                        const date = newTask.dateTime 
                          ? format(new Date(newTask.dateTime), 'yyyy-MM-dd')
                          : format(new Date(), 'yyyy-MM-dd');
                        setNewTask({
                          ...newTask, 
                          dateTime: `${date}T${e.target.value}:00`
                        });
                      }}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                  <input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    className="form-input"
                    value={newTask.duration || 30}
                    onChange={(e) => setNewTask({...newTask, duration: parseInt(e.target.value)})}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="caregiver" className="form-label">Assigned Caregiver</label>
                  <select
                    id="caregiver"
                    className="form-input"
                    value={newTask.caregiver || ''}
                    onChange={(e) => setNewTask({...newTask, caregiver: e.target.value})}
                    required
                  >
                    <option value="">Select a caregiver</option>
                    {selectedPatient?.caregivers.map((caregiver) => (
                      <option key={caregiver} value={caregiver}>
                        {caregiver}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="notes" className="form-label">Notes (optional)</label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="form-input"
                    value={newTask.notes || ''}
                    onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveTask}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;