import { Request, Response } from 'express';
import { analyzeIssueWithAI } from '../services/aiService';

export const analyzeIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType, userHint, locationAddress } = req.body;

    const analysis = await analyzeIssueWithAI({
      imageBase64,
      mimeType,
      userHint,
      locationAddress,
    });

    res.json({
      success: true,
      message: 'Issue successfully analyzed by FixMyCity AI engine.',
      data: analysis,
    });
  } catch (error: any) {
    console.error('AI Analysis Route Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI analysis failed.',
    });
  }
};
