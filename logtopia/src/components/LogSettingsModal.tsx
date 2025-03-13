import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useLogSettings } from '@/hooks/useLogSettings';
import { useToast } from '@/hooks/use-toast';

interface LogSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange?: () => void;  
}

const LogSettingsModal = ({ open, onOpenChange, onSettingsChange }: LogSettingsModalProps) => {
  const { settings, updateSettings, updateVisibleColumns } = useLogSettings();
  const { toast } = useToast();
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleNumberChange = (field: keyof typeof settings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setTempSettings(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };

  const handleColumnToggle = (column: keyof typeof settings.visibleColumns) => {
    setTempSettings(prev => ({
      ...prev,
      visibleColumns: {
        ...prev.visibleColumns,
        [column]: !prev.visibleColumns[column]
      }
    }));
  };

  const handleApply = () => {
    updateSettings({
      ...tempSettings,
      visibleColumns: tempSettings.visibleColumns
    });

    toast({
      title: "Settings Updated",
      description: "All settings have been applied successfully",
    });
    if (onSettingsChange) {
      setTimeout(onSettingsChange, 0);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Management Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="autoCleanupPeriod">Auto-cleanup Period (days)</Label>
            <Input
              id="autoCleanupPeriod"
              type="number"
              min="0"
              value={tempSettings.autoCleanupPeriod}
              onChange={(e) => handleNumberChange('autoCleanupPeriod', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="errorThresholdPercentage">Error Threshold Percentage</Label>
            <Input
              id="errorThresholdPercentage"
              type="number"
              min="0"
              max="100"
              value={tempSettings.errorThresholdPercentage}
              onChange={(e) => handleNumberChange('errorThresholdPercentage', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="errorCountThreshold">Error Count Threshold (10 min)</Label>
            <Input
              id="errorCountThreshold"
              type="number"
              min="0"
              value={tempSettings.errorCountThreshold}
              onChange={(e) => handleNumberChange('errorCountThreshold', e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Visible Columns</Label>
            <div className="space-y-2">
              {Object.entries(tempSettings.visibleColumns).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={() => handleColumnToggle(key as keyof typeof settings.visibleColumns)}
                  />
                  <Label htmlFor={key} className="capitalize">
                    {key}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogSettingsModal;