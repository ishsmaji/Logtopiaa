
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-medium text-xs"
    >
      {name} ({value})
    </text>
  );
};

const Dashboard = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-accent/10">
            <CardHeader className="pb-2">
              <div className="w-40 h-5 bg-accent/30 rounded-md"></div>
              <div className="w-full h-3 bg-accent/20 rounded-md"></div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-52 bg-accent/20 rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const logLevelData = [
    { name: 'Error', value: stats.byLevel.error },
    { name: 'Warning', value: stats.byLevel.warning },
    { name: 'Info', value: stats.byLevel.info },
  ];
  
  const sourceData = Object.entries(stats.bySources).map(([name, value]) => ({
    name,
    value,
  }));
  
  const timeSeriesData = [
    { time: '00:00', errors: 2, warnings: 3, info: 5 },
    { time: '01:00', errors: 3, warnings: 1, info: 4 },
    { time: '02:00', errors: 5, warnings: 2, info: 3 },
    { time: '03:00', errors: 1, warnings: 5, info: 6 },
    { time: '04:00', errors: 0, warnings: 4, info: 7 },
    { time: '05:00', errors: 2, warnings: 2, info: 5 },
    { time: '06:00', errors: 4, warnings: 1, info: 3 },
    { time: '07:00', errors: 6, warnings: 3, info: 4 },
    { time: '08:00', errors: 3, warnings: 2, info: 8 },
  ];
  
  const COLORS = {
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    background: 'rgba(30, 41, 59, 0.7)',
    grid: 'rgba(255, 255, 255, 0.1)',
  };
  
  const pieChartColors = [COLORS.error, COLORS.warning, COLORS.info];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Logs by Level</CardTitle>
          <CardDescription>Distribution of logs by severity level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={logLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomPieLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {logLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center mt-4 space-x-6">
            {logLevelData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: pieChartColors[index] }}
                ></div>
                <span className="text-sm">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass">
        <CardHeader>
          <CardTitle>Logs by Source</CardTitle>
          <CardDescription>Distribution of logs by source system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: COLORS.background, border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill={COLORS.info} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass md:col-span-2">
        <CardHeader>
          <CardTitle>Logs Over Time</CardTitle>
          <CardDescription>Log frequency by type over the last 8 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeSeriesData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: COLORS.background, border: 'none', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="errors" 
                  stackId="1"
                  stroke={COLORS.error} 
                  fill={`${COLORS.error}80`} 
                />
                <Area 
                  type="monotone" 
                  dataKey="warnings" 
                  stackId="1"
                  stroke={COLORS.warning} 
                  fill={`${COLORS.warning}80`} 
                />
                <Area 
                  type="monotone" 
                  dataKey="info" 
                  stackId="1"
                  stroke={COLORS.info} 
                  fill={`${COLORS.info}80`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass md:col-span-2">
        <CardHeader>
          <CardTitle>Total Logs</CardTitle>
          <CardDescription>Total count: {stats.total}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
            <div className="bg-accent/20 border border-white/5 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-log-error mb-1">{stats.byLevel.error}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="bg-accent/20 border border-white/5 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-log-warning mb-1">{stats.byLevel.warning}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="bg-accent/20 border border-white/5 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-log-info mb-1">{stats.byLevel.info}</div>
              <div className="text-sm text-muted-foreground">Info</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
