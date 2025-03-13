
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import useLogData from '@/hooks/useLogData';
import AlertBanner from '@/components/AlertBanner';

const Statistics = () => {
  const { stats, statsLoading, activeAlerts } = useLogData();

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
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-medium mb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Log Statistics
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Visual insights into your application's log patterns
          </motion.p>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Dashboard stats={stats} />
        </motion.div>
      </main>
    </motion.div>
  );
};

export default Statistics;
