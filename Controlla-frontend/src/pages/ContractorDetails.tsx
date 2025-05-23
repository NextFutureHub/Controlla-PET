import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Star,
  Clock,
  CalendarDays,
  FileText,
  MessageSquare,
  ChevronLeft,
  Briefcase,
  LineChart,
  Calendar,
  Check,
  ArrowUpRight,
} from 'lucide-react';

// Mock contractor data
const CONTRACTORS = {
  '1': {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    role: 'UI/UX Designer',
    hourlyRate: 45,
    rating: 4.8,
    status: 'active',
    location: 'New York, USA',
    bio: 'Experienced UI/UX designer with 7+ years of experience creating user-centered designs for web and mobile applications. Specialized in creating visually appealing and intuitive interfaces.',
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping', 'User Testing'],
    joinedDate: '2024-01-15',
    contractEndDate: '2025-12-31',
    totalHours: 642,
    totalProjects: 8,
    currentProjects: 3,
    totalEarnings: 28890,
    availability: '30 hrs/week',
    projects: [
      { id: 'p1', name: 'Website Redesign', status: 'in-progress', hoursLogged: 45 },
      { id: 'p2', name: 'Mobile App UI', status: 'in-progress', hoursLogged: 28 },
      { id: 'p3', name: 'E-commerce Platform', status: 'completed', hoursLogged: 120 },
    ],
    invoices: [
      { id: 'inv1', date: '2025-05-01', amount: 1800, status: 'paid' },
      { id: 'inv2', date: '2025-04-01', amount: 2250, status: 'paid' },
      { id: 'inv3', date: '2025-03-01', amount: 1980, status: 'paid' },
    ],
    timeEntries: [
      { date: '2025-05-12', hours: 6, project: 'Website Redesign' },
      { date: '2025-05-11', hours: 4, project: 'Mobile App UI' },
      { date: '2025-05-10', hours: 5, project: 'Website Redesign' },
      { date: '2025-05-09', hours: 7, project: 'Mobile App UI' },
      { date: '2025-05-08', hours: 6, project: 'Website Redesign' },
    ],
    performanceMetrics: {
      qualityScore: 9.2,
      onTimeDelivery: 95,
      communicationScore: 8.8,
      clientSatisfaction: 4.7,
    },
  },
};

const ContractorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // In a real app, you would fetch the contractor data based on the ID
  const contractor = id ? CONTRACTORS[id as keyof typeof CONTRACTORS] : null;
  
  if (!contractor) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Contractor not found</p>
        <Link to="/contractors" className="mt-4 inline-block">
          <Button variant="outline" leftIcon={<ChevronLeft size={16} />}>
            Back to Contractors
          </Button>
        </Link>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link to="/contractors">
          <Button variant="ghost" size="sm" leftIcon={<ChevronLeft size={16} />}>
            Back to Contractors
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={contractor.avatar}
                  alt={contractor.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">{contractor.name}</h2>
                <p className="text-gray-500">{contractor.role}</p>
                
                <div className="flex items-center mt-2">
                  <Star size={16} className="text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{contractor.rating} / 5</span>
                </div>
                
                <div className="mt-4 w-full">
                  <Button variant="primary" fullWidth>
                    Message
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium">{contractor.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm font-medium">{contractor.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-sm font-medium">{contractor.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="text-sm font-medium">${contractor.hourlyRate}/hr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Availability</p>
                      <p className="text-sm font-medium">{contractor.availability}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarDays size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Contract End Date</p>
                      <p className="text-sm font-medium">{formatDate(contractor.contractEndDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-base font-medium text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {contractor.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-200 pb-0">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === 'overview'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === 'projects'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('time')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === 'time'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Time Tracking
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === 'invoices'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Invoices
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                    <p className="text-gray-600">{contractor.bio}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <Clock className="h-5 w-5 text-primary-600" />
                        </div>
                        <p className="ml-2 text-sm text-gray-500">Total Hours</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold">{contractor.totalHours}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-secondary-100 rounded-full">
                          <Briefcase className="h-5 w-5 text-secondary-600" />
                        </div>
                        <p className="ml-2 text-sm text-gray-500">Projects</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold">{contractor.totalProjects}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-accent-100 rounded-full">
                          <DollarSign className="h-5 w-5 text-accent-600" />
                        </div>
                        <p className="ml-2 text-sm text-gray-500">Total Earnings</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold">${contractor.totalEarnings}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CalendarDays className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="ml-2 text-sm text-gray-500">Joined</p>
                      </div>
                      <p className="mt-1 text-lg font-semibold">{formatDate(contractor.joinedDate)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-500">Quality Score</p>
                          <p className="text-sm font-medium">{contractor.performanceMetrics.qualityScore}/10</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(contractor.performanceMetrics.qualityScore / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-500">On-Time Delivery</p>
                          <p className="text-sm font-medium">{contractor.performanceMetrics.onTimeDelivery}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${contractor.performanceMetrics.onTimeDelivery}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-500">Communication</p>
                          <p className="text-sm font-medium">{contractor.performanceMetrics.communicationScore}/10</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-secondary-500 h-2 rounded-full"
                            style={{
                              width: `${(contractor.performanceMetrics.communicationScore / 10) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-500">Client Satisfaction</p>
                          <p className="text-sm font-medium">{contractor.performanceMetrics.clientSatisfaction}/5</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${(contractor.performanceMetrics.clientSatisfaction / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'projects' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Current Projects ({contractor.currentProjects})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Briefcase size={16} />}
                    >
                      Assign Project
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {contractor.projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">{project.name}</h4>
                            <div className="flex items-center mt-1">
                              <Clock size={14} className="text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">{project.hoursLogged} hours logged</span>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {project.status === 'in-progress' ? 'In Progress' : 'Completed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'time' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Time Entries</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Calendar size={16} />}
                      >
                        View Calendar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<LineChart size={16} />}
                      >
                        View Report
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Project
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Hours
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contractor.timeEntries.map((entry, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(entry.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.project}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.hours}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${entry.hours * contractor.hourlyRate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {activeTab === 'invoices' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<FileText size={16} />}
                    >
                      Generate Invoice
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Invoice #
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contractor.invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {invoice.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(invoice.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${invoice.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {invoice.status === 'paid' && (
                                  <Check size={12} className="mr-1" />
                                )}
                                {invoice.status === 'paid'
                                  ? 'Paid'
                                  : invoice.status === 'pending'
                                  ? 'Pending'
                                  : 'Overdue'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-primary-600 hover:text-primary-900">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractorDetails;