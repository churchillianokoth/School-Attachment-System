import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, X, MapPin, Users, Star, Phone, Mail, Globe } from 'lucide-react';

interface OrganizationDetailsFormProps {
  onClose: () => void;
  organization: {
    id: number;
    name: string;
    industry: string;
    location: string;
    contactPerson: string;
    email: string;
    phone: string;
    activeStudents: number;
    totalCapacity: number;
    rating: number;
    status: string;
  };
}

const OrganizationDetailsForm = ({ onClose, organization }: OrganizationDetailsFormProps) => {
  const utilizationRate = (organization.activeStudents / organization.totalCapacity) * 100;

  const assignedStudents = [
    { id: 1, name: "Alice Wanjiku", position: "Software Engineer Intern", startDate: "2024-07-01", performance: 4.2 },
    { id: 2, name: "John Kamau", position: "Business Analyst Intern", startDate: "2024-07-01", performance: 3.8 },
    { id: 3, name: "Mary Akinyi", position: "IT Support Intern", startDate: "2024-07-01", performance: 4.0 }
  ];

  const performanceMetrics = {
    studentSatisfaction: 4.5,
    completionRate: 95,
    mentorshipQuality: 4.3,
    learningOpportunities: 4.6
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Organization Details</span>
              </CardTitle>
              <CardDescription>Complete organization information and performance overview</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Organization Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{organization.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Industry:</span>
                      <Badge variant="secondary">{organization.industry}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organization.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={organization.status === 'Active' ? 'default' : 'destructive'}>
                        {organization.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{organization.rating}/5 Rating</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Capacity & Utilization</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Student Capacity</span>
                        <span className="text-sm font-semibold">{organization.activeStudents}/{organization.totalCapacity}</span>
                      </div>
                      <Progress value={utilizationRate} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{utilizationRate.toFixed(1)}% utilized</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{organization.activeStudents}</div>
                        <p className="text-xs text-muted-foreground">Active Students</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{organization.totalCapacity - organization.activeStudents}</div>
                        <p className="text-xs text-muted-foreground">Available Spots</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <h3 className="text-lg font-semibold">Assigned Students</h3>
              <div className="space-y-4">
                {assignedStudents.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{student.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{student.performance}/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span>Position: {student.position}</span>
                      </div>
                      <div>
                        <span>Start Date: {student.startDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(performanceMetrics).map(([metric, value]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-semibold">
                        {typeof value === 'number' && value <= 5 ? `${value}/5` : `${value}%`}
                      </span>
                    </div>
                    <Progress 
                      value={typeof value === 'number' && value <= 5 ? (value / 5) * 100 : value} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Primary Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organization.contactPerson}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organization.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organization.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Additional Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">www.{organization.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organization.location}, Kenya</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationDetailsForm;