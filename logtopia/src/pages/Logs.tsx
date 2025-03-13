import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import LogFilter from '@/components/LogFilter';
import LogTable from '@/components/LogTable';
import LogDetail from '@/components/LogDetail';
import AlertBanner from '@/components/AlertBanner';
import Bookmarks from '@/components/Bookmarks';
import useLogData from '@/hooks/useLogData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PauseIcon, PlayIcon, RefreshCw, DownloadIcon } from 'lucide-react';

const Logs = () => {
  const { 
    logs, 
    applyFilters, 
    logsLoading, 
    autoRefresh, 
    toggleAutoRefresh, 
    refreshData, 
    activeAlerts 
  } = useLogData();
  
  const [selectedLog, setSelectedLog] = React.useState(null);
  const { toast } = useToast();
  
  const handleViewDetails = (log) => {
    setSelectedLog(log);
  };
  
  const handleCloseDetails = () => {
    setSelectedLog(null);
  };
  
  const handleExportLogs = () => {
    toast({
      title: "Logs Exported",
      description: "Your logs have been exported successfully.",
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar activeAlerts={activeAlerts.length} />
      
      <AlertBanner alerts={activeAlerts} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <motion.h1 
            className="text-3xl font-medium mb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Log Management
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Monitor and analyze your application logs in real-time
          </motion.p>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Bookmarks onViewDetails={handleViewDetails} />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Log Explorer</h2>
            <div className="flex space-x-2">
              
              
              <Button 
                variant={autoRefresh ? "default" : "outline"} 
                size="sm" 
                onClick={toggleAutoRefresh}
              >
                {autoRefresh ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Auto-refresh
                  </>
                )}
              </Button>
              
              
            </div>
          </div>
          
          <LogFilter 
            onApplyFilters={applyFilters} 
            logs={logs}
          />
          
          <LogTable 
            logs={logs} 
            isLoading={logsLoading} 
            onViewDetails={handleViewDetails} 
          />
        </motion.div>
      </main>
      
      {selectedLog && <LogDetail log={selectedLog} onClose={handleCloseDetails} />}
    </motion.div>
  );
};

export default Logs;
