import { useState, useEffect } from "react";
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
import { formApi, evaluationApi } from "@/services/api";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'On Hold': { label: 'On Hold', variant: 'warning' },
    'Round 1 Cleared': { label: 'Round 1 Cleared', variant: 'secondary' },
    'Round 2 Cleared': { label: 'Round 2 Cleared', variant: 'secondary' },
    'Selected': { label: 'Selected', variant: 'success' },
    'Rejected': { label: 'Rejected', variant: 'destructive' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['On Hold'];
  
  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  );
};

// Types for our data
interface FormData {
  _id: string;
  projectId: string;
  role: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  country: string;
  city: string;
  startupName: string;
  websiteURL: string;
  currentState: string;
  lookingFor: string;
  companyLinkedIn: string;
  foundersLinkedIn: string;
  industry: string;
  problemSolved: string;
  startupDescription: string;
  targetMarket: string;
  numberOfCustomers: number;
  revenueCurrency: string;
  revenueAmount: number;
  raisedFunding: boolean;
  fundingCurrency: string;
  fundingAmount: number;
  heardFrom: string;
  additionalInfo: string;
  pitchDeck: string;
  submissionDate: string;
}

interface EvaluationData {
  _id: string;
  projectId: string;
  projectStatus: string;
  roundNotes: {
    firstRound: Array<{ text: string; timestamp: string }>;
    secondRound: Array<{ text: string; timestamp: string }>;
    thirdRound: Array<{ text: string; timestamp: string }>;
    generalNotes: Array<{ text: string; timestamp: string }>;
  };
  additionalDocuments: Array<{
    _id: string;
    name: string;
    url: string;
    type: string;
  }>;
  evaluationChecklist: Array<{
    _id: string;
    name: string;
    checked: boolean;
    notes: string;
  }>;
  lastUpdated: string;
}

// Update the pendingChanges type
interface PendingChanges {
  status?: string;
  roundNotes?: Record<string, Array<{ text: string; timestamp: string }>>;
  checklist?: Array<{ _id: string; checked: boolean; notes?: string }>;
  documents?: Array<{ name: string; url: string; type: string } | { _id: string; remove: true }>;
}

const Applications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<FormData[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationData>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<FormData | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // State for editing
  const [newNote, setNewNote] = useState("");
  const [noteRound, setNoteRound] = useState("firstRound");
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  // Filter options
  const [filters, setFilters] = useState({
    sectors: [] as string[],
    stages: [] as string[],
    lookingFor: [] as string[],
    statuses: [] as string[],
    fundingRange: { min: 0, max: 10000000 },
  });

  // Transform notes data to ensure it's in the correct format
  const transformNotes = (notes: any) => {
    if (!notes) return {
      firstRound: [],
      secondRound: [],
      thirdRound: [],
      generalNotes: []
    };

    const transformRound = (roundNotes: any): Array<{ text: string; timestamp: string }> => {
      if (!roundNotes) return [];
      if (Array.isArray(roundNotes)) return roundNotes;
      if (typeof roundNotes === 'string') {
        return [{
          text: roundNotes,
          timestamp: new Date().toISOString()
        }];
      }
      return [];
    };

    return {
      firstRound: transformRound(notes.firstRound),
      secondRound: transformRound(notes.secondRound),
      thirdRound: transformRound(notes.thirdRound),
      generalNotes: transformRound(notes.generalNotes)
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsResponse, evaluationsResponse] = await Promise.all([
          formApi.getForms(),
          evaluationApi.getEvaluations()
        ]);

        const formsData = formsResponse.data.data;
        const evaluationsData = evaluationsResponse.data.data;

        // Transform evaluations data
        const transformedEvaluations = evaluationsData.map((evaluation: any) => ({
          ...evaluation,
          roundNotes: transformNotes(evaluation.roundNotes)
        }));

        // Convert evaluations array to object with projectId as key
        const evaluationsMap = transformedEvaluations.reduce((acc: Record<string, EvaluationData>, evaluation: EvaluationData) => {
          acc[evaluation.projectId] = evaluation;
          return acc;
        }, {});

        setApplications(formsData);
        setEvaluations(evaluationsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applications data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
  const handleViewDetails = async (application: FormData) => {
    setSelectedApplication(application);
    const evaluation = evaluations[application.projectId];
    if (evaluation) {
      setSelectedEvaluation({
        ...evaluation,
        roundNotes: transformNotes(evaluation.roundNotes)
      });
    } else {
      setSelectedEvaluation(null);
    }
    setShowDetails(true);
    
    // Reset form states
    setNewNote("");
    setNoteRound("firstRound");
    setNewLinkName("");
    setNewLinkUrl("");
  };

  // Handle status update
  const handleStatusUpdate = (status: string) => {
    if (!selectedApplication) return;
    console.log('Status update:', { status, projectId: selectedApplication.projectId });
    
    // Update local state immediately for better UX
    setEvaluations(prev => {
      const currentEvaluation = prev[selectedApplication.projectId];
      if (!currentEvaluation) return prev;

      const updatedEvaluation = {
        ...currentEvaluation,
        projectStatus: status
      };

      // Update selected evaluation as well
      setSelectedEvaluation(updatedEvaluation);

      return {
        ...prev,
        [selectedApplication.projectId]: updatedEvaluation
      };
    });

    setPendingChanges(prev => ({ ...prev, status }));
    setHasChanges(true);
  };

  // Handle checklist update
  const handleChecklistUpdate = (checklistId: string, checked: boolean, notes?: string) => {
    if (!selectedApplication) return;
    setPendingChanges(prev => ({
      ...prev,
      checklist: [...(prev.checklist || []), { _id: checklistId, checked, notes }]
    }));
    setHasChanges(true);
  };

  // Handle round notes update
  const handleRoundNotesUpdate = (round: string, notes: string) => {
    if (!selectedApplication) return;
    console.log('Notes update:', { round, notes, projectId: selectedApplication.projectId });
    
    const newNote = {
      text: notes,
      timestamp: new Date().toISOString()
    };

    // Update local state immediately for better UX
    setEvaluations(prev => {
      const currentEvaluation = prev[selectedApplication.projectId];
      if (!currentEvaluation) return prev;

      const updatedEvaluation = {
        ...currentEvaluation,
        roundNotes: {
          ...currentEvaluation.roundNotes,
          [round]: [
            ...(currentEvaluation.roundNotes[round as keyof typeof currentEvaluation.roundNotes] || []),
            newNote
          ]
        }
      };

      // Update selected evaluation as well
      setSelectedEvaluation(updatedEvaluation);

      return {
        ...prev,
        [selectedApplication.projectId]: updatedEvaluation
      };
    });

    setPendingChanges(prev => ({
      ...prev,
      roundNotes: {
        ...(prev.roundNotes || {}),
        [round]: [
          ...(prev.roundNotes?.[round] || []),
          newNote
        ]
      }
    }));
    setHasChanges(true);

    // Clear the input after adding note
    setNewNote("");
  };

  // Handle document operations
  const handleAddDocument = (document: { name: string, url: string, type: string }) => {
    if (!selectedApplication) return;
    setPendingChanges(prev => ({
      ...prev,
      documents: [...(prev.documents || []), document]
    }));
    setHasChanges(true);
  };

  const handleRemoveDocument = (documentId: string) => {
    if (!selectedApplication) return;
    setPendingChanges(prev => ({
      ...prev,
      documents: [...(prev.documents || []), { _id: documentId, remove: true }]
    }));
    setHasChanges(true);
  };

  // Save all changes
  const handleSaveChanges = async () => {
    if (!selectedApplication || !hasChanges) return;

    console.log('Saving changes:', {
      projectId: selectedApplication.projectId,
      pendingChanges
    });

    try {
      const response = await evaluationApi.updateEvaluation(selectedApplication.projectId, pendingChanges);
      console.log('Save response:', response.data);
      
      // Update local state with the response data
      setEvaluations(prev => {
        const currentEvaluation = prev[selectedApplication.projectId];
        if (!currentEvaluation) return prev;

        const updatedEvaluation: EvaluationData = {
          ...currentEvaluation,
          projectStatus: pendingChanges.status || currentEvaluation.projectStatus,
          roundNotes: {
            ...currentEvaluation.roundNotes,
            ...(pendingChanges.roundNotes || {})
          },
          evaluationChecklist: pendingChanges.checklist 
            ? currentEvaluation.evaluationChecklist.map(item => {
                const update = pendingChanges.checklist?.find(u => u._id === item._id);
                return update ? { ...item, ...update } : item;
              })
            : currentEvaluation.evaluationChecklist,
          additionalDocuments: pendingChanges.documents
            ? [
                ...currentEvaluation.additionalDocuments.filter(doc => 
                  !pendingChanges.documents?.some(d => 
                    'remove' in d && d._id === doc._id
                  )
                ),
                ...(pendingChanges.documents
                  .filter((doc): doc is { name: string; url: string; type: string } => !('remove' in doc))
                  .map(doc => ({ ...doc, _id: Math.random().toString() }))
                )
              ]
            : currentEvaluation.additionalDocuments,
          lastUpdated: new Date().toISOString()
        };

        return {
          ...prev,
          [selectedApplication.projectId]: updatedEvaluation
        };
      });

      // Reset changes
      setPendingChanges({});
      setHasChanges(false);
    setNewNote("");
      setNewLinkName("");
      setNewLinkUrl("");

    toast({
        title: "Success",
        description: "Changes saved successfully",
    });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
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
  };

  // Apply filters
  const handleApplyFilters = () => {
    let filtered = [...applications];
    
    // Apply sector filter
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(app => filters.sectors.includes(app.industry));
    }
    
    // Apply stage filter
    if (filters.stages.length > 0) {
      filtered = filtered.filter(app => filters.stages.includes(app.currentState));
    }
    
    // Apply looking for filter
    if (filters.lookingFor.length > 0) {
      filtered = filtered.filter(app => filters.lookingFor.includes(app.lookingFor));
    }
    
    // Apply status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(app => 
        filters.statuses.includes(evaluations[app.projectId]?.projectStatus || 'NEW')
      );
    }
    
    // Apply funding range filter
    if (filters.fundingRange.min > 0 || filters.fundingRange.max < 10000000) {
      filtered = filtered.filter(app => {
        const fundingAmount = app.fundingAmount;
        return fundingAmount >= filters.fundingRange.min && fundingAmount <= filters.fundingRange.max;
      });
    }
    
    setApplications(filtered);
  };

  // Handle search
  const handleSearch = () => {
    if (!searchTerm) {
      // Reset to original data
      formApi.getForms().then(response => {
        setApplications(response.data.data);
      });
      return;
    }
    
    const filtered = applications.filter(app => 
      app.startupName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.industry.toLowerCase().includes(searchTerm.toLowerCase())
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
              <th onClick={() => requestSort('startupName')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Startup Name
                  {getSortIcon('startupName')}
                </div>
              </th>
              <th onClick={() => requestSort('industry')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Industry/Sector
                  {getSortIcon('industry')}
                </div>
              </th>
              <th onClick={() => requestSort('currentState')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Stage
                  {getSortIcon('currentState')}
                </div>
              </th>
              <th onClick={() => requestSort('lookingFor')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Looking For
                  {getSortIcon('lookingFor')}
                </div>
              </th>
              <th onClick={() => requestSort('fundingAmount')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Funding Ask
                  {getSortIcon('fundingAmount')}
                </div>
              </th>
              <th onClick={() => requestSort('revenueAmount')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Current Revenue
                  {getSortIcon('revenueAmount')}
                </div>
              </th>
              <th onClick={() => requestSort('projectStatus')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Application Status
                  {getSortIcon('projectStatus')}
                </div>
              </th>
              <th onClick={() => requestSort('submissionDate')} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Date
                  {getSortIcon('submissionDate')}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center">
                  Loading applications...
                </td>
              </tr>
            ) : applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app._id}>
                  <td className="font-medium">{app.startupName}</td>
                  <td>{app.industry}</td>
                  <td>{app.currentState}</td>
                  <td>{app.lookingFor}</td>
                  <td className="font-semibold">
                    {app.fundingAmount.toLocaleString()} {app.fundingCurrency}
                  </td>
                  <td>
                    {app.revenueAmount.toLocaleString()} {app.revenueCurrency}
                  </td>
                  <td>
                    {getStatusBadge(evaluations[app.projectId]?.projectStatus || 'NEW')}
                  </td>
                  <td>{new Date(app.submissionDate).toLocaleDateString()}</td>
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

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {selectedApplication.startupName}
                {getStatusBadge(selectedEvaluation?.projectStatus || 'NEW')}
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
                      <p className="font-medium">{selectedApplication.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stage</p>
                      <p className="font-medium">{selectedApplication.currentState}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Looking For</p>
                      <p className="font-medium">{selectedApplication.lookingFor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submission Date</p>
                      <p className="font-medium">
                        {new Date(selectedApplication.submissionDate).toLocaleDateString()}
                      </p>
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
                      <p className="text-2xl font-bold text-green-600">
                        {selectedApplication.fundingAmount.toLocaleString()} {selectedApplication.fundingCurrency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Revenue</p>
                      <p className="text-2xl font-bold">
                        {selectedApplication.revenueAmount.toLocaleString()} {selectedApplication.revenueCurrency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

                {/* Status Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status Management</CardTitle>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                      <Select 
                        value={selectedEvaluation?.projectStatus || 'On Hold'} 
                        onValueChange={handleStatusUpdate}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status">
                            {selectedEvaluation?.projectStatus || 'On Hold'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Round 1 Cleared">Round 1 Cleared</SelectItem>
                            <SelectItem value="Round 2 Cleared">Round 2 Cleared</SelectItem>
                            <SelectItem value="Selected">Selected</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Evaluation Checklist */}
              {selectedEvaluation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evaluation Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedEvaluation.evaluationChecklist.map((item) => (
                        <div key={item._id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={item._id}
                            checked={item.checked}
                            onCheckedChange={(checked) => 
                              handleChecklistUpdate(item._id, checked as boolean, item.notes)
                            }
                          />
                          <label htmlFor={item._id} className="text-sm">{item.name}</label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes Section */}
              {selectedEvaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {Object.entries(selectedEvaluation.roundNotes).map(([round, notes]) => (
                        notes && notes.length > 0 && (
                          <div key={round} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex justify-between items-start mb-1">
                              <Badge variant="outline">
                                {round === 'firstRound' ? 'First Round' :
                                 round === 'secondRound' ? 'Second Round' :
                                 round === 'thirdRound' ? 'Third Round' :
                                 'General Notes'}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {notes.map((note, index) => (
                                <div key={index} className="bg-muted/50 p-2 rounded-md">
                                  <p className="text-sm">{note.text}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(note.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Select 
                        value={noteRound} 
                        onValueChange={setNoteRound}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select round">
                            {noteRound === 'firstRound' ? 'First Round' :
                             noteRound === 'secondRound' ? 'Second Round' :
                             noteRound === 'thirdRound' ? 'Third Round' :
                             'General Notes'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="firstRound">First Round</SelectItem>
                            <SelectItem value="secondRound">Second Round</SelectItem>
                            <SelectItem value="thirdRound">Third Round</SelectItem>
                            <SelectItem value="generalNotes">General Notes</SelectItem>
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
                    <Button 
                      onClick={() => handleRoundNotesUpdate(noteRound, newNote)}
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Documents & Links */}
              {selectedEvaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents & Pitch Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {selectedEvaluation.additionalDocuments.map((doc) => (
                        <div key={doc._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Link size={18} className="text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <a 
                                href={doc.url} 
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
                            onClick={() => handleRemoveDocument(doc._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>

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
                        onClick={() => handleAddDocument({
                          name: newLinkName,
                          url: newLinkUrl,
                          type: 'Document'
                        })}
                      disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
              )}
            </div>
            
            <DialogFooter className="border-t pt-4">
              <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={!hasChanges}
                  className="ml-2"
                >
                  <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Applications;
