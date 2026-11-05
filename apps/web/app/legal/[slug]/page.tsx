import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };
type LegalDocument = { title: string; description: string; sections: LegalSection[] };

const documents: Record<string, LegalDocument> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How MONK collects, uses, protects and deletes personal data.',
    sections: [
      { title: '1. Scope and controller', paragraphs: ['This policy applies to the MONK website, accounts, organization workspaces and related support interactions. The organization operating a MONK workspace is the controller of its customer and project data; MONK acts as a processor for that workspace data.', 'The operating legal entity, registered address and dedicated privacy contact must be inserted before general availability. During the pilot, privacy requests are handled through the verified onboarding channel. Do not post personal data in public GitHub issues.'] },
      { title: '2. Information we collect', paragraphs: ['We collect only the information needed to provide and secure the service.'], bullets: ['Account data: name, email address, authentication events and legal acceptance records.', 'Workspace data: organization profile, memberships, contacts, leads, projects, tasks, documents and activity records that users choose to add.', 'Technical data: IP address, browser or device information, request IDs and security logs.', 'Support data: messages and context you deliberately provide when asking for help.'] },
      { title: '3. How we use information', paragraphs: ['Information is used to create and secure accounts, provide workspace features, prevent abuse, respond to support requests, meet legal obligations and improve reliability. We do not sell personal data. We do not use workspace content to train an AI model.', 'Where required, processing relies on performance of a contract, legitimate interests in securing and operating the service, consent, or compliance with law. Workspace operators are responsible for documenting the lawful basis for their own customer data.'] },
      { title: '4. AI and consequential actions', paragraphs: ['The current build does not send workspace data to an AI provider. If Copilot is enabled later, the provider, region, retention terms and data-processing safeguards will be disclosed first. Copilot outputs must be labelled and sourced, and consequential actions require human confirmation.'] },
      { title: '5. Sharing and subprocessors', paragraphs: ['Data is shared only with service providers needed to operate MONK, such as managed authentication, PostgreSQL database hosting, application hosting, transactional email, error monitoring and private file storage. A current subprocessor list and region disclosure must be published before production.', 'We may also disclose information when required by law, to protect against abuse, or as part of a business transaction subject to appropriate safeguards.'] },
      { title: '6. Retention and deletion', paragraphs: ['Account and workspace data is intended to remain for the life of the account plus a documented recovery window. The recommended default is 90 days after account closure, with audit records retained for up to two years and AI conversations for 90 days if that feature is enabled.', 'Deletion requests enter a grace period before records, files and derived data are purged. Legal holds and mandatory records may be excluded where permitted by law. Production retention schedules must be approved by the owner before launch.'] },
      { title: '7. Security', paragraphs: ['MONK uses tenant-scoped PostgreSQL row-level security, role checks, managed authentication and append-only audit records. No online service can promise absolute security. We maintain a production checklist for backup restoration, incident response, monitoring and vulnerability management.'] },
      { title: '8. Your rights', paragraphs: ['Depending on your location, you may request access, correction, export, deletion, restriction, objection or withdrawal of consent. Workspace users should contact their organization administrator for workspace records; account-level requests can be made through the verified support channel.', 'Requests are verified before account data is discussed or disclosed. You may also complain to the relevant data-protection authority.'] },
      { title: '9. Changes and contact', paragraphs: ['Material changes will be posted with a new version date and, where appropriate, notified in advance. Continued use does not replace consent where fresh consent is legally required.'] },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'The rules for accessing and using MONK.',
    sections: [
      { title: '1. Agreement and eligibility', paragraphs: ['These terms govern access to MONK. By creating an account or accepting an invitation, you agree to these terms and the referenced policies. If you use MONK for an organization, you confirm that you may bind that organization.', 'You must be legally capable of entering this agreement. The operating legal entity and governing-law details must be inserted before general availability.'] },
      { title: '2. Accounts and workspace roles', paragraphs: ['Provide accurate account information, protect your credentials and promptly report suspected unauthorized access. Organization owners control memberships and must assign the least privilege needed for each user.', 'A user may belong to multiple organizations with different roles. Users must not attempt to access records outside their assigned organization, project or sharing scope.'] },
      { title: '3. Pilot service', paragraphs: ['MONK is currently provided as a pilot and may change as workflows are validated. Features marked as preview or demo are not represented as generally available. Sample records in the demo are fictional and must not be treated as real customer information.', 'Do not enter regulated, highly sensitive or mission-critical production data into a preview environment.'] },
      { title: '4. Customer data and responsibilities', paragraphs: ['You retain your rights in workspace content. You grant MONK only the permissions needed to host, process and display that content to provide the service.', 'You are responsible for having a lawful basis for uploaded personal data, configuring client visibility correctly, maintaining exports where needed and ensuring your users follow these terms.'] },
      { title: '5. Acceptable use', paragraphs: ['The Acceptable Use Policy is part of these terms. You may not probe other tenants, bypass permissions, upload malware, send unlawful communications, infringe rights or use MONK for regulated money movement, payroll or statutory filing.'] },
      { title: '6. AI-assisted features', paragraphs: ['AI output can be wrong and must be verified. MONK does not provide legal, tax, medical, investment or other regulated professional advice through Copilot. You remain responsible for reviewing drafts, sources and every action you approve.'] },
      { title: '7. Fees and plan limits', paragraphs: ['Pilot pricing may be communicated separately. Public plan prices will be published before paid self-serve subscriptions begin. Limits, renewal terms, taxes, cancellation and refund terms must be shown clearly before any charge.', 'Core security features such as tenant isolation, MFA support, audit records and export are not sold as optional security add-ons.'] },
      { title: '8. Availability, suspension and termination', paragraphs: ['We may suspend access to protect users, investigate abuse, address security risk or comply with law. Where practical, we will provide notice and a path to resolve the issue.', 'You may stop using MONK and request export or deletion. Suspension or termination must not silently erase customer data; documented notice and recovery windows apply unless immediate action is legally required.'] },
      { title: '9. Disclaimers and liability', paragraphs: ['The pilot is provided on an “as available” basis to the extent permitted by law. Nothing in these terms excludes liability that cannot be excluded. Specific liability caps, indemnities and dispute procedures require qualified legal review before production.'] },
      { title: '10. Changes and contact', paragraphs: ['Material changes will be versioned and communicated where required. Questions about these terms should be sent through the verified support or pilot onboarding channel, not posted with confidential details in public forums.'] },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'How MONK uses essential browser storage and cookies.',
    sections: [
      { title: '1. What we use', paragraphs: ['MONK uses cookies and similar browser storage for secure authentication, session continuity, CSRF-safe login flows and remembering essential workspace preferences. These are strictly necessary for the service you request.'] },
      { title: '2. Analytics and advertising', paragraphs: ['The current implementation does not install advertising cookies or third-party product analytics. If privacy-respecting analytics are added, this policy and any required consent controls will be updated first.'] },
      { title: '3. Authentication storage', paragraphs: ['Supabase authentication may set secure, HTTP-only or browser-managed tokens depending on the sign-in flow. Sessions are refreshed and revoked through the authentication service. Do not copy or share session tokens.'] },
      { title: '4. Your controls', paragraphs: ['You can clear cookies and site data through your browser, but doing so will sign you out and may reset preferences. Blocking essential authentication storage can prevent the secure workspace from functioning.'] },
    ],
  },
  'acceptable-use': {
    title: 'Acceptable Use Policy',
    description: 'Rules that protect MONK users, data and infrastructure.',
    sections: [
      { title: '1. Security and access', paragraphs: ['Do not attempt to access another organization’s data, guess record identifiers, bypass row-level security or permissions, probe the service without authorization, share accounts or interfere with authentication and rate limits.'] },
      { title: '2. Unlawful or harmful content', paragraphs: ['Do not upload or transmit malware, stolen data, infringing material, deceptive content, harassment, exploitation or content that violates applicable law or another person’s rights.'] },
      { title: '3. Communications and consent', paragraphs: ['Do not use MONK for spam or unsolicited marketing. A matching consent record or documented lawful basis is required before outbound marketing. Honor withdrawal requests promptly.'] },
      { title: '4. Prohibited high-risk uses', paragraphs: ['MONK v1 is not for payroll, statutory filing, banking, escrow, regulated money movement, medical decision-making or autonomous legal and financial advice. Do not use it as the sole system for mission-critical records without an approved operating plan.'] },
      { title: '5. Fair use and system integrity', paragraphs: ['Do not overload shared infrastructure, circumvent plan limits, create abusive automation loops or resell access except through an authorized agreement. Imports, webhooks and AI features may be disabled to protect service stability.'] },
      { title: '6. Reporting and enforcement', paragraphs: ['Report suspected abuse or vulnerabilities through the verified private support channel. We may investigate, limit or suspend access, preserve relevant evidence and report unlawful activity where required. Enforcement actions should be proportionate, reasoned and auditable.'] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(documents).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const document = documents[slug];
  return document ? { title: document.title, description: document.description } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = documents[slug];
  if (!document) notFound();
  return <><SiteHeader /><main className="subpage-main" id="main-content"><section className="subpage-hero"><div className="container"><span className="eyebrow">Legal · version 5 November 2026</span><h1>{document.title}</h1><p>{document.description}</p></div></section><section className="subpage-content"><div className="container legal-layout"><nav className="legal-nav" aria-label="Legal documents"><strong>Legal documents</strong><Link href="/legal/privacy">Privacy Policy</Link><Link href="/legal/terms">Terms & Conditions</Link><Link href="/legal/cookies">Cookie Policy</Link><Link href="/legal/acceptable-use">Acceptable Use</Link></nav><article className="legal-document"><div className="legal-notice">Prelaunch working draft. The operating entity, governing law, contact details and jurisdiction-specific clauses require qualified legal review before production customer data is accepted.</div>{document.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}</article></div></section></main><SiteFooter /></>;
}
