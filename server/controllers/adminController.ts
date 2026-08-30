import { Request, Response } from 'express';
import { db, IssuePriority, IssueStatus } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = db.getAllReports();
    const users = db.getAllUsers();

    const totalReports = reports.length;
    const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
    const inProgressReports = reports.filter((r) => r.status === 'In Progress').length;
    const underReviewReports = reports.filter((r) => r.status === 'Under Review').length;
    const reportedPending = reports.filter((r) => r.status === 'Reported').length;
    const highOrCritical = reports.filter((r) => r.priority === 'High' || r.priority === 'Critical').length;

    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Categories breakdown
    const categoryCounts: Record<string, number> = {};
    reports.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Status breakdown
    const statusData = [
      { name: 'Reported', value: reportedPending, color: '#3B82F6' },
      { name: 'Under Review', value: underReviewReports, color: '#F59E0B' },
      { name: 'In Progress', value: inProgressReports, color: '#8B5CF6' },
      { name: 'Resolved', value: resolvedReports, color: '#10B981' },
    ];

    // Priority breakdown
    const priorityData = [
      { name: 'Low', count: reports.filter((r) => r.priority === 'Low').length },
      { name: 'Medium', count: reports.filter((r) => r.priority === 'Medium').length },
      { name: 'High', count: reports.filter((r) => r.priority === 'High').length },
      { name: 'Critical', count: reports.filter((r) => r.priority === 'Critical').length },
    ];

    // Monthly activity mock trend for visual charts
    const timelineTrends = [
      { month: 'Apr', reported: 12, resolved: 9 },
      { month: 'May', reported: 18, resolved: 14 },
      { month: 'Jun', reported: 24, resolved: 20 },
      { month: 'Jul', reported: 31, resolved: 28 },
      { month: 'Aug', reported: totalReports, resolved: resolvedReports },
    ];

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        totalReports,
        resolvedReports,
        inProgressReports,
        underReviewReports,
        reportedPending,
        highOrCritical,
        resolutionRate,
        categoryData,
        statusData,
        priorityData,
        timelineTrends,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin stats.' });
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = db.getAllUsers();
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users.' });
  }
};

export const getAdminReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = db.getAllReports();
    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin reports.' });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, officialResponse, note } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Please provide status.' });
      return;
    }

    const validStatuses: IssueStatus[] = ['Reported', 'Under Review', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const adminName = req.user?.name || 'Municipal Administrator';
    const updated = db.updateReport(
      id,
      {
        status,
        officialResponse: officialResponse || note,
      },
      adminName
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Report status successfully updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update report status.' });
  }
};

export const updateReportPriority = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!priority) {
      res.status(400).json({ success: false, message: 'Please provide priority.' });
      return;
    }

    const validPriorities: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical'];
    if (!validPriorities.includes(priority)) {
      res.status(400).json({ success: false, message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
      return;
    }

    const adminName = req.user?.name || 'Municipal Administrator';
    const updated = db.updateReport(id, { priority }, adminName);

    if (!updated) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Report priority updated to ${priority}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update report priority.' });
  }
};

export const deleteAdminReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = db.deleteReport(id);

    if (!success) {
      res.status(404).json({ success: false, message: 'Report not found or already deleted.' });
      return;
    }

    res.json({
      success: true,
      message: 'Report purged by administrator.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete report.' });
  }
};
