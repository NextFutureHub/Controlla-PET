import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Plus, Clock, Users, Calendar, AlertCircle, MoreHorizontal, Trash2, X } from 'lucide-react';
import { projectsService, Project } from '../services/projectsService';
import { tasksService, Task } from '../services/tasksService';
import { getProjectStatusInfo } from '../utils/projectStatus';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { contractorsService, Contractor } from '../services/contractorsService';
import { toast } from 'react-hot-toast';

interface CreateTaskFormData {
  name: string;
  description: string;
  estimatedHours: number;
  dueDate: string;
  priority: string;
}

interface ProjectWithDates extends Project {
  startDate: string;
  endDate?: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [taskFormData, setTaskFormData] = useState<CreateTaskFormData>({
    name: '',
    description: '',
    estimatedHours: 0,
    dueDate: '',
    priority: 'medium'
  });
  const [showAddContractorsModal, setShowAddContractorsModal] = useState(false);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);

  // Получение данных проекта с использованием React Query
  const { data: project, isLoading: isLoadingProject } = useQuery<ProjectWithDates>({
    queryKey: ['project', id],
    queryFn: () => projectsService.getById(id!),
    enabled: !!id,
  });

  const { data: contractors = { contractors: [], total: 0, totalPages: 0 } } = useQuery({
    queryKey: ['contractors'],
    queryFn: () => contractorsService.getAll(),
  });

  const addContractorsMutation = useMutation({
    mutationFn: ({ projectId, contractorIds }: { projectId: string; contractorIds: string[] }) =>
      projectsService.addContractors(projectId, contractorIds),
    onMutate: async ({ projectId, contractorIds }) => {
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      const previousProject = queryClient.getQueryData(['project', projectId]);

      queryClient.setQueryData(['project', projectId], (old: any) => {
        const newContractors = contractors.contractors
          .filter(c => contractorIds.includes(c.id))
          .map(c => ({
            id: c.id,
            name: c.name,
            avatar: c.avatar,
            role: c.role
          }));

        return {
          ...old,
          assignedContractors: [...(old?.assignedContractors || []), ...newContractors]
        };
      });

      return { previousProject };
    },
    onError: (err, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', id], context.previousProject);
      }
      toast.error('Failed to add contractors');
    },
    onSettled: () => {
      // В любом случае инвалидируем запрос для получения актуальных данных
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowAddContractorsModal(false);
      setSelectedContractors([]);
      toast.success('Contractors added successfully');
    },
  });

  const removeContractorMutation = useMutation({
    mutationFn: ({ projectId, contractorId }: { projectId: string; contractorId: string }) =>
      projectsService.removeContractor(projectId, contractorId),
    onMutate: async ({ projectId, contractorId }) => {
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      const previousProject = queryClient.getQueryData(['project', projectId]);

      queryClient.setQueryData(['project', projectId], (old: any) => ({
        ...old,
        assignedContractors: old?.assignedContractors.filter((c: any) => c.id !== contractorId) || []
      }));

      return { previousProject };
    },
    onError: (err, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', id], context.previousProject);
      }
      toast.error('Failed to remove contractor');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Contractor removed successfully');
    },
  });

  const handleAddContractors = async () => {
    if (selectedContractors.length === 0) {
      toast.error('Please select at least one contractor');
      return;
    }

    await addContractorsMutation.mutateAsync({
      projectId: id!,
      contractorIds: selectedContractors,
    });
  };

  const handleRemoveContractor = async (contractorId: string) => {
    await removeContractorMutation.mutateAsync({
      projectId: id!,
      contractorId,
    });
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      await tasksService.create(data);
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.delete(taskId);
        queryClient.invalidateQueries({ queryKey: ['project', id] });
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

  const deleteMutation = useMutation({
    mutationFn: () => projectsService.delete(id!),
    onSuccess: () => {
      toast.success('Project deleted successfully');
      navigate('/projects');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-error-500">Project not found</p>
      </div>
    );
  }

  const statusInfo = getProjectStatusInfo(project.progress, project.dueDate, project.updatedAt);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{project?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-gray-600">{project?.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Status</h3>
              <p className="text-gray-600">{project?.status}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Start Date</h3>
              <p className="text-gray-600">{project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">End Date</h3>
              <p className="text-gray-600">{project?.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">Edit Project</Button>
              <Button variant="danger" onClick={handleDelete}>Delete Project</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;