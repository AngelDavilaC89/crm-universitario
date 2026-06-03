import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      campus: string;
      needsPasswordChange?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    campus: string;
    needsPasswordChange?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    campus?: string;
    needsPasswordChange?: boolean;
  }
}
