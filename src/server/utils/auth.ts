import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {prisma } from "@/server/db/client";
import { loginSchema as CredentialsSchema } from "@/server/validation/login";
import { compare } from "bcryptjs";

//import * as argon2 from "argon2"; 

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials ({
      name: "Credentials",
      credentials:{
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize : async (creds) =>{
        const credParsed = CredentialsSchema.safeParse(creds);
        if (!credParsed.success) return null;
        const {username, password} = credParsed.data;
        const  id = username.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where  :{
            OR:[{name: id}, {email: id}]
          }
        })
        if (!user) return null;
        if (!user.passwordHash) return null;
        const  passwordCheck = await compare(password, user.passwordHash) //argon2.verify(user.passwordHash, password); 
        if (!passwordCheck) return null;
        return {id : user.id.toString(), name: user.name || undefined, email: user.email};


      }
    })
  ],
  callbacks:{
    async jwt ({ token, user }) {
      if (user){
        token.userId = user.id;
        token.username = user.name;
      }
      return token;
    },
    async session ({ session, token }) {
      if (token?.userId){
        session.user.id = token.userId as string;
        session.user.name = token.username as string | undefined;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

