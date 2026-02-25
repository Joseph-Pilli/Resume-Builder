/**
 * Job Description Analyzer - Extracts keywords, skills, and requirements from JD
 */

/**
 * Common action verbs for resume bullet points
 */
const ACTION_VERBS = [
  'developed', 'implemented', 'designed', 'led', 'managed', 'optimized',
  'created', 'built', 'delivered', 'improved', 'reduced', 'increased',
  'automated', 'architected', 'coordinated', 'executed', 'launched',
  'streamlined', 'transformed', 'scaled', 'deployed', 'integrated',
  'analyzed', 'resolved', 'established', 'collaborated', 'drove'
];

/**
 * Technical keywords commonly found in job descriptions
 */
const TECH_PATTERNS = [
  /\b(?:javascript|typescript|js|ts)\b/gi,
  /\b(?:react|vue|angular|svelte)\b/gi,
  /\b(?:node\.?js|nodejs|express)\b/gi,
  /\b(?:python|java|c#|c\+\+|go|rust|kotlin|swift)\b/gi,
  /\b(?:sql|mongodb|postgresql|mysql|redis|elasticsearch)\b/gi,
  /\b(?:aws|azure|gcp|google cloud)\b/gi,
  /\b(?:docker|kubernetes|k8s|terraform)\b/gi,
  /\b(?:rest|graphql|api|microservices)\b/gi,
  /\b(?:git|ci\/cd|jenkins|agile|scrum)\b/gi,
  /\b(?:machine learning|ml|ai|nlp|tensorflow|pytorch)\b/gi,
  /\b(?:html|css|scss|sass|redux|webpack)\b/gi
];

/**
 * Extract skills and keywords from job description text
 */
export function extractJDKeywords(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return { skills: [], keywords: [], actionVerbs: [] };
  }

  const text = jdText.toLowerCase();
  const skills = new Set();
  const keywords = new Set();

  // Extract technical skills using patterns
  TECH_PATTERNS.forEach(pattern => {
    const matches = jdText.match(pattern);
    if (matches) {
      matches.forEach(m => skills.add(m.trim()));
    }
  });

  // Extract words that look like skills (capitalized or in lists)
  const skillLikeWords = text.match(/\b[a-z][a-z+#\.]+\b/g) || [];
  skillLikeWords.forEach(word => {
    if (word.length > 2 && word.length < 30) {
      if (['the', 'and', 'for', 'with', 'from', 'this', 'that'].includes(word)) return;
      keywords.add(word);
    }
  });

  // Extract action verbs from JD
  const actionVerbs = ACTION_VERBS.filter(verb => text.includes(verb));

  // Look for "required", "must have", "experience with" sections
  const requiredSection = jdText.match(/(?:required|must have|qualifications?|requirements?)[:\s]+([\s\S]*?)(?=\n\n|$)/gi);
  if (requiredSection) {
    requiredSection.forEach(section => {
      const words = section.split(/[,;•\-–—\n]/).map(w => w.trim().toLowerCase());
      words.forEach(w => {
        if (w.length > 3 && w.length < 40) keywords.add(w);
      });
    });
  }

  return {
    skills: Array.from(skills),
    keywords: Array.from(keywords),
    actionVerbs
  };
}

/**
 * Extract job title from JD (usually in first few lines)
 */
export function extractJobTitle(jdText) {
  if (!jdText) return '';
  const lines = jdText.split(/\n/).map(l => l.trim()).filter(Boolean);
  // First non-empty line is often the job title
  return lines[0] || '';
}
