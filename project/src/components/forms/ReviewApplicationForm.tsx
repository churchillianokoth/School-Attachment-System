import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReviewApplicationFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  application: {
    id: number;
    studentName: string;
    organization: string;
    position: string;
    status: string;
    submittedDate: string;
    type: string;
  };
}

const ReviewApplicationForm = ({ onClose, onSubmit, application }: ReviewApplicationFormProps) => {
  const [reviewData, setReviewData] = useState({
    decision: '',
    feedback: '',
    recommendations: '',
    priority: 'Normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewData.decision || !reviewData.feedback) {
      toast({
        title: "Error",
        description: "Please provide decision and feedback",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ ...reviewData, applicationId: application.id });
    toast({
      title: "Success",
      description: "Application reviewed successfully",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Review Application</span>
              </CardTitle>
              <CardDescription>Review and provide feedback on student application</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Application Details */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{application.studentName}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={application.type === 'WBL' ? 'default' : 'secondary'}>
                    {application.type}
                  </Badge>
                  <Badge variant="secondary">{application.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Organization:</span>
                  <p className="font-medium">{application.organization}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <p className="font-medium">{application.position}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <p className="font-medium">{application.submittedDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Application Type:</span>
                  <p className="font-medium">{application.type === 'WBL' ? 'Work-Based Learning' : 'Service-Based Learning'}</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Student ID:</span>
                  <p className="font-medium">154789</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Course:</span>
                  <p className="font-medium">Bachelor of Business Information Technology</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>
                  <p className="font-medium">Year 3</p>
                </div>
                <div>
                  <span className="text-muted-foreground">GPA:</span>
                  <p className="font-medium">3.75/4.0</p>
                </div>
              </div>
            </div>

            {/* Application Content */}
            <div className="space-y-4">
              <h3 className="font-semibold">Application Content</h3>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Motivation Letter</h4>
                  <p className="text-sm text-muted-foreground">
                    I am writing to express my strong interest in the Software Engineer Intern position at Safaricom PLC. 
                    As a third-year student pursuing a Bachelor of Business Information Technology, I am eager to apply 
                    my technical skills and gain practical experience in a dynamic telecommunications environment...
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Relevant Skills</h4>
                  <p className="text-sm text-muted-foreground">
                    • Programming languages: Java, Python, JavaScript<br/>
                    • Web development: React, Node.js, HTML/CSS<br/>
                    • Database management: MySQL, MongoDB<br/>
                    • Version control: Git, GitHub
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Previous Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    Completed a web development project for a local NGO, developing a volunteer management system. 
                    Participated in hackathons and coding competitions. Strong academic performance with consistent 
                    high grades in programming courses.
                  </p>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold">Review & Decision</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decision">Decision *</Label>
                  <Select value={reviewData.decision} onValueChange={(value) => setReviewData(prev => ({ ...prev, decision: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Approve</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Reject</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span>Request More Information</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={reviewData.priority} onValueChange={(value) => setReviewData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High Priority</SelectItem>
                      <SelectItem value="Normal">Normal Priority</SelectItem>
                      <SelectItem value="Low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback *</Label>
                <Textarea
                  id="feedback"
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide detailed feedback on the application..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={reviewData.recommendations}
                  onChange={(e) => setReviewData(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Provide recommendations for the student or next steps..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewApplicationForm;