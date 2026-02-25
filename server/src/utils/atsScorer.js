/**
 * ATS Score Calculator - Computes resume-JD match percentage
 */

import { extractJDKeywords } from './jdAnalyzer.js';

/**
 * Normalize text for comparison (lowercase, trim, remove extra spaces)
 */
function normalize(text) {
  if (!text) return '';
  return String(text).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Extract skills from resume data
 */
function getResumeSkills(resumeData) {
  const skills = new Set();
  if (resumeData.skills?.length) {
    resumeData.skills.forEach(s => skills.add(normalize(s)));
  }
  if (resumeData.skillGroups?.length) {
    resumeData.skillGroups.forEach(g => {
      const parts = (g.skills || '').split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(s => skills.add(normalize(s)));
    });
  }
  if (resumeData.technicalSkills?.length) {
    resumeData.technicalSkills.forEach(s => skills.add(normalize(s)));
  }
  if (resumeData.softSkills?.length) {
    resumeData.softSkills.forEach(s => skills.add(normalize(s)));
  }
  // Also extract from summary and experience
  const textToScan = [
    resumeData.summary,
    ...(resumeData.experience || []).flatMap(e => [...(e.responsibilities || []), e.role, e.company]),
    ...(resumeData.projects || []).flatMap(p => [p.title, p.description, ...(p.techStack || []), ...(p.achievements || [])])
  ].join(' ');
  const words = textToScan.toLowerCase().match(/\b[a-z0-9+#\.]+\b/g) || [];
  words.forEach(w => {
    if (w.length > 2 && w.length < 30) skills.add(w);
  });
  return Array.from(skills);
}

/**
 * Calculate ATS match score (0-100) between resume and job description
 */
export function calculateATSScore(resumeData, jdText) {
  const jdAnalysis = extractJDKeywords(jdText);
  const resumeSkills = getResumeSkills(resumeData);

  const jdSkills = new Set([
    ...jdAnalysis.skills.map(s => normalize(s)),
    ...jdAnalysis.keywords.map(k => normalize(k))
  ]);

  if (jdSkills.size === 0) return 75; // Default if JD has no clear keywords

  const resumeSkillsSet = new Set(resumeSkills);
  let matchCount = 0;
  jdSkills.forEach(skill => {
    // Exact or partial match
    const matched = Array.from(resumeSkillsSet).some(rs => {
      return rs.includes(skill) || skill.includes(rs);
    });
    if (matched) matchCount++;
  });

  const score = Math.round((matchCount / jdSkills.size) * 100);
  return Math.min(100, Math.max(0, score));
}
