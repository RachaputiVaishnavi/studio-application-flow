import { useState } from "react";
import { 
  Search, Check, X, Pause, ArrowUpDown, ArrowUp, ArrowDown, Save, Link, Plus, Trash2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ApplicationFilter from "@/components/ApplicationFilter";

// Mock data
const mockApplications = [
  { 
    id: 1, 
    name: "Cloudnet", 
    sector: "SaaS", 
    stage: "MVP", 
    lookingFor: "Funding", 
    status: "ROUND-1",
    revenue: "$10,000", 
    fundingAsk: "$250,000", 
    timestamp: "2023-01-15",
    notes: [
      { id: 1, round: "First Round", content: "Strong technical team with good market understanding. MVP shows promise.", timestamp: "2023-01-16" }
    ],
    pptLinks: [
      { id: 1, name: "Business Plan PPT", url: "https://example.com/cloudnet-business-plan.pptx" },
      { id: 2, name: "Product Demo", url: "https://example.com/cloudnet-demo.pdf" }
    ],
    checklistItems: {
      'check-1': false,
      'check-2': false,
      'check-3': false,
      'check-4': false,
      'check-5': false,
      'check-6': false,
    }
  },
  { 
    id: 2, 
    name: "Fintech", 
    sector: "Finance", 
    stage: "Early Traction", 
    lookingFor: "MVP", 
    status: "ROUND-2",
    revenue: "$25,000", 
    fundingAsk: "$300,000", 
    timestamp: "2023-02-10",
    notes: [
      { id: 1, round: "First Round", content: "Impressive user growth and solid financial projections. Team has relevant experience.", timestamp: "2023-02-11" },
      { id: 2, round: "Second Round", content: "Due diligence shows strong compliance framework. Ready for Series A.", timestamp: "2023-02-15" }
    ],
    pptLinks: [
      { id: 1, name: "Pitch Deck", url: "https://example.com/fintech-pitch.pdf" }
    ],
    checklistItems: {
      'check-1': true,
      'check-2': true,
      'check-3': false,
      'check-4': false,
      'check-5': false,
      'check-6': false,
    }
  },
  { 
    id: 3, 
    name: "Health App", 
    sector: "Health", 
    stage: "MVP", 
    lookingFor: "Growth", 
    status: "NEW",
    revenue: "$0", 
    fundingAsk: "$150,000", 
    timestamp: "2023-03-05",
    notes: [],
    pptLinks: [],
    checklistItems: {
      'check-1': false,
      'check-2': false,
      'check-3': false,
      'check-4': false,
      'check-5': false,
      'check-6': false,
    }
  },
  { 
    id: 4, 
    name: "EdTech Solution", 
    sector: "Education", 
    stage: "Early Traction", 
    lookingFor: "Funding", 
    status: "SELECTED",
    revenue: "$15,000", 
    fundingAsk: "$200,000", 
    timestamp: "2023-03-15",
    notes: [
      { id: 1, round: "First Round", content: "Innovative approach to online learning. Strong pilot results.", timestamp: "2023-03-16" }
    ],
    pptLinks: [
      { id: 1, name: "Product Overview", url: "https://example.com/edtech-overview.pptx" }
    ],
    checklistItems: {
      'check-1': true,
      'check-2': true,
      'check-3': true,
      'check-4': true,
      'check-5': true,
      'check-6': true,
    }
  },
  { 
    id: 5, 
    name: "Foodtech", 
    sector: "Food", 
    stage: "Idea", 
    lookingFor: "MVP", 
    status: "REJECTED",
    revenue: "$0", 
    fundingAsk: "$100,000", 
    timestamp: "2023-03-20",
    notes: [
      { id: 1, round: "First Round", content: "Concept needs more validation. Limited market research provided.", timestamp: "2023-03-21" }
    ],
    pptLinks: [],
    checklistItems: {
      'check-1': false,
      'check-2': false,
      'check-3': false,
      'check-4': false,
      'check-5': false,
      'check-6': false,
    }
  },
  { 
    id: 6, 
    name: "Robotics AI", 
    sector: "AI", 
    stage: "MVP", 
    lookingFor: "Growth", 
    status: "ON-HOLD",
    revenue: "$5,000", 
    fundingAsk: "$500,000", 
    timestamp: "2023-04-01",
    notes: [
      { id: 1, round: "First Round", content: "Cutting-edge technology but high execution risk. Team needs strengthening.", timestamp: "2023-04-02" }
    ],
    pptLinks: [
      { id: 1, name: "Technical Demo", url: "https://example.com/robotics-tech-demo.pdf" },
      { id: 2, name: "Market Analysis", url: "https://example.com/robotics-market.pptx" }
    ],
    checklistItems: {
      'check-1': false,
      'check-2': false,
      'check-3': false,
      'check-4': false,
      'check-5': false,
      'check-6': false,
    }
  },
];

// Status badge mapping
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string, className: string }> = {
    'NEW': { label: 'New', className: 'status-badge status-new' },
    'ROUND-1': { label: 'Round 1 Cleared', className: 'status-badge status-round1' },
    'ROUND-2': { label: 'Round 2 Cleared', className: 'status-badge status-round2' },
    'SELECTED': { label: 'Selected', className: 'status-badge status-selected' },
    'REJECTED': { label: 'Rejected', className: 'status-badge status-rejected' },
    'ON-HOLD': { label: 'On Hold', className: 'status-badge status-hold' },
  };

  const status_info = statusMap[status] || { label: status, className: 'status-badge' };
  return (
    <span className={status_info.className}>
      {status_info.label}
    </span>
  );
};

const Applications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState(mockApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // State for editing
  const [newNote, setNewNote] = useState("");
  const [noteRound, setNoteRound] = useState("First Round");
  const [pptLinks, setPptLinks] = useState<{id: number, name: string, url: string}[]>([]);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [checklistItems, setChecklistItems] = useState({
    'check-1': false,
    'check-2': false,
    'check-3': false,
    'check-4': false,
    'check-5': false,
    'check-6': false,
  });
  const [selectedStatus, setSelectedStatus] = useState("");

  // Filter options
  const [filters, setFilters] = useState({
    sectors: [] as string[],
    stages: [] as string[],
    lookingFor: [] as string[],
    statuses: [] as string[],
    fundingRange: { min: 0, max: 10000000 },
  });

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    const sortedItems = [...applications].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setApplications(sortedItems);
  };

  // Get sort icon
  const getSortIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown size={16} />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  // Handle application selection
  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetails(true);
    
    // Reset form states
    setNewNote("");
    setNoteRound("First Round");
    setPptLinks(application.pptLinks || []);
    setNewLinkName("");
    setNewLinkUrl("");
    setChecklistItems(application.checklistItems || {
      'check-1': false,
      'check-2': false,
      'check-3': false,
      'check-4': false,
      'check-5': false,
      'check-6': false,
    });
    setSelectedStatus(application.status);
  };

  // Handle adding new PPT link
  const handleAddPptLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      const newLink = {
        id: Date.now(),
        name: newLinkName.trim(),
        url: newLinkUrl.trim()
      };
      
      setPptLinks([...pptLinks, newLink]);
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };

  // Handle removing PPT link
  const handleRemovePptLink = (linkId: number) => {
    setPptLinks(pptLinks.filter(link => link.id !== linkId));
  };

  // Handle checklist item changes
  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklistItems({
      ...checklistItems,
      [itemId]: checked
    });
  };

  // Handle save all changes
  const handleSaveChanges = () => {
    const updatedApplicationData = {
      ...selectedApplication,
      status: selectedStatus,
      pptLinks: pptLinks,
      checklistItems: checklistItems,
      notes: newNote.trim() 
        ? [...(selectedApplication.notes || []), {
            id: Date.now(),
            round: noteRound,
            content: newNote.trim(),
            timestamp: new Date().toISOString().split('T')[0]
          }]
        : selectedApplication.notes || []
    };

    // Update the application in the state
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id ? updatedApplicationData : app
    ));

    // Update selected application
    setSelectedApplication(updatedApplicationData);

    // Reset new note
    setNewNote("");

    toast({
      title: "Changes Saved",
      description: "All application changes have been saved successfully.",
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      sectors: [],
      stages: [],
      lookingFor: [],
      statuses: [],
      fundingRange: { min: 0, max: 10000000 },
    });
    setApplications(mockApplications);
  };

  // Apply filters
  const handleApplyFilters = () => {
    let filtered = [...mockApplications];
    
    // Apply sector filter
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(app => filters.sectors.includes(app.sector));
    }
    
    // Apply stage filter
    if (filters.stages.length > 0) {
      filtered = filtered.filter(app => filters.stages.includes(app.stage));
    }
    
    // Apply looking for filter
    if (filters.lookingFor.length > 0) {
      filtered = filtered.filter(app => filters.lookingFor.includes(app.lookingFor));
    }
    
    // Apply status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(app => filters.statuses.includes(app.status));
    }
    
    // Apply funding range filter
    if (filters.fundingRange.min > 0 || filters.fundingRange.max < 10000000) {
      filtered = filtered.filter(app => {
        const fundingAskNumber = parseInt(app.fundingAsk.replace(/[^0-9]/g, ''));
        return fundingAskNumber >= filters.fundingRange.min && fundingAskNumber <= filters.fundingRange.max;
      });
    }
    
    setApplications(filtered);
  };

  // Handle search
  const handleSearch = () => {
    if (!searchTerm) {
      setApplications(mockApplications);
      return;
    }
    
    const filtered = mockApplications.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setApplications(filtered);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Startup Applications</h1>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search by name or industry..."
            className="flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search size={18} />
          </Button>
        </div>
        
        <ApplicationFilter
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
      </div>
      
      {/* Applications Table */}
      <div className="table-container mb-6 border rounded-md">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Startup Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th onClick={() => requestSort('sector')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Industry/Sector
                  {getSortIcon('sector')}
                </div>
              </th>
              <th onClick={() => requestSort('stage')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Stage
                  {getSortIcon('stage')}
                </div>
              </th>
              <th onClick={() => requestSort('lookingFor')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Looking For
                  {getSortIcon('lookingFor')}
                </div>
              </th>
              <th onClick={() => requestSort('fundingAsk')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Funding Ask
                  {getSortIcon('fundingAsk')}
                </div>
              </th>
              <th onClick={() => requestSort('revenue')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Current Revenue
                  {getSortIcon('revenue')}
                </div>
              </th>
              <th onClick={() => requestSort('status')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Application Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th onClick={() => requestSort('timestamp')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Date
                  {getSortIcon('timestamp')}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app.id}>
                  <td className="font-medium">{app.name}</td>
                  <td>{app.sector}</td>
                  <td>{app.stage}</td>
                  <td>{app.lookingFor}</td>
                  <td className="font-semibold">{app.fundingAsk}</td>
                  <td>{app.revenue}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>{app.timestamp}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleViewDetails(app)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No applications found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Application Details Dialog - Sleek and Classic Design */}
      {selectedApplication && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {selectedApplication.name}
                {getStatusBadge(selectedApplication.status)}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Company Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{selectedApplication.sector}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stage</p>
                      <p className="font-medium">{selectedApplication.stage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Looking For</p>
                      <p className="font-medium">{selectedApplication.lookingFor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submission Date</p>
                      <p className="font-medium">{selectedApplication.timestamp}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Funding Ask</p>
                      <p className="text-2xl font-bold text-green-600">{selectedApplication.fundingAsk}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Revenue</p>
                      <p className="text-2xl font-bold">{selectedApplication.revenue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="ROUND-1">Round 1 Cleared</SelectItem>
                            <SelectItem value="ROUND-2">Round 2 Cleared</SelectItem>
                            <SelectItem value="SELECTED">Selected</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="ON-HOLD">On Hold</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Reviewer</p>
                      <p className="font-medium">Jane Doe</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Evaluation Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evaluation Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { id: 'check-1', label: 'Founder is full-time' },
                        { id: 'check-2', label: 'Problem clearly defined' },
                        { id: 'check-3', label: 'Solution is validated' },
                        { id: 'check-4', label: 'Clear differentiation' },
                        { id: 'check-5', label: 'Large enough TAM/SAM' },
                        { id: 'check-6', label: 'Strong team composition' },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={item.id}
                            checked={checklistItems[item.id]}
                            onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                          />
                          <label htmlFor={item.id} className="text-sm">{item.label}</label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Notes */}
                  {selectedApplication.notes && selectedApplication.notes.length > 0 && (
                    <div className="space-y-3">
                      {selectedApplication.notes.map((note: any) => (
                        <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start mb-1">
                            <Badge variant="outline">{note.round}</Badge>
                            <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                      <Separator />
                    </div>
                  )}

                  {/* Add New Note */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={noteRound} onValueChange={setNoteRound}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select round" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="First Round">First Round</SelectItem>
                            <SelectItem value="Second Round">Second Round</SelectItem>
                            <SelectItem value="Final Round">Final Round</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Add your review notes here..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Documents & Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents & Pitch Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Links */}
                  {pptLinks.length > 0 && (
                    <div className="space-y-2">
                      {pptLinks.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Link size={18} className="text-blue-600" />
                            <div>
                              <p className="font-medium">{link.name}</p>
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              >
                                View Document <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemovePptLink(link.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                      <Separator />
                    </div>
                  )}

                  {/* Add New Link */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Document name"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                      />
                      <Input
                        placeholder="Document URL"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleAddPptLink} 
                      size="sm" 
                      disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
              <Button onClick={handleSaveChanges}>
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Applications;
