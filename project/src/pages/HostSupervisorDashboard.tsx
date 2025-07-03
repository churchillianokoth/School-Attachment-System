import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Calendar,
  FileText,
  TrendingUp,
  Plus,
  UserPlus
} from 'lucide-react';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/DashboardHeader';
import StatsCard from '@/components/StatsCard';
import StudentCard from '@/components/StudentCard';
import MarkAttendanceForm from '@/components/forms/MarkAttendanceForm';
import CreateEvaluationForm from '@/components/forms/CreateEvaluationForm';
import AssignStudentForm from '@/components/forms/AssignStudentForm';
import StudentDetailsForm from '@/components/forms/StudentDetailsForm';

function HostSupervisorDashboard() {
  const [showMarkAttendanceForm, setShowMarkAttendanceForm] = useState(false);
  const [showCreateEvaluationForm, setShowCreateEvaluationForm] = useState(false);
  const [showAssignStudentForm, setShowAssignStudentForm] = useState(false);
  const [showStudentDetailsForm, setShowStudentDetailsForm] = useState(false);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState<string>('');
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any>(null);

  const students = [
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
    }
  ];

  const todayAttendance = [
    {
      id: 1,
      studentName: "Alice Wanjiku",
      checkIn: "08:30",
      checkOut: "17:00",
      status: "Present",
      hoursWorked: 8.5
    },
    {
      id: 2,
      studentName: "John Kamau",
      checkIn: "09:15",
      checkOut: "17:30",
      status: "Present",
      hoursWorked: 8.25
    }
  ];

  const recentEvaluations = [
    {
      id: 1,
      studentName: "Alice Wanjiku",
      evaluationType: "Weekly Performance Review",
      date: "2024-06-15",
      overallRating: 4.5,
      status: "Completed"
    },
    {
      id: 2,
      studentName: "John Kamau",
      evaluationType: "Monthly Progress Review",
      date: "2024-06-10",
      overallRating: 4.0,
      status: "Completed"
    }
  ];

  const pendingEvaluations = [
    {
      id: 1,
      studentName: "Alice Wanjiku",
      type: "Bi-weekly Review",
      dueDate: "2024-06-25"
    },
    {
      id: 2,
      studentName: "John Kamau",
      type: "Skills Assessment",
      dueDate: "2024-06-28"
    }
  ];

  const averageAttendance = Math.round(
    students.reduce((acc, student) => acc + student.attendanceRate, 0) / students.length
  );

  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;

  function handleViewDetails(id: number) {
    const student = students.find(s => s.id === id);
    if (student) {
      setSelectedStudentForDetails(student);
      setShowStudentDetailsForm(true);
    }
  }

  function handleEvaluate(id: number) {
    const student = students.find(s => s.id === id);
    if (student) {
      setSelectedStudentForEvaluation(student.name);
      setShowCreateEvaluationForm(true);
    }
  }

  function handleMarkAttendance(data: any) {
    console.log('Attendance marked:', data);
  }

  function handleCreateEvaluation(data: any) {
    console.log('Evaluation created:', data);
  }

  function handleAssignStudent(data: any) {
    console.log('Student assigned:', data);
  }

  function handleStartEvaluation(studentName: string) {
    setSelectedStudentForEvaluation(studentName);
    setShowCreateEvaluationForm(true);
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <DashboardHeader
          title="Host Supervisor Dashboard"
          description="Monitor student attendance and performance at your organization"
          actionButton={{
            label: "Record Attendance",
            icon: FileText,
            onClick: () => setShowMarkAttendanceForm(true)
          }}
        />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Assigned Students"
            value={students.length.toString()}
            change="Currently active"
            icon={Users}
            iconColor="text-muted-foreground"
          />
          <StatsCard
            title="Today's Attendance"
            value={`${presentToday}/${todayAttendance.length}`}
            change="Students present"
            icon={CheckCircle}
            iconColor="text-muted-foreground"
          />
          <StatsCard
            title="Avg Attendance Rate"
            value={`${averageAttendance}%`}
            change="Overall performance"
            icon={TrendingUp}
            iconColor="text-muted-foreground"
          />
          <StatsCard
            title="Pending Evaluations"
            value={pendingEvaluations.length.toString()}
            change="Due this week"
            icon={Calendar}
            iconColor="text-muted-foreground"
          />
        </div>

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assigned Students</CardTitle>
                    <CardDescription>Students under your supervision</CardDescription>
                  </div>
                  <Button onClick={() => setShowAssignStudentForm(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
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
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Attendance</CardTitle>
                    <CardDescription>Student check-in and check-out records</CardDescription>
                  </div>
                  <Button onClick={() => setShowMarkAttendanceForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Mark Attendance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{record.studentName}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm">In: {record.checkIn}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span className="text-sm">Out: {record.checkOut}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Hours: {record.hoursWorked}
                          </span>
                        </div>
                      </div>
                      <Badge variant="default">{record.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pending Evaluations</CardTitle>
                      <CardDescription>Evaluations that need to be completed</CardDescription>
                    </div>
                    <Button onClick={() => setShowCreateEvaluationForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Evaluation
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingEvaluations.map((evaluation) => (
                      <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{evaluation.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{evaluation.type}</p>
                          <p className="text-xs text-muted-foreground">Due: {evaluation.dueDate}</p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleStartEvaluation(evaluation.studentName)}
                        >
                          Start Evaluation
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Evaluations</CardTitle>
                  <CardDescription>Performance evaluations for your students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEvaluations.map((evaluation) => (
                      <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{evaluation.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{evaluation.evaluationType}</p>
                          <p className="text-xs text-muted-foreground">Date: {evaluation.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold">{evaluation.overallRating}/5</span>
                            <Badge variant="default">{evaluation.status}</Badge>
                          </div>
                          <Button size="sm" variant="outline" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        {showMarkAttendanceForm && (
          <MarkAttendanceForm
            onClose={() => setShowMarkAttendanceForm(false)}
            onSubmit={handleMarkAttendance}
          />
        )}

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
}

export default HostSupervisorDashboard;