import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export type IssueCategory =
  | 'Garbage'
  | 'Road Damage'
  | 'Street Light'
  | 'Water Leakage'
  | 'Infrastructure'
  | 'Environment'
  | 'Traffic'
  | 'Safety'
  | 'Other';

export type IssueStatus = 'Reported' | 'Under Review' | 'In Progress' | 'Resolved';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IStatusHistory {
  status: IssueStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface IReport {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  image: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: IssueStatus;
  priority: IssuePriority;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  upvotes: string[]; // User IDs who upvoted
  statusHistory?: IStatusHistory[];
  officialResponse?: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

// In-memory cache
let users: IUser[] = [];
let reports: IReport[] = [];

// Initialize & Seed Database
export function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      users = JSON.parse(data);
    } else {
      seedUsers();
      saveUsers();
    }

    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf-8');
      reports = JSON.parse(data);
    } else {
      seedReports();
      saveReports();
    }
    console.log(`Database initialized: ${users.length} users, ${reports.length} reports.`);
  } catch (error) {
    console.error('Error initializing database, seeding fallback:', error);
    seedUsers();
    seedReports();
  }
}

function saveUsers() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist users to file:', err);
  }
}

function saveReports() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist reports to file:', err);
  }
}

function seedUsers() {
  const salt = bcrypt.genSaltSync(10);
  const citizenHash = bcrypt.hashSync('citizen123', salt);
  const adminHash = bcrypt.hashSync('admin123', salt);

  users = [
    {
      _id: 'usr_admin_01',
      name: 'Elena Rostova (City Admin)',
      email: 'admin@fixmycity.gov',
      password: adminHash,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      _id: 'usr_citizen_01',
      name: 'Marcus Vance',
      email: 'marcus@citizen.org',
      password: citizenHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      _id: 'usr_citizen_02',
      name: 'Aisha Patel',
      email: 'aisha.patel@citylife.net',
      password: citizenHash,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      _id: 'usr_citizen_03',
      name: 'David Chen',
      email: 'david.chen@neighborhood.io',
      password: citizenHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];
}

function seedReports() {
  const now = Date.now();
  reports = [
    {
      _id: 'rep_001',
      title: 'Massive Pothole on 5th Avenue & Pine St',
      description: 'Deep hazardous pothole causing vehicular damage and severe tire blowouts during rush hour. Multiple vehicles had to swerve dangerously into oncoming lanes.',
      category: 'Road Damage',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      location: {
        address: '5th Ave & Pine Street, Downtown Metro',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      status: 'In Progress',
      priority: 'High',
      reportedBy: {
        _id: 'usr_citizen_01',
        name: 'Marcus Vance',
        email: 'marcus@citizen.org',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      upvotes: ['usr_citizen_01', 'usr_citizen_02', 'usr_citizen_03'],
      statusHistory: [
        {
          status: 'Reported',
          changedAt: new Date(now - 4 * 86400000).toISOString(),
          changedBy: 'Marcus Vance',
          note: 'Initial citizen report submitted with photo evidence.',
        },
        {
          status: 'Under Review',
          changedAt: new Date(now - 3 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
          note: 'Department of Public Works verified high traffic risk.',
        },
        {
          status: 'In Progress',
          changedAt: new Date(now - 1 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
          note: 'Asphalt resurfacing crew scheduled and materials dispatched.',
        },
      ],
      officialResponse: 'Public Works crew #4 has cordoned off the lane. Asphalt patching underway.',
      createdAt: new Date(now - 4 * 86400000).toISOString(),
      updatedAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      _id: 'rep_002',
      title: 'Overflowing Commercial Dumpsters at Westside Park',
      description: 'Multiple garbage bins overflowing into the public children’s playground area. Strong odor and attracting stray animals and pests.',
      category: 'Garbage',
      image: 'https://images.unsplash.com/photo-1611288870280-4a37a77d1309?w=800&auto=format&fit=crop&q=80',
      location: {
        address: '420 Westside Community Park, Elm District',
        latitude: 37.7833,
        longitude: -122.4167,
      },
      status: 'Under Review',
      priority: 'Medium',
      reportedBy: {
        _id: 'usr_citizen_02',
        name: 'Aisha Patel',
        email: 'aisha.patel@citylife.net',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      upvotes: ['usr_citizen_01', 'usr_citizen_02'],
      statusHistory: [
        {
          status: 'Reported',
          changedAt: new Date(now - 2 * 86400000).toISOString(),
          changedBy: 'Aisha Patel',
          note: 'Reported with playground photo.',
        },
        {
          status: 'Under Review',
          changedAt: new Date(now - 1 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
          note: 'Forwarded to Municipal Sanitation and Parks Dept.',
        },
      ],
      createdAt: new Date(now - 2 * 86400000).toISOString(),
      updatedAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      _id: 'rep_003',
      title: 'High-Pressure Water Main Burst Flooding Pedestrian Walkway',
      description: 'Major underground pipe leakage creating a massive puddle and eroding sidewalk foundations near the transit hub.',
      category: 'Water Leakage',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
      location: {
        address: '890 Market Street, Transit Plaza',
        latitude: 37.7879,
        longitude: -122.4075,
      },
      status: 'Resolved',
      priority: 'Critical',
      reportedBy: {
        _id: 'usr_citizen_03',
        name: 'David Chen',
        email: 'david.chen@neighborhood.io',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      upvotes: ['usr_citizen_01', 'usr_citizen_02', 'usr_citizen_03', 'usr_admin_01'],
      statusHistory: [
        {
          status: 'Reported',
          changedAt: new Date(now - 7 * 86400000).toISOString(),
          changedBy: 'David Chen',
        },
        {
          status: 'Under Review',
          changedAt: new Date(now - 6 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
        },
        {
          status: 'In Progress',
          changedAt: new Date(now - 5 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
        },
        {
          status: 'Resolved',
          changedAt: new Date(now - 3 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
          note: 'Water main replaced, pressure tested, and concrete walkway repaved.',
        },
      ],
      officialResponse: 'City Water Utility replaced the broken 12-inch valve and restored complete sidewalk access.',
      createdAt: new Date(now - 7 * 86400000).toISOString(),
      updatedAt: new Date(now - 3 * 86400000).toISOString(),
    },
    {
      _id: 'rep_004',
      title: 'Broken Street Light Creating Dark Alley Hazard',
      description: 'Entire block between 12th & 14th St has dark non-functional LED lamps. Poses serious safety and visibility concerns for evening commuters.',
      category: 'Street Light',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      location: {
        address: 'Corner of 14th Ave & Harrison Blvd',
        latitude: 37.7694,
        longitude: -122.4467,
      },
      status: 'Reported',
      priority: 'Medium',
      reportedBy: {
        _id: 'usr_citizen_01',
        name: 'Marcus Vance',
        email: 'marcus@citizen.org',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      upvotes: ['usr_citizen_01'],
      statusHistory: [
        {
          status: 'Reported',
          changedAt: new Date(now - 1 * 86400000).toISOString(),
          changedBy: 'Marcus Vance',
          note: 'Reported via FixMyCity AI mobile interface.',
        },
      ],
      createdAt: new Date(now - 1 * 86400000).toISOString(),
      updatedAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      _id: 'rep_005',
      title: 'Malfunctioning Traffic Signal at School Crosswalk',
      description: 'Traffic light is stuck on blinking amber, causing gridlock and dangerous vehicle acceleration right in front of Lincoln Elementary School.',
      category: 'Traffic',
      image: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=800&auto=format&fit=crop&q=80',
      location: {
        address: 'Lincoln Elementary Crosswalk, 8th Ave',
        latitude: 37.7725,
        longitude: -122.4312,
      },
      status: 'In Progress',
      priority: 'Critical',
      reportedBy: {
        _id: 'usr_citizen_02',
        name: 'Aisha Patel',
        email: 'aisha.patel@citylife.net',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      upvotes: ['usr_citizen_01', 'usr_citizen_02', 'usr_citizen_03'],
      statusHistory: [
        {
          status: 'Reported',
          changedAt: new Date(now - 2 * 86400000).toISOString(),
          changedBy: 'Aisha Patel',
        },
        {
          status: 'Under Review',
          changedAt: new Date(now - 2 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
        },
        {
          status: 'In Progress',
          changedAt: new Date(now - 1 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
          note: 'Traffic electrical technicians deployed on emergency priority.',
        },
      ],
      createdAt: new Date(now - 2 * 86400000).toISOString(),
      updatedAt: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      _id: 'rep_006',
      title: 'Fallen Tree Branch Crushing Public Park Bench',
      description: 'Large oak branch snapped during storm, blocking cycling pathway and crushing public seating infrastructure in Oakwood Park.',
      category: 'Environment',
      image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
      location: {
        address: 'North Path, Oakwood Botanical Gardens',
        latitude: 37.7650,
        longitude: -122.4500,
      },
      status: 'Resolved',
      priority: 'Low',
      reportedBy: {
        _id: 'usr_citizen_03',
        name: 'David Chen',
        email: 'david.chen@neighborhood.io',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      upvotes: ['usr_citizen_03'],
      statusHistory: [
        {
          status: 'Reported',
          changedAt: new Date(now - 10 * 86400000).toISOString(),
          changedBy: 'David Chen',
        },
        {
          status: 'Resolved',
          changedAt: new Date(now - 8 * 86400000).toISOString(),
          changedBy: 'Elena Rostova (City Admin)',
          note: 'Urban forestry team cleared tree debris and installed new park bench.',
        },
      ],
      createdAt: new Date(now - 10 * 86400000).toISOString(),
      updatedAt: new Date(now - 8 * 86400000).toISOString(),
    },
  ];
}

// Database helper operations
export const db = {
  // User methods
  findUserByEmail: (email: string) => users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id: string) => users.find((u) => u._id === id),
  createUser: (userData: Omit<IUser, '_id' | 'createdAt'>) => {
    const newUser: IUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...userData,
    };
    users.push(newUser);
    saveUsers();
    return newUser;
  },
  getAllUsers: () => users.map(({ password, ...rest }) => rest),

  // Report methods
  getAllReports: () => [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  findReportById: (id: string) => reports.find((r) => r._id === id),
  createReport: (reportData: Omit<IReport, '_id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'statusHistory'>) => {
    const newReport: IReport = {
      _id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...reportData,
      upvotes: [reportData.reportedBy._id], // automatic self upvote
      statusHistory: [
        {
          status: reportData.status || 'Reported',
          changedAt: new Date().toISOString(),
          changedBy: reportData.reportedBy.name,
          note: 'Issue reported by citizen.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    saveReports();
    return newReport;
  },
  updateReport: (id: string, updates: Partial<IReport>, updatedByName?: string) => {
    const index = reports.findIndex((r) => r._id === id);
    if (index === -1) return null;

    const current = reports[index];
    const newHistory = [...(current.statusHistory || [])];

    if (updates.status && updates.status !== current.status) {
      newHistory.push({
        status: updates.status,
        changedAt: new Date().toISOString(),
        changedBy: updatedByName || 'City Official',
        note: updates.officialResponse || `Status transitioned to ${updates.status}`,
      });
    }

    const updatedReport: IReport = {
      ...current,
      ...updates,
      statusHistory: newHistory,
      updatedAt: new Date().toISOString(),
    };

    reports[index] = updatedReport;
    saveReports();
    return updatedReport;
  },
  deleteReport: (id: string) => {
    const index = reports.findIndex((r) => r._id === id);
    if (index === -1) return false;
    reports.splice(index, 1);
    saveReports();
    return true;
  },
  toggleUpvote: (reportId: string, userId: string) => {
    const report = reports.find((r) => r._id === reportId);
    if (!report) return null;

    const upvoteIndex = report.upvotes.indexOf(userId);
    let hasUpvoted = false;
    if (upvoteIndex > -1) {
      report.upvotes.splice(upvoteIndex, 1);
      hasUpvoted = false;
    } else {
      report.upvotes.push(userId);
      hasUpvoted = true;
    }
    report.updatedAt = new Date().toISOString();
    saveReports();
    return { report, hasUpvoted, upvotesCount: report.upvotes.length };
  },
};
