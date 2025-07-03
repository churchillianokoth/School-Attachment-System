import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, X, Calendar, Building2, Star, FileText, Clock } from 'lucide-react';

interface StudentDetailsFormProps {
  onClose: () => void;
  student: {
    id: number;
    name: string;
    studentId: string;
    department: string;
    position: string;
    startDate: string;
    attendanceRate: number;
    status: string;
    lastCheckIn?: string;
    totalDays?: number;
    presentDays?: number;
  };
}

const StudentDetailsForm = ({ onClose, student }: StudentDetailsFormProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const performanceData = {
    technicalSkills: 4.2,
    communication: 4.0,
    teamwork: 4.5,
    punctuality: 3.8,
    initiative: 4.1
  };

  const recentEvaluations = [
    {
      id: 1,
      type: "Weekly Assessment",
      date: "2024-06-15",
      score: 4.2,
      feedback: "Excellent progress in technical skills"
    },
    {
      id: 2,
      type: "Monthly Review",
      date: "2024-06-01",
      score: 4.0,
      feedback: "Good communication and teamwork"
    }
  ];

  const attendanceHistory = [
    { date: "2024-06-18", checkIn: "08:30", checkOut: "17:00", status: "Present" },
    { date: "2024-06-17", checkIn: "08:45", checkOut: "17:15", status: "Present" },
    { date: "2024-06-16", checkIn: "09:00", checkOut: "17:00", status: "Late" },
    { date: "2024-06-15", checkIn: "-", checkOut: "-", status: "Absent" },
    { date: "2024-06-14", checkIn: "08:30", checkOut: "17:30", status: "Present" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'text-green-600';
      case 'Late': return 'text-yellow-600';
      case 'Absent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Student Details</span>
              </CardTitle>
              <CardDescription>Comprehensive view of student information and performance</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Student ID:</span>
                      <span className="text-sm">{student.studentId}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{student.department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Position:</span>
                      <span className="text-sm">{student.position}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Started: {student.startDate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={student.status === 'Active' ? 'default' : 'destructive'}>
                        {student.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Attendance Rate</span>
                        <span className="text-sm font-semibold">{student.attendanceRate}%</span>
                      </div>
                      <Progress value={student.attendanceRate} className="h-2" />
                    </div>
                    {student.lastCheckIn && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Last check-in: {student.lastCheckIn}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(performanceData).map(([skill, rating]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold">{rating}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Progress value={(rating / 5) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <h3 className="text-lg font-semibold">Attendance History</h3>
              <div className="space-y-2">
                {attendanceHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{record.date}</span>
                      <span className={`text-sm ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {record.checkIn !== '-' && (
                        <>
                          <span>In: {record.checkIn}</span>
                          <span>Out: {record.checkOut}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Evaluations</h3>
              <div className="space-y-4">
                {recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{evaluation.type}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{evaluation.score}/5</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Date: {evaluation.date}</p>
                    <p className="text-sm">{evaluation.feedback}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetailsForm;