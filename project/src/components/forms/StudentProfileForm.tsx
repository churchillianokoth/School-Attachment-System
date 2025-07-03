import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, X, Calendar, Building2, Star, FileText, Clock, Mail, Phone } from 'lucide-react';

interface StudentProfileFormProps {
  onClose: () => void;
  student: {
    id: number;
    name: string;
    studentId: string;
    email: string;
    course: string;
    year: number;
    status: string;
    organization?: string;
    supervisor?: string;
  };
}

const StudentProfileForm = ({ onClose, student }: StudentProfileFormProps) => {
  const performanceData = {
    technicalSkills: 4.2,
    communication: 4.0,
    teamwork: 4.5,
    punctuality: 3.8,
    initiative: 4.1
  };

  const recentReports = [
    {
      id: 1,
      title: "Week 8 Progress Report",
      submittedDate: "2024-06-18",
      status: "Reviewed",
      grade: "A"
    },
    {
      id: 2,
      title: "Week 7 Progress Report",
      submittedDate: "2024-06-11",
      status: "Reviewed",
      grade: "B+"
    }
  ];

  const attendanceData = {
    totalDays: 45,
    presentDays: 43,
    lateDays: 2,
    absentDays: 0,
    attendanceRate: 95.6
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Student Profile</span>
              </CardTitle>
              <CardDescription>Complete student information and performance overview</CardDescription>
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
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
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
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={student.status === 'Active' ? 'default' : 'destructive'}>
                        {student.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Course:</span>
                      <span className="text-sm">{student.course}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Year:</span>
                      <span className="text-sm">Year {student.year}</span>
                    </div>
                    {student.organization && (
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{student.organization}</span>
                      </div>
                    )}
                    {student.supervisor && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Supervisor:</span>
                        <span className="text-sm">{student.supervisor}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Performance</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Current GPA</h4>
                  <div className="text-2xl font-bold text-blue-600">3.75</div>
                  <p className="text-sm text-muted-foreground">Out of 4.0</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Credits Completed</h4>
                  <div className="text-2xl font-bold text-green-600">85</div>
                  <p className="text-sm text-muted-foreground">Out of 120 required</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Attendance Rate</h4>
                  <div className="text-2xl font-bold text-purple-600">{attendanceData.attendanceRate}%</div>
                  <Progress value={attendanceData.attendanceRate} className="h-2 mt-2" />
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Class Rank</h4>
                  <div className="text-2xl font-bold text-orange-600">15</div>
                  <p className="text-sm text-muted-foreground">Out of 120 students</p>
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

            <TabsContent value="reports" className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Reports</h3>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{report.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">{report.status}</Badge>
                        <Badge variant="outline">{report.grade}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {report.submittedDate}</span>
                    </div>
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

export default StudentProfileForm;