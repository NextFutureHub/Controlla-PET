import { useState } from 'react';
import { Modal } from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { CreateTaskDto } from '../../services/tasksService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDto) => Promise<void>;
  projectId: string;
}

const CreateTaskModal = ({ isOpen, onClose, onSubmit, projectId }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState<CreateTaskDto>({
    name: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    progress: 0,
    estimatedHours: 0,
    loggedHours: 0,
    weight: 1,
    dueDate: '',
    projectId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        description: '',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        estimatedHours: 0,
        loggedHours: 0,
        weight: 1,
        dueDate: '',
        projectId
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Task Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Estimated Hours"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
              required
              min="0"
              step="0.5"
            />

            <Input
              type="date"
              label="Due Date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
          />

          <Input
            type="number"
            label="Weight"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
            min="1"
            max="10"
            step="1"
          />
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
            disabled={!formData.name || !formData.description || !formData.dueDate || formData.estimatedHours <= 0}
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal; 