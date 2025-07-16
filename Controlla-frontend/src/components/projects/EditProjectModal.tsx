import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { ProjectStatus, ProjectPriority, UpdateProjectDto, Project } from '../../services/projectsService';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProjectDto) => Promise<void>;
  initialData: Project;
}

export default function EditProjectModal({ isOpen, onClose, onSubmit, initialData }: EditProjectModalProps) {
  const mapInitialData = (data: Project): UpdateProjectDto => ({
    name: data.name,
    description: data.description,
    status: data.status as ProjectStatus,
    priority: 'medium',
    dueDate: data.dueDate,
    budget: data.budget,
    assignedContractors: data.assignedContractors?.map(c => c.id),
  });

  const [formData, setFormData] = useState<UpdateProjectDto>(mapInitialData(initialData));

  useEffect(() => {
    setFormData(mapInitialData(initialData));
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.description || !formData.dueDate || !formData.budget) {
        throw new Error('Please fill in all required fields');
      }
      // Преобразуем dueDate в ISO-строку (YYYY-MM-DD)
      const submitData = {
        name: formData.name,
        description: formData.description,
        dueDate: formData.dueDate ? formData.dueDate.slice(0, 10) : undefined,
        budget: Number(formData.budget),
        status: formData.status,
        priority: formData.priority,
        assignedContractors: formData.assignedContractors,
      };
      console.log('PATCH payload', submitData);
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      // TODO: вывести ошибку для пользователя
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'archived', label: 'Archived' }
              ]}
            />

            <Select
              label="Priority"
              value={formData.priority || 'medium'}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Due Date"
              value={formData.dueDate ? formData.dueDate.slice(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />

            <Input
              type="number"
              label="Budget"
              value={formData.budget ?? 0}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!formData.name || !formData.description || !formData.dueDate}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
} 