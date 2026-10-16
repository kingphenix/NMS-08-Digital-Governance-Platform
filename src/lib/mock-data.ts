import type { StaticImageData } from 'next/image';
import setChairmanImage from '@/assets/set chairman.jpeg';

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

export interface CompanyInfo {
  id: string;
  name: string;
  code: string;
  motto: string;
  commander: string;
  color: string;
  totalMembers: number;
  duesComplianceRate: number;
  description: string;
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

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: "AGM" | "Reunion" | "Welfare" | "Sports" | "Gala";
  description: string;
  attendeesCount: number;
  isRegistered?: boolean;
  bannerUrl: string;
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

export interface ElectionCandidate {
  id: string;
  name: string;
  position: string;
  nmsNo: string;
  company: string;
  manifesto: string;
  votesCount: number;
  avatarUrl: string;
}

export interface Election {
  id: string;
  title: string;
  status: "Active" | "Upcoming" | "Closed";
  endDate: string;
  totalEligibleVoters: number;
  totalVotesCast: number;
  userHasVoted: boolean;
  candidates: ElectionCandidate[];
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
  type: "dues" | "election" | "welfare" | "event" | "general";
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
    year2026: "Paid",
    welfareLevy: "Paid",
    reunionLevy: "Paid",
    amountPaid: 150000,
    totalDue: 150000,
    lastPaymentDate: "Jan 14, 2026",
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
    motto: "First in Battle, Foremost in Victory",
    commander: "Ex-Boy Capt. Ibrahim Musa",
    color: "#2563eb",
    bgClass: "bg-blue-600",
    totalMembers: 72,
    duesComplianceRate: 94,
    description: "Home of the Dragons. Known for exemplary military discipline and leadership excellence.",
  },
  {
    id: "bravo",
    name: "Bravo Company",
    code: "BR",
    motto: "Brave Hearts, Unshakable Resolve",
    commander: "Ex-Boy Dr. Segun Adeleke",
    color: "#eab308",
    bgClass: "bg-yellow-500",
    totalMembers: 68,
    duesComplianceRate: 88,
    description: "The Bulls. Demonstrating tactical intelligence, camaraderie, and unmatched sportsmanship.",
  },
  {
    id: "charlie",
    name: "Charlie Company",
    code: "CH",
    motto: "Courage, Honor and Valor",
    commander: "Ex-Boy Engr. Emeka Nwosu",
    color: "#dc2626",
    bgClass: "bg-red-600",
    totalMembers: 65,
    duesComplianceRate: 91,
    description: "The Chargers. Steadfast in commitment to set welfare and academic prowess.",
  },
  {
    id: "delta",
    name: "Delta Company",
    code: "DE",
    motto: "Defenders of Honor",
    commander: "Ex-Boy Barr. Tunde Bakare",
    color: "#16a34a",
    bgClass: "bg-green-600",
    totalMembers: 70,
    duesComplianceRate: 85,
    description: "The Eagles. Pioneering governance reforms and financial sustainability initiatives.",
  },
  {
    id: "echo",
    name: "Echo Company",
    code: "EC",
    motto: "Ever Ready, Ever True",
    commander: "Ex-Boy Usman Garba",
    color: "#9333ea",
    bgClass: "bg-purple-600",
    totalMembers: 64,
    duesComplianceRate: 89,
    description: "The Falcons. Celebrated for high camaraderie, diaspora network, and welfare support.",
  },
  {
    id: "foxtrot",
    name: "Foxtrot Company",
    code: "FX",
    motto: "Fierce in Duty, Faithful in Friendship",
    commander: "Ex-Boy Major Daniel Okon",
    color: "#78350f",
    bgClass: "bg-amber-900",
    totalMembers: 66,
    duesComplianceRate: 92,
    description: "The Foxes. Demonstrating tactical precision and strong commitment to set development.",
  },
  {
    id: "gulf",
    name: "Gulf Company",
    code: "GF",
    motto: "Guardians of the Legacy",
    commander: "Ex-Boy Kazeem Bello",
    color: "#ec4899",
    bgClass: "bg-pink-500",
    totalMembers: 60,
    duesComplianceRate: 90,
    description: "The Giants. Upholding the sacred traditions of the Nigerian Military School.",
  },
];

export const LEADERSHIP_LIST: LeaderProfile[] = [
  {
    id: "lead-1",
    name: "Ex-Boy Filani Victor",
    role: "Set Chairman",
    nmsNo: "NMS/08/xxx",
    company: "Delta Company",
    bio: "Visionary military leader and strategist serving as the President of the NMS 08 Alumni Executive Council.",
    email: "president@nms08alumni.org",
    phone: "+234 802 000 1122",
    imageUrl: setChairmanImage,
  },
  {
    id: "lead-2",
    name: "Ex-Boy Dr. Aminu Bello",
    role: "Vice President",
    nmsNo: "NMS/08/4834",
    company: "Bravo Company",
    bio: "Consultant Physician and healthcare policymaker coordinating set chapters and global diaspora networks.",
    email: "vp@nms08alumni.org",
    phone: "+234 803 111 2233",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "lead-3",
    name: "Ex-Boy Barr. Obinna Eze",
    role: "Secretary General",
    nmsNo: "NMS/08/4890",
    company: "Charlie Company",
    bio: "Corporate lawyer steering constitutional reforms, digital governance, and administrative operations.",
    email: "secgen@nms08alumni.org",
    phone: "+234 805 222 3344",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "lead-4",
    name: "Ex-Boy Alh. Farouk Sanusi",
    role: "Financial Secretary",
    nmsNo: "NMS/08/4915",
    company: "Delta Company",
    bio: "Chartered accountant and treasury specialist managing set dues, investments, and audit transparency.",
    email: "finsec@nms08alumni.org",
    phone: "+234 809 333 4455",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "lead-5",
    name: "Ex-Boy Major Rotimi Williams",
    role: "National Welfare Officer",
    nmsNo: "NMS/08/4950",
    company: "Echo Company",
    bio: "Dedicated welfare pioneer managing medical assistance, bereavement funds, and emergency relief.",
    email: "welfare@nms08alumni.org",
    phone: "+234 801 444 5566",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "lead-6",
    name: "Ex-Boy Engr. Kabir Ahmed",
    role: "Public Relations Officer (PRO)",
    nmsNo: "NMS/08/4988",
    company: "Foxtrot Company",
    bio: "Communications strategist championing media outreach, brand identity, and alumni publications.",
    email: "pro@nms08alumni.org",
    phone: "+234 807 555 6677",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
  },
];

export const NEWS_LIST: NewsItem[] = [
  {
    id: "news-1",
    title: "NMS 08 Digital Governance Portal Officially Launched with Supabase Architecture",
    category: "Governance",
    date: "October 5, 2026",
    author: "National Secretariat",
    summary: "The Executive Council is proud to announce the inauguration of our state-of-the-art digital alumni portal for member verification, dues collection, and voting.",
    content: "The NMS Class of 2008 Alumni Association has taken a giant leap into modern digital governance. Built with modern web frameworks, glassmorphic UI, and Supabase security infrastructure, the portal allows Ex-Boys to manage profiles, pay dues, vote in set elections, and access welfare support seamlessly.",
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
    content: "The Welfare Committee chaired by Ex-Boy Major Rotimi Williams reports that 92% of active members have fulfilled their annual welfare levies. The fund continues to provide rapid relief for medical emergencies, bereavement aid, and business grants.",
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
    title: "Notice of 2026 Executive Council Elections & Nomination Guidelines",
    category: "Governance",
    date: "August 30, 2026",
    author: "Electoral Committee (ELCOM)",
    summary: "Nominations are now open for the positions of President, Secretary General, and Financial Secretary.",
    content: "ELCOM announces that electronic voting will open on October 25, 2026 via the Digital Portal. All financial members in good standing are eligible to submit candidate manifestos.",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800",
  },
];

export const EVENTS_LIST: EventItem[] = [
  {
    id: "evt-1",
    title: "NMS 08 Grand Reunion Gala & Business Summit 2026",
    date: "November 20-22, 2026",
    time: "09:00 AM (WAT)",
    location: "Transcorp Hilton Convention Center, Abuja",
    category: "Reunion",
    description: "The flagship annual gathering of NMS 08 Ex-Boys featuring keynote speeches, company drills, networking, and gala dinner.",
    attendeesCount: 215,
    isRegistered: true,
    bannerUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "evt-2",
    title: "Virtual National AGM & Financial Presentation Q3",
    date: "October 28, 2026",
    time: "06:00 PM (WAT)",
    location: "Online (Zoom & Portal Live Stream)",
    category: "AGM",
    description: "Annual General Meeting to review 2026 financial audits, approve constitutional amendments, and conduct ELCOM voting.",
    attendeesCount: 340,
    isRegistered: false,
    bannerUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "evt-3",
    title: "Inter-Company Military Drill & Veterans Sports Day",
    date: "December 12, 2026",
    time: "07:30 AM (WAT)",
    location: "NMS Sports Complex, Zaria",
    category: "Sports",
    description: "Revisit the parade grounds! Inter-company football, tug of war, obstacle course, and squad parade in Zaria.",
    attendeesCount: 180,
    isRegistered: false,
    bannerUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800",
  },
];

export const ELECTION_DATA: Election = {
  id: "elc-2026",
  title: "2026 NMS 08 Executive Committee Elections",
  status: "Active",
  endDate: "October 30, 2026",
  totalEligibleVoters: 485,
  totalVotesCast: 0,
  userHasVoted: false,
  candidates: [
    {
      id: "cand-1",
      name: "Ex-Boy Col. Victor Danjuma (Rtd)",
      position: "National President",
      nmsNo: "NMS/08/4801",
      company: "Alpha Company",
      manifesto: "Strengthening set unity, expanding welfare fund investments to ₦50M, and creating an Ex-Boy venture incubator.",
      votesCount: 0,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: "cand-2",
      name: "Ex-Boy Dr. Segun Adeleke",
      position: "National President",
      nmsNo: "NMS/08/4812",
      company: "Bravo Company",
      manifesto: "Enhancing health insurance schemes for all Ex-Boys, digital transparency, and international chapter expansion.",
      votesCount: 0,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    }
  ]
};

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
    id: "notif-1",
    title: "2026 Dues Payment Confirmed",
    message: "Your annual dues payment of ₦150,000 for 2026 was received. Official receipt #NMS08-8921 is available.",
    timestamp: "2 hours ago",
    type: "dues",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Elections Voting Open",
    message: "You have successfully cast your ballot for the 2026 NMS 08 Executive Committee Elections.",
    timestamp: "1 day ago",
    type: "election",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Welfare Grant Disbursed",
    message: "Welfare disbursement #WEL-101 has been credited to your verified bank account.",
    timestamp: "3 days ago",
    type: "welfare",
    isRead: true,
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
    company: "Gulf Company",
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
  "A friendly reminder to all Ex-Boys: kindly ensure your 2026 annual dues and welfare levies are settled to support set governance and brotherhood initiatives.",
  "📢 The 2026 Virtual National AGM will hold on October 28, 2026 at 6:00 PM WAT. All Ex-Boys are enjoined to attend via the Digital Portal.",
  "🗳️ Voting is now OPEN for the 2026 NMS 08 Executive Committee Elections. Cast your ballot via the Member Dashboard before October 30.",
  "📅 Mark your calendars: The 18th Anniversary Reunion Gala holds November 20–22, 2026 at Transcorp Hilton, Abuja. Register today!",
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
    postedBy: "Ex-Boy Barr. Obinna Eze (Secretary General)",
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
    message: "Members who are yet to settle their 2026 welfare levy are reminded that the deadline is October 31, 2026. Failure to comply may affect voting eligibility in the ongoing elections.",
    postedAt: "October 8, 2026",
    postedBy: "Ex-Boy Alh. Farouk Sanusi (Financial Secretary)",
    severity: "urgent",
    active: false,
  },
];

export const FINANCIAL_METRICS = {
  totalDuesCollected: 36500000, // NGN
  targetDues: 40000000,
  welfareFundBalance: 24800000,
  activeMembersCount: 445,
  totalSetMembers: 485,
  complianceRate: 91.7, // %
  monthlyDuesTrend: [
    { month: "Jan", amount: 8.5 },
    { month: "Feb", amount: 5.2 },
    { month: "Mar", amount: 4.1 },
    { month: "Apr", amount: 3.8 },
    { month: "May", amount: 2.9 },
    { month: "Jun", amount: 3.4 },
    { month: "Jul", amount: 2.1 },
    { month: "Aug", amount: 2.8 },
    { month: "Sep", amount: 3.7 },
  ],
  companyBreakdown: [
    { company: "Alpha", count: 72, compliance: 94 },
    { company: "Bravo", count: 68, compliance: 88 },
    { company: "Charlie", count: 65, compliance: 91 },
    { company: "Delta", count: 70, compliance: 85 },
    { company: "Echo", count: 64, compliance: 89 },
    { company: "Foxtrot", count: 66, compliance: 92 },
    { company: "Gulf", count: 60, compliance: 90 },
  ],
};
