/**
 * Resume Parser - Extracts structured data from PDF, DOCX, and text resumes
 */

import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text from PDF file
 */
async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 */
async function parseDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error.message}`);
  }
}

/**
 * Extract structured data from resume text using regex patterns
 */
function extractResumeData(text) {
  const data = {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
    skills: [],
    technicalSkills: [],
    softSkills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: []
  };

  if (!text || typeof text !== 'string') return data;

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const fullText = text.toLowerCase();

  // Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatch) data.email = emailMatch[0];

  // Phone extraction (various formats)
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
  if (phoneMatch) data.phone = phoneMatch[0].trim();

  // LinkedIn
  const linkedInMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi);
  if (linkedInMatch) data.linkedin = linkedInMatch[0];

  // GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/gi);
  if (githubMatch) data.github = githubMatch[0];

  // Portfolio/Website
  const urlMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g);
  const portfolioCandidates = (urlMatch || []).filter(u =>
    !u.includes('linkedin') && !u.includes('github') && !u.includes('gmail')
  );
  if (portfolioCandidates.length) data.portfolio = portfolioCandidates[0];

  // Section detection patterns
  const sectionPatterns = {
    summary: /(?:professional\s+)?summary|objective|profile|about\s+me/i,
    skills: /^(?:technical\s+)?skills|competencies|core\s+skills/i,
    experience: /^(?:work\s+)?experience|employment|professional\s+experience|work\s+history/i,
    education: /^education|academic|qualifications/i,
    projects: /^projects|key\s+projects|project\s+experience/i,
    certifications: /^certifications?|licenses|certificates/i
  };

  let currentSection = null;
  let currentExperience = null;
  let currentProject = null;
  let currentEducation = null;

  // Common tech skills for extraction
  const techKeywords = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'python', 'java',
    'c#', 'c++', 'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes',
    'git', 'rest', 'graphql', 'html', 'css', 'scss', 'redux', 'express', 'django',
    'flask', 'machine learning', 'tensorflow', 'pytorch', 'agile', 'scrum', 'ci/cd',
    'jenkins', 'terraform', 'linux', 'api', 'microservices', 'redis', 'elasticsearch'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Check for section headers
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line) && line.length < 50) {
        currentSection = section;
        if (section === 'experience') currentProject = null;
        if (section === 'projects') currentExperience = null;
        break;
      }
    }

    if (currentSection === 'summary' && line.length > 20) {
      data.summary = line;
      currentSection = null;
    } else if (currentSection === 'skills') {
      // Extract skills - could be comma separated or bullet points
      const skillItems = line.split(/[,;|•\-–—]/).map(s => s.trim()).filter(s => s.length > 2);
      skillItems.forEach(skill => {
        if (skill.length > 1 && skill.length < 50 && !skill.match(/^\d+$/)) {
          const skillLower = skill.toLowerCase();
          if (techKeywords.some(t => skillLower.includes(t)) || /^[a-z\s#+.]+$/i.test(skill)) {
            if (!data.technicalSkills.includes(skill)) data.technicalSkills.push(skill);
          } else if (!data.softSkills.includes(skill)) {
            data.softSkills.push(skill);
          }
        }
      });
    } else if (currentSection === 'experience') {
      // Experience entries often have: Company | Role | Date pattern
      const datePattern = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4}|(?:\d{4})\s*[-–—]\s*(?:present|now|current)|(?:\d{1,2}\/\d{4})\s*[-–—]|(?:\d{4})\s*[-–—]/i;
      if (datePattern.test(line) && line.length < 100) {
        if (currentExperience) data.experience.push(currentExperience);
        const parts = line.split(/[|–—\-]/).map(p => p.trim());
        currentExperience = {
          company: parts[0] || 'Company',
          role: parts[1] || 'Role',
          duration: line.match(datePattern)?.[0] || '',
          responsibilities: []
        };
      } else if (currentExperience && (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./))) {
        currentExperience.responsibilities.push(line.replace(/^[•\-]\s*|\d+\.\s*/, ''));
      } else if (currentExperience && line.length > 20 && !sectionPatterns.experience.test(line)) {
        currentExperience.responsibilities.push(line);
      }
    } else if (currentSection === 'projects') {
      if (line.match(/^\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i) || (line.length < 60 && !line.startsWith('•'))) {
        if (currentProject) data.projects.push(currentProject);
        currentProject = {
          title: line,
          techStack: [],
          description: '',
          achievements: []
        };
      } else if (currentProject) {
        if (line.toLowerCase().includes('tech') || line.toLowerCase().includes('stack')) {
          currentProject.techStack = line.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
        } else if (line.startsWith('•') || line.startsWith('-')) {
          currentProject.achievements.push(line.replace(/^[•\-]\s*/, ''));
        } else {
          currentProject.description = line;
        }
      }
    } else if (currentSection === 'education') {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch && line.length < 80) {
        if (currentEducation) data.education.push(currentEducation);
        currentEducation = {
          degree: line.replace(/\b(19|20)\d{2}\b.*$/, '').trim(),
          institution: '',
          year: yearMatch[0],
          cgpa: line.match(/\d+\.?\d*\s*(?:gpa|cgpa|\/\s*\d+\.?\d*)/i)?.[0] || ''
        };
      } else if (currentEducation && line.length > 5) {
        currentEducation.institution = line;
      }
    } else if (currentSection === 'certifications') {
      if (line.length > 5 && line.length < 150) {
        data.certifications.push(line.replace(/^[•\-]\s*/, ''));
      }
    }

    // First line is often the name (if no section matched yet)
    if (i === 0 && !data.fullName && line.length > 2 && line.length < 60 && !line.includes('@')) {
      data.fullName = line;
    }
  }

  // Push last items
  if (currentExperience) data.experience.push(currentExperience);
  if (currentProject) data.projects.push(currentProject);
  if (currentEducation) data.education.push(currentEducation);

  // Merge technical and soft skills into skills
  data.skills = [...new Set([...data.technicalSkills, ...data.softSkills])];

  return data;
}

/**
 * Main parse function - accepts file path or buffer
 */
export async function parseResume(filePath) {
  let text = '';
  const ext = path.extname(filePath).toLowerCase();

  const buffer = await fs.readFile(filePath);

  if (ext === '.pdf') {
    text = await parsePDF(buffer);
  } else if (ext === '.docx' || ext === '.doc') {
    text = await parseDOCX(buffer);
  } else if (ext === '.txt') {
    text = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file format. Use PDF, DOCX, or TXT.');
  }

  return extractResumeData(text);
}

/**
 * Parse resume from buffer (for direct upload)
 */
export async function parseResumeFromBuffer(buffer, filename) {
  const ext = path.extname(filename || '').toLowerCase();
  let text = '';

  if (ext === '.pdf') {
    text = await parsePDF(buffer);
  } else if (ext === '.docx' || ext === '.doc') {
    text = await parseDOCX(buffer);
  } else if (ext === '.txt' || !ext) {
    text = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file format. Use PDF, DOCX, or TXT.');
  }

  return extractResumeData(text);
}
