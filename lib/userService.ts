// User management API functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "department_lead" | "user";
  department?: string;
  isActive: boolean;
}

export async function listUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users || data.data || [];
}

export async function createUser(userData: {
  name: string;
  email: string;
  role?: string;
  department?: string;
  password?: string;
}): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create user");
  }
  const data = await res.json();
  return data.user;
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update user");
  }
  const data = await res.json();
  return data.user;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete user");
  }
}
