import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, X, Search, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';

interface ViewAllApplicationsFormProps {
  onClose: () => void;
  applications: Array<{
    id: number;
    studentName: string;
    organization: string;
    position: string;
    status: string;
    submittedDate: string;
    type: string;
  }>;
  onReview: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const ViewAllApplicationsForm = ({ onClose, applications, onReview, onApprove, onReject }: ViewAllApplicationsFormProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesType = !typeFilter || app.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending Review': return 'secondary';
      case 'Under Review': return 'outline';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>All Applications</span>
              </CardTitle>
              <CardDescription>View and manage all attachment applications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="min-w-[150px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[120px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="WBL">WBL</SelectItem>
                    <SelectItem value="SBL">SBL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setTypeFilter('');
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'Pending Review').length}
                </div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'Approved').length}
                </div>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {applications.filter(app => app.status === 'Under Review').length}
                </div>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Applications ({filteredApplications.length})
              </h3>
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{application.studentName}</h4>
                        <Badge variant={application.type === 'WBL' ? 'default' : 'secondary'}>
                          {application.type}
                        </Badge>
                      </div>
                      <Badge variant={getStatusVariant(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Organization:</span> {application.organization}
                      </div>
                      <div>
                        <span className="font-medium">Position:</span> {application.position}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {application.submittedDate}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onReview(application.id)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Review
                      </Button>
                      {application.status === 'Pending Review' && (
                        <>
                          <Button size="sm" onClick={() => onApprove(application.id)}>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onReject(application.id)}>
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Export List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAllApplicationsForm;