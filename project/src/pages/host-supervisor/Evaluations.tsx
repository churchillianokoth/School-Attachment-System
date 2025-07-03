import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Plus, Eye, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/DashboardHeader';
import CreateEvaluationForm from '@/components/forms/CreateEvaluationForm';
import EvaluationDetailsForm from '@/components/forms/EvaluationDetailsForm';

function Evaluations() {
  const [showCreateEvaluationForm, setShowCreateEvaluationForm] = useState(false);
  const [showEvaluationDetailsForm, setShowEvaluationDetailsForm] = useState(false);
  const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState('');
  const [selectedEvaluationForDetails, setSelectedEvaluationForDetails] = useState<any>(null);

  const evaluations = [
    {
      id: 1,
      studentName: "Alice Wanjiku",
      evaluationType: "Weekly Performance Review",
      date: "2024-06-15",
      overallRating: 4.5,
      status: "Completed",
      skills: {
        technical: 4.5,
        communication: 4.2,
        teamwork: 4.8,
        punctuality: 4.0
      }
    },
    {
      id: 2,
      studentName: "John Kamau",
      evaluationType: "Monthly Progress Review",
      date: "2024-06-10",
      overallRating: 4.0,
      status: "Completed",
      skills: {
        technical: 3.8,
        communication: 4.2,
        teamwork: 4.0,
        punctuality: 4.2
      }
    },
    {
      id: 3,
      studentName: "Mary Akinyi",
      evaluationType: "Mid-term Evaluation",
      date: "2024-06-08",
      overallRating: 4.3,
      status: "Completed", 
      skills: {
        technical: 4.0,
        communication: 4.5,
        teamwork: 4.2,
        punctuality: 4.5
      }
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

  const skillAverages = {
    technical: 4.1,
    communication: 4.3,
    teamwork: 4.3,
    punctuality: 4.2
  };

  const averageRating = (evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length).toFixed(1);
  const topPerformers = evaluations.filter(e => e.overallRating >= 4.5).length;

  const handleCreateEvaluation = (data: any) => {
    console.log('Evaluation created:', data);
  };

  const handleStartEvaluation = (studentName: string) => {
    setSelectedStudentForEvaluation(studentName);
    setShowCreateEvaluationForm(true);
  };

  const handleViewDetails = (evaluation: any) => {
    setSelectedEvaluationForDetails(evaluation);
    setShowEvaluationDetailsForm(true);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <DashboardHeader
          title="Student Evaluations"
          description="Evaluate and track student performance during their attachment"
          actionButton={{
            label: "New Evaluation",
            icon: Plus,
            onClick: () => setShowCreateEvaluationForm(true)
          }}
        />

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {evaluations.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {pendingEvaluations.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {averageRating}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {topPerformers}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Skill Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Performance Overview</CardTitle>
              <CardDescription>Average performance across key skill areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(skillAverages).map(([skill, average]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{skill}</span>
                      <span className="text-sm font-semibold">{average}/5</span>
                    </div>
                    <Progress value={(average / 5) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Evaluations</CardTitle>
              <CardDescription>Evaluations that need to be completed</CardDescription>
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
        </div>

        {/* Recent Evaluations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
            <CardDescription>Latest completed student evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{evaluation.studentName}</h4>
                      <p className="text-sm text-muted-foreground">{evaluation.evaluationType}</p>
                      <p className="text-xs text-muted-foreground">Date: {evaluation.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">{evaluation.overallRating}/5</span>
                      </div>
                      <Badge variant="default">{evaluation.status}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(evaluation.skills).map(([skill, rating]) => (
                      <div key={skill} className="text-center">
                        <p className="text-xs text-muted-foreground capitalize">{skill}</p>
                        <p className="font-semibold">{rating}/5</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(evaluation)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(evaluation)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                </div>
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

        {showEvaluationDetailsForm && selectedEvaluationForDetails && (
          <EvaluationDetailsForm
            onClose={() => {
              setShowEvaluationDetailsForm(false);
              setSelectedEvaluationForDetails(null);
            }}
            evaluation={selectedEvaluationForDetails}
          />
        )}
      </div>
    </Layout>
  );
}

export default Evaluations;