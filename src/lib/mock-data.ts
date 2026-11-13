import type { StaticImageData } from 'next/image';
import setChairmanImage from '@/assets/set chairman.jpeg';
import isahMuhammadImage from '@/assets/Ex-boy Isah Muhammad .jpeg';
import ikennaUkonnaImage from '@/assets/Exboy Ikenna Ukonna.jpeg';
import isaacDanmusaImage from '@/assets/Exboy Isaac Danmusa.jpeg';
import ibrahimLasisiImage from '@/assets/Exboy Lt Ibrahim Lasisi.jpeg';
import masdBawaImage from '@/assets/Exboy Mas\'d Bawa.jpeg';
import sendeKaunImage from '@/assets/Exboy Sende Kaun.jpeg';
import michaelOrizuImage from '@/assets/Exboy NN Lt Michael Orizu.jpg';

export interface MemberProfile {
  id: string;
  name: string;
  nmsNo: string;
  squad: string;
  company: string;
  homeCell: string;
  phone: string;
  email: string;
  dob: string;
  stateOfOrigin: string;
  stateOfResidence: string;
  address?: string;
  maritalStatus: string;
  rankAppointment: string;
  setAppointment: string;
  occupation: string;
  industry: string;
  business: string;
  skills: string;
  professionalQualifications: string;
  bloodGroup?: string;
  genotype?: string;
  nextOfKin: string;
  relationship: string;
  nextOfKinPhone: string;
  membershipStatus: "Active" | "Pending Verification" | "Honorary" | "Inactive";
  duesStatus: {
    year2026: "Paid" | "Pending" | "Overdue";
    welfareLevy: "Paid" | "Pending";
    reunionLevy: "Paid" | "Pending";
    amountPaid: number;
    totalDue: number;
    lastPaymentDate: string;
  };
  avatarUrl: string;
  bio: string;
}



export interface NewsItem {
  id: string;
  title: string;
  category: "Governance" | "Welfare" | "Event" | "Remembrance" | "General";
  date: string;
  author: string;
  summary: string;
  content: string;
  imageUrl: string;
  isImportant?: boolean;
}

export interface LeaderProfile {
  id: string;
  name: string;
  role: string;
  nmsNo: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  imageUrl: string | StaticImageData;
}

export interface WelfareClaim {
  id: string;
  memberId: string;
  memberName: string;
  type: "Medical" | "Bereavement" | "Emergency" | "Celebration";
  amountRequested: number;
  status: "Approved" | "Under Review" | "Disbursed";
  dateFiled: string;
  description: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: "Constitution" | "Financial" | "AGM Minutes" | "Bylaws";
  date: string;
  fileSize: string;
  fileFormat: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "dues" | "welfare" | "event" | "general";
  isRead: boolean;
}

export const CURRENT_USER: MemberProfile = {
  id: "mem-08-001",
  name: "Chidi E. Abubakar",
  nmsNo: "NMS/08/4912",
  squad: "Platoon 2",
  company: "Alpha Company (Dragons)",
  homeCell: "Abuja Executive Chapter",
  phone: "+234 803 123 4567",
  email: "chidi.abubakar@nms08alumni.org",
  dob: "1992-05-14",
  stateOfOrigin: "Kano",
  stateOfResidence: "FCT Abuja",
  address: "12 Asokoro Drive, Abuja",
  maritalStatus: "Married",
  rankAppointment: "Ex-Boy Sergeant",
  setAppointment: "Assistant Set PRO",
  occupation: "Cybersecurity Architect",
  industry: "Technology",
  business: "Trinity Vote Ltd",
  skills: "Strategic Planning, Leadership, Python",
  professionalQualifications: "B.Sc Computer Science, CISSP",
  bloodGroup: "O+",
  genotype: "AA",
  nextOfKin: "Aisha Abubakar",
  relationship: "Spouse",
  nextOfKinPhone: "+234 802 999 8877",
  membershipStatus: "Active",
  duesStatus: {
    year2026: "Pending",
    welfareLevy: "Pending",
    reunionLevy: "Pending",
    amountPaid: 0,
    totalDue: 150000,
    lastPaymentDate: "-",
  },
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  bio: "Ex-Boy NMS 08 set. Dedicated to fostering brotherhood, technological innovation, and digital transformation for our set governance.",
};

export interface CompanyInfo {
  id: string;
  name: string;
  code: string;
  motto: string;
  commander: string;
  representative: string;
  secondInCommand?: string;
  color: string;
  bgClass: string;
  totalMembers: number;
  duesComplianceRate: number;
  description: string;
}

export const COMPANIES_LIST: CompanyInfo[] = [
  {
    id: "alpha",
    name: "Alpha Company",
    code: "AL",
    motto: "Alpha Radicals",
    commander: "Isaac Akomah",
    representative: "Isaac Akomah",
    secondInCommand: "Samuel Raji",
    color: "#2563eb",
    bgClass: "bg-blue-600",
    totalMembers: 0,
    duesComplianceRate: 0,
    description: "Company Rep: Isaac Akomah • 2IC: Samuel Raji",
  },
  {
    id: "bravo",
    name: "Bravo Company",
    code: "BR",
    motto: "Bravo Braves",
    commander: "Abdulaziz Mahmood",
    representative: "Abdulaziz Mahmood",
    color: "#eab308",
    bgClass: "bg-yellow-500",
    totalMembers: 0,
    duesComplianceRate: 0,
    description: "Company Rep: Abdulaziz Mahmood",
  },
  {
    id: "charlie",
    name: "Charlie Company",
    code: "CH",
    motto: "Charlie Champs",
    commander: "David Ejiga",
    representative: "David Ejiga",
    secondInCommand: "Mukaila Adaralohun",
    color: "#dc2626",
    bgClass: "bg-red-600",
    totalMembers: 0,
    duesComplianceRate: 0,
    description: "Company Rep: David Ejiga • 2IC: Mukaila Adaralohun",
  },
  {
    id: "delta",
    name: "Delta Company",
    code: "DE",
    motto: "Delta Force",
    commander: "Ghali Baba Makkau",
    representative: "Ghali Baba Makkau",
    secondInCommand: "Solomon Ogunlowo",
    color: "#16a34a",
    bgClass: "bg-green-600",
    totalMembers: 0,
    duesComplianceRate: 0,
    description: "Company Rep: Ghali Baba Makkau • 2IC: Solomon Ogunlowo",
  },
  {
    id: "echo",
    name: "Echo Company",
    code: "EC",
    motto: "Echo Lites",
    commander: "Christian Agboeze",
    representative: "Christian Agboeze",
    color: "#9333ea",
    bgClass: "bg-purple-600",
    totalMembers: 0,
    duesComplianceRate: 0,
    description: "Company Rep: Christian Agboeze",
  },
  {
    id: "foxtrot",
    name: "Foxtrot Company",
    code: "FX",
    motto: "Foxy Chochos",
    commander: "Samaila Ibrahim",
    representative: "Samaila Ibrahim",
    secondInCommand: "Chibuzor Good Hope",
    color: "#78350f",
    bgClass: "bg-amber-900",
    totalMembers: 0,
    duesComplianceRate: 0,
    description: "Company Rep: Samaila Ibrahim • 2IC: Chibuzor Good Hope",
  },
  {
    id: "golf",
    name: "Golf Company",
    code: "GO",
    motto: "Golfy Gangsters",
    commander: "Illiya Kurmi",
    representative: "Illiya Kurmi",
    secondInCommand: "Jerry Zaku",
    color: "#ec4899",
    bgClass: "bg-pink-500",
    totalMembers: 0,
    duesComplianceRate: 0,
    description: "Company Rep: Illiya Kurmi • 2IC: Jerry Zaku",
  },
];

export const LEADERSHIP_LIST: LeaderProfile[] = [
  {
    id: "lead-1",
    name: "Exboy Filani Victor Oluwasegun",
    role: "Chairman",
    nmsNo: "NMS/08/6614",
    company: "Executive Council",
    bio: "Chairman of the NMS 08 Alumni Executive Council steering set administration, strategic direction, and fraternal cohesion.",
    email: "Philex409@gmail.com",
    phone: "09035570695",
    imageUrl: setChairmanImage,
  },
  {
    id: "lead-2",
    name: "Exboy Isah Mohammed",
    role: "Vice Chairman/ Coordinator Coy Reps",
    nmsNo: "NMS/08/6672",
    company: "Executive Council",
    bio: "Vice Chairman and Coordinator of Company Representatives, harmonizing company activities and grassroots member mobilization.",
    email: "mnupeko@gmail.com",
    phone: "07031862211",
    imageUrl: isahMuhammadImage,
  },
  {
    id: "lead-3",
    name: "Exboy Ikenna Ukonna",
    role: "General Secretary",
    nmsNo: "NMS/08/6447",
    company: "Executive Council",
    bio: "General Secretary managing secretariat operations, records, official correspondence, and administrative documentation.",
    email: "Ukonnaikenna@gmail.com",
    phone: "08137685454",
    imageUrl: ikennaUkonnaImage,
  },
  {
    id: "lead-4",
    name: "Exboy Masud Bawa",
    role: "Public Relations Officer",
    nmsNo: "NMS/08/6603",
    company: "Executive Council",
    bio: "Public Relations Officer driving strategic communications, publicity, media relations, and brand identity across all platforms.",
    email: "mbawa920@gmail.com",
    phone: "09037768506",
    imageUrl: masdBawaImage,
  },
  {
    id: "lead-5",
    name: "Exboy Isaac Danmusa",
    role: "Financial secretary",
    nmsNo: "NMS/08/6666",
    company: "Executive Council",
    bio: "Financial Secretary managing financial compliance, dues accounting, treasury governance, and audit transparency.",
    email: "isaacdanmusa@gmail.com",
    phone: "09037843563",
    imageUrl: isaacDanmusaImage,
  },
  {
    id: "lead-6",
    name: "Exboy Sende Kaun",
    role: "Welfare",
    nmsNo: "NMS/08/6478",
    company: "Executive Council",
    bio: "Welfare Officer coordinating member welfare schemes, medical relief, emergency assistance, and fraternal solidarity.",
    email: "qaunjeff@gmail.com",
    phone: "08131566033",
    imageUrl: sendeKaunImage,
  },
  {
    id: "lead-7",
    name: "Exboy NN Lt Michael Orizu",
    role: "Special Adviser Governance & Strategy",
    nmsNo: "NMS/08/6460",
    company: "Executive Council",
    bio: "Special Adviser on Governance & Strategy providing high-level counsel on institutional policies, reforms, and long-term planning.",
    email: "mikedastrategy@gmail.com",
    phone: "09054216617",
    imageUrl: michaelOrizuImage,
  },
  {
    id: "lead-8",
    name: "Exboy Lt Ibrahim Lasisi",
    role: "Provost",
    nmsNo: "NMS/08/6623",
    company: "Executive Council",
    bio: "Provost maintaining order, constitutional decorum, discipline, and protocol during meetings and alumni engagements.",
    email: "leoken08139021350@gmail.com",
    phone: "09063286126",
    imageUrl: ibrahimLasisiImage,
  },
];

export const NEWS_LIST: NewsItem[] = [
  {
    id: "news-1",
    title: "NMS 08 Digital Governance Portal Officially Launched with Supabase Architecture",
    category: "Governance",
    date: "October 5, 2026",
    author: "National Secretariat",
    summary: "The Executive Council is proud to announce the inauguration of our state-of-the-art digital alumni portal for member verification, dues collection, and welfare management.",
    content: "The NMS Class of 2008 Alumni Association has taken a giant leap into modern digital governance. Built with modern web frameworks, glassmorphic UI, and Supabase security infrastructure, the portal allows Ex-Boys to manage profiles, pay dues, and access welfare support seamlessly.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    isImportant: true,
  },
  {
    id: "news-2",
    title: "Annual Welfare Scheme Reaches ₦25M Target for Ex-Boys Medical & Emergency Fund",
    category: "Welfare",
    date: "September 28, 2026",
    author: "Welfare Committee",
    summary: "Thanks to the generous contributions of class members across Nigeria and the Diaspora, the welfare reserve fund has hit an all-time record.",
    content: "The Welfare Committee overseen by Exboy Sende Kaun reports that 92% of active members have fulfilled their annual welfare levies. The fund continues to provide rapid relief for medical emergencies, bereavement aid, and business grants.",
    imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&q=80&w=800",
    isImportant: true,
  },
  {
    id: "news-3",
    title: "Preparations Underway for 18th Anniversary Reunion Gala in Abuja",
    category: "Event",
    date: "September 15, 2026",
    author: "Planning Committee",
    summary: "Mark your calendars for November 20-22, 2026 as Ex-Boys gather for three days of military nostalgia, networking, and celebration.",
    content: "The 2026 Reunion Planning Committee has finalized venue arrangements at the Transcorp Hilton Abuja. Events will include a military drill display, golf tournament, business symposium, and grand dinner.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "news-4",
    title: "Strategic Partnership with Military Veterans Association Announced",
    category: "Governance",
    date: "August 30, 2026",
    author: "National Executive Council",
    summary: "The NMS 08 Alumni Association has formalized a strategic partnership with the Military Veterans Association of Nigeria.",
    content: "This historic partnership will enable NMS 08 Ex-Boys to access veteran support programs, pension advisory services, and joint community development projects. The collaboration underscores our commitment to lifelong service and national development.",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800",
  },
];

export const WELFARE_CLAIMS: WelfareClaim[] = [
  {
    id: "wel-101",
    memberId: "mem-08-001",
    memberName: "Chidi E. Abubakar",
    type: "Medical",
    amountRequested: 350000,
    status: "Disbursed",
    dateFiled: "Aug 12, 2026",
    description: "Support for child's specialized pediatric procedure.",
  },
  {
    id: "wel-102",
    memberId: "mem-08-044",
    memberName: "Ex-Boy Lt. Commander K. Ahmed",
    type: "Celebration",
    amountRequested: 150000,
    status: "Approved",
    dateFiled: "Sep 04, 2026",
    description: "Set wedding congratulations grant.",
  },
  {
    id: "wel-103",
    memberId: "mem-08-099",
    memberName: "Ex-Boy Dr. O. Bello",
    type: "Emergency",
    amountRequested: 500000,
    status: "Under Review",
    dateFiled: "Oct 01, 2026",
    description: "Emergency relief for storm-damaged business facility.",
  },
];

export const DOCUMENTS_LIST: DocumentItem[] = [
  {
    id: "doc-1",
    title: "NMS Class of 2008 Revised Constitution 2025 (PDF)",
    category: "Constitution",
    date: "Jan 10, 2025",
    fileSize: "2.4 MB",
    fileFormat: "PDF",
  },
  {
    id: "doc-2",
    title: "Audited Financial Report & Treasury Statement 2025",
    category: "Financial",
    date: "Mar 15, 2026",
    fileSize: "4.1 MB",
    fileFormat: "PDF",
  },
  {
    id: "doc-3",
    title: "Minutes of the 17th National AGM in Lagos",
    category: "AGM Minutes",
    date: "Dec 05, 2025",
    fileSize: "1.8 MB",
    fileFormat: "PDF",
  },
  {
    id: "doc-4",
    title: "Welfare Scheme Operational Bylaws & Claim Guidelines",
    category: "Bylaws",
    date: "Feb 01, 2026",
    fileSize: "950 KB",
    fileFormat: "PDF",
  },
];

export const NOTIFICATIONS_LIST: NotificationItem[] = [
  {
    id: "notif-2",
    title: "Profile Update Reminder",
    message: "Please ensure your profile information is up to date for the upcoming reunion gala.",
    timestamp: "1 day ago",
    type: "general",
    isRead: false,
  },
  {
    id: "notif-4",
    title: "Grand Reunion Registration",
    message: "Your seat for the 18th Anniversary Reunion Gala in Abuja is reserved.",
    timestamp: "5 days ago",
    type: "event",
    isRead: true,
  },
];

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  postedAt: string;
  postedBy: string;
  severity: "info" | "warning" | "urgent";
  active: boolean;
}

export interface MemberRosterEntry {
  id: string;
  name: string;
  nmsNo: string;
  dob: string;
  company: string;
  bloodGroup: string;
  stateOfOrigin: string;
  stateOfResidence: string;
  occupation: string;
  industry: string;
  business: string;
  skills: string;
  professionalQualifications: string;
}

export const MEMBERS_ROSTER: MemberRosterEntry[] = [
  {
    id: "roster-001",
    name: "Chidi E. Abubakar",
    nmsNo: "NMS/08/4912",
    dob: "1992-05-14",
    company: "Alpha Company",
    bloodGroup: "O+",
    stateOfOrigin: "Kano",
    stateOfResidence: "FCT Abuja",
    occupation: "Cybersecurity Architect",
    industry: "Technology",
    business: "Trinity Vote Ltd",
    skills: "Strategic Planning, Leadership, Python",
    professionalQualifications: "B.Sc Computer Science, CISSP",
  },
  {
    id: "roster-002",
    name: "Ibrahim Musa",
    nmsNo: "NMS/08/4801",
    dob: "1990-10-16",
    company: "Alpha Company",
    bloodGroup: "A+",
    stateOfOrigin: "Kaduna",
    stateOfResidence: "Kaduna",
    occupation: "Military Officer (Capt.)",
    industry: "Defence",
    business: "Nigerian Army",
    skills: "Leadership, Tactics, Operations",
    professionalQualifications: "NDA, B.Sc Military Science",
  },
  {
    id: "roster-003",
    name: "Segun Adeleke",
    nmsNo: "NMS/08/4812",
    dob: "1991-08-22",
    company: "Bravo Company",
    bloodGroup: "B+",
    stateOfOrigin: "Oyo",
    stateOfResidence: "Lagos",
    occupation: "Consultant Physician",
    industry: "Healthcare",
    business: "Lagos Island Hospital",
    skills: "Diagnostics, Public Health, Research",
    professionalQualifications: "MBBS, FWACS",
  },
  {
    id: "roster-004",
    name: "Emeka Nwosu",
    nmsNo: "NMS/08/4820",
    dob: "1992-02-09",
    company: "Charlie Company",
    bloodGroup: "O-",
    stateOfOrigin: "Enugu",
    stateOfResidence: "FCT Abuja",
    occupation: "Civil Engineer",
    industry: "Construction",
    business: "Nwosu & Sons Engineering Ltd",
    skills: "Project Management, AutoCAD, Structural Analysis",
    professionalQualifications: "B.Eng Civil Engineering, MNSE",
  },
  {
    id: "roster-005",
    name: "Tunde Bakare",
    nmsNo: "NMS/08/4835",
    dob: "1991-11-30",
    company: "Delta Company",
    bloodGroup: "AB+",
    stateOfOrigin: "Ogun",
    stateOfResidence: "Lagos",
    occupation: "Legal Practitioner",
    industry: "Legal",
    business: "Bakare & Co. Chambers",
    skills: "Litigation, Corporate Law, Arbitration",
    professionalQualifications: "LLB, BL, LLM",
  },
  {
    id: "roster-006",
    name: "Usman Garba",
    nmsNo: "NMS/08/4842",
    dob: "1990-06-17",
    company: "Echo Company",
    bloodGroup: "A-",
    stateOfOrigin: "Borno",
    stateOfResidence: "FCT Abuja",
    occupation: "Investment Banker",
    industry: "Finance",
    business: "Garba Holdings Ltd",
    skills: "Portfolio Management, Negotiation, Risk Analysis",
    professionalQualifications: "B.Sc Economics, MBA, CFA",
  },
  {
    id: "roster-007",
    name: "Daniel Okon",
    nmsNo: "NMS/08/4850",
    dob: "1992-09-03",
    company: "Foxtrot Company",
    bloodGroup: "O+",
    stateOfOrigin: "Akwa Ibom",
    stateOfResidence: "Port Harcourt",
    occupation: "Major (Nigerian Army)",
    industry: "Defence",
    business: "Nigerian Army",
    skills: "Logistics, Command, Strategic Planning",
    professionalQualifications: "NDA, B.Sc Military Science",
  },
  {
    id: "roster-008",
    name: "Kazeem Bello",
    nmsNo: "NMS/08/4863",
    dob: "1991-04-25",
    company: "Golf Company",
    bloodGroup: "B+",
    stateOfOrigin: "Kwara",
    stateOfResidence: "Ilorin",
    occupation: "Software Engineer",
    industry: "Technology",
    business: "Bello Tech Solutions",
    skills: "JavaScript, Cloud Architecture, DevOps",
    professionalQualifications: "B.Sc Computer Science, AWS Certified",
  },
];

export const TICKER_MESSAGES: string[] = [
  "A friendly reminder to all Ex-Boys: 2026 statutory dues are ₦2,000 monthly (₦24,000 for the year, or ₦20,000 if paid in full upfront). Kindly keep your dues and welfare levies settled to support set governance and brotherhood initiatives.",
  "📢 The 2026 Virtual National AGM will hold on October 28, 2026 at 6:00 PM WAT. All Ex-Boys are enjoined to attend via the Digital Portal.",
  " Mark your calendars: The 18th Anniversary Reunion Gala holds November 20–22, 2026 at Transcorp Hilton, Abuja. Register today!",
  "⚖️ The Secretariat has published proposed amendments to the NMS 08 Constitution (2025 Revised). Members may review and submit comments via the Documents Library.",
  "🎖️ Discipline, Knowledge & Patriotism — the timeless motto of NMS Ex-Boys. Wear it with pride in all set engagements.",
  "💼 Welfare Committee reminds all Ex-Boys to update their medical emergency information (blood group, genotype, next of kin) on the Member Portal.",
];

export const GLOBAL_NOTIFICATIONS: GlobalNotification[] = [
  {
    id: "glob-1",
    title: "2026 AGM & Financial Presentation — October 28",
    message: "The National Secretariat hereby notifies all Ex-Boys that the 2026 Annual General Meeting will hold virtually on October 28, 2026 at 6:00 PM WAT. Quorum requirements apply.",
    postedAt: "October 12, 2026",
    postedBy: "Exboy Ikenna Ukonna (General Secretary)",
    severity: "info",
    active: true,
  },
  {
    id: "glob-2",
    title: "Constitutional Amendment Public Review Window Open",
    message: "The Constitutional Review Committee has opened a 14-day public review window for the proposed amendments to the NMS 08 Constitution. Members in good standing may submit written comments via the Documents Library.",
    postedAt: "October 5, 2026",
    postedBy: "Constitutional Review Committee",
    severity: "warning",
    active: true,
  },
  {
    id: "glob-3",
    title: "URGENT: Welfare Levy Defaulters List Update",
    message: "Members who are yet to settle their 2026 welfare levy are reminded that the deadline is October 31, 2026. Timely payment ensures uninterrupted access to welfare benefits.",
    postedAt: "October 8, 2026",
    postedBy: "Exboy Isaac Danmusa (Financial Secretary)",
    severity: "urgent",
    active: false,
  },
];

export const FINANCIAL_METRICS = {
  totalDuesCollected: 0,
  targetDues: 0,
  welfareFundBalance: 0,
  activeMembersCount: 0,
  totalSetMembers: 246,
  complianceRate: 0,
  monthlyDuesTrend: [],
  companyBreakdown: [
    { company: "Alpha", count: 0, compliance: 0 },
    { company: "Bravo", count: 0, compliance: 0 },
    { company: "Charlie", count: 0, compliance: 0 },
    { company: "Delta", count: 0, compliance: 0 },
    { company: "Echo", count: 0, compliance: 0 },
    { company: "Foxtrot", count: 0, compliance: 0 },
    { company: "Golf", count: 0, compliance: 0 },
  ],
};
