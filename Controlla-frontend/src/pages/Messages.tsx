import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { MessageSquare, Send, Search, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Messages = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Communicate with your team and contractors</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send size={16} />}
          >
            New Message
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search messages..."
                fullWidth
                leftIcon={<Search size={18} />}
              />
            </div>
            <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-sm text-gray-500">
                Start a conversation with your team or contractors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages; 