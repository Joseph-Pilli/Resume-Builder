/**
 * Resume Optimizer API routes
 */

import express from 'express';
import { upload } from '../config/upload.js';
import { parseResumeFromBuffer } from '../utils/resumeParser.js';
import { optimizeResume } from '../services/optimizerService.js';
import { calculateATSScore } from '../utils/atsScorer.js';

const router = express.Router();

// Optimize resume from uploaded file + JD
router.post('/optimize', upload.single('resume'), async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;
    const jd = jobDescription || '';

    if (!req.file && !req.body.resumeData) {
      return res.status(400).json({
        error: 'Please upload a resume file or provide resume data in the request body'
      });
    }

    let resumeData;
    if (req.file) {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(req.file.path);
      resumeData = await parseResumeFromBuffer(buffer, req.file.originalname);
    } else {
      resumeData = typeof req.body.resumeData === 'string'
        ? JSON.parse(req.body.resumeData)
        : req.body.resumeData;
    }

    const result = await optimizeResume(resumeData, jd, jobTitle);
    res.json(result);
  } catch (error) {
    console.error('Optimizer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Optimize from JSON resume data (no file upload)
router.post('/optimize-json', express.json(), async (req, res) => {
  try {
    const { resumeData, jobTitle, jobDescription } = req.body;
    const jd = jobDescription || '';

    if (!resumeData) {
      return res.status(400).json({ error: 'resumeData is required' });
    }

    const result = await optimizeResume(resumeData, jd, jobTitle);
    res.json(result);
  } catch (error) {
    console.error('Optimizer error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
