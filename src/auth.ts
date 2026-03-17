import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { candidatos } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // B2B: Portal Administrativo
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // B2C: Portal del Candidato
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const userArr = await db.select().from(candidatos).where(eq(candidatos.email, email)).limit(1);
          const user = userArr[0];

          if (!user || !user.password_hash) {
             return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password_hash);
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.nombre,
              userRole: "candidato" // Custom prop to distinguish session type
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Validate Google OAuth logic for Clinical Avaria specific domains
      if (account?.provider === "google") {
        const allowedDomains = ["clinicaavaria.cl", "ext-clinicaavaria.cl"];
        // For Google Auth we look at the email in the profile scope
        if (profile?.email && !allowedDomains.some(domain => profile.email!.endsWith(`@${domain}`))) {
          console.log(`Access Denied for ${profile.email}`);
          // Return false or a specific URL path to reject the sign in
          // This will redirect to an unauthorized page automatically
          return false;
        }
      }
      return true; // the Credentials provider simply falls through here
    },
    async jwt({ token, user, account }) {
      if (user) {
         // Attach our custom role based on provider
         if (account?.provider === "google") {
             token.userRole = "admin";
         } else if (account?.provider === "credentials") {
             token.userRole = "candidato";
             token.id = user.id;
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
         // Pass the custom payload via session
         (session.user as any).userRole = token.userRole;
         (session.user as any).id = token.id || token.sub; // Attach sub/id for PK uses
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // We will build a unified login that discriminates paths
  }
});
