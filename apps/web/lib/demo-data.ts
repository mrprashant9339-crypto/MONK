import type { WorkspaceData } from './types';

export const demoData: WorkspaceData = {
  organization: {
    id: 'demo-org-northstar',
    name: 'Northstar Studio',
    slug: 'northstar-studio',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    locale: 'en-IN',
    industry: 'Design & creative services',
  },
  role: 'owner',
  user: { id: 'demo-user-arjun', name: 'Arjun Mehta', email: 'arjun@example.com' },
  contacts: [
    {
      id: 'contact-maya', firstName: 'Maya', lastName: 'Kapoor', email: 'maya@kayafoods.example',
      phone: '+91 98765 01420', title: 'Founder', companyId: 'company-kaya', companyName: 'Kaya Foods',
      owner: 'Arjun', tags: ['Key client', 'Retainer'], lastActivity: '2026-11-05T06:30:00.000Z',
    },
    {
      id: 'contact-rohan', firstName: 'Rohan', lastName: 'Shah', email: 'rohan@nilaskin.example',
      phone: '+91 99871 23304', title: 'Marketing director', companyId: 'company-nila', companyName: 'Nila Skincare',
      owner: 'Arjun', tags: ['Active'], lastActivity: '2026-11-04T11:15:00.000Z',
    },
    {
      id: 'contact-ira', firstName: 'Ira', lastName: 'Bose', email: 'ira@asterarch.example',
      phone: '+91 97420 55182', title: 'Principal architect', companyId: 'company-aster', companyName: 'Aster Architecture',
      owner: 'Naina', tags: ['Referral'], lastActivity: '2026-11-03T08:45:00.000Z',
    },
    {
      id: 'contact-dev', firstName: 'Dev', lastName: 'Malhotra', email: 'dev@cobaltlabs.example',
      phone: '+91 98200 37611', title: 'Product lead', companyId: 'company-cobalt', companyName: 'Cobalt Labs',
      owner: 'Arjun', tags: ['Prospect'], lastActivity: '2026-11-02T10:20:00.000Z',
    },
    {
      id: 'contact-sana', firstName: 'Sana', lastName: 'Qureshi', email: 'sana@fernworks.example',
      phone: '+91 98921 44208', title: 'Operations head', companyId: 'company-fern', companyName: 'Fern & Co.',
      owner: 'Kabir', tags: ['Active'], lastActivity: '2026-10-30T09:00:00.000Z',
    },
  ],
  leads: [
    { id: 'lead-dev', name: 'Dev Malhotra', email: 'dev@cobaltlabs.example', phone: null, source: 'referral', status: 'qualified', score: 82, nextAction: 'Send scope and estimate', nextActionAt: '2026-11-05T12:30:00.000Z', owner: 'Arjun' },
    { id: 'lead-ira', name: 'Ira Bose', email: 'ira@asterarch.example', phone: null, source: 'web_form', status: 'contacted', score: 64, nextAction: 'Discovery call', nextActionAt: '2026-11-06T06:00:00.000Z', owner: 'Naina' },
    { id: 'lead-vihaan', name: 'Vihaan Rao', email: 'vihaan@stoneware.example', phone: '+91 98111 20943', source: 'outbound', status: 'new', score: 38, nextAction: 'Qualify requirements', nextActionAt: '2026-11-07T08:00:00.000Z', owner: 'Arjun' },
    { id: 'lead-elena', name: 'Elena Thomas', email: 'elena@wildfig.example', phone: null, source: 'event', status: 'contacted', score: 57, nextAction: 'Share credentials', nextActionAt: '2026-11-04T09:00:00.000Z', owner: 'Kabir' },
  ],
  projects: [
    { id: 'project-kaya', name: 'Kaya brand evolution', code: 'KAYA-24', clientCompanyId: 'company-kaya', clientName: 'Kaya Foods', status: 'active', health: 'on_track', dueDate: '2026-11-20', description: 'A focused brand refresh across identity, packaging and launch assets.', visibility: 'client_visible', progress: 68, taskCount: 12, doneTaskCount: 8, manager: 'Arjun' },
    { id: 'project-nila', name: 'Nila digital flagship', code: 'NILA-18', clientCompanyId: 'company-nila', clientName: 'Nila Skincare', status: 'in_review', health: 'at_risk', dueDate: '2026-11-12', description: 'Design and delivery of a calm, conversion-focused digital storefront.', visibility: 'client_visible', progress: 82, taskCount: 17, doneTaskCount: 14, manager: 'Naina' },
    { id: 'project-aster', name: 'Aster portfolio system', code: 'ASTR-09', clientCompanyId: 'company-aster', clientName: 'Aster Architecture', status: 'active', health: 'on_track', dueDate: '2026-12-04', description: 'A modular portfolio and editorial system for the architecture practice.', visibility: 'internal', progress: 36, taskCount: 11, doneTaskCount: 4, manager: 'Arjun' },
    { id: 'project-fern', name: 'Fern seasonal campaign', code: 'FERN-31', clientCompanyId: 'company-fern', clientName: 'Fern & Co.', status: 'active', health: 'off_track', dueDate: '2026-11-09', description: 'Campaign concepts, production and channel-ready seasonal assets.', visibility: 'client_visible', progress: 54, taskCount: 13, doneTaskCount: 7, manager: 'Kabir' },
    { id: 'project-internal', name: 'Studio playbook', code: 'NSTR-02', clientCompanyId: null, clientName: 'Internal', status: 'active', health: 'on_track', dueDate: '2026-12-16', description: 'A living operating playbook for the Northstar team.', visibility: 'internal', progress: 25, taskCount: 8, doneTaskCount: 2, manager: 'Naina' },
  ],
  tasks: [
    { id: 'task-1', projectId: 'project-kaya', title: 'Refine packaging dielines', status: 'in_progress', priority: 'high', dueDate: '2026-11-05', assignee: 'You', estimateHours: 3, blockerReason: null, visibility: 'internal' },
    { id: 'task-2', projectId: 'project-nila', title: 'Homepage design QA', status: 'review', priority: 'urgent', dueDate: '2026-11-05', assignee: 'Naina', estimateHours: 2, blockerReason: null, visibility: 'client_visible' },
    { id: 'task-3', projectId: 'project-aster', title: 'Curate project photography', status: 'todo', priority: 'medium', dueDate: '2026-11-06', assignee: 'You', estimateHours: 4, blockerReason: null, visibility: 'internal' },
    { id: 'task-4', projectId: 'project-fern', title: 'Approve final campaign copy', status: 'blocked', priority: 'high', dueDate: '2026-11-04', assignee: 'Kabir', estimateHours: 1, blockerReason: 'Waiting for the client’s final product claims.', visibility: 'internal' },
    { id: 'task-5', projectId: 'project-kaya', title: 'Prepare client walkthrough', status: 'todo', priority: 'medium', dueDate: '2026-11-06', assignee: 'You', estimateHours: 1.5, blockerReason: null, visibility: 'client_visible' },
    { id: 'task-6', projectId: 'project-nila', title: 'Mobile navigation prototype', status: 'done', priority: 'medium', dueDate: '2026-11-03', assignee: 'Naina', estimateHours: 5, blockerReason: null, visibility: 'internal' },
    { id: 'task-7', projectId: 'project-aster', title: 'Typography direction', status: 'in_progress', priority: 'medium', dueDate: '2026-11-07', assignee: 'You', estimateHours: 6, blockerReason: null, visibility: 'internal' },
    { id: 'task-8', projectId: 'project-fern', title: 'Export paid social variations', status: 'review', priority: 'high', dueDate: '2026-11-05', assignee: 'Kabir', estimateHours: 2, blockerReason: null, visibility: 'internal' },
  ],
  documents: [
    { id: 'doc-1', projectId: 'project-nila', projectName: 'Nila digital flagship', name: 'Homepage — final review.fig', reviewStatus: 'in_review', confidentiality: 'internal', owner: 'Naina', updatedAt: '2026-11-05T07:10:00.000Z', version: 4, size: '18.4 MB' },
    { id: 'doc-2', projectId: 'project-kaya', projectName: 'Kaya brand evolution', name: 'Brand guidelines v3.pdf', reviewStatus: 'approved', confidentiality: 'client_shared', owner: 'You', updatedAt: '2026-11-04T13:40:00.000Z', version: 3, size: '8.2 MB' },
    { id: 'doc-3', projectId: 'project-fern', projectName: 'Fern seasonal campaign', name: 'Campaign key visual.jpg', reviewStatus: 'in_review', confidentiality: 'internal', owner: 'Kabir', updatedAt: '2026-11-05T04:20:00.000Z', version: 2, size: '5.7 MB' },
    { id: 'doc-4', projectId: 'project-aster', projectName: 'Aster portfolio system', name: 'Content inventory.csv', reviewStatus: 'draft', confidentiality: 'internal', owner: 'You', updatedAt: '2026-11-03T10:00:00.000Z', version: 1, size: '124 KB' },
    { id: 'doc-5', projectId: 'project-kaya', projectName: 'Kaya brand evolution', name: 'Packaging range overview.pdf', reviewStatus: 'approved', confidentiality: 'client_shared', owner: 'You', updatedAt: '2026-11-02T15:30:00.000Z', version: 2, size: '12.1 MB' },
  ],
  activities: [
    { id: 'activity-1', actor: 'Naina', action: 'moved Homepage design QA to review', resourceType: 'task', resourceId: 'task-2', kind: 'stage_change', createdAt: '2026-11-05T07:18:00.000Z' },
    { id: 'activity-2', actor: 'Maya Kapoor', action: 'approved Brand guidelines v3.pdf', resourceType: 'document', resourceId: 'doc-2', kind: 'file', createdAt: '2026-11-05T06:42:00.000Z' },
    { id: 'activity-3', actor: 'You', action: 'added a qualified lead for Cobalt Labs', resourceType: 'lead', resourceId: 'lead-dev', kind: 'system', createdAt: '2026-11-05T05:25:00.000Z' },
    { id: 'activity-4', actor: 'Kabir', action: 'flagged a blocker on Fern seasonal campaign', resourceType: 'project', resourceId: 'project-fern', kind: 'note', createdAt: '2026-11-04T12:05:00.000Z' },
  ],
};
