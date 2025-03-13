const { Log } = require("../models/Log");


const logPatterns = new Map();


function trackLogPattern(log) {
  const key = `${log.level}:${log.message}`;
  const now = Date.now();
  const timeWindow = 10 * 60 * 1000; 

  if (!logPatterns.has(key)) {
    logPatterns.set(key, []);
  }

  const patterns = logPatterns.get(key);
  patterns.push(now);
  const recentPatterns = patterns.filter(time => (now - time) <= timeWindow);
  logPatterns.set(key, recentPatterns);

  return recentPatterns.length;
}


function checkAlerts(log, logs) {
  const alerts = [];
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);

  if (log.level === 'error') {
    const occurrences = trackLogPattern(log);
    if (occurrences >= 3) {
      alerts.push({
        type: 'error_frequency',
        message: `Error "${log.message}" occurred ${occurrences} times in the last 10 minutes`,
        log: log
      });
    }
  }

  const recentLogs = logs.filter(l => new Date(l.timestamp) >= new Date(hourAgo));
  if (recentLogs.length > 0) {
    const errorWarningLogs = recentLogs.filter(l => ['error', 'warning'].includes(l.level));
    const ratio = errorWarningLogs.length / recentLogs.length;

    if (ratio >= 0.1) { 
      alerts.push({
        type: 'error_threshold',
        message: `Error/Warning logs exceed 10% threshold in the last hour (${Math.round(ratio * 100)}%)`,
        log: log
      });
    }
  }

  return alerts;
}


exports.createLog = async (req, res, io) => {
  try {
    const { timestamp, level, source, message, details } = req.body;

    if (!level || !source || !message) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Level, source, and message are required fields"
      });
    }

    const newLog = new Log({
      timestamp: timestamp || Date.now(),
      level,
      source,
      message,
      details
    });

    const savedLog = await newLog.save();

    if (['error', 'warning'].includes(savedLog.level)) {
      const recentLogs = await Log.find().sort({ timestamp: -1 }).limit(100);
      const alerts = checkAlerts(savedLog, recentLogs);
      
      if (alerts.length > 0 && io) {
        io.emit('alerts', alerts);
      }
    }

    res.status(200).json({
      success: true,
      data: savedLog,
      message: "Log created successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Internal server error"
    });
  }
};


exports.getLogs = async (req, res, io) => {
  try {
    const { startDate, endDate, level, search } = req.query;
    let filter = {};
    if (startDate || endDate || (level && level !== 'all') || search) {
      if (startDate) {
        filter.timestamp = filter.timestamp || {};
        filter.timestamp.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.timestamp = filter.timestamp || {};
        filter.timestamp.$lte = new Date(endDate);
      }
      
      if (level && level !== 'all') {
        filter.level = level;
      }
      
      if (search) {
        filter.$or = [
          { message: { $regex: search, $options: 'i' } },
          { source: { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    const logs = await Log.find(filter).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: logs,
      message: "Logs fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Internal server error",
    });
  }
};

exports.exportLogs = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, level, search } = req.query;
    let filter = {};
    if (startDate || endDate || (level && level !== 'all') || search) {
      if (startDate) {
        filter.timestamp = filter.timestamp || {};
        filter.timestamp.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.timestamp = filter.timestamp || {};
        filter.timestamp.$lte = new Date(endDate);
      }
      
      if (level && level !== 'all') {
        filter.level = level;
      }
      
      if (search) {
        filter.$or = [
          { message: { $regex: search, $options: 'i' } },
          { source: { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    const logs = await Log.find(filter).sort({ timestamp: -1 });

    if (format === 'csv') {
      const csvHeader = 'Timestamp,Level,Source,Message\n';
      const csvContent = logs.map(log => 
        `${log.timestamp},${log.level},${log.source},"${log.message.replace(/"/g, '""')}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
      res.send(csvHeader + csvContent);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=logs.json');
      res.status(200).json({
        success: true,
        data: logs,
        message: "Logs exported successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Internal server error",
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Log.countDocuments();
    const errorCount = await Log.countDocuments({ level: 'error' });
    const warningCount = await Log.countDocuments({ level: 'warning' });
    const infoCount = await Log.countDocuments({ level: 'info' });
    const sources = await Log.distinct('source');
    const bySources = {};
    for (const source of sources) {
      bySources[source] = await Log.countDocuments({ source });
    }
    
    const stats = {
      total,
      byLevel: {
        error: errorCount,
        warning: warningCount,
        info: infoCount
      },
      bySources
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: "Log statistics fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Internal server error",
    });
  }
};