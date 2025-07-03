import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, X, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ManageStudentsFormProps {
  onClose: () => void;
  organization: {
    id: number;
    name: string;
    activeStudents: number;
    totalCapacity: number;
  };
}

const ManageStudentsForm = ({ onClose, organization }: ManageStudentsFormProps) => {
  const [assignedStudents, setAssignedStudents] = useState([
    { 
      id: 1, 
      name: "Alice Wanjiku", 
      studentId: "154789", 
      position: "Software Engineer Intern", 
      startDate: "2024-07-01",
      status: "Active",
      performance: 4.2 
    },
    { 
      id: 2, 
      name: "John Kamau", 
      studentId: "154790", 
      position: "Business Analyst Intern", 
      startDate: "2024-07-01",
      status: "Active",
      performance: 3.8 
    },
    { 
      id: 3, 
      name: "Mary Akinyi", 
      studentId: "154791", 
      position: "IT Support Intern", 
      startDate: "2024-07-01",
      status: "Active",
      performance: 4.0 
    }
  ]);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    studentId: '',
    position: '',
    startDate: ''
  });

  const availableStudents = [
    { id: '154792', name: 'Peter Ochieng', course: 'Bachelor of Information Technology' },
    { id: '154793', name: 'Grace Mwangi', course: 'Bachelor of Business Information Technology' },
    { id: '154794', name: 'David Kiprotich', course: 'Bachelor of Computer Science' }
  ];

  const positions = [
    'Software Engineer Intern',
    'Business Analyst Intern',
    'IT Support Intern',
    'Marketing Intern',
    'Finance Intern',
    'Customer Service Intern'
  ];

  const handleAddStudent = () => {
    if (!newStudentData.studentId || !newStudentData.position || !newStudentData.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const selectedStudent = availableStudents.find(s => s.id === newStudentData.studentId);
    if (selectedStudent) {
      const newStudent = {
        id: Date.now(),
        name: selectedStudent.name,
        studentId: selectedStudent.id,
        position: newStudentData.position,
        startDate: newStudentData.startDate,
        status: "Active",
        performance: 0
      };

      setAssignedStudents(prev => [...prev, newStudent]);
      setNewStudentData({ studentId: '', position: '', startDate: '' });
      setShowAddStudent(false);
      
      toast({
        title: "Success",
        description: "Student assigned successfully",
      });
    }
  };

  const handleRemoveStudent = (studentId: number) => {
    setAssignedStudents(prev => prev.filter(s => s.id !== studentId));
    toast({
      title: "Success",
      description: "Student removed from organization",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Manage Students - {organization.name}</span>
              </CardTitle>
              <CardDescription>
                Assign and manage students for this organization ({assignedStudents.length}/{organization.totalCapacity} capacity)
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Add Student Section */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Assign New Student</h3>
                <Button 
                  onClick={() => setShowAddStudent(!showAddStudent)}
                  disabled={assignedStudents.length >= organization.totalCapacity}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </div>

              {showAddStudent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentSelect">Student</Label>
                    <Select 
                      value={newStudentData.studentId} 
                      onValueChange={(value) => setNewStudentData(prev => ({ ...prev, studentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="positionSelect">Position</Label>
                    <Select 
                      value={newStudentData.position} 
                      onValueChange={(value) => setNewStudentData(prev => ({ ...prev, position: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position} value={position}>{position}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newStudentData.startDate}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddStudent}>
                      Assign Student
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Current Students */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Currently Assigned Students</h3>
              <div className="space-y-4">
                {assignedStudents.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{student.name}</h4>
                          <Badge variant={getStatusBadgeVariant(student.status)}>
                            {student.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Student ID:</span> {student.studentId}
                          </div>
                          <div>
                            <span className="font-medium">Position:</span> {student.position}
                          </div>
                          <div>
                            <span className="font-medium">Start Date:</span> {student.startDate}
                          </div>
                        </div>
                        {student.performance > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">Performance: </span>
                            <span className="text-sm">{student.performance}/5</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRemoveStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Assigned:</span> {assignedStudents.length}
                </div>
                <div>
                  <span className="font-medium">Available Spots:</span> {organization.totalCapacity - assignedStudents.length}
                </div>
                <div>
                  <span className="font-medium">Utilization:</span> {Math.round((assignedStudents.length / organization.totalCapacity) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageStudentsForm;