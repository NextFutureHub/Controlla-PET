import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Users, Clock, DollarSign, AlertCircle, ArrowRight, BarChart2, ArrowUpRight } from 'lucide-react';
import Button from '../components/ui/Button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('week');
  const [companyName, setCompanyName] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (user?.role === 'tenant_admin') {
        try {
          const companyData = await companyService.getCompany();
          setCompanyName(companyData.name);
        } catch (error) {
          console.error('Error fetching company data:', error);
        }
      }
    };
    
    fetchCompanyData();
  }, [user]);
  
  // Mock data for charts
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Contractor Hours',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          precision: 0,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  
  const contractorActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours Logged',
        data: [4, 6.5, 5, 7.5, 5.5, 3, 0],
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Mock contractors
  const topContractors = [
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'UI/UX Designer',
      hourlyRate: '$45/hr',
      status: 'active',
      hoursThisMonth: 87,
    },
    {
      id: '2',
      name: 'Sarah Miller',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'Frontend Developer',
      hourlyRate: '$55/hr',
      status: 'active',
      hoursThisMonth: 76,
    },
    {
      id: '3',
      name: 'David Chen',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'Backend Developer',
      hourlyRate: '$60/hr',
      status: 'active',
      hoursThisMonth: 65,
    },
  ];
  
  // Mock upcoming deadlines
  const upcomingDeadlines = [
    {
      id: '1',
      project: 'Website Redesign',
      task: 'Finalize homepage mockups',
      assignee: 'Alex Johnson',
      dueDate: '2025-06-15',
      priority: 'high',
    },
    {
      id: '2',
      project: 'Mobile App',
      task: 'User authentication flow',
      assignee: 'Sarah Miller',
      dueDate: '2025-06-18',
      priority: 'medium',
    },
    {
      id: '3',
      project: 'CRM Integration',
      task: 'API development',
      assignee: 'David Chen',
      dueDate: '2025-06-20',
      priority: 'low',
    },
  ];
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error-500';
      case 'medium':
        return 'bg-warning-500';
      case 'low':
        return 'bg-success-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {companyName && (
            <p className="text-sm text-gray-500 mt-1">Company: {companyName}</p>
          )}
        </div>
        <div className="mt-3 sm:mt-0">
          <Button variant="primary" size="sm" rightIcon={<ArrowUpRight size={16} />}>
            Generate Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Contractors</p>
                <p className="text-2xl font-semibold mt-1">24</p>
                <p className="text-xs font-medium text-success-700 flex items-center mt-1">
                  <span className="flex items-center">
                    <ArrowUpRight size={14} className="mr-1" />
                    <span>12% from last month</span>
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Hours This Month</p>
                <p className="text-2xl font-semibold mt-1">1,285</p>
                <p className="text-xs font-medium text-success-700 flex items-center mt-1">
                  <span className="flex items-center">
                    <ArrowUpRight size={14} className="mr-1" />
                    <span>8% from last month</span>
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spending</p>
                <p className="text-2xl font-semibold mt-1">$48,250</p>
                <p className="text-xs font-medium text-error-700 flex items-center mt-1">
                  <span className="flex items-center">
                    <ArrowUpRight size={14} className="mr-1" />
                    <span>15% from last month</span>
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600">
                <DollarSign size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                <p className="text-2xl font-semibold mt-1">12</p>
                <p className="text-xs font-medium text-warning-700 flex items-center mt-1">
                  <span className="flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    <span>5 require review</span>
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-error-100 rounded-full flex items-center justify-center text-error-600">
                <DollarSign size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Contractor Hours</CardTitle>
                <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setSelectedTab('week')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      selectedTab === 'week' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setSelectedTab('month')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      selectedTab === 'month' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setSelectedTab('year')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      selectedTab === 'year' ? 'bg-white shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Contractors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContractors.map((contractor) => (
                  <div key={contractor.id} className="flex items-center space-x-4">
                    <img
                      src={contractor.avatar}
                      alt={contractor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contractor.name}
                      </p>
                      <p className="text-xs text-gray-500">{contractor.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{contractor.hourlyRate}</p>
                      <p className="text-xs text-gray-500">{contractor.hoursThisMonth} hrs</p>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  rightIcon={<ArrowRight size={16} />}
                >
                  View All Contractors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-full min-h-[40px] ${getPriorityColor(deadline.priority)} rounded-full`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{deadline.task}</p>
                      <p className="text-xs text-gray-500">{deadline.project}</p>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-gray-500 mr-2">{deadline.assignee}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          {formatDate(deadline.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  rightIcon={<ArrowRight size={16} />}
                >
                  View All Deadlines
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Daily Activity</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-secondary-500 rounded-full"></span>
                    <span className="text-xs text-gray-500">Hours Logged</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <Line data={contractorActivityData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;