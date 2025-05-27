
import { useState } from "react";
import { Filter, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface FilterOptions {
  sectors: string[];
  stages: string[];
  lookingFor: string[];
  statuses: string[];
  fundingRange: { min: number; max: number };
}

interface ApplicationFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const ApplicationFilter = ({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  onResetFilters 
}: ApplicationFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = {
    sectors: ["SaaS", "Finance", "Health", "Education", "Food", "AI", "E-commerce", "Fintech"],
    stages: ["Idea", "MVP", "Early Traction", "Growth", "Scale"],
    lookingFor: ["Funding", "MVP", "Growth", "Mentorship", "Network"],
    statuses: ["NEW", "ROUND-1", "ROUND-2", "SELECTED", "REJECTED", "ON-HOLD"],
    fundingRanges: [
      { label: "Under $100K", min: 0, max: 100000 },
      { label: "$100K - $250K", min: 100000, max: 250000 },
      { label: "$250K - $500K", min: 250000, max: 500000 },
      { label: "$500K - $1M", min: 500000, max: 1000000 },
      { label: "Over $1M", min: 1000000, max: 10000000 },
    ]
  };

  const handleCheckboxChange = (category: keyof FilterOptions, value: string, checked: boolean) => {
    if (category === 'fundingRange') return;
    
    const currentValues = filters[category] as string[];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({
      ...filters,
      [category]: newValues
    });
  };

  const handleFundingRangeChange = (rangeLabel: string) => {
    const range = filterOptions.fundingRanges.find(r => r.label === rangeLabel);
    if (range) {
      onFiltersChange({
        ...filters,
        fundingRange: { min: range.min, max: range.max }
      });
    }
  };

  const getActiveFilterCount = () => {
    return filters.sectors.length + 
           filters.stages.length + 
           filters.lookingFor.length + 
           filters.statuses.length +
           (filters.fundingRange.min > 0 || filters.fundingRange.max < 10000000 ? 1 : 0);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter size={16} className="mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Filter Applications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <Separator />

          {/* Industry/Sector */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Industry / Sector</h4>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.sectors.map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`sector-${sector}`}
                    checked={filters.sectors.includes(sector)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('sectors', sector, checked as boolean)
                    }
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

          <Separator />

          {/* Stage */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Stage</h4>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.stages.map((stage) => (
                <div key={stage} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`stage-${stage}`}
                    checked={filters.stages.includes(stage)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('stages', stage, checked as boolean)
                    }
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

          <Separator />

          {/* Looking For */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Looking For</h4>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.lookingFor.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`lookingFor-${item}`}
                    checked={filters.lookingFor.includes(item)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('lookingFor', item, checked as boolean)
                    }
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

          <Separator />

          {/* Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Application Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.statuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`}
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('statuses', status, checked as boolean)
                    }
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

          <Separator />

          {/* Funding Range */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Funding Range</h4>
            <Select onValueChange={handleFundingRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select funding range" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.fundingRanges.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="flex-1"
            >
              <RefreshCw size={14} className="mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onApplyFilters();
                setIsOpen(false);
              }}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ApplicationFilter;
