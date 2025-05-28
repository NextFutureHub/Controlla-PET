import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { contractorsService } from '../services/contractorsService';

export default function ContractorDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: contractor, isLoading } = useQuery({
    queryKey: ['contractor', id],
    queryFn: () => contractorsService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!contractor) {
    return <div>Contractor not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{contractor.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold">Email</h3>
              <p className="text-gray-600">{contractor.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Phone</h3>
              <p className="text-gray-600">{contractor.phone}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Role</h3>
              <p className="text-gray-600">{contractor.role}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Status</h3>
              <p className="text-gray-600">{contractor.status}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">Edit Contractor</Button>
              <Button variant="danger">Delete Contractor</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}