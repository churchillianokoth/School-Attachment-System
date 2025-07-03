import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, UserCheck, UserPlus } from 'lucide-react';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/DashboardHeader';
import StudentCard from '@/components/StudentCard';
import CreateEvaluationForm from '@/components/forms/CreateEvaluationForm';
import AssignStudentForm from '@/components/forms/AssignStudentForm';
import StudentDetailsForm from '@/components/forms/StudentDetailsForm';

const Students = () => {
  const [showCreateEvaluationForm, setShowCreateEvaluationForm] = useState(false);
  const [showAssignStudentForm, setShowAssignStudentForm] = useState(false);
  const [showStudentDetailsForm, setShowStudentDetailsForm] = useState(false);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState('');
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any>(null);

  const assignedStudents = [
    {
      id: 1,
      name: "Alice Wanjiku",
      studentId: "154789",
      department: "IT Department",
      position: "Software Engineer Intern",
      startDate: "2024-07-01",
      attendanceRate: 95,
      status: "Active",
      lastCheckIn: "2024-06-18 08:30",
      totalDays: 45,
      presentDays: 43
    },
    {
      id: 2,
      name: "John Kamau", 
      studentId: "154790",
      department: "Business Analysis",
      position: "Business Analyst Intern",
      startDate: "2024-07-01",
      attendanceRate: 88,
      status: "Active",
      lastCheckIn: "2024-06-18 09:15",
      totalDays: 45,
      presentDays: 40
    },
    {
      id: 3,
      name: "Mary Akinyi", 
      studentId: "154792",
      department: "Customer Service",
      position: "Customer Service Intern",
      startDate: "2024-07-01",
      attendanceRate: 92,
      status: "Active",
      lastCheckIn: "2024-06-18 08:45",
      totalDays: 45,
      presentDays: 41
    }
  ];

  const averageAttendance = Math.round(
    assignedStudents.reduce((acc, student) => acc + student.attendanceRate, 0) / assignedStudents.length
  );

  const handleViewDetails = (id: number) => {
    const student = assignedStudents.find(s => s.id === id);
    if (student) {
      setSelectedStudentForDetails(student);
      setShowStudentDetailsForm(true);
    }
  };

  const handleEvaluate = (id: number) => {
    const student = assignedStudents.find(s => s.id === id);
    if (student) {
      setSelectedStudentForEvaluation(student.name);
      setShowCreateEvaluationForm(true);
    }
  };

  const handleCreateEvaluation = (data: any) => {
    console.log('Evaluation created:', data);
  };

  const handleAssignStudent = (data: any) => {
    console.log('Student assigned:', data);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <DashboardHeader
          title="My Students"
          description="Manage and monitor students assigned to your department"
          actionButton={{
            label: "Assign Student",
            icon: UserPlus,
            onClick: () => setShowAssignStudentForm(true)
          }}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{assignedStudents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {assignedStudents.filter(s => s.status === 'Active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {averageAttendance}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {new Set(assignedStudents.map(s => s.department)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>All students assigned to your supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  showAttendanceDetails={true}
                  onViewDetails={handleViewDetails}
                  onEvaluate={handleEvaluate}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forms */}
        {showCreateEvaluationForm && (
          <CreateEvaluationForm
            onClose={() => {
              setShowCreateEvaluationForm(false);
              setSelectedStudentForEvaluation('');
            }}
            onSubmit={handleCreateEvaluation}
            studentName={selectedStudentForEvaluation}
          />
        )}

        {showAssignStudentForm && (
          <AssignStudentForm
            onClose={() => setShowAssignStudentForm(false)}
            onSubmit={handleAssignStudent}
          />
        )}

        {showStudentDetailsForm && selectedStudentForDetails && (
          <StudentDetailsForm
            onClose={() => {
              setShowStudentDetailsForm(false);
              setSelectedStudentForDetails(null);
            }}
            student={selectedStudentForDetails}
          />
        )}
      </div>
    </Layout>
  );
};

export default Students;