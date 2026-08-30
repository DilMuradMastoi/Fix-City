import { Router } from 'express';
import { analyzeIssue } from '../controllers/aiController';

const router = Router();

router.post('/analyze-issue', analyzeIssue);

export default router;
