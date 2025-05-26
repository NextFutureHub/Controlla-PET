import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Plus, Clock, Users, Calendar, AlertCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { projectsService, Project } from '../services/projectsService';
import { tasksService, Task, CreateTaskDto } from '../services/tasksService';
import { getProjectStatusInfo } from '../utils/projectStatus';
import CreateTaskModal from '../components/tasks/CreateTaskModal';

interface CreateTaskFormData {
  name: string;
  description: string;
  estimatedHours: number;
  dueDate: string;
  priority: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [taskFormData, setTaskFormData] = useState<CreateTaskFormData>({
    name: '',
    description: '',
    estimatedHours: 0,
    dueDate: '',
    priority: 'medium'
  });

  const fetchProject = async () => {
    try {
      if (id) {
        const data = await projectsService.getById(id);
        setProject(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load project details');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateTask = async (data: CreateTaskDto) => {
    try {
      await tasksService.create(data);
      await fetchProject();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.delete(id!, taskId);
        await fetchProject();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-error-500">{error || 'Project not found'}</p>
      </div>
    );
  }

  const statusInfo = getProjectStatusInfo(project.progress, project.dueDate, project.updatedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.message}
                  </span>
                  {statusInfo.indicator === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-2xl font-semibold mt-1">{project.progress}%</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Budget</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(project.budget)}</p>
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
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p className="text-2xl font-semibold mt-1">{formatDate(project.dueDate)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Add Task
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-5">
            {project?.tasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                  <div className="relative">
                    <button 
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {activeDropdown === task.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete Task
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock size={16} />
                      <span>{task.estimatedHours} hours</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar size={16} />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Progress:</span>
                    <span className="font-medium">{task.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
            
            {(!project?.tasks || project.tasks.length === 0) && (
              <div className="text-center py-10">
                <p className="text-gray-500">No tasks found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        projectId={id!}
      />
    </div>
  );
};

export default ProjectDetails;