/**
 * Every public form on the site, defined once.
 *
 * Shared deliberately between the browser and the Express/Vercel handler:
 * the client renders and validates from these definitions, and the server
 * validates against the same list before composing the notification email.
 * A single definition means a field cannot be added to a form and then be
 * silently dropped from the email because the server never heard of it.
 *
 * This file must stay free of Node and React imports — it is bundled into
 * the browser build and imported by the serverless function.
 */

export interface FormField {
  /** Submitted key; also the input's name attribute. */
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  /** Renders full-width in the two-column registration grid. */
  wide?: boolean;
}

export interface FormDef {
  /** Subject line and heading for the email. */
  title: string;
  /** Field whose value becomes the email's Reply-To. */
  replyToField?: string;
  fields: FormField[];
}

export const FORMS = {
  contact: {
    title: "Contact Enquiry",
    replyToField: "email",
    fields: [
      { name: "name", label: "Full Name", required: true },
      { name: "email", label: "Work Email", type: "email", required: true },
      { name: "organization", label: "Organization" },
      { name: "interest", label: "Interested In" },
      { name: "message", label: "Message", type: "textarea", required: true },
    ],
  },

  newsletter: {
    title: "Briefing Subscription",
    replyToField: "email",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
  },

  corporate: {
    title: "Corporate Advisory Request",
    replyToField: "email",
    fields: [
      { name: "organization", label: "Organization", required: true },
      { name: "email", label: "Corporate Email", type: "email", required: true },
      { name: "teamSize", label: "Team Size / Focus Area" },
    ],
  },

  application: {
    title: "Cohort Application",
    replyToField: "email",
    fields: [
      { name: "name", label: "Full Name", required: true },
      { name: "role", label: "Current Title & Organization", required: true },
      { name: "email", label: "Work Email", type: "email", required: true },
      { name: "course", label: "Programme" },
    ],
  },

  // Asking for the syllabus is a lead like any other, so it is captured
  // rather than handed over anonymously.
  syllabus: {
    title: "Syllabus Request",
    replyToField: "email",
    fields: [
      { name: "name", label: "Full Name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "course", label: "Programme" },
    ],
  },

  // ── Registration ──────────────────────────────────────────────────────
  // Applications rather than accounts: there is no user database, so these
  // reach the admissions inbox and are actioned by a person. Wording on the
  // page says so, to avoid promising a login that does not exist yet.
  student: {
    title: "Student Registration",
    replyToField: "email",
    fields: [
      { name: "name", label: "Full Name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true },
      { name: "location", label: "City & Country", required: true },
      {
        name: "school",
        label: "School of Interest",
        type: "select",
        required: true,
        options: [
          "School of Leadership",
          "School of Business & Entrepreneurship",
          "School of Technology & Innovation",
          "School of Finance & Wealth",
          "School of Personal Development",
          "Not sure yet — advise me",
        ],
      },
      {
        name: "level",
        label: "Current Career Level",
        type: "select",
        options: [
          "Student / Entry level",
          "Mid-level professional",
          "Senior manager",
          "Director / Executive",
          "Founder / Business owner",
        ],
      },
      {
        name: "format",
        label: "Preferred Format",
        type: "select",
        options: ["Online (self-paced)", "Online (live cohort)", "In-person", "Hybrid"],
      },
      {
        name: "goals",
        label: "What do you want to achieve?",
        type: "textarea",
        required: true,
        placeholder: "Tell us where you are now and where you want to be...",
        wide: true,
      },
    ],
  },

  mentor: {
    title: "Mentor Application",
    replyToField: "email",
    fields: [
      { name: "name", label: "Full Name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true },
      { name: "role", label: "Current Title & Organization", required: true },
      { name: "location", label: "City & Country", required: true },
      {
        name: "expertise",
        label: "Primary Area of Expertise",
        type: "select",
        required: true,
        options: [
          "Leadership & Governance",
          "Business & Entrepreneurship",
          "Technology & Innovation",
          "Finance & Wealth",
          "Career & Personal Development",
        ],
      },
      {
        name: "experience",
        label: "Years of Experience",
        type: "select",
        required: true,
        options: ["3 - 5 years", "6 - 10 years", "11 - 20 years", "20+ years"],
      },
      {
        name: "availability",
        label: "Availability per Month",
        type: "select",
        options: ["1 - 2 sessions", "3 - 5 sessions", "6 - 10 sessions", "Flexible"],
      },
      {
        name: "linkedin",
        label: "LinkedIn / Portfolio URL",
        type: "url",
        placeholder: "https://linkedin.com/in/...",
        wide: true,
      },
      {
        name: "bio",
        label: "Professional Background",
        type: "textarea",
        required: true,
        placeholder: "Summarise your experience and who you are best placed to mentor...",
        wide: true,
      },
    ],
  },
} satisfies Record<string, FormDef>;

export type FormKey = keyof typeof FORMS;
