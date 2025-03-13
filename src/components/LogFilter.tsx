import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Filter, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { convertLogsToCSV, downloadCSV } from '@/utils/exportUtils';
import { Log } from '@/hooks/useLogData';

interface LogFilterProps {
  onApplyFilters: (filters: any) => void;
  logs?: Log[];
}

const LogFilter = ({ onApplyFilters, logs = [] }: LogFilterProps) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [logLevel, setLogLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);

  const handleApplyFilters = () => {
    const newFilters = [];
    
    if (startDate) {
      newFilters.push({ 
        id: 'startDate', 
        label: `From: ${format(startDate, 'MMM dd, yyyy')}`,
        value: startDate
      });
    }
    
    if (endDate) {
      newFilters.push({ 
        id: 'endDate', 
        label: `To: ${format(endDate, 'MMM dd, yyyy')}`,
        value: endDate
      });
    }
    
    if (logLevel) {
      newFilters.push({ 
        id: 'logLevel', 
        label: `Level: ${logLevel.charAt(0).toUpperCase() + logLevel.slice(1)}`,
        value: logLevel
      });
    }
    
    if (searchQuery) {
      newFilters.push({ 
        id: 'search', 
        label: `Search: ${searchQuery}`,
        value: searchQuery
      });
    }
    
    setAppliedFilters(newFilters);
    onApplyFilters({
      startDate,
      endDate,
      level: logLevel,
      query: searchQuery
    });
  };

  const handleRemoveFilter = (filterId) => {
    const updatedFilters = appliedFilters.filter(filter => filter.id !== filterId);

    if (filterId === 'startDate') setStartDate(null);
    if (filterId === 'endDate') setEndDate(null);
    if (filterId === 'logLevel') setLogLevel('');
    if (filterId === 'search') setSearchQuery('');
    
    setAppliedFilters(updatedFilters);
    onApplyFilters({
      startDate: filterId === 'startDate' ? null : startDate,
      endDate: filterId === 'endDate' ? null : endDate,
      level: filterId === 'logLevel' ? '' : logLevel,
      query: filterId === 'search' ? '' : searchQuery
    });
  };

  const handleClearAll = () => {
    setStartDate(null);
    setEndDate(null);
    setLogLevel('');
    setSearchQuery('');
    setAppliedFilters([]);
    
    onApplyFilters({
      startDate: null,
      endDate: null,
      level: '',
      query: ''
    });
  };

  const handleExportFilteredLogs = () => {
    if (!logs.length) return;
    
    const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm');
    const filterSuffix = appliedFilters.length > 0 
      ? `-${appliedFilters.map(f => f.id).join('-')}`
      : '';
    const filename = `logs-${timestamp}${filterSuffix}.csv`;
    
    const csvContent = convertLogsToCSV(logs);
    downloadCSV(csvContent, filename);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      handleApplyFilters();
    }, 300); 

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  
    const updatedFilters = appliedFilters.filter(f => f.id !== 'search');
    if (e.target.value) {
      updatedFilters.push({
        id: 'search',
        label: `Search: ${e.target.value}`,
        value: e.target.value
      });
    }
    setAppliedFilters(updatedFilters);
  };

  return (
    <div className="glass rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
        <div className="grid gap-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search logs..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[180px]",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[180px]",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Label>Log Level</Label>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2 md:ml-auto">
          <Button onClick={handleApplyFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          
          
        </div>
      </div>
      
      {appliedFilters.length > 0 && (
        <div className="mt-4">
          <Separator className="mb-3" />
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-1">Active filters:</span>
            {appliedFilters.map((filter) => (
              <Badge 
                key={filter.id} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.label}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemoveFilter(filter.id)}
                />
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              className="h-7 text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogFilter;
