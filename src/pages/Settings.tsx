
import { useState } from "react";
import { Download, Mail, FileSpreadsheet, Users, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [emailAddress, setEmailAddress] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Mock function to export data as Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      
      // Create a mock download
      const csvContent = `Startup Name,Industry/Sector,Stage,Looking For,Funding Ask,Current Revenue,Application Status,Date
Cloudnet,SaaS,MVP,Funding,$250000,$10000,ROUND-1,2023-01-15
Fintech,Finance,Early Traction,MVP,$300000,$25000,ROUND-2,2023-02-10
Health App,Health,MVP,Growth,$150000,$0,NEW,2023-03-05
EdTech Solution,Education,Early Traction,Funding,$200000,$15000,SELECTED,2023-03-15
Foodtech,Food,Idea,MVP,$100000,$0,REJECTED,2023-03-20
Robotics AI,AI,MVP,Growth,$500000,$5000,ON-HOLD,2023-04-01`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'startup-applications.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "Export Successful",
        description: "Application data has been exported to CSV file.",
      });
    }, 2000);
  };

  // Mock function to send email with Excel attachment
  const handleSendEmail = () => {
    if (!emailAddress.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the report.",
        variant: "destructive",
      });
      return;
    }

    if (!emailAddress.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    
    // Simulate email sending process
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailAddress("");
      
      toast({
        title: "Email Sent",
        description: `Application report has been sent to ${emailAddress}`,
      });
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon size={24} />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet size={20} />
              Data Export
            </CardTitle>
            <CardDescription>
              Export your startup application data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                {isExporting ? "Exporting..." : "Export as CSV"}
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <Input
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="flex-1"
                  type="email"
                />
                <Button 
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail size={16} />
                  {isSendingEmail ? "Sending..." : "Email Report"}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              The export includes all application data: startup names, sectors, stages, funding asks, 
              revenue, status, and submission dates. Email reports are sent as Excel attachments.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Application Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Application Statistics
            </CardTitle>
            <CardDescription>
              Overview of your startup application pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-muted-foreground">Selected</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
            <CardDescription>
              Customize your dashboard experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive email updates for new applications</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dashboard Layout</h4>
                <p className="text-sm text-muted-foreground">Customize the dashboard view</p>
              </div>
              <Button variant="outline" size="sm">
                Customize
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Retention</h4>
                <p className="text-sm text-muted-foreground">Manage how long application data is stored</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
