import { Request, Response } from 'express';
import { db, IssueCategory, IssuePriority, IssueStatus } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, priority, search, sortBy } = req.query;

    let reports = db.getAllReports();

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.address.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All' && category !== 'All Categories') {
      reports = reports.filter((r) => r.category === category);
    }

    // Status filter
    if (status && status !== 'All') {
      reports = reports.filter((r) => r.status === status);
    }

    // Priority filter
    if (priority && priority !== 'All') {
      reports = reports.filter((r) => r.priority === priority);
    }

    // Sort
    if (sortBy === 'upvotes') {
      reports.sort((a, b) => b.upvotes.length - a.upvotes.length);
    } else if (sortBy === 'oldest') {
      reports.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Default newest
      reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reports.' });
  }
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const report = db.findReportById(id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch report.' });
  }
};

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { title, description, category, image, location, priority } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category.',
      });
      return;
    }

    const defaultImages: Record<string, string> = {
      'Road Damage': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      Garbage: 'https://images.unsplash.com/photo-1611288870280-4a37a77d1309?w=800&auto=format&fit=crop&q=80',
      'Street Light': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      'Water Leakage': 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
      Traffic: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=800&auto=format&fit=crop&q=80',
      Environment: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
      Infrastructure: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&auto=format&fit=crop&q=80',
      Safety: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
      Other: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    };

    const finalImage = image && image.trim() !== '' ? image : defaultImages[category] || defaultImages['Other'];

    const finalLocation = {
      address: location?.address || 'Metro Civic Area',
      latitude: location?.latitude || 37.7749,
      longitude: location?.longitude || -122.4194,
    };

    const newReport = db.createReport({
      title,
      description,
      category: category as IssueCategory,
      image: finalImage,
      location: finalLocation,
      status: 'Reported',
      priority: (priority as IssuePriority) || 'Medium',
      reportedBy: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully to municipal dispatch.',
      data: newReport,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create report.' });
  }
};

export const updateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const report = db.findReportById(id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    // Citizen can only edit their own report if not resolved, Admin can edit any
    const isOwner = report.reportedBy._id === req.user._id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to edit this report.' });
      return;
    }

    const { title, description, category, priority, image, location, status, officialResponse } = req.body;

    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (priority) updates.priority = priority;
    if (image) updates.image = image;
    if (location) updates.location = location;

    if (isAdmin) {
      if (status) updates.status = status;
      if (officialResponse !== undefined) updates.officialResponse = officialResponse;
    }

    const updated = db.updateReport(id, updates, req.user.name);

    res.json({
      success: true,
      message: 'Report updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update report.' });
  }
};

export const deleteReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const report = db.findReportById(id);

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const isOwner = report.reportedBy._id === req.user._id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this report.' });
      return;
    }

    const success = db.deleteReport(id);
    if (!success) {
      res.status(400).json({ success: false, message: 'Failed to delete report.' });
      return;
    }

    res.json({
      success: true,
      message: 'Report deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete report.' });
  }
};

export const getMyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const allReports = db.getAllReports();
    const myReports = allReports.filter((r) => r.reportedBy._id === req.user?._id);

    res.json({
      success: true,
      count: myReports.length,
      data: myReports,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch your reports.' });
  }
};

export const toggleUpvote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to upvote.' });
      return;
    }

    const { id } = req.params;
    const result = db.toggleUpvote(id, req.user._id);

    if (!result) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    res.json({
      success: true,
      message: result.hasUpvoted ? 'Upvoted report' : 'Removed upvote',
      hasUpvoted: result.hasUpvoted,
      upvotesCount: result.upvotesCount,
      data: result.report,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle upvote.' });
  }
};
