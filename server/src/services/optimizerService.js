/**
 * Resume Optimizer Service - Uses OpenAI to improve resume based on JD
 * Falls back to rule-based improvements if OpenAI is not configured
 */

import OpenAI from 'openai';
import { extractJDKeywords } from '../utils/jdAnalyzer.js';
import { calculateATSScore } from '../utils/atsScorer.js';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Build prompt for OpenAI to optimize resume
 */
function buildOptimizationPrompt(resumeData, jdText, jdKeywords) {
  return `You are an expert resume writer and ATS specialist. Optimize this resume for the following job description.

JOB DESCRIPTION:
${jdText}

KEYWORDS TO INCORPORATE: ${jdKeywords.skills.join(', ')}

RESUME DATA (JSON):
${JSON.stringify(resumeData, null, 2)}

Return a JSON object with these exact keys:
- "summary": Improved professional summary (2-4 sentences) that incorporates JD keywords
- "experience": Array of experience objects, each with: company, role, duration, responsibilities (array of improved bullet points starting with strong action verbs, quantified where possible)
- "skills": Reordered skills array (JD-relevant skills first)
- "projects": Array of project objects with: title, techStack, description, achievements
- "changes": Array of strings describing what was changed (e.g. "Added 'React' to skills", "Quantified achievement in first bullet")

Rules:
- Use strong action verbs (developed, implemented, led, optimized, etc.)
- Add metrics/numbers where reasonable
- Incorporate missing JD keywords naturally
- Keep ATS-friendly: no tables, standard headings
- Preserve all original information, just improve presentation
- Single column format compatible`;
}

/**
 * Parse OpenAI response - handle JSON extraction from markdown code blocks
 */
function parseAIResponse(text) {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonStr.trim());
  } catch {
    return null;
  }
}

/**
 * Rule-based resume improvement (fallback when no OpenAI)
 */
function ruleBasedOptimize(resumeData, jdText) {
  const jdAnalysis = extractJDKeywords(jdText);
  const result = { ...JSON.parse(JSON.stringify(resumeData)) };
  const changes = [];

  // Reorder skills - JD skills first
  if (result.skills?.length && jdAnalysis.skills?.length) {
    const jdSkillsLower = jdAnalysis.skills.map(s => s.toLowerCase());
    const sorted = [...result.skills].sort((a, b) => {
      const aMatch = jdSkillsLower.some(j => a.toLowerCase().includes(j) || j.includes(a.toLowerCase()));
      const bMatch = jdSkillsLower.some(j => b.toLowerCase().includes(j) || j.includes(b.toLowerCase()));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    result.skills = sorted;
    result.technicalSkills = result.technicalSkills || sorted;
    changes.push('Reordered skills to prioritize JD keywords');
  }

  // Add missing JD skills
  const resumeSkills = new Set((result.skills || []).map(s => s.toLowerCase()));
  jdAnalysis.skills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (!Array.from(resumeSkills).some(rs => rs.includes(skillLower) || skillLower.includes(rs))) {
      result.skills = result.skills || [];
      result.skills.unshift(skill);
      resumeSkills.add(skillLower);
      changes.push(`Added missing skill: ${skill}`);
    }
  });

  // Improve bullet points with action verbs
  const actionVerbs = jdAnalysis.actionVerbs.length ? jdAnalysis.actionVerbs : ['developed', 'implemented', 'led', 'managed', 'optimized'];
  (result.experience || []).forEach((exp, i) => {
    exp.responsibilities = (exp.responsibilities || []).map((resp, j) => {
      const lower = resp.toLowerCase();
      const hasActionVerb = actionVerbs.some(v => lower.startsWith(v));
      if (!hasActionVerb && resp.length > 10) {
        const verb = actionVerbs[j % actionVerbs.length];
        const improved = verb.charAt(0).toUpperCase() + verb.slice(1) + resp.substring(resp.search(/\w/));
        changes.push(`Improved bullet in ${exp.company}: added action verb`);
        return improved;
      }
      return resp;
    });
  });

  result.changes = changes;
  return result;
}

/**
 * Main optimization function
 */
export async function optimizeResume(resumeData, jdText, jobTitle = '') {
  const beforeScore = calculateATSScore(resumeData, jdText);
  const jdKeywords = extractJDKeywords(jdText);

  let optimizedData;

  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert ATS resume optimizer. Return only valid JSON.' },
          { role: 'user', content: buildOptimizationPrompt(resumeData, jdText, jdKeywords) }
        ],
        temperature: 0.4
      });
      const content = response.choices[0]?.message?.content;
      optimizedData = parseAIResponse(content);
      if (!optimizedData) throw new Error('Invalid AI response');
      optimizedData.changes = optimizedData.changes || ['AI-powered optimization applied'];
    } catch (err) {
      console.warn('OpenAI optimization failed, using rule-based:', err.message);
      optimizedData = ruleBasedOptimize(resumeData, jdText);
    }
  } else {
    optimizedData = ruleBasedOptimize(resumeData, jdText);
  }

  const afterScore = calculateATSScore(optimizedData, jdText);

  return {
    resume: optimizedData,
    beforeScore,
    afterScore,
    changes: optimizedData.changes || []
  };
}
