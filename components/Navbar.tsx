"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, logout, switchOrg, listAuthOrgs } from "../lib/apiClient";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [switchingOrg, setSwitchingOrg] = useState(false);
  const [orgNameById, setOrgNameById] = useState<Record<string, string>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        if (userData?.role === "admin" && Object.keys(orgNameById).length === 0) {
          try {
            const orgs = await listAuthOrgs();
            const map: Record<string, string> = {};
            for (const o of orgs) {
              map[o._id] = o.name;
            }
            setOrgNameById(map);
          } catch {
            // ignore
          }
        }

        if (
          userData &&
          userData.role !== "admin" &&
          !userData.department &&
          pathname !== "/choose-department" &&
          pathname !== "/login" &&
          pathname !== "/"
        ) {
          router.push("/choose-department");
        }
      } catch (error) {
        if (pathname !== "/login" && pathname !== "/") {
          router.push("/login");
        }
      }
    };
    load();
  }, [pathname, router, orgNameById]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  if (pathname === "/login" || pathname === "/") return null;
  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isDeptLead = user.role === "department_lead";
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#020817]">
      <div className="mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="font-bold text-xl text-primary-600 dark:text-primary-500">
              Zentra.
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
            <Link 
              href="/dashboard" 
              className={`text-sm transition-colors ${
                pathname === "/dashboard"
                  ? "text-primary-600 dark:text-primary-400 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/documents" 
              className={`text-sm transition-colors ${
                pathname === "/documents"
                  ? "text-primary-600 dark:text-primary-400 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400"
              }`}
            >
              Documents
            </Link>
            <Link 
              href="/upload" 
              className={`text-sm transition-colors ${
                pathname === "/upload"
                  ? "text-primary-600 dark:text-primary-400 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400"
              }`}
            >
              Upload
            </Link>
            <Link 
              href="/approvals" 
              className={`text-sm transition-colors ${
                pathname === "/approvals"
                  ? "text-primary-600 dark:text-primary-400 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400"
              }`}
            >
              Approvals
            </Link>
            <Link 
              href="/workflows" 
              className={`text-sm transition-colors ${
                pathname === "/workflows"
                  ? "text-primary-600 dark:text-primary-400 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400"
              }`}
            >
              Workflows
            </Link>
            {(isAdmin || isDeptLead) && (
              <Link 
                href="/analytics" 
                className={`text-sm transition-colors ${
                  pathname === "/analytics"
                    ? "text-primary-600 dark:text-primary-400 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                Analytics
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {isAdmin && Array.isArray(user.orgs) && user.orgs.length > 0 ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="text-xs text-zinc-500">Org</div>
                <select
                  className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                  value={user.org}
                  disabled={switchingOrg}
                  onChange={async (e) => {
                    const nextOrgId = e.target.value;
                    try {
                      setSwitchingOrg(true);
                      const updated = await switchOrg(nextOrgId);
                      setUser(updated);
                      router.refresh();
                    } finally {
                      setSwitchingOrg(false);
                    }
                  }}
                >
                  {user.orgs.map((id: string) => (
                    <option key={id} value={id}>
                      {orgNameById[id] || id}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{user.email}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-sm font-bold text-primary-700 dark:text-primary-400">
                  {initials}
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg z-20">
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-t-lg"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 py-3 md:hidden">
            <Link
              href="/dashboard"
              className="block py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/documents"
              className="block py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documents
            </Link>
            <Link
              href="/upload"
              className="block py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Upload
            </Link>
            <Link
              href="/approvals"
              className="block py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Approvals
            </Link>
            <Link
              href="/workflows"
              className="block py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Workflows
            </Link>
            {(isAdmin || isDeptLead) && (
              <>
                <Link
                  href="/analytics"
                  className="block py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/org-settings"
                  className="block py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Organization Settings
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// export default function Navbar() {
//   const [user, setUser] = useState<any>(null);
//   const router = useRouter();

  
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const API = process.env.NEXT_PUBLIC_API_URL || "";
//         const res = await fetch(`${API}/api/auth/me`, {
//           credentials: "include",
//         });
//         if (!res.ok) {
//           return;
//         }
//         const json = await res.json();
//         setUser(json.user);
//       } catch (e) {
//         // ignore
//       }
//     };
//     load();
//   }, []);

//   const role = user?.role ?? "User";
//   const showApprovals = role === "Admin";

//   return (
//     <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white">
//       <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
//         <div className="flex items-center gap-4">
//           <div className="text-sky-600 text-lg font-semibold">Zentra</div>
//           <nav className="hidden md:flex gap-3">
//             <Link
//               className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
//               href="/dashboard"
//             >
//               <IconDocs />
//               Dashboard
//             </Link>
//             <Link
//               className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
//               href="/documents"
//             >
//               Documents
//             </Link>
//             <Link
//               className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
//               href="/upload"
//             >
//               Upload
//             </Link>
//             {showApprovals && (
//               <Link
//                 className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
//                 href="/approvals"
//               >
//                 Approvals
//               </Link>
//             )}
//           </nav>
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="hidden items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm md:flex">
//             Signed in as{" "}
//             <span className="ml-2 font-medium">{user?.name ?? "Guest"}</span>
//           </div>

//           <label className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm">
//             <span className="text-xs text-zinc-500">Role</span>
//             <span className="text-xs text-zinc-500">{user?.role ?? role}</span>
//           </label>

//           <button
//             type="button"
//             onClick={async () => {
//               try {
//                 const API = process.env.NEXT_PUBLIC_API_URL || "";
//                 await fetch(`${API}/api/auth/logout`, {
//                   method: "POST",
//                   credentials: "include",
//                 });
//               } catch (e) {
//                 // ignore
//               }
//               router.push("/login");
//             }}
//             className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700"
//           >
//             Sign out
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }
