import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Star, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/DashboardHeader';
import SearchOrganizationsForm from '@/components/forms/SearchOrganizationsForm';
import NewApplicationForm from '@/components/forms/NewApplicationForm';
import OrganizationDetailsForm from '@/components/forms/OrganizationDetailsForm';

const Organizations = () => {
  const [showSearchOrganizationsForm, setShowSearchOrganizationsForm] = useState(false);
  const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
  const [showOrganizationDetailsForm, setShowOrganizationDetailsForm] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);

  const organizations = [
    {
      id: 1,
      name: 'Safaricom PLC',
      industry: 'Telecommunications',
      location: 'Nairobi',
      contactPerson: 'Jane Wanjiku',
      email: 'jane.wanjiku@safaricom.co.ke',
      phone: '+254700123456',
      activeStudents: 5,
      totalCapacity: 10,
      availablePositions: 5,
      rating: 4.8,
      status: 'Active',
      description: 'Leading telecommunications company in Kenya'
    },
    {
      id: 2,
      name: 'Kenya Commercial Bank',
      industry: 'Banking',
      location: 'Nairobi',
      contactPerson: 'John Kamau',
      email: 'john.kamau@kcbgroup.com',
      phone: '+254700234567',
      activeStudents: 3,
      totalCapacity: 8,
      availablePositions: 3,
      rating: 4.6,
      status: 'Active',
      description: 'One of the largest commercial banks in East Africa'
    },
    {
      id: 3,
      name: 'Equity Bank',
      industry: 'Banking',
      location: 'Nairobi',
      contactPerson: 'Mary Akinyi',
      email: 'mary.akinyi@equitybank.co.ke',
      phone: '+254700345678',
      activeStudents: 2,
      totalCapacity: 6,
      availablePositions: 2,
      rating: 4.5,
      status: 'Active',
      description: 'Pan-African financial services group'
    },
    {
      id: 4,
      name: 'Co-operative Bank',
      industry: 'Banking',
      location: 'Nairobi',
      contactPerson: 'Peter Ochieng',
      email: 'peter.ochieng@co-opbank.co.ke',
      phone: '+254700456789',
      activeStudents: 1,
      totalCapacity: 5,
      availablePositions: 4,
      rating: 4.4,
      status: 'Active',
      description: 'Customer-owned financial institution'
    }
  ];

  const handleApplyNow = (organization: any) => {
    setSelectedOrganization(organization);
    setShowNewApplicationForm(true);
  };

  const handleViewDetails = (organization: any) => {
    setSelectedOrganization(organization);
    setShowOrganizationDetailsForm(true);
  };

  const handleNewApplication = (data: any) => {
    console.log('Application submitted:', data);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <DashboardHeader
          title="Partner Organizations"
          description="Browse available attachment opportunities with our partner organizations"
          actionButton={{
            label: "Search Organizations",
            icon: Search,
            onClick: () => setShowSearchOrganizationsForm(true)
          }}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{organizations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {organizations.reduce((sum, org) => sum + org.availablePositions, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Industries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {new Set(organizations.map(org => org.industry)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {(organizations.reduce((sum, org) => sum + org.rating, 0) / organizations.length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Organizations</CardTitle>
            <CardDescription>Partner organizations offering attachment positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {organizations.map((org) => (
                <div key={org.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{org.name}</h3>
                        <Badge variant="secondary">{org.industry}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{org.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{org.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{org.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{org.availablePositions} positions available</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleApplyNow(org)}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(org)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forms */}
        {showSearchOrganizationsForm && (
          <SearchOrganizationsForm
            onClose={() => setShowSearchOrganizationsForm(false)}
          />
        )}

        {showNewApplicationForm && selectedOrganization && (
          <NewApplicationForm
            onClose={() => {
              setShowNewApplicationForm(false);
              setSelectedOrganization(null);
            }}
            onSubmit={handleNewApplication}
          />
        )}

        {showOrganizationDetailsForm && selectedOrganization && (
          <OrganizationDetailsForm
            onClose={() => {
              setShowOrganizationDetailsForm(false);
              setSelectedOrganization(null);
            }}
            organization={selectedOrganization}
          />
        )}
      </div>
    </Layout>
  );
};

export default Organizations;