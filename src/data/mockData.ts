import { Course, FacultyMember, Testimonial, StudentProgress, School, Mentor, EventItem, BlogPost } from '../types';

export const FEATURED_COURSE: Course = {
  id: 'exec-strategy-growth',
  title: 'Executive Strategy & Global Growth',
  schoolId: 'leadership',
  schoolName: 'School of Leadership',
  duration: '12 Weeks',
  level: 'Executive',
  format: 'Live Cohort + 1-on-1 AI Mentorship',
  instructorName: 'Dr. Adebayo Okonkwo, PhD',
  instructorRole: 'Senior Fellow at Oxford & Former Managing Director at McKinsey',
  instructorAvatar: '/people/m3-okonkwo.jpg',
  rating: 4.96,
  reviewCount: 342,
  status: 'Next Cohort Starts Oct 15 â€¢ 4 Seats Remaining',
  heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
  description: 'An intensive 12-week executive mastery program engineered for C-Suite leaders, Managing Directors, and Founders navigating hyper-scale growth, market disruption, and geopolitical complexity.',
  price: '$4,800 USD (Sponsorship Available)',
  featured: true,
  outcomes: [
    'Formulate resilient 5-year global expansion and market entry playbooks.',
    'Deploy institutional AI capabilities to streamline corporate decision velocity.',
    'Master high-stakes boardroom negotiations and stakeholder alignment frameworks.',
    'Incorporate geopolitical and currency risk hedges into capital allocation models.',
    'Build high-performance executive teams capable of cross-border execution.',
    'Construct an actionable Capstone Strategic Roadmap vetted by industry peers.'
  ],
  modules: [
    {
      week: 'Weeks 1 - 3',
      title: 'Foundations of Global Scaling & Strategic Foresight',
      description: 'Understanding macro-economic expansion triggers, competitive defensive moats, and strategic foresight methodologies.',
      topics: [
        'Macro-Economic Expansion Frameworks',
        'Competitive Moat Analysis in Volatile Markets',
        'Strategic Foresight & Scenario Planning'
      ]
    },
    {
      week: 'Weeks 4 - 6',
      title: 'Operational Excellence, AI Integration & Tech Leverage',
      description: 'Leveraging modern AI infrastructure to transform organizational speed and reduce operational overhead.',
      topics: [
        'Institutional AI Deployment',
        'Algorithmic Governance & Compliance',
        'Optimizing Executive Decision Velocity'
      ]
    },
    {
      week: 'Weeks 7 - 9',
      title: 'Geopolitical Risk & Capital Allocation Strategy',
      description: 'Navigating international regulatory trade-offs, foreign market risk, and venture balance sheet optimization.',
      topics: [
        'Geopolitical Trade & Regulatory Risk',
        'Cross-Border M&A and Joint Ventures',
        'Capital Allocation & Balance Sheet Defense'
      ]
    },
    {
      week: 'Weeks 10 - 12',
      title: 'The Capstone Strategic Roadmap & Boardroom Defense',
      description: 'Synthesizing course frameworks into a board-ready institutional growth playbook presented to executive advisors.',
      topics: [
        'Developing the 5-Year Master Roadmap',
        'Boardroom Simulation & Crisis Defense',
        'Final Executive Panel Review & Certification'
      ]
    }
  ]
};

export const COURSES: Course[] = [
  FEATURED_COURSE,
  {
    id: 'resilient-leadership',
    title: 'Resilient Leadership in Crisis Command',
    schoolId: 'leadership',
    schoolName: 'School of Leadership',
    duration: '8 Weeks',
    level: 'Executive',
    format: 'Cohort-based',
    instructorName: 'Dr. Ngozi Okafor',
    instructorRole: 'Harvard Business School Fellow & Leadership Strategist',
    instructorAvatar: '/people/w1-okafor.jpg',
    rating: 4.92,
    reviewCount: 218,
    status: 'Enrolling for November Cohort',
    heroImage: '/scenes/leadership-meeting.jpg',
    description: 'Develop psychological stamina, rapid crisis communication, and adaptive command structures during systemic market shocks.',
    price: '$3,200 USD',
    outcomes: [
      'Establish Crisis Command Centers within 4 hours of market triggers.',
      'Maintain stakeholder trust during high-volatility events.',
      'Lead cross-functional turnarounds with high psychological safety.'
    ],
    modules: []
  },
  {
    id: 'algorithmic-strategy',
    title: 'Algorithmic Strategy & AI Governance',
    schoolId: 'tech',
    schoolName: 'School of Tech & AI',
    duration: '10 Weeks',
    level: 'Senior Directorate',
    format: 'Self-Paced + Live Labs',
    instructorName: 'Dr. Amara Balogun',
    instructorRole: 'Former Chief AI Officer at DeepTech Global',
    instructorAvatar: '/people/w3-balogun.jpg',
    rating: 4.98,
    reviewCount: 412,
    status: 'Instant Access Available',
    heroImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    description: 'Demystify enterprise AI architectures, LLM fine-tuning governance, and automated risk detection for modern tech directors.',
    price: '$3,900 USD',
    outcomes: [
      'Audit enterprise AI workflows for bias and security risks.',
      'Implement AI agentic workflows in financial and operational units.',
      'Measure ROI on multi-million dollar tech investments.'
    ],
    modules: []
  },
  {
    id: 'global-growth-masters',
    title: 'The Global Growth Masters Fellowship',
    schoolId: 'coaching',
    schoolName: 'Executive Coaching',
    duration: '24 Weeks',
    level: 'Executive',
    format: '1-on-1 Mentorship + C-Suite Boardroom',
    instructorName: 'Emeka Nwachukwu',
    instructorRole: 'Venture Partner & Ex-Fortune 100 CEO',
    instructorAvatar: '/people/m4-nwachukwu.jpg',
    rating: 5.0,
    reviewCount: 89,
    status: 'Application Only â€¢ Limited 15 Seats',
    heroImage: '/scenes/coaching-collab.jpg',
    description: 'An elite 6-month immersive fellowship pairing high-potential executives directly with global industry visionaries.',
    price: '$12,500 USD',
    outcomes: [
      'Direct monthly 1-on-1 strategic mentorship with seasoned Fortune 500 CEOs.',
      'Proprietary access to the Global Growth Alumni Syndicate.',
      'Custom AI performance analytics dashboard tracking executive trajectory.'
    ],
    modules: []
  },
  {
    id: 'global-corporate-finance',
    title: 'Global Corporate Finance & Valuation',
    schoolId: 'finance',
    schoolName: 'School of Finance',
    duration: '10 Weeks',
    level: 'Senior Directorate',
    format: 'Live Cohort + Case Labs',
    instructorName: 'Dr. Folake Adeyemi',
    instructorRole: 'Former Head of Valuation at Goldman Sachs',
    instructorAvatar: '/people/w2-adeyemi.jpg',
    rating: 4.94,
    reviewCount: 176,
    status: 'Enrolling for Winter Cohort',
    heroImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    description: 'Master enterprise valuation, capital structuring, and cross-border M&A modeling used by global investment committees.',
    price: '$4,200 USD',
    outcomes: [
      'Build institutional-grade DCF and comparable valuation models.',
      'Structure capital stacks for high-growth and distressed scenarios.',
      'Lead M&A due diligence and post-merger integration planning.'
    ],
    modules: []
  },
  {
    id: 'venture-scaling-mastery',
    title: 'Venture Scaling & Market Disruption',
    schoolId: 'business',
    schoolName: 'School of Business',
    duration: '8 Weeks',
    level: 'Emerging Leaders',
    format: 'Self-Paced + Live Labs',
    instructorName: 'Emeka Nwachukwu',
    instructorRole: 'General Partner at Apex Ventures',
    instructorAvatar: '/people/m4-nwachukwu.jpg',
    rating: 4.9,
    reviewCount: 254,
    status: 'Instant Access Available',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    description: 'A tactical playbook for founders and intrapreneurs scaling from product-market fit to category leadership.',
    price: '$2,900 USD',
    outcomes: [
      'Design repeatable go-to-market and revenue engines.',
      'Raise and deploy growth capital with disciplined unit economics.',
      'Build defensible moats against fast-following competitors.'
    ],
    modules: []
  },
  {
    id: 'personal-mastery-systems',
    title: 'Personal Mastery & Peak Performance Systems',
    schoolId: 'personal',
    schoolName: 'Personal Development School',
    duration: '6 Weeks',
    level: 'Emerging Leaders',
    format: 'Self-Paced + Weekly Coaching',
    instructorName: 'Dr. Ngozi Okafor',
    instructorRole: 'Executive Coach & Organizational Psychologist',
    instructorAvatar: '/people/w1-okafor.jpg',
    rating: 4.97,
    reviewCount: 431,
    status: 'Instant Access Available',
    heroImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800',
    description: 'Build the habits, mindset, and energy-management systems that sustain high performance under pressure.',
    price: '$1,600 USD',
    outcomes: [
      'Engineer daily systems for focus, resilience, and recovery.',
      'Apply behavioural design to build durable executive habits.',
      'Develop an executive presence and communication toolkit.'
    ],
    modules: []
  }
];

// â”€â”€ Schools & Faculties (14) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const SCHOOLS: School[] = [
  {
    id: 'leadership',
    name: 'Leadership School',
    code: 'SOL',
    iconName: 'Crown',
    tagline: 'Transformational C-Suite Governance',
    overview: 'The flagship faculty raising transformational leaders through adaptive decision-making, crisis resilience, and high-stakes organizational alignment.',
    programCount: 12,
    keyTopics: ['Executive Foresight', 'High-Stakes Governance', 'Adaptive Crisis Management', 'Board Leadership'],
    careerPaths: ['C-Suite Executive', 'Managing Director', 'Board Director', 'Chief of Staff'],
    certifications: ['Certified Executive Leader (CEL)', 'Board Governance Fellow'],
    accentColor: 'blue'
  },
  {
    id: 'business',
    name: 'Business School',
    code: 'SOB',
    iconName: 'TrendingUp',
    tagline: 'Venture Scaling & Global Strategy',
    overview: 'Equip executives with global capital allocation frameworks, M&A strategy, and market disruption tactics for hyper-scale growth.',
    programCount: 18,
    keyTopics: ['Capital Allocation', 'M&A & Restructuring', 'Go-To-Market', 'Venture Expansion'],
    careerPaths: ['Founder / CEO', 'Chief Strategy Officer', 'Business Unit Director', 'Growth Lead'],
    certifications: ['Certified Growth Strategist', 'Venture Scaling Professional'],
    accentColor: 'emerald'
  },
  {
    id: 'finance',
    name: 'Finance School',
    code: 'SOF',
    iconName: 'Landmark',
    tagline: 'Capital Markets & Institutional Finance',
    overview: 'Master corporate finance, valuation, risk, and capital structuring used by global investment committees and CFOs.',
    programCount: 14,
    keyTopics: ['Corporate Valuation', 'Capital Structuring', 'Risk Management', 'Investment Strategy'],
    careerPaths: ['Chief Financial Officer', 'Investment Director', 'Portfolio Manager', 'Treasury Lead'],
    certifications: ['Certified Corporate Finance Professional', 'Institutional Valuation Fellow'],
    accentColor: 'amber'
  },
  {
    id: 'tech',
    name: 'Technology School',
    code: 'SOT',
    iconName: 'Cpu',
    tagline: 'Institutional AI & Frontier Systems',
    overview: 'Lead enterprise AI deployment, algorithmic governance, cloud transformation, and frontier system architecture.',
    programCount: 24,
    keyTopics: ['Enterprise AI Strategy', 'Algorithmic Risk', 'Cloud Transformation', 'Web3 & Quantum'],
    careerPaths: ['Chief Technology Officer', 'Chief AI Officer', 'Head of Engineering', 'Digital Transformation Lead'],
    certifications: ['Certified AI Governance Officer', 'Enterprise Architecture Fellow'],
    accentColor: 'indigo'
  },
  {
    id: 'engineering',
    name: 'Engineering School',
    code: 'SOE',
    iconName: 'Cog',
    tagline: 'Systems, Infrastructure & Reliability',
    overview: 'Advanced engineering leadership across infrastructure, manufacturing systems, and large-scale program delivery.',
    programCount: 11,
    keyTopics: ['Systems Engineering', 'Reliability & Safety', 'Program Delivery', 'Industrial Automation'],
    careerPaths: ['VP of Engineering', 'Program Director', 'Principal Engineer', 'Operations Head'],
    certifications: ['Certified Engineering Leader', 'Systems Reliability Fellow'],
    accentColor: 'slate'
  },
  {
    id: 'agriculture',
    name: 'Agriculture School',
    code: 'SOA',
    iconName: 'Sprout',
    tagline: 'Agribusiness & Food Systems',
    overview: 'Modern agribusiness leadership, agri-tech adoption, and resilient food-system supply chains for global markets.',
    programCount: 8,
    keyTopics: ['Agri-Tech', 'Food Security', 'Sustainable Farming', 'Agribusiness Finance'],
    careerPaths: ['Agribusiness Executive', 'Food Systems Director', 'Agri-Tech Founder', 'Supply Chain Lead'],
    certifications: ['Certified Agribusiness Leader', 'Sustainable Food Systems Fellow'],
    accentColor: 'emerald'
  },
  {
    id: 'health',
    name: 'Health School',
    code: 'SOH',
    iconName: 'HeartPulse',
    tagline: 'Healthcare Leadership & Systems',
    overview: 'Executive leadership for healthcare systems, digital health, and public-health policy and administration.',
    programCount: 10,
    keyTopics: ['Health Systems', 'Digital Health', 'Clinical Governance', 'Public Health Policy'],
    careerPaths: ['Hospital CEO', 'Chief Medical Officer', 'Health Policy Director', 'Digital Health Lead'],
    certifications: ['Certified Health Systems Leader', 'Digital Health Fellow'],
    accentColor: 'rose'
  },
  {
    id: 'creative',
    name: 'Creative Arts School',
    code: 'SCA',
    iconName: 'Palette',
    tagline: 'Design, Media & Creative Enterprise',
    overview: 'Build and scale creative enterprises across design, media, brand, and the modern content economy.',
    programCount: 9,
    keyTopics: ['Brand & Design Strategy', 'Media Production', 'Creative Direction', 'Content Economy'],
    careerPaths: ['Creative Director', 'Chief Brand Officer', 'Studio Founder', 'Media Executive'],
    certifications: ['Certified Creative Enterprise Leader', 'Brand Strategy Fellow'],
    accentColor: 'purple'
  },
  {
    id: 'education',
    name: 'Education School',
    code: 'SED',
    iconName: 'GraduationCap',
    tagline: 'Learning Design & Institutional Leadership',
    overview: 'Lead educational institutions and design transformative learning experiences at scale.',
    programCount: 7,
    keyTopics: ['Curriculum Design', 'EdTech', 'Institutional Leadership', 'Learning Science'],
    careerPaths: ['Institution Director', 'Head of Learning', 'EdTech Founder', 'Academic Dean'],
    certifications: ['Certified Learning Leader', 'Institutional Governance Fellow'],
    accentColor: 'teal'
  },
  {
    id: 'law',
    name: 'Law & Governance School',
    code: 'SLG',
    iconName: 'Scale',
    tagline: 'Regulation, Compliance & Public Policy',
    overview: 'Corporate governance, regulatory strategy, compliance, and public-policy leadership for complex jurisdictions.',
    programCount: 9,
    keyTopics: ['Corporate Governance', 'Regulatory Strategy', 'Compliance', 'Public Policy'],
    careerPaths: ['General Counsel', 'Chief Compliance Officer', 'Policy Director', 'Governance Advisor'],
    certifications: ['Certified Governance Professional', 'Regulatory Strategy Fellow'],
    accentColor: 'amber'
  },
  {
    id: 'construction',
    name: 'Construction School',
    code: 'SOC',
    iconName: 'HardHat',
    tagline: 'Built Environment & Project Leadership',
    overview: 'Leadership for large-scale construction, real estate development, and capital project delivery.',
    programCount: 8,
    keyTopics: ['Project Delivery', 'Real Estate Development', 'Cost & Risk Control', 'Sustainable Building'],
    careerPaths: ['Development Director', 'Project Executive', 'Real Estate Principal', 'Construction Head'],
    certifications: ['Certified Construction Leader', 'Capital Projects Fellow'],
    accentColor: 'orange'
  },
  {
    id: 'oilgas',
    name: 'Oil & Gas School',
    code: 'SOG',
    iconName: 'Flame',
    tagline: 'Energy, Resources & Transition',
    overview: 'Executive leadership across upstream, downstream, and the strategic energy transition to sustainable resources.',
    programCount: 8,
    keyTopics: ['Energy Strategy', 'Resource Economics', 'HSE Governance', 'Energy Transition'],
    careerPaths: ['Energy Executive', 'Operations Director', 'Resource Strategy Lead', 'Sustainability Head'],
    certifications: ['Certified Energy Leader', 'Energy Transition Fellow'],
    accentColor: 'red'
  },
  {
    id: 'career',
    name: 'Career Development School',
    code: 'SCD',
    iconName: 'Briefcase',
    tagline: 'Career Acceleration & Professional Growth',
    overview: 'Accelerate professional trajectories with career strategy, executive presence, and job-market positioning.',
    programCount: 12,
    keyTopics: ['Career Strategy', 'Executive Presence', 'Personal Branding', 'Interview Mastery'],
    careerPaths: ['Any Function', 'Career Switchers', 'Rising Managers', 'Consultants'],
    certifications: ['Certified Career Strategist', 'Professional Growth Fellow'],
    accentColor: 'blue'
  },
  {
    id: 'personal',
    name: 'Personal Development School',
    code: 'SPD',
    iconName: 'Sparkles',
    tagline: 'Mindset, Habits & Peak Performance',
    overview: 'Build the mindset, habits, and performance systems that sustain lifelong growth and impact.',
    programCount: 15,
    keyTopics: ['Peak Performance', 'Habit Design', 'Emotional Intelligence', 'Wealth Mindset'],
    careerPaths: ['All Professionals', 'Entrepreneurs', 'Leaders', 'Lifelong Learners'],
    certifications: ['Certified Personal Mastery Practitioner', 'Peak Performance Fellow'],
    accentColor: 'teal'
  }
];

// â”€â”€ Mentor Marketplace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: 'Dr. Adebayo Okonkwo',
    role: 'Former Managing Director, McKinsey',
    expertise: ['Global Strategy', 'Board Governance', 'Market Entry'],
    location: 'Lagos, Nigeria',
    bio: 'Advisor to 20+ Fortune 500 boards on international expansion and capital allocation.',
    rating: 4.98,
    sessions: 640,
    rate: '$450 / session',
    availability: 'Limited',
    avatar: '/people/m3-okonkwo.jpg',
    featured: true
  },
  {
    id: 'm2',
    name: 'Dr. Ngozi Okafor',
    role: 'Executive Coach & Organizational Psychologist',
    expertise: ['Leadership', 'Executive Presence', 'Team Dynamics'],
    location: 'Abuja, Nigeria',
    bio: 'Pioneered adaptive leadership models used by multinational technology conglomerates.',
    rating: 4.99,
    sessions: 812,
    rate: '$380 / session',
    availability: 'Available',
    avatar: '/people/w1-okafor.jpg',
    featured: true
  },
  {
    id: 'm3',
    name: 'Emeka Nwachukwu',
    role: 'General Partner, Apex Ventures',
    expertise: ['Fundraising', 'Venture Scaling', 'M&A'],
    location: 'Lagos, Nigeria',
    bio: 'Led 14 tech IPOs and managed over $3.2B in venture growth capital.',
    rating: 5.0,
    sessions: 305,
    rate: '$600 / session',
    availability: 'Waitlist',
    avatar: '/people/m4-nwachukwu.jpg',
    featured: true
  },
  {
    id: 'm4',
    name: 'Dr. Amara Balogun',
    role: 'Former Chief AI Officer',
    expertise: ['AI Governance', 'Digital Transformation', 'Data Strategy'],
    location: 'Lagos, Nigeria',
    bio: 'Pioneer in ethical AI governance, agentic systems, and neural network risk modeling.',
    rating: 4.97,
    sessions: 428,
    rate: '$520 / session',
    availability: 'Available',
    avatar: '/people/w3-balogun.jpg'
  },
  {
    id: 'm5',
    name: 'Dr. Folake Adeyemi',
    role: 'Former Head of Valuation, Goldman Sachs',
    expertise: ['Corporate Finance', 'Valuation', 'Capital Markets'],
    location: 'Abuja, Nigeria',
    bio: 'Structured multi-billion-dollar cross-border transactions across Africa and EMEA.',
    rating: 4.95,
    sessions: 376,
    rate: '$490 / session',
    availability: 'Limited',
    avatar: '/people/w2-adeyemi.jpg'
  },
  {
    id: 'm6',
    name: 'James Okoro',
    role: 'Energy & Infrastructure Executive',
    expertise: ['Energy Strategy', 'Large Projects', 'Public-Private Partnerships'],
    location: 'Port Harcourt, Nigeria',
    bio: 'Directed $2B+ in energy infrastructure programs across three continents.',
    rating: 4.92,
    sessions: 214,
    rate: '$340 / session',
    availability: 'Available',
    avatar: '/people/m1-okoro.jpg'
  }
];

// â”€â”€ Events Platform â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Global Growth Summit 2024',
    type: 'Conference',
    date: 'Oct 28â€“30, 2024',
    time: '09:00 WAT',
    location: 'Lagos + Livestream',
    mode: 'Hybrid',
    speaker: 'Dr. Adebayo Okonkwo & 40+ Global Leaders',
    description: 'Our flagship three-day summit on institutional growth, AI governance, and geopolitical strategy for the world\'s top executives.',
    price: 'From $1,200',
    seatsLeft: 42,
    image: '/scenes/summit-audience.jpg'
  },
  {
    id: 'e2',
    title: 'AI Governance for Boards',
    type: 'Webinar',
    date: 'Nov 12, 2024',
    time: '16:00 WAT',
    location: 'Virtual',
    mode: 'Virtual',
    speaker: 'Dr. Amara Balogun',
    description: 'A 90-minute executive briefing on the metrics, risks, and controls boards need to govern enterprise AI.',
    price: 'Free',
    seatsLeft: 480,
    image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'e3',
    title: 'Executive Crisis Command Bootcamp',
    type: 'Bootcamp',
    date: 'Nov 18â€“20, 2024',
    time: '10:00 WAT',
    location: 'Abuja, Nigeria',
    mode: 'In-Person',
    speaker: 'Dr. Ngozi Okafor',
    description: 'An intensive three-day simulation bootcamp on leading organizations through systemic market shocks.',
    price: '$2,400',
    seatsLeft: 18,
    image: '/scenes/bootcamp-team.jpg'
  },
  {
    id: 'e4',
    title: 'Venture Scaling Masterclass',
    type: 'Workshop',
    date: 'Dec 03, 2024',
    time: '15:00 WAT',
    location: 'Virtual',
    mode: 'Virtual',
    speaker: 'Emeka Nwachukwu',
    description: 'A hands-on workshop for founders on building repeatable revenue engines and raising growth capital.',
    price: '$350',
    seatsLeft: 120,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'e5',
    title: 'Women in Executive Leadership Summit',
    type: 'Virtual Summit',
    date: 'Dec 10, 2024',
    time: '13:00 WAT',
    location: 'Virtual',
    mode: 'Virtual',
    speaker: 'Dr. Folake Adeyemi & Global Panel',
    description: 'A global virtual summit spotlighting pathways to the C-suite and boardroom for emerging women leaders.',
    price: 'Free',
    seatsLeft: 900,
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'e6',
    title: 'Corporate Finance & Valuation Seminar',
    type: 'Seminar',
    date: 'Dec 16, 2024',
    time: '14:00 WAT',
    location: 'Lagos, Nigeria',
    mode: 'Hybrid',
    speaker: 'Dr. Folake Adeyemi',
    description: 'A practitioner seminar on institutional-grade valuation, capital structuring, and M&A modeling.',
    price: '$650',
    seatsLeft: 60,
    image: '/scenes/finance-documents.jpg'
  }
];

// â”€â”€ Blog & Knowledge Centre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    slug: 'governing-enterprise-ai',
    title: 'Governing Enterprise AI: A Board-Level Playbook',
    category: 'Technology',
    excerpt: 'The controls, metrics, and accountability structures every board needs before deploying AI at scale.',
    author: 'Dr. Amara Balogun',
    authorRole: 'Chair of Artificial Intelligence',
    readTime: '8 min read',
    date: 'Oct 18, 2024',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    featured: true
  },
  {
    id: 'b2',
    slug: 'five-year-expansion-roadmap',
    title: 'How to Structure a Resilient 5-Year Global Expansion Roadmap',
    category: 'Strategy',
    excerpt: 'A step-by-step framework for sequencing market entry while hedging geopolitical and currency risk.',
    author: 'Dr. Adebayo Okonkwo',
    authorRole: 'Dean of Executive Leadership',
    readTime: '11 min read',
    date: 'Oct 09, 2024',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    featured: true
  },
  {
    id: 'b3',
    slug: 'leading-through-crisis',
    title: 'Leading Through Crisis: The First 72 Hours',
    category: 'Leadership',
    excerpt: 'What high-performing executives do in the critical window after a systemic shock hits the organization.',
    author: 'Dr. Ngozi Okafor',
    authorRole: 'Chair of Organizational Dynamics',
    readTime: '7 min read',
    date: 'Sep 30, 2024',
    image: '/scenes/leadership-meeting.jpg'
  },
  {
    id: 'b4',
    slug: 'capital-allocation-discipline',
    title: 'Capital Allocation Discipline in Volatile Markets',
    category: 'Finance',
    excerpt: 'Why the best CFOs treat capital allocation as a repeatable system, not a series of one-off bets.',
    author: 'Dr. Folake Adeyemi',
    authorRole: 'Institutional Finance Faculty',
    readTime: '9 min read',
    date: 'Sep 22, 2024',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'b5',
    slug: 'wealth-mindset-for-founders',
    title: 'The Wealth Mindset Every Founder Needs',
    category: 'Wealth Creation',
    excerpt: 'Reframing risk, patience, and compounding to build durable long-term wealth as an entrepreneur.',
    author: 'Emeka Nwachukwu',
    authorRole: 'Director of Venture Scaling',
    readTime: '6 min read',
    date: 'Sep 14, 2024',
    image: '/scenes/wealth-planning.jpg'
  },
  {
    id: 'b6',
    slug: 'building-high-performance-habits',
    title: 'Building High-Performance Habits That Actually Stick',
    category: 'Personal Growth',
    excerpt: 'The behavioural-design principles behind habits that survive stress, travel, and busy quarters.',
    author: 'Dr. Ngozi Okafor',
    authorRole: 'Executive Coach',
    readTime: '5 min read',
    date: 'Sep 05, 2024',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'
  }
];

// â”€â”€ "What our users say" â€” testimonials columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const USER_TESTIMONIALS = [
  {
    text: 'The Executive Strategy program reshaped how our board approaches global expansion. We entered three new markets with far more conviction and discipline.',
    image: '/people/w4-eze.jpg',
    name: 'Chidinma Eze',
    role: 'COO, Zenith Global Tech',
  },
  {
    text: 'Growth AI and the boardroom simulations transformed how we evaluate geopolitical risk. It is now core to our executive committee cadence.',
    image: '/people/m4-nwachukwu.jpg',
    name: 'Yusuf Bello',
    role: 'Managing Director, Sahara Sovereign Capital',
  },
  {
    text: 'As a founder scaling past $100M ARR, the 1-on-1 mentorship accelerated our M&A strategy by two full years. The ROI was immediate.',
    image: '/people/w1-okafor.jpg',
    name: 'Amaka Obi',
    role: 'Founder & CEO, Aether Systems',
  },
  {
    text: 'The faculty are genuine operators, not lecturers. Every framework was something I applied in the boardroom the very next week.',
    image: '/people/m1-okoro.jpg',
    name: 'Ibrahim Sani',
    role: 'Group CEO, Meridian Holdings',
  },
  {
    text: 'Our leadership academy for 200 senior managers was delivered flawlessly. The reporting dashboards made impact easy to prove to the board.',
    image: '/people/w3-balogun.jpg',
    name: 'Funmilayo Adebayo',
    role: 'Chief People Officer, Helix Industries',
  },
  {
    text: 'The capital allocation module alone paid for the entire program. Disciplined, practical, and immediately usable at the CFO level.',
    image: '/people/w2-adeyemi.jpg',
    name: 'Zainab Yusuf',
    role: 'CFO, Sterling Capital Partners',
  },
  {
    text: 'The AI governance track gave our board the exact controls and metrics we were missing before deploying AI across the enterprise.',
    image: '/people/m2-okeke.jpg',
    name: 'Olusegun Adeyinka',
    role: 'Board Director, Continental Energy',
  },
  {
    text: 'World-class peer network. The alumni syndicate opened doors and partnerships I could not have accessed any other way.',
    image: '/people/w4-eze.jpg',
    name: 'Blessing Nwafor',
    role: 'SVP Strategy, Astra Global',
  },
  {
    text: 'Rigorous, high-stakes, and deeply practical. The crisis command bootcamp changed how our entire executive team operates under pressure.',
    image: '/people/m3-okonkwo.jpg',
    name: 'Musa Danladi',
    role: 'President, Sahel Infrastructure Group',
  },
];

export const IMPACT_STATS = [
  { label: 'Global Alumni', value: '10,000+' },
  { label: 'Nations Represented', value: '50+' },
  { label: 'Corporate Partners', value: '200+' },
  { label: 'Career Acceleration', value: '94%' }
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'f1',
    name: 'Dr. Adebayo Okonkwo, PhD',
    role: 'Dean of Executive Leadership',
    institution: 'Former Managing Director at McKinsey & Oxford Fellow',
    bio: 'Advisor to 20+ Fortune 500 boards on international expansion and capital allocation.',
    credentials: ['PhD Economics, Oxford', 'Published Author on Global Resilience', 'Special Envoy for Tech Policy'],
    avatar: '/people/m3-okonkwo.jpg'
  },
  {
    id: 'f2',
    name: 'Dr. Ngozi Okafor',
    role: 'Chair of Organizational Dynamics',
    institution: 'Harvard Business School Fellow',
    bio: 'Pioneered adaptive leadership models used by multinational technology conglomerates.',
    credentials: ['DBA Harvard Business School', 'Executive Coach to Fortune 100 CEOs'],
    avatar: '/people/w1-okafor.jpg'
  },
  {
    id: 'f3',
    name: 'Emeka Nwachukwu',
    role: 'Director of Venture Scaling',
    institution: 'General Partner at Apex Ventures',
    bio: 'Led 14 tech IPOs and managed over $3.2B in venture growth capital.',
    credentials: ['MBA Stanford GSB', 'Board Director at 5 Global Unicorns'],
    avatar: '/people/m4-nwachukwu.jpg'
  },
  {
    id: 'f4',
    name: 'Dr. Amara Balogun',
    role: 'Chair of Artificial Intelligence',
    institution: 'Former Chief AI Officer & MIT Research Fellow',
    bio: 'Pioneer in ethical AI governance, agentic systems, and neural network risk modeling.',
    credentials: ['PhD Computer Science, MIT', 'Advisor to African Union Tech Council'],
    avatar: '/people/w3-balogun.jpg'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote: 'School of Growth Global provided the strategic clarity necessary to scale our African division across 14 new territories while boosting gross margins by 28%.',
    author: 'Chidinma Eze',
    role: 'Chief Operating Officer',
    organization: 'Zenith Global Tech',
    avatar: '/people/w4-eze.jpg',
    metric: '28% Margin Increase'
  },
  {
    id: 't2',
    quote: 'The Growth AI Coach and boardroom simulations transformed how our executive committee evaluates geopolitical capital exposure. Essential for modern C-Suites.',
    author: 'Yusuf Bello',
    role: 'Managing Director',
    organization: 'Sahara Sovereign Capital',
    avatar: '/people/m4-nwachukwu.jpg',
    metric: '$1.2B Capital Hedged'
  },
  {
    id: 't3',
    quote: 'As a tech founder scaling past $100M ARR, the 1-on-1 executive mentorship and curriculum accelerated our M&A strategy by two full years.',
    author: 'Amaka Obi',
    role: 'Founder & CEO',
    organization: 'Aether Systems',
    avatar: '/people/w1-okafor.jpg',
    metric: 'Accelerated $100M+ M&A'
  }
];

export const STUDENT_DATA: StudentProgress = {
  name: 'Chidi Okeke',
  title: 'VP of Global Strategy',
  company: 'Nexus International',
  tier: 'Level 4 Executive Tier',
  avatar: '/people/m2-okeke.jpg',
  completionPercentage: 45,
  daysAhead: 12,
  completedCourses: 3,
  totalCertificates: 2,
  studyHours: 47,
  activeTracks: [
    {
      id: 'track-1',
      title: 'High-Stakes Decision Making & Boardroom Strategy',
      schoolName: 'Leadership School',
      progressPercentage: 68,
      nextModule: 'Module 4: Boardroom Simulation & Defense',
      dueDate: 'Oct 24, 2024',
      modulesCompleted: 4,
      moduleCount: 6,
      instructorName: 'Dr. Adebayo Okonkwo',
      instructorAvatar: '/people/m3-okonkwo.jpg'
    },
    {
      id: 'track-2',
      title: 'Algorithmic Strategy Design & Enterprise AI',
      schoolName: 'Technology School',
      progressPercentage: 22,
      nextModule: 'Module 2: Neural Architecture Audit',
      dueDate: 'Nov 02, 2024',
      modulesCompleted: 1,
      moduleCount: 5,
      instructorName: 'Dr. Amara Balogun',
      instructorAvatar: '/people/w3-balogun.jpg'
    }
  ],
  upcoming: [
    {
      id: 'session-1',
      title: 'Boardroom Simulation: Defending a Capital Reallocation',
      type: 'Live Class',
      date: 'Oct 18, 2024',
      time: '14:00 WAT',
      mode: 'Virtual',
      host: 'Dr. Adebayo Okonkwo'
    },
    {
      id: 'session-2',
      title: 'One-to-one Mentor Review',
      type: 'Mentor Session',
      date: 'Oct 21, 2024',
      time: '09:30 WAT',
      mode: 'Virtual',
      host: 'Dr. Ngozi Okafor'
    },
    {
      id: 'session-3',
      title: 'Module 4 Written Assessment',
      type: 'Assessment',
      date: 'Oct 24, 2024',
      time: '23:59 WAT',
      mode: 'Virtual',
      host: 'Leadership School'
    },
    {
      id: 'session-4',
      title: 'Enterprise AI Governance Workshop',
      type: 'Workshop',
      date: 'Oct 29, 2024',
      time: '11:00 WAT',
      mode: 'In-Person',
      host: 'Dr. Amara Balogun'
    }
  ],
  certificates: [
    {
      id: 'cert-1',
      title: 'Strategic Foresight & Scenario Planning',
      status: 'Earned',
      issued: 'Jun 12, 2024',
      credentialId: 'SGG-SF-2024-0418'
    },
    {
      id: 'cert-2',
      title: 'Executive Communication & Influence',
      status: 'Earned',
      issued: 'Aug 03, 2024',
      credentialId: 'SGG-EC-2024-0771'
    },
    {
      id: 'cert-3',
      title: 'C-Suite Boardroom Defense',
      status: 'In Progress',
      progressPercentage: 68,
      target: 'Oct 24, 2024'
    },
    {
      id: 'cert-4',
      title: 'Global Growth Fellow',
      status: 'Locked',
      target: 'Q1 2025'
    }
  ],
  mentor: {
    name: 'Dr. Ngozi Okafor',
    role: 'Executive Coach & Organizational Psychologist',
    avatar: '/people/w1-okafor.jpg',
    nextSession: 'Oct 21, 2024 Â· 09:30 WAT'
  }
};

export const CORPORATE_PARTNERS = [
  'McKinsey & Company',
  'Dangote Group',
  'MTN Group',
  'Microsoft',
  'Access Bank',
  'Flutterwave',
  'Deloitte',
  'Andela'
];
