/**
 * Project Documentation Knowledge Base Bridge
 * -------------------------------------------
 * Provides the in-app AI Assistant with direct access to:
 * 1. AGENTS.md (System overview, CCEYA legal ground truth, privacy rules)
 * 2. TODO.md (Canonical master task roadmap & completed deliverables)
 * 3. README.md (Architecture diagrams, operational workflows, operator manual)
 */

import agentsMdContent from '../../AGENTS.md?raw';
import todoMdContent from '../../TODO.md?raw';
import readmeMdContent from '../../README.md?raw';

export interface ProjectDocsKnowledge {
  agentsMd: string;
  todoMd: string;
  readmeMd: string;
  summary: {
    totalRoadmapTasksCompleted: number;
    activeDomains: string[];
    governingLegislation: string;
    databaseResidency: string;
  };
}

export const PROJECT_DOCS: ProjectDocsKnowledge = {
  agentsMd: agentsMdContent,
  todoMd: todoMdContent,
  readmeMd: readmeMdContent,
  summary: {
    totalRoadmapTasksCompleted: 33,
    activeDomains: [
      '1. Parent Admissions & Intake Pipeline',
      '2. Provider Hub, Attendance & Timesheets',
      '3. Home Visitor Field Portal & CCEYA',
      '4. Compliance Portal & Form Lifecycles',
      '5. Admin Command Centre & Agency Config',
      '6. Platform, Field PWA & Local AI'
    ],
    governingLegislation: 'Child Care and Early Years Act, 2014 (CCEYA) & Ontario Regulation 137/15',
    databaseResidency: 'Google Cloud Platform (Montreal, northamerica-northeast1)'
  }
};
