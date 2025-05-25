import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { CreateProjectDto } from '../../services/projectsService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectDto) => Promise<void>;
}

const CreateProjectModal = ({ isOpen, onClose, onSubmit }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    dueDate: '',
    progress: 0,
    assignedContractors: [],
    totalHours: 0,
    budget: 0,
    spent: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  fullWidth
                />
              </div>

              <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
                  Progress (%)
                </label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  required
                  fullWidth
                />
              </div>

              <div>
                <label htmlFor="totalHours" className="block text-sm font-medium text-gray-700">
                  Total Hours
                </label>
                <Input
                  id="totalHours"
                  type="number"
                  min="0"
                  value={formData.totalHours}
                  onChange={(e) => setFormData({ ...formData, totalHours: parseInt(e.target.value) })}
                  required
                  fullWidth
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  Budget ($)
                </label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                  required
                  fullWidth
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal; 