import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Search, Filter, Plus, Star, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { contractorsService, Contractor } from '../services/contractorsService';
import { toast } from 'react-hot-toast';
import { ContractorStatus } from '../types/contractor';

const Contractors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'rating' | 'hourlyRate'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | ContractorStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const queryClient = useQueryClient();

  // Получение списка подрядчиков
  const { data: contractors = [], isLoading, error } = useQuery({
    queryKey: ['contractors', currentPage],
    queryFn: async () => {
      try {
        console.log('Fetching contractors...');
        const data = await contractorsService.getAll(currentPage);
        console.log('Contractors data:', data);
        setTotalPages(data.totalPages);
        return data.contractors;
      } catch (error) {
        console.error('Error fetching contractors:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Мутация для обновления статуса
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContractorStatus }) =>
      contractorsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors', currentPage] });
      toast.success('Contractor status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating contractor status:', error);
      toast.error('Failed to update contractor status');
    },
  });

  // Мутация для обновления рейтинга
  const updateRatingMutation = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      contractorsService.updateRating(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors', currentPage] });
      toast.success('Contractor rating updated successfully');
    },
    onError: (error) => {
      console.error('Error updating contractor rating:', error);
      toast.error('Failed to update contractor rating');
    },
  });

  const handleRatingUpdate = async (id: string, currentRating: number) => {
    try {
      console.log('Current rating before update:', currentRating, typeof currentRating);
      
      // Убедимся, что currentRating является числом
      const rating = Number(currentRating || 0);
      console.log('Converted rating:', rating, typeof rating);
      
      if (isNaN(rating)) {
        console.error('Invalid rating value:', currentRating);
        toast.error('Invalid rating value');
        return;
      }

      // Вычисляем новый рейтинг, но не превышаем 5
      const newRating = Math.min(rating + 0.5, 5);
      console.log('New rating before rounding:', newRating);
      
      // Округляем до двух знаков после запятой (как в БД)
      const roundedRating = Number(newRating.toFixed(2));
      console.log('Final rounded rating:', roundedRating);
      
      await updateRatingMutation.mutateAsync({ id, rating: roundedRating });
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update rating');
    }
  };

  const handleSort = (field: 'name' | 'rating' | 'hourlyRate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredContractors = contractors.filter((contractor) => {
    // Filter by search query
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus =
      statusFilter === 'all' || contractor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by selected field
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'rating') {
      return sortDirection === 'asc'
        ? a.rating - b.rating
        : b.rating - a.rating;
    } else {
      return sortDirection === 'asc'
        ? a.hourlyRate - b.hourlyRate
        : b.hourlyRate - a.hourlyRate;
    }
  });

  const getStatusColor = (status: ContractorStatus) => {
    switch (status) {
      case ContractorStatus.ACTIVE:
        return 'bg-success-100 text-success-800';
      case ContractorStatus.INACTIVE:
        return 'bg-warning-100 text-warning-800';
      case ContractorStatus.OFFLINE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading contractors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error-500">Error loading contractors. Please try again later.</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
        <div className="mt-3 sm:mt-0">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Add Contractor
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search contractors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                leftIcon={<Search size={18} />}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Filter size={16} />}
                >
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
                <div className="absolute z-10 mt-1 right-0 w-40 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block">
                  <div className="py-1">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter(ContractorStatus.ACTIVE)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setStatusFilter(ContractorStatus.INACTIVE)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Inactive
                    </button>
                    <button
                      onClick={() => setStatusFilter(ContractorStatus.OFFLINE)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Offline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1"
                    >
                      <span>Contractor</span>
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <button
                      onClick={() => handleSort('hourlyRate')}
                      className="flex items-center space-x-1"
                    >
                      <span>Rate</span>
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <button
                      onClick={() => handleSort('rating')}
                      className="flex items-center space-x-1"
                    >
                      <span>Rating</span>
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredContractors.map((contractor) => (
                  <tr key={contractor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={contractor.avatar || 'https://via.placeholder.com/40'}
                          alt={contractor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contractor.name}</p>
                          <p className="text-xs text-gray-500">{contractor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{contractor.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{contractor.location}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">${contractor.hourlyRate}/hr</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {(() => {
                            const rating = Number(contractor.rating || 0);
                            console.log('Display rating:', contractor.rating, typeof contractor.rating, 'Converted:', rating);
                            return !isNaN(rating) ? rating.toFixed(2) : '0.00';
                          })()}
                        </span>
                        <button
                          onClick={() => {
                            console.log('Button clicked, contractor:', contractor);
                            const currentRating = Number(contractor.rating || 0);
                            handleRatingUpdate(contractor.id, currentRating);
                          }}
                          className="ml-2 text-gray-400 hover:text-yellow-400"
                          disabled={updateRatingMutation.isPending}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}
                      >
                        {contractor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Link to={`/contractors/${contractor.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <button className="text-gray-400 hover:text-gray-500">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredContractors.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No contractors found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-8 flex justify-center items-center space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 border rounded-md ${
              currentPage === page ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Contractors;