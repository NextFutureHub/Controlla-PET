import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const TimeTracking = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Time tracking features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracking;