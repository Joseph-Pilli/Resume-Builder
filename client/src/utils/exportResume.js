/**
 * Resume Export - PDF and Word generation
 * PDF: Renders the live preview HTML to PDF for exact layout match (like reference)
 */

import html2pdf from 'html2pdf.js'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType } from 'docx'
import { saveAs } from 'file-saver'

/**
 * Build resume content structure for exports
 */
const CONTACT_SEP = ' | '

function buildResumeContent(data) {
  const d = data || {}
  const contactRow2 = [d.phone, d.email, d.linkedin ? `LinkedIn: ${d.linkedin}` : ''].filter(Boolean).join(CONTACT_SEP)
  const contactRow3 = [d.github ? `GitHub: ${d.github}` : '', d.portfolio ? `Portfolio: ${d.portfolio}` : ''].filter(Boolean).join(CONTACT_SEP)
  const contact = [contactRow2, contactRow3].filter(Boolean).join(' ')

  // Build skills from skillGroups: "Title: skill1, skill2"
  const skillGroups = Array.isArray(d.skillGroups) ? d.skillGroups : []
  const skillsContent = skillGroups
    .filter(g => g.title || g.skills)
    .map(g => {
      const skillsStr = (g.skills || '').split(',').map(s => s.trim()).filter(Boolean).join(', ')
      return g.title ? `${g.title}: ${skillsStr}` : skillsStr
    })
    .filter(Boolean)
  // Legacy fallback
  const legacyTech = Array.isArray(d.technicalSkills) ? d.technicalSkills : []
  const legacySoft = Array.isArray(d.softSkills) ? d.softSkills : []
  const allSkills = skillsContent.length ? skillsContent : [...legacyTech, ...legacySoft]

  const certsRaw = d.certifications || []
  const certifications = certsRaw.map(c => {
    if (typeof c === 'object' && c && (c.company || c.specialization)) {
      return c
    }
    return typeof c === 'string' ? { company: c, duration: '', specialization: c } : null
  }).filter(Boolean)

  const achievements = (d.achievements || []).filter(Boolean)

  return {
    name: d.fullName || 'Your Name',
    contact,
    contactRow2,
    contactRow3,
    summary: d.summary || '',
    skills: allSkills,
    experience: d.experience || [],
    projects: d.projects || [],
    education: d.education || [],
    certifications,
    achievements
  }
}

/**
 * Export resume as PDF - renders the live preview HTML for exact layout match
 */
export function exportPDF(data) {
  const element = document.getElementById('resume-preview')
  const filename = ((data?.fullName || 'resume') + '.pdf').replace(/\s+/g, '_')

  if (element) {
    element.scrollIntoView({ block: 'start', behavior: 'instant' })

    /* Match preview content width (720px) so PDF inner area = 7.5in, no scaling. */
    const contentWidthPx = 720
    const marginIn = 0.5
    const prevWidth = element.style.width
    const prevPadding = element.style.padding
    element.style.width = contentWidthPx + 'px'
    element.style.padding = '0'

    const opt = {
      margin: [marginIn, marginIn, marginIn, marginIn],
      filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: contentWidthPx,
        onclone: (clonedDoc) => {
          const root = clonedDoc.getElementById('resume-preview')
          if (root) {
            root.style.width = contentWidthPx + 'px'
            root.style.padding = '0'
          }
        }
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.rp-block'] }
    }

    const restore = () => {
      element.style.width = prevWidth
      element.style.padding = prevPadding
    }
    html2pdf().set(opt).from(element).save().then(restore).catch(restore)
    return
  }

  // Fallback: programmatic PDF when element not in DOM (e.g. SSR)
  const c = buildResumeContent(data)
  const doc = new jsPDF({ format: 'letter', unit: 'in' })
  const margin = 0.75
  const pageWidth = 8.5
  const contentWidth = pageWidth - 2 * margin
  const rightEdge = pageWidth - margin
  let y = margin
  const lineHeight = 0.22
  const sectionGap = 0.2

  const drawRight = (text, rowY) => {
    if (!text) return
    doc.setFontSize(12)
    const w = doc.getTextWidth(text)
    doc.text(text, rightEdge - w, rowY)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(c.name, margin + (contentWidth - doc.getTextWidth(c.name)) / 2, y)
  y += lineHeight

  if (c.contactRow2 || c.contactRow3) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    if (c.contactRow2) {
      const w2 = doc.getTextWidth(c.contactRow2)
      doc.text(c.contactRow2, margin + (contentWidth - w2) / 2, y)
      y += lineHeight
    }
    if (c.contactRow3) {
      const w3 = doc.getTextWidth(c.contactRow3)
      doc.text(c.contactRow3, margin + (contentWidth - w3) / 2, y)
      y += lineHeight
    }
    y += sectionGap
  }

  if (c.summary) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('PROFESSIONAL SUMMARY', margin, y)
    y += lineHeight
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(c.summary, contentWidth)
    summaryLines.forEach(l => { doc.text(l, margin, y); y += lineHeight })
    y += sectionGap
  }

  if (c.skills.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('SKILLS', margin, y)
    y += lineHeight
    doc.setFont('helvetica', 'normal')
    const skillsText = Array.isArray(c.skills) ? c.skills.join('\n') : String(c.skills)
    const skillLines = doc.splitTextToSize(skillsText, contentWidth)
    skillLines.forEach(l => { doc.text(l, margin, y); y += lineHeight })
    y += sectionGap
  }

  if (c.experience.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('EXPERIENCE', margin, y)
    y += lineHeight

    c.experience.forEach(exp => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(exp.role || 'Job Title', margin, y)
      drawRight(exp.duration || '', y)
      y += lineHeight
      doc.text(exp.company || '', margin, y)
      drawRight(exp.location || '', y)
      y += lineHeight
      doc.setFont('helvetica', 'normal')
      ;(exp.responsibilities || []).filter(Boolean).forEach(r => {
        const lines = doc.splitTextToSize('• ' + r, contentWidth - 0.2)
        lines.forEach(l => { doc.text(l, margin + 0.15, y); y += lineHeight })
        if (y > 10.5) { doc.addPage(); y = margin }
      })
      y += sectionGap
    })
  }

  if (c.projects.length > 0) {
    if (y > 10) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('PROJECTS', margin, y)
    y += lineHeight

    c.projects.forEach(proj => {
      if (proj.title || proj.description) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(proj.title || 'Project', margin, y)
        y += lineHeight
        const techStr = Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || '')
        if (techStr) {
          doc.setFont('helvetica', 'bold')
          const prefix = 'Tech Stack: '
          doc.text(prefix, margin, y)
          doc.setFont('helvetica', 'normal')
          doc.text(techStr, margin + doc.getTextWidth(prefix), y)
          y += lineHeight
        }
        doc.setFont('helvetica', 'normal')
        if (proj.description) {
          const lines = doc.splitTextToSize(proj.description, contentWidth)
          lines.forEach(l => { doc.text(l, margin, y); y += lineHeight })
        }
        ;(proj.achievements || []).filter(Boolean).forEach(a => {
          const lines = doc.splitTextToSize('• ' + a, contentWidth - 0.2)
          lines.forEach(l => { doc.text(l, margin + 0.15, y); y += lineHeight })
        })
        y += sectionGap
      }
    })
  }

  if (c.education.length > 0) {
    if (y > 10) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('EDUCATION', margin, y)
    y += lineHeight

    c.education.forEach(edu => {
      if (edu.degree || edu.institution) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        const degreeStr = edu.cgpa ? `${edu.degree || ''} (${edu.cgpa})` : (edu.degree || '')
        doc.text(degreeStr, margin, y)
        drawRight(edu.year || '', y)
        y += lineHeight
        doc.setFont('helvetica', 'normal')
        doc.text(edu.institution || '', margin, y)
        drawRight(edu.location || '', y)
        y += lineHeight + sectionGap
      }
    })
  }

  if (c.certifications.length > 0) {
    if (y > 10) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('CERTIFICATIONS', margin, y)
    y += lineHeight
    doc.setFont('helvetica', 'normal')
    c.certifications.forEach(cert => {
      if (typeof cert === 'object' && cert) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(cert.specialization || '', margin, y)
        drawRight(cert.duration || '', y)
        y += lineHeight
        doc.setFont('helvetica', 'normal')
        if (cert.company) {
          doc.text(cert.company, margin, y)
          y += lineHeight
        }
      } else {
        doc.text('• ' + cert, margin, y)
        y += lineHeight
      }
    })
  }

  if (c.achievements.length > 0) {
    if (y > 10) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('ACHIEVEMENTS', margin, y)
    y += lineHeight
    doc.setFont('helvetica', 'normal')
    c.achievements.forEach(a => {
      const lines = doc.splitTextToSize('• ' + a, contentWidth - 0.2)
      lines.forEach(l => { doc.text(l, margin + 0.15, y); y += lineHeight })
    })
  }

  doc.save((c.name || 'resume').replace(/\s+/g, '_') + '.pdf')
}

/**
 * Export resume as Word (.docx)
 */
export async function exportWord(data) {
  const c = buildResumeContent(data)
  const children = []

  // Name - 24px (size in half-points: 36)
  children.push(
    new Paragraph({
      children: [new TextRun({ text: c.name, bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 }
    })
  )

  // Contact – row 2: Mobile | Email | LinkedIn; row 3: GitHub | Portfolio
  if (c.contactRow2) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: c.contactRow2, size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 }
      })
    )
  }
  if (c.contactRow3) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: c.contactRow3, size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    )
  }

  // Summary
  if (c.summary) {
    children.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 80 }
      }),
      new Paragraph({
        children: [new TextRun({ text: c.summary })],
        spacing: { after: 200 }
      })
    )
  }

  // Skills
  if (c.skills.length > 0) {
    children.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 80 }
      }),
      new Paragraph({
        text: Array.isArray(c.skills) ? c.skills.join('\n') : String(c.skills),
        spacing: { after: 200 }
      })
    )
  }

  const rightTabStop = { type: TabStopType.RIGHT, position: 10080 }

  // Experience
  if (c.experience.length > 0) {
    children.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 80 }
      })
    )
    c.experience.forEach(exp => {
      children.push(
        new Paragraph({
          tabStops: [rightTabStop],
          children: [
            new TextRun({ text: (exp.role || 'Job Title') + '\t', bold: true }),
            new TextRun({ text: exp.duration || '', bold: true })
          ],
          spacing: { after: 40 }
        }),
        new Paragraph({
          tabStops: [rightTabStop],
          children: [
            new TextRun({ text: (exp.company || '') + '\t', bold: true }),
            new TextRun({ text: exp.location || '', bold: true })
          ],
          spacing: { after: 80 }
        })
      )
      ;(exp.responsibilities || []).filter(Boolean).forEach(r => {
        children.push(
        new Paragraph({
          text: '• ' + r,
          indent: { left: 360 },
          spacing: { after: 40 }
        })
        )
      })
      children.push(new Paragraph({ text: '', spacing: { after: 80 } }))
    })
  }

  // Projects
  if (c.projects.length > 0) {
    children.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 80 }
      })
    )
    c.projects.forEach(proj => {
      if (proj.title || proj.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.title || 'Project', bold: true })],
            spacing: { after: 40 }
          })
        )
        const techStr = Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || '')
        if (techStr) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Tech Stack: ', bold: true }),
                new TextRun({ text: techStr })
              ],
              spacing: { after: 40 }
            })
          )
        }
        if (proj.description) {
          children.push(new Paragraph({ text: proj.description, spacing: { after: 40 } }))
        }
        ;(proj.achievements || []).filter(Boolean).forEach(a => {
          children.push(
        new Paragraph({
          text: '• ' + a,
          indent: { left: 360 },
          spacing: { after: 40 }
        })
          )
        })
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }))
      }
    })
  }

  // Education
  if (c.education.length > 0) {
    children.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 80 }
      })
    )
    c.education.forEach(edu => {
      if (edu.degree || edu.institution) {
        const degreeStr = edu.cgpa ? `${edu.degree || ''} (${edu.cgpa})` : (edu.degree || '')
        children.push(
          new Paragraph({
            tabStops: [rightTabStop],
            children: [
              new TextRun({ text: degreeStr + '\t', bold: true }),
              new TextRun({ text: edu.year || '', bold: true })
            ],
            spacing: { after: 40 }
          }),
          new Paragraph({
            tabStops: [rightTabStop],
            children: [
              new TextRun({ text: (edu.institution || '') + '\t' }),
              new TextRun({ text: edu.location || '' })
            ],
            spacing: { after: 80 }
          })
        )
      }
    })
  }

  // Certifications
  if (c.certifications.length > 0) {
    children.push(
      new Paragraph({
        text: 'CERTIFICATIONS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 80 }
      })
    )
    c.certifications.forEach(cert => {
      if (typeof cert === 'object' && cert) {
        children.push(
          new Paragraph({
            tabStops: [rightTabStop],
            children: [
              new TextRun({ text: (cert.specialization || '') + '\t', bold: true }),
              new TextRun({ text: cert.duration || '', bold: true })
            ],
            spacing: { after: 40 }
          })
        )
        if (cert.company) {
          children.push(
            new Paragraph({
              text: cert.company,
              spacing: { after: 80 }
            })
          )
        }
      } else {
        children.push(
          new Paragraph({
            text: '• ' + cert,
            indent: { left: 360 },
            spacing: { after: 40 }
          })
        )
      }
    })
  }

  // Achievements
  if (c.achievements.length > 0) {
    children.push(
      new Paragraph({
        text: 'ACHIEVEMENTS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 80 }
      })
    )
    c.achievements.forEach(a => {
      children.push(
        new Paragraph({
          text: '• ' + a,
          indent: { left: 360 },
          spacing: { after: 40 }
        })
      )
    })
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, (c.name || 'resume').replace(/\s+/g, '_') + '.docx')
}
