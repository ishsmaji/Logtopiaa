
import { useState, useEffect } from 'react';
import { Log } from '@/hooks/useLogData';

export const useBookmarks = () => {
  const [bookmarkedLogs, setBookmarkedLogs] = useState<Log[]>([]);

  useEffect(() => {
    const storedBookmarks = localStorage.getItem('bookmarkedLogs');
    if (storedBookmarks) {
      try {
        const parsedBookmarks = JSON.parse(storedBookmarks);
        setBookmarkedLogs(parsedBookmarks);
      } catch (error) {
        console.error('Failed to parse bookmarks from localStorage:', error);
        localStorage.removeItem('bookmarkedLogs');
      }
    }
  }, );

  const addBookmark = (log: Log) => {
    setBookmarkedLogs(prev => {
      if (prev.some(item => item._id === log._id)) {
        return prev;
      }
      const updatedBookmarks = [...prev, log];
     
      localStorage.setItem('bookmarkedLogs', JSON.stringify(updatedBookmarks));
      
      return updatedBookmarks;
    });
  };

  const removeBookmark = (logId: string) => {
    setBookmarkedLogs(prev => {
      const updatedBookmarks = prev.filter(log => log._id !== logId);
   
      localStorage.setItem('bookmarkedLogs', JSON.stringify(updatedBookmarks));
      
      return updatedBookmarks;
    });
  };

  const isBookmarked = (logId: string) => {
    return bookmarkedLogs.some(log => log._id === logId);
  };

  return {
    bookmarkedLogs,
    addBookmark,
    removeBookmark,
    isBookmarked
  };
};
