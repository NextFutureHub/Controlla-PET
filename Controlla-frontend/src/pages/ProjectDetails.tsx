import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const ProjectDetails = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Project details coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;