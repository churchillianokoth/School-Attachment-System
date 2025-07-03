import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, X, Download, FileText } from 'lucide-react';

interface EvaluationDetailsFormProps {
  onClose: () => void;
  evaluation: {
    id: number;
    studentName: string;
    evaluationType: string;
    date: string;
    overallRating: number;
    status: string;
    skills: {
      technical: number;
      communication: number;
      teamwork: number;
      punctuality: number;
    };
  };
}

const EvaluationDetailsForm = ({ onClose, evaluation }: EvaluationDetailsFormProps) => {
  const handleDownloadReport = () => {
    console.log('Downloading evaluation report for:', evaluation.studentName);
    // Simulate download
    const element = document.createElement('a');
    const file = new Blob([`Evaluation Report for ${evaluation.studentName}\n\nType: ${evaluation.evaluationType}\nDate: ${evaluation.date}\nOverall Rating: ${evaluation.overallRating}/5\n\nSkill Breakdown:\n- Technical: ${evaluation.skills.technical}/5\n- Communication: ${evaluation.skills.communication}/5\n- Teamwork: ${evaluation.skills.teamwork}/5\n- Punctuality: ${evaluation.skills.punctuality}/5`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `evaluation-${evaluation.studentName.replace(' ', '-')}-${evaluation.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Evaluation Details</span>
              </CardTitle>
              <CardDescription>Detailed view of student evaluation</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{evaluation.studentName}</h3>
                <Badge variant="default">{evaluation.status}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Evaluation Type:</span>
                  <p className="font-medium">{evaluation.evaluationType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{evaluation.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Overall Rating:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{evaluation.overallRating}/5</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(evaluation.overallRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skill Assessment</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(evaluation.skills).map(([skill, rating]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{skill}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold">{rating}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
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
            </div>

            {/* Performance Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Summary</h3>
              <div className="p-4 border rounded-lg">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {Object.values(evaluation.skills).filter(rating => rating >= 4).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Strong Areas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {Object.values(evaluation.skills).filter(rating => rating >= 3 && rating < 4).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Developing Areas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {Object.values(evaluation.skills).filter(rating => rating < 3).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Needs Improvement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detailed Feedback</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Strengths</h4>
                  <p className="text-sm text-muted-foreground">
                    Demonstrates excellent teamwork skills and shows strong initiative in problem-solving. 
                    Communication with team members is clear and effective.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Areas for Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    Could improve punctuality and time management. Technical skills are developing well 
                    but would benefit from more hands-on practice.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Continue current trajectory with teamwork and communication. Focus on arriving on time 
                    and managing deadlines more effectively. Consider additional technical training sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationDetailsForm;