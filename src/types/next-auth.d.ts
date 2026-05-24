import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      campus: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    campus: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    campus?: string;
  }
}
