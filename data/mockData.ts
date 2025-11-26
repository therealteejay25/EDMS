export type Comment = {
  id: string;
  docId: string;
  author: string;
  text: string;
  date: string;
};

export const comments: Comment[] = [
  {
    id: "c1",
    docId: "1",
    author: "jane.doe",
    text: "Looks good to me — please confirm retention period.",
    date: "2025-11-01",
  },
  {
    id: "c2",
    docId: "1",
    author: "john.smith",
    text: "Suggest minor wording edits on section 3.",
    date: "2025-10-15",
  },
  {
    id: "c3",
    docId: "4",
    author: "alex.k",
    text: "Pending legal review.",
    date: "2025-11-02",
  },
];

export type Doc = {
  id: string;
  title: string;
  type: string;
  department: string;
  status: "Draft" | "Active" | "Pending";
  version: string;
  dateAdded: string;
  effectiveDate?: string;
  description?: string;
};

export type Org = {
  id: string;
  name: string;
};

export const orgs: Org[] = [
  { id: "org1", name: "Acme Corp" },
  { id: "org2", name: "Contoso Ltd" },
  { id: "org3", name: "Globex" },
];

export type UserProfile = {
  username: string;
  email?: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  // sha256 hex of password for static demo (do NOT use in production)
  passwordHash: string;
  // roles per org
  roles: Record<string, string>;
};

// Password for demo users: 'password123' hashed with sha256
export const users: User[] = [
  {
    id: "u1",
    username: "admin",
    email: "admin@example.com",
    passwordHash:
      "ef92b778bafe771e89245b89ecbc1b1b0b5ba0b5a0f18c9bd4a1a8b1f1b9e9c5",
    roles: { org1: "Admin", org2: "Admin" },
  },
  {
    id: "u2",
    username: "jane.doe",
    email: "jane.doe@example.com",
    passwordHash:
      "ef92b778bafe771e89245b89ecbc1b1b0b5ba0b5a0f18c9bd4a1a8b1f1b9e9c5",
    roles: { org1: "User", org2: "Viewer" },
  },
];

export const stats = {
  totalDocuments: 128,
  pendingApprovals: 5,
  activePolicies: 42,
};

export const docs: Doc[] = [
  {
    id: "1",
    title: "Data Retention Policy",
    type: "Policy",
    department: "Legal",
    status: "Active",
    version: "1.2",
    dateAdded: "2025-10-01",
    effectiveDate: "2025-10-01",
    description: "Policy for retention",
  },
  {
    id: "2",
    title: "Onboarding Guide",
    type: "Procedure",
    department: "HR",
    status: "Draft",
    version: "0.9",
    dateAdded: "2025-09-15",
  },
  {
    id: "3",
    title: "Security Standards",
    type: "Standard",
    department: "IT",
    status: "Active",
    version: "2.0",
    dateAdded: "2025-07-21",
  },
  {
    id: "4",
    title: "Expense Policy",
    type: "Policy",
    department: "Finance",
    status: "Pending",
    version: "1.0",
    dateAdded: "2025-11-01",
  },
  {
    id: "5",
    title: "Work From Home",
    type: "Policy",
    department: "HR",
    status: "Active",
    version: "1.1",
    dateAdded: "2024-12-10",
  },
  {
    id: "6",
    title: "Change Management",
    type: "Procedure",
    department: "IT",
    status: "Draft",
    version: "0.7",
    dateAdded: "2025-08-05",
  },
];

export const approvals = [
  {
    id: "a1",
    title: "Expense Policy",
    department: "Finance",
    requestedBy: "jane.doe",
    date: "2025-11-20",
  },
  {
    id: "a2",
    title: "New Hire Checklist",
    department: "HR",
    requestedBy: "john.smith",
    date: "2025-11-21",
  },
  {
    id: "a3",
    title: "Vendor Access",
    department: "IT",
    requestedBy: "alex.k",
    date: "2025-11-22",
  },
];
