import { jsPDF } from 'jspdf';
import {
  DEVELOPER_IDENTITY,
  FEATURED_PROJECTS,
  JOURNEY_MILESTONES,
  SKILLS_DATA,
} from '../data/portfolioData';

export function downloadPortfolioCV(): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = 56;

  // Header band
  doc.setFillColor(10, 17, 40);
  doc.rect(0, 0, pageWidth, 108, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(DEVELOPER_IDENTITY.name, margin, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(147, 197, 253);
  doc.text('Aspiring Software Developer & Digital Creator', margin, 66);

  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Email: ${DEVELOPER_IDENTITY.email}   |   GitHub: github.com/${DEVELOPER_IDENTITY.githubUsername}   |   Location: ${DEVELOPER_IDENTITY.location}`,
    margin,
    86,
  );

  y = 138;

  const addSectionTitle = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(title.toUpperCase(), margin, y);
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  };

  // Profile Summary
  addSectionTitle('Profile Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const summaryLines = doc.splitTextToSize(
    'Aspiring developer and digital creator building interactive web applications, 3D browser experiments, Android/Kotlin AI utilities, and student tools. Passionate about combining visual creativity with practical software engineering.',
    maxWidth,
  );
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 14 + 14;

  // Core Skills
  addSectionTitle('Technical Skills');
  doc.setFontSize(9.5);
  const skillText = SKILLS_DATA.map((s) => `${s.name} (${s.focus.split(',')[0]})`).join('  •  ');
  const skillLines = doc.splitTextToSize(skillText, maxWidth);
  doc.text(skillLines, margin, y);
  y += skillLines.length * 13 + 16;

  // Featured Projects
  addSectionTitle('Selected GitHub Projects');
  FEATURED_PROJECTS.forEach((proj) => {
    if (y > 720) {
      doc.addPage();
      y = 56;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${proj.title}  —  [${proj.stack.join(', ')}]`, margin, y);
    y += 13;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(proj.summary, maxWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 12 + 3;

    doc.setTextColor(37, 99, 235);
    doc.setFontSize(8.5);
    doc.text(proj.repoUrl, margin, y);
    y += 16;
  });

  y += 6;
  if (y > 700) {
    doc.addPage();
    y = 56;
  }

  // Learning Journey
  addSectionTitle('Development Journey');
  JOURNEY_MILESTONES.forEach((item) => {
    if (y > 740) {
      doc.addPage();
      y = 56;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.period}: ${item.title}`, margin, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(item.description, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 12;
  });

  doc.save('Saipratap_Dansana_CV.pdf');
}
