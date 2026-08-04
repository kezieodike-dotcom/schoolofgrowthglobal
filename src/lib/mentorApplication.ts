/**
 * The mentor registration form, defined as data.
 *
 * Every step, field, rule and error message lives here; the view renders it
 * and knows nothing about what a mentor is asked. That separation is what
 * makes the form cheap to change — adding a question is one entry in this
 * file, and it automatically gains validation, draft saving, the review
 * screen and its line in the application email.
 *
 * Kept free of React imports so it stays a plain description of the form.
 */

export type MentorFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "chips"
  | "cards";

export type FieldValue = string | string[];

export interface MentorField {
  name: string;
  label: string;
  type: MentorFieldType;
  required?: boolean;
  placeholder?: string;
  /** Sits under the input; explains why we ask or what "good" looks like. */
  help?: string;
  options?: string[];
  /** Full width in the two-column step grid. */
  wide?: boolean;
  maxLength?: number;
  minLength?: number;
  /** chips only: how many must be picked. */
  minSelected?: number;
  maxSelected?: number;
  /** cards only: a short line under each option label. */
  optionHints?: Record<string, string>;
  autoComplete?: string;
}

export interface MentorStep {
  id: string;
  title: string;
  /** One sentence under the step title, telling the applicant why it matters. */
  blurb: string;
  fields: MentorField[];
}

// ── Option lists ─────────────────────────────────────────────────────────
// Named separately so the same vocabulary can seed the mentor directory's
// filters when applications start feeding real data into it.

export const EXPERTISE_AREAS = [
  "Leadership & Governance",
  "Business & Entrepreneurship",
  "Technology & Innovation",
  "Finance & Wealth",
  "Career & Personal Development",
];

export const SPECIALISMS = [
  "Strategy",
  "Board Governance",
  "Fundraising",
  "M&A",
  "Market Entry",
  "Operations",
  "Product",
  "Engineering Leadership",
  "AI & Data",
  "Cybersecurity",
  "Corporate Finance",
  "Valuation",
  "Investment",
  "Sales & Growth",
  "Marketing & Brand",
  "People & Culture",
  "Executive Presence",
  "Public Policy",
  "Energy & Infrastructure",
  "Healthcare",
  "Supply Chain",
  "Legal & Compliance",
];

export const INDUSTRIES = [
  "Banking & Financial Services",
  "Technology & Software",
  "Telecommunications",
  "Oil, Gas & Energy",
  "Healthcare & Pharma",
  "Manufacturing",
  "Retail & FMCG",
  "Agriculture & Agribusiness",
  "Real Estate & Construction",
  "Media & Entertainment",
  "Public Sector & NGOs",
  "Professional Services",
  "Education",
  "Logistics & Transport",
];

export const LANGUAGES = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Pidgin",
  "French",
  "Arabic",
  "Portuguese",
  "Swahili",
];

export const SESSION_FORMATS = [
  "1-on-1 video call",
  "Group mentoring",
  "In-person (my city)",
  "Async written reviews",
  "Workshop facilitation",
];

export const MENTEE_LEVELS = [
  "Students & graduates",
  "Early-career professionals",
  "Mid-level managers",
  "Senior managers",
  "Directors & executives",
  "Founders & business owners",
];

// ── Steps ────────────────────────────────────────────────────────────────

export const MENTOR_STEPS: MentorStep[] = [
  {
    id: "about",
    title: "About you",
    blurb: "How we reach you, and the name that will appear on your profile.",
    fields: [
      {
        name: "name",
        label: "Full name",
        type: "text",
        required: true,
        placeholder: "Dr. Adebayo Okonkwo",
        autoComplete: "name",
      },
      {
        name: "email",
        label: "Email address",
        type: "email",
        required: true,
        placeholder: "you@organisation.com",
        autoComplete: "email",
        help: "We reply here. Use an address you check.",
      },
      {
        name: "phone",
        label: "Phone / WhatsApp",
        type: "tel",
        required: true,
        placeholder: "+234 801 234 5678",
        autoComplete: "tel",
      },
      {
        name: "location",
        label: "City & country",
        type: "text",
        required: true,
        placeholder: "Lagos, Nigeria",
        help: "Shown on your profile so mentees can find someone local.",
      },
      {
        name: "title",
        label: "Current title",
        type: "text",
        required: true,
        placeholder: "Managing Director",
      },
      {
        name: "organization",
        label: "Organisation",
        type: "text",
        required: true,
        placeholder: "Apex Ventures",
      },
      {
        name: "linkedin",
        label: "LinkedIn profile",
        type: "url",
        required: true,
        placeholder: "https://linkedin.com/in/...",
        wide: true,
        help: "We verify every mentor's record before listing them.",
      },
    ],
  },

  {
    id: "expertise",
    title: "Your expertise",
    blurb: "What you are qualified to teach, and who has already paid you for it.",
    fields: [
      {
        name: "area",
        label: "Primary school",
        type: "cards",
        required: true,
        options: EXPERTISE_AREAS,
        wide: true,
        help: "The school your mentoring sits under. You can cover more than one in practice.",
        optionHints: {
          "Leadership & Governance": "Boards, strategy, executive decision-making",
          "Business & Entrepreneurship": "Founding, scaling, operations, go-to-market",
          "Technology & Innovation": "Engineering, product, AI, digital transformation",
          "Finance & Wealth": "Corporate finance, investment, valuation, capital",
          "Career & Personal Development": "Progression, presence, transitions, coaching",
        },
      },
      {
        name: "specialisms",
        label: "Specialisms",
        type: "chips",
        required: true,
        options: SPECIALISMS,
        wide: true,
        minSelected: 2,
        maxSelected: 6,
        help: "Pick 2 to 6. These become the searchable tags on your profile.",
      },
      {
        name: "experience",
        label: "Years of experience",
        type: "select",
        required: true,
        options: ["3 - 5 years", "6 - 10 years", "11 - 20 years", "20+ years"],
      },
      {
        name: "seniority",
        label: "Highest role held",
        type: "select",
        required: true,
        options: [
          "Manager",
          "Senior manager",
          "Director",
          "VP / Executive",
          "C-suite",
          "Founder / Owner",
          "Board member",
        ],
      },
      {
        name: "industries",
        label: "Industries you know",
        type: "chips",
        required: true,
        options: INDUSTRIES,
        wide: true,
        minSelected: 1,
        maxSelected: 5,
        help: "Up to 5.",
      },
    ],
  },

  {
    id: "practice",
    title: "How you mentor",
    blurb: "Your working pattern, so we only match you with mentees you can serve.",
    fields: [
      {
        name: "formats",
        label: "Session formats you offer",
        type: "chips",
        required: true,
        options: SESSION_FORMATS,
        wide: true,
        minSelected: 1,
        help: "Choose everything you are willing to do.",
      },
      {
        name: "menteeLevels",
        label: "Who you want to mentor",
        type: "chips",
        required: true,
        options: MENTEE_LEVELS,
        wide: true,
        minSelected: 1,
      },
      {
        name: "availability",
        label: "Sessions per month",
        type: "select",
        required: true,
        options: [
          "1 - 2 sessions",
          "3 - 5 sessions",
          "6 - 10 sessions",
          "More than 10",
          "Flexible",
        ],
      },
      {
        name: "startDate",
        label: "Earliest you can start",
        type: "select",
        required: true,
        options: [
          "Immediately",
          "Within 2 weeks",
          "Within a month",
          "Next quarter",
        ],
      },
      {
        name: "languages",
        label: "Languages you mentor in",
        type: "chips",
        required: true,
        options: LANGUAGES,
        wide: true,
        minSelected: 1,
      },
    ],
  },

  {
    id: "record",
    title: "Your record",
    blurb:
      "The part our faculty team actually reads. Specifics beat adjectives every time.",
    fields: [
      {
        name: "bio",
        label: "Professional background",
        type: "textarea",
        required: true,
        wide: true,
        minLength: 120,
        maxLength: 900,
        placeholder:
          "Summarise your career, the scale you have operated at, and the kind of problem you are best placed to help with...",
        help: "This becomes your public profile. Write it for a mentee deciding whether to pick you.",
      },
      {
        name: "achievement",
        label: "One result you are known for",
        type: "textarea",
        required: true,
        wide: true,
        minLength: 40,
        maxLength: 400,
        placeholder:
          "e.g. Led the ₦4.2B Series B for a fintech, taking it from 40 to 300 staff in 18 months.",
        help: "A number and an outcome. This is what separates a strong application.",
      },
      {
        name: "philosophy",
        label: "Your mentoring approach",
        type: "textarea",
        maxLength: 400,
        wide: true,
        placeholder:
          "How you run a session, what you expect from a mentee, and what they should expect from you...",
        help: "Optional, but applications that include it are approved faster.",
      },
      {
        name: "referral",
        label: "How did you hear about us?",
        type: "select",
        options: [
          "A current mentor",
          "A student or alumnus",
          "LinkedIn",
          "Search engine",
          "An event or conference",
          "Press or media",
          "Other",
        ],
      },
    ],
  },
];

// ── Validation ───────────────────────────────────────────────────────────

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Deliberately permissive: international formats, spaces, dashes and brackets
// all appear in real numbers. This rejects obvious junk, not unusual dialling.
const PHONE = /^[+()\d][\d\s()-]{7,}$/;
const URL = /^https?:\/\/.+\..+/i;

/** The consent boxes on the final step. All three are required. */
export const CONSENTS = [
  {
    name: "consentAccuracy",
    label:
      "Everything I have entered is accurate, and I agree to School of Growth verifying my professional record.",
  },
  {
    name: "consentConduct",
    label:
      "I agree to the mentor code of conduct, including confidentiality and professional boundaries with mentees.",
  },
  {
    name: "consentListing",
    label:
      "I consent to my name, photo, role and background appearing on the public mentor directory once approved.",
  },
];

/**
 * Validates one field. Returns an error message, or null when valid.
 *
 * Messages say what to do rather than what went wrong ("Pick at least 2"),
 * because an applicant reading an error wants the fix, not the diagnosis.
 */
export function validateField(field: MentorField, raw: FieldValue): string | null {
  const isList = Array.isArray(raw);
  const list = isList ? (raw as string[]) : [];
  const text = isList ? "" : String(raw ?? "").trim();

  if (field.type === "chips") {
    const min = field.minSelected ?? (field.required ? 1 : 0);
    if (list.length < min) {
      return min === 1 ? "Choose at least one." : `Choose at least ${min}.`;
    }
    if (field.maxSelected && list.length > field.maxSelected) {
      return `Choose no more than ${field.maxSelected}.`;
    }
    return null;
  }

  if (field.required && !text) return "This is required.";
  if (!text) return null;

  if (field.type === "email" && !EMAIL.test(text)) {
    return "Enter a valid email address.";
  }
  if (field.type === "tel" && !PHONE.test(text)) {
    return "Enter a valid phone number, including country code.";
  }
  if (field.type === "url" && !URL.test(text)) {
    return "Enter a full URL, starting with https://";
  }
  if (field.minLength && text.length < field.minLength) {
    return `Write at least ${field.minLength} characters — ${
      field.minLength - text.length
    } to go.`;
  }
  if (field.maxLength && text.length > field.maxLength) {
    return `Keep this under ${field.maxLength} characters.`;
  }
  return null;
}

/** Every error in a step, keyed by field name. Empty means the step passes. */
export function validateStep(
  step: MentorStep,
  values: Record<string, FieldValue>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of step.fields) {
    const error = validateField(field, values[field.name] ?? (field.type === "chips" ? [] : ""));
    if (error) errors[field.name] = error;
  }
  return errors;
}

/** Blank values for every field, so inputs are controlled from first render. */
export function emptyValues(): Record<string, FieldValue> {
  const values: Record<string, FieldValue> = {};
  for (const step of MENTOR_STEPS) {
    for (const field of step.fields) {
      values[field.name] = field.type === "chips" ? [] : "";
    }
  }
  return values;
}

/**
 * Flattens the answers into the [label, value] pairs the application email
 * carries, in the order they were asked.
 */
export function toEmailEntries(
  values: Record<string, FieldValue>
): [string, string][] {
  const entries: [string, string][] = [];
  for (const step of MENTOR_STEPS) {
    for (const field of step.fields) {
      const value = values[field.name];
      const text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
      if (text.trim()) entries.push([field.label, text]);
    }
  }
  return entries;
}
