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
import { projectsService, Project, UpdateProjectDto } from '../services/projectsService';
import { tasksService, Task } from '../services/tasksService';
import { getProjectStatusInfo } from '../utils/projectStatus';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import { contractorsService, Contractor } from '../services/contractorsService';
import { toast } from 'react-hot-toast';
import EditProjectModal from '../components/projects/EditProjectModal';

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
  spent?: number;
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
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleEditProject = async (data: UpdateProjectDto) => {
    try {
      // Преобразуем assignedContractors в массив id, если есть
      let updateData: any = { ...data };
      if (Array.isArray(data.assignedContractors)) {
        updateData.assignedContractors = data.assignedContractors.map((c: any) => c.id ? c.id : c);
      }
      await projectsService.update(id!, updateData);
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowEditModal(false);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
      console.error('Error updating project:', error);
    }
  };

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
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              <CardTitle>{project?.name}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(true)}>Edit Project</Button>
              <Button variant="danger" onClick={handleDelete}>Delete Project</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-1">
                  <AlertCircle className="w-5 h-5 text-yellow-500" /> Description
                </h3>
                <p className="text-gray-600">{project?.description}</p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-1">
                  <Clock className="w-5 h-5 text-purple-500" /> Status
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>{project?.status}</span>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-1">
                  <Plus className="w-5 h-5 text-green-500" /> Progress
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{project?.progress ?? 0}%</span>
                  <div className="w-40 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (project?.progress || 0) >= 70 ? 'bg-green-500' :
                        (project?.progress || 0) >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(Math.max(project?.progress || 0, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="w-5 h-5 text-blue-500" /> Participants
                  </h3>
                  <Button size="sm" variant="primary" onClick={() => setShowAddContractorsModal(true)}>
                    Add Participant
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(project?.assignedContractors || []).length === 0 && (
                    <Card className="flex items-center justify-center">
                      <span className="text-gray-500">No contractors assigned</span>
                    </Card>
                  )}
                  {(project?.assignedContractors || []).map(contractor => (
                    <Card key={contractor.id} hoverable className="flex flex-col items-center p-4">
                      <img
                        src={contractor.avatar}
                        alt={contractor.name}
                        className="w-16 h-16 rounded-full border-2 border-white shadow mb-2"
                        title={contractor.name}
                      />
                      <span className="text-base font-medium">{contractor.name}</span>
                      <span className="text-xs text-gray-500">{contractor.role}</span>
                      {/* <Button size="sm" variant="danger" onClick={() => handleRemoveContractor(contractor.id)} className="mt-2">Remove</Button> */}
                    </Card>
                  ))}
                </div>
                {/* Модальное окно для добавления участников */}
                {showAddContractorsModal && (
                  <Modal isOpen={showAddContractorsModal} onClose={() => setShowAddContractorsModal(false)} title="Add Participants">
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Select contractors to add:</h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {contractors.contractors.map((contractor: any) => {
                          const alreadyAssigned = (project?.assignedContractors || []).some((c: any) => c.id === contractor.id);
                          return (
                            <label key={contractor.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer ${alreadyAssigned ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                              <input
                                type="checkbox"
                                disabled={alreadyAssigned}
                                checked={selectedContractors.includes(contractor.id) || alreadyAssigned}
                                onChange={e => {
                                  if (alreadyAssigned) return;
                                  if (e.target.checked) {
                                    setSelectedContractors(prev => [...prev, contractor.id]);
                                  } else {
                                    setSelectedContractors(prev => prev.filter(id => id !== contractor.id));
                                  }
                                }}
                              />
                              <img src={contractor.avatar} alt={contractor.name} className="w-8 h-8 rounded-full border" />
                              <span className="font-medium">{contractor.name}</span>
                              <span className="text-xs text-gray-500">{contractor.role}</span>
                              {alreadyAssigned && <span className="ml-auto text-xs text-green-500">Already in project</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddContractorsModal(false)}>Cancel</Button>
                      <Button
                        variant="primary"
                        onClick={handleAddContractors}
                        disabled={selectedContractors.length === 0}
                      >
                        Add
                      </Button>
                    </div>
                  </Modal>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-1">
                  <Calendar className="w-5 h-5 text-blue-400" /> Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500">Start Date</span>
                    <span className="text-gray-700 font-medium">{project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">End Date</span>
                    <span className="text-gray-700 font-medium">{project?.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Due Date</span>
                    <span className="text-gray-700 font-medium">{project?.dueDate ? formatDate(project.dueDate) : 'Not set'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Created</span>
                    <span className="text-gray-700 font-medium">{project?.createdAt ? formatDate(project.createdAt) : 'Not set'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Updated</span>
                    <span className="text-gray-700 font-medium">{project?.updatedAt ? formatDate(project.updatedAt) : 'Not set'}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Budget
                  </h3>
                  <span className="text-gray-700 font-medium">{formatCurrency(project?.budget ?? 0)}</span>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Spent
                  </h3>
                  <span className="text-gray-700 font-medium">{formatCurrency(project?.spent ?? 0)}</span>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-1">
                    <Clock className="w-4 h-4 text-purple-400" /> Total Hours
                  </h3>
                  <span className="text-gray-700 font-medium">{project?.totalHours ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {showEditModal && project && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditProject}
          initialData={project}
        />
      )}
    </div>
  );
};

export default ProjectDetails;