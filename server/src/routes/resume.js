/**
 * Resume API routes - Parse uploaded resumes
 */

import express from 'express';
import { upload } from '../config/upload.js';
import { parseResumeFromBuffer } from '../utils/resumeParser.js';
import { calculateATSScore } from '../utils/atsScorer.js';
import { extractJDKeywords } from '../utils/jdAnalyzer.js';

const router = express.Router();

// Parse resume from uploaded file
router.post('/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const buffer = await import('fs').then(fs => fs.promises.readFile(req.file.path));
    const data = await parseResumeFromBuffer(buffer, req.file.originalname);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract JD keywords
router.post('/jd/analyze', express.json(), (req, res) => {
  try {
    const { jd } = req.body;
    const keywords = extractJDKeywords(jd || '');
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate ATS score
router.post('/ats-score', express.json(), (req, res) => {
  try {
    const { resume, jd } = req.body;
    const score = calculateATSScore(resume || {}, jd || '');
    res.json({ score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
