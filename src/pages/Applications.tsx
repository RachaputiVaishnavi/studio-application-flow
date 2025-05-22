
import { useState } from "react";
import { 
  Search, Filter, Check, X, Pause, ChevronDown,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    timestamp: "2023-01-15" 
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
    timestamp: "2023-02-10" 
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
    timestamp: "2023-03-05" 
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
    timestamp: "2023-03-15" 
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
    timestamp: "2023-03-20" 
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
    timestamp: "2023-04-01" 
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
  const [applications, setApplications] = useState(mockApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // Filter options
  const [filters, setFilters] = useState({
    sectors: [] as string[],
    stages: [] as string[],
    lookingFor: [] as string[],
    statuses: [] as string[],
    fundingMin: 0,
    fundingMax: 500000,
    hasPriorFunding: null as boolean | null,
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
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      sectors: [],
      stages: [],
      lookingFor: [],
      statuses: [],
      fundingMin: 0,
      fundingMax: 500000,
      hasPriorFunding: null,
    });
    setApplications(mockApplications);
    setShowFilterDialog(false);
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
    filtered = filtered.filter(app => {
      const fundingAskNumber = parseInt(app.fundingAsk.replace(/[^0-9]/g, ''));
      return fundingAskNumber >= filters.fundingMin && fundingAskNumber <= filters.fundingMax;
    });
    
    setApplications(filtered);
    setShowFilterDialog(false);
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
      <h1 className="text-2xl font-bold mb-6">Startup Applications</h1>
      
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
        
        <Button onClick={() => setShowFilterDialog(true)} variant="outline" className="flex items-center gap-2">
          <Filter size={18} />
          <span>Filter</span>
        </Button>
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
                  <td>{app.name}</td>
                  <td>{app.sector}</td>
                  <td>{app.stage}</td>
                  <td>{app.lookingFor}</td>
                  <td>{app.fundingAsk}</td>
                  <td>{app.revenue}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>{app.timestamp}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleViewDetails(app)}
                    >
                      View
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

      {/* Filter Dialog */}
      {showFilterDialog && (
        <div className="filter-dialog">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Filter Options</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilterDialog(false)}
              className="text-white hover:text-white hover:bg-white/10"
            >
              <X />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Stage</h3>
              <div className="space-y-2">
                {["Idea", "MVP", "Early Traction", "Growth"].map((stage) => (
                  <div key={stage} className="flex items-center gap-2">
                    <Checkbox 
                      id={`stage-${stage}`} 
                      checked={filters.stages.includes(stage)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({...filters, stages: [...filters.stages, stage]});
                        } else {
                          setFilters({...filters, stages: filters.stages.filter(s => s !== stage)});
                        }
                      }}
                    />
                    <label 
                      htmlFor={`stage-${stage}`}
                      className="text-sm cursor-pointer"
                    >
                      {stage}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Looking For</h3>
              <div className="space-y-2">
                {["Funding", "MVP", "Growth"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Checkbox 
                      id={`lookingFor-${item}`} 
                      checked={filters.lookingFor.includes(item)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({...filters, lookingFor: [...filters.lookingFor, item]});
                        } else {
                          setFilters({...filters, lookingFor: filters.lookingFor.filter(i => i !== item)});
                        }
                      }}
                    />
                    <label 
                      htmlFor={`lookingFor-${item}`}
                      className="text-sm cursor-pointer"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Industry / Sector</h3>
              <div className="space-y-2">
                {["SaaS", "Finance", "Health", "Education", "Food", "AI"].map((sector) => (
                  <div key={sector} className="flex items-center gap-2">
                    <Checkbox 
                      id={`sector-${sector}`}
                      checked={filters.sectors.includes(sector)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({...filters, sectors: [...filters.sectors, sector]});
                        } else {
                          setFilters({...filters, sectors: filters.sectors.filter(s => s !== sector)});
                        }
                      }}
                    />
                    <label 
                      htmlFor={`sector-${sector}`}
                      className="text-sm cursor-pointer"
                    >
                      {sector}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Application Status</h3>
              <div className="space-y-2">
                {["NEW", "ROUND-1", "ROUND-2", "SELECTED", "REJECTED", "ON-HOLD"].map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <Checkbox 
                      id={`status-${status}`}
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({...filters, statuses: [...filters.statuses, status]});
                        } else {
                          setFilters({...filters, statuses: filters.statuses.filter(s => s !== status)});
                        }
                      }}
                    />
                    <label 
                      htmlFor={`status-${status}`}
                      className="text-sm cursor-pointer"
                    >
                      {status.replace("-", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Funding Amount</h3>
            <div className="relative pt-6 pb-2">
              <div className="h-1 w-full bg-gray-600 rounded">
                <div 
                  className="h-full bg-white rounded" 
                  style={{width: `${(filters.fundingMax - filters.fundingMin) / 5000}%`}}
                />
              </div>
              <div className="range-marker" style={{ left: `${filters.fundingMin / 5000}%` }}></div>
              <div className="range-marker" style={{ left: `${filters.fundingMax / 5000}%` }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>$0</span>
              <span>$500K</span>
            </div>
          </div>
          
          <div className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
              className="border-white/30 text-white hover:text-white hover:bg-white/10"
            >
              Reset Filters
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="bg-white text-black hover:bg-white/90"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedApplication.name} - Application Details</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Basic Information</h3>
                <div className="bg-muted p-4 rounded-md space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Industry / Sector</h4>
                    <p>{selectedApplication.sector}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Stage</h4>
                    <p>{selectedApplication.stage}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Looking For</h4>
                    <p>{selectedApplication.lookingFor}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Funding Ask</h4>
                    <p>{selectedApplication.fundingAsk}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Current Revenue</h4>
                    <p>{selectedApplication.revenue}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Submission Date</h4>
                    <p>{selectedApplication.timestamp}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Screening Status</h3>
                <div className="bg-muted p-4 rounded-md space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Current Status</h4>
                    <p>{getStatusBadge(selectedApplication.status)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Reviewer</h4>
                    <p>Jane Doe</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground">Screening Notes</h4>
                    <p className="text-sm">
                      Good product-market fit. Team has relevant experience in the sector. 
                      Solution addresses a clear pain point.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-1">Update Status</h3>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a new status" />
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
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Evaluation Checklist</h3>
              <div className="bg-muted p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-1" />
                    <label htmlFor="check-1" className="text-sm">Founder is full-time</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-2" />
                    <label htmlFor="check-2" className="text-sm">Problem clearly defined</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-3" />
                    <label htmlFor="check-3" className="text-sm">Solution is validated</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-4" />
                    <label htmlFor="check-4" className="text-sm">Clear differentiation</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-5" />
                    <label htmlFor="check-5" className="text-sm">Large enough TAM/SAM</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check-6" />
                    <label htmlFor="check-6" className="text-sm">Strong team composition</label>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex gap-2 justify-end w-full">
                <Button variant="outline" size="sm">
                  <X size={16} className="mr-1" />
                  Reject
                </Button>
                <Button variant="outline" size="sm">
                  <Pause size={16} className="mr-1" />
                  Hold
                </Button>
                <Button size="sm">
                  <Check size={16} className="mr-1" />
                  Approve
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
