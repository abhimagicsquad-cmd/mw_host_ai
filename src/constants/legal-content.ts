import { siteConfig } from "@/constants/site-config"

export type LegalSection = {
  heading: string
  body: string[]
}

export type LegalDocument = {
  slug: string
  title: string
  summary: string
  lastUpdated: string
  sections: LegalSection[]
}

/**
 * Placeholder legal copy for the shared /legal/[slug] template. Generic, good-faith
 * drafting standing in until reviewed by qualified legal counsel — not legal advice.
 */
export const legalDocuments: Record<string, LegalDocument> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    summary: "How MagicWorks Host collects, uses, and protects your information.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "We collect information you provide directly, such as your name, email address, phone number, billing address, and any message content you submit through our forms.",
          "We also collect limited technical information automatically — such as IP address, browser type, and pages visited — to keep our services secure and to understand how our site is used.",
        ],
      },
      {
        heading: "How we use your information",
        body: [
          "We use your information to provision and support your hosting account, respond to enquiries, send service-related communications, and process billing.",
          "With your consent, we may also send occasional product updates or offers. You can opt out of marketing communications at any time.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use essential cookies to keep our site functioning correctly (for example, remembering that you've dismissed a banner) and, where enabled, analytics cookies to understand aggregate site usage.",
          "You can control or disable cookies through your browser settings; disabling essential cookies may affect site functionality.",
        ],
      },
      {
        heading: "How we share your information",
        body: [
          "We do not sell your personal information. We share data only with service providers who help us operate — such as email delivery and payment processing — under confidentiality obligations, or where required by law.",
        ],
      },
      {
        heading: "Data retention and security",
        body: [
          "We retain account and billing information for as long as your account is active and as needed to meet legal and accounting obligations.",
          "We apply reasonable technical and organizational safeguards to protect your data, including access controls and encrypted transmission (HTTPS) for forms submitted on this site.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request access to, correction of, or deletion of your personal information, or object to certain processing, by contacting us using the details below.",
        ],
      },
      {
        heading: "Contact us",
        body: [
          `Questions about this policy can be sent to ${siteConfig.contact.email} or by post to ${siteConfig.contact.address}.`,
        ],
      },
    ],
  },
  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    summary: "The terms that govern your use of MagicWorks Host's products and services.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Acceptance of terms",
        body: [
          `By purchasing, accessing, or using any ${siteConfig.name} service — including shared hosting, VPS, dedicated servers, domains, SSL certificates, and email hosting — you agree to be bound by these Terms of Service.`,
        ],
      },
      {
        heading: "Service description",
        body: [
          "We provide web hosting and related infrastructure services on a subscription basis. Plan features, storage, bandwidth, and pricing are as described on the relevant product page at the time of purchase.",
        ],
      },
      {
        heading: "Billing and renewals",
        body: [
          "Services are billed in advance for the billing cycle selected at checkout (monthly, annual, biennial, or triennial). Renewal reminders are sent before your billing date; failure to pay by the due date may result in service suspension.",
          "Discounted introductory pricing applies to the initial term only unless stated otherwise; renewal pricing will be communicated in advance of your renewal date.",
        ],
      },
      {
        heading: "Money-back guarantee",
        body: [
          "New shared hosting customers may request a full refund within 30 days of initial purchase. Domain registration fees, SSL certificates, and dedicated/VPS setup fees are non-refundable once provisioned, except where required by law.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "You agree not to use our services to host unlawful content, distribute malware, send unsolicited bulk email, or engage in activity that disrupts other customers or our infrastructure. See our Acceptable Use Policy for details.",
        ],
      },
      {
        heading: "Limitation of liability",
        body: [
          `To the maximum extent permitted by law, ${siteConfig.name} is not liable for indirect, incidental, or consequential damages arising from use of our services, including loss of data or revenue, beyond amounts paid for the service in the preceding billing cycle.`,
        ],
      },
      {
        heading: "Service availability",
        body: [
          "We target the uptime commitment described in our Service Level Agreement. Scheduled maintenance will be communicated in advance where practical.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "We may update these terms from time to time. Continued use of our services after an update constitutes acceptance of the revised terms.",
        ],
      },
    ],
  },
  "service-level-agreement": {
    slug: "service-level-agreement",
    title: "Service Level Agreement",
    summary: "Our uptime commitment and what happens if we don't meet it.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Uptime commitment",
        body: [
          "We target 99.9% network and server uptime per calendar month across our shared, VPS, and dedicated hosting infrastructure, excluding scheduled maintenance windows.",
        ],
      },
      {
        heading: "Scheduled maintenance",
        body: [
          "Planned maintenance that may affect availability is scheduled during low-traffic windows where possible and announced in advance via email or your client area.",
        ],
      },
      {
        heading: "Service credits",
        body: [
          "If monthly uptime falls below our commitment due to causes within our control, eligible customers may request a service credit against their next invoice, calculated on a sliding scale based on downtime duration.",
        ],
      },
      {
        heading: "Exclusions",
        body: [
          "This commitment does not cover downtime caused by factors outside our reasonable control, including third-party DNS/registrar issues, customer-side misconfiguration, force majeure events, or scheduled maintenance.",
        ],
      },
      {
        heading: "Requesting a credit",
        body: [
          `To request a service credit, contact ${siteConfig.contact.email} within 30 days of the incident with your account details and the dates/times affected.`,
        ],
      },
    ],
  },
  "acceptable-use-policy": {
    slug: "acceptable-use-policy",
    title: "Acceptable Use Policy",
    summary: "What is and isn't allowed on MagicWorks Host infrastructure.",
    lastUpdated: "August 7, 2026",
    sections: [
      {
        heading: "Prohibited content and activity",
        body: [
          "You may not use our services to host or distribute unlawful, infringing, or malicious content, including malware, phishing pages, or material that violates the intellectual property rights of others.",
        ],
      },
      {
        heading: "Resource usage",
        body: [
          "Shared hosting plans are intended for typical website workloads. Accounts that consume disproportionate CPU, memory, or I/O in a way that affects other customers may be asked to upgrade to a VPS or dedicated plan.",
        ],
      },
      {
        heading: "Email and anti-spam",
        body: [
          "Sending unsolicited bulk email (spam) from our infrastructure is strictly prohibited and may result in immediate suspension. Mailing lists must use confirmed opt-in and provide a working unsubscribe mechanism.",
        ],
      },
      {
        heading: "Security",
        body: [
          "You are responsible for keeping software on your hosting account (CMS platforms, plugins, scripts) updated. Compromised accounts may be temporarily suspended to protect other customers while the issue is resolved.",
        ],
      },
      {
        heading: "Enforcement",
        body: [
          "We may suspend or terminate services that violate this policy, with notice where practical. Repeated or severe violations may result in immediate termination without refund.",
        ],
      },
    ],
  },
}

export const legalSlugs = Object.keys(legalDocuments)
