import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const Finance = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Financial management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;