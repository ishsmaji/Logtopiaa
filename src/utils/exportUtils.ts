import { format } from 'date-fns';
import { Log } from '@/hooks/useLogData';

export const convertLogsToCSV = (logs: Log[]): string => {
  const headers = [
    'Timestamp',
    'Level',
    'Source',
    'Message',
    'Details',
    'ID'
  ];

  const rows = logs.map(log => [
    format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
    log.level.toUpperCase(),
    log.source,
    log.message,
    JSON.stringify(log.details || {}),
    log._id
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        const escaped = String(cell).replace(/"/g, '""');
        return /[,"\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
