import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Search, Filter, Clock, Users, MoreHorizontal, Calendar, ArrowUpRight } from 'lucide-react';
import { projectsService, Project, CreateProjectDto } from '../services/projectsService';
import CreateProjectModal from '../components/projects/CreateProjectModal';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'planning' | 'completed'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const data = await projectsService.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: CreateProjectDto) => {
    try {
      await projectsService.create(data);
      await fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-error-500';
      case 'medium':
        return 'text-warning-500';
      case 'low':
        return 'text-success-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-error-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Project
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <p className="text-2xl font-semibold mt-1">{projects.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <ArrowUpRight size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold mt-1">
                  {projects.filter(p => p.status === 'in-progress').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(projects.reduce((acc, p) => acc + p.budget, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-2xl font-semibold mt-1">
                  {projects.reduce((acc, p) => acc + p.totalHours, 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                leftIcon={<Search size={18} />}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Filter size={16} />}
                >
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
                <div className="absolute z-10 mt-1 right-0 w-40 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block">
                  <div className="py-1">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('in-progress')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setStatusFilter('planning')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Planning
                    </button>
                    <button
                      onClick={() => setStatusFilter('completed')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {project.name}
                      </Link>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {project.assignedContractors.map((contractor) => (
                        <img
                          key={contractor.id}
                          src={contractor.avatar}
                          alt={contractor.name}
                          className="w-8 h-8 rounded-full border-2 border-white"
                          title={contractor.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>{project.totalHours} hours</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar size={16} />
                      <span>{formatDate(project.dueDate)}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Budget: </span>
                    <span className="font-medium">{formatCurrency(project.budget)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No projects found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Projects;