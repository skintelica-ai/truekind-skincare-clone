import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
 
export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	trustedOrigins: ["http://localhost:3000"],
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
				required: false,
			}
		}
	},
	plugins: [bearer()]
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}

// Role checking helpers
export type UserRole = "admin" | "editor" | "user";

export function hasRole(user: any, allowedRoles: UserRole[]): boolean {
  if (!user?.role) return false;
  return allowedRoles.includes(user.role as UserRole);
}

export function isAdmin(user: any): boolean {
  return user?.role === "admin";
}

export function isEditor(user: any): boolean {
  return user?.role === "editor";
}

export function canAccessAdminPanel(user: any): boolean {
  return hasRole(user, ["admin", "editor"]);
}