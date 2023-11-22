import CredentialsProvider from "next-auth/providers/credentials";
import ConnectToDB from "@/utils/db";
import User from "@/models/userModel";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const options: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        type: "credentials",
        name: "credentials",
        credentials: {},
        async authorize(credentials, req) {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };
  
          if (!email || !password) {
            return null;
          }
          try {
            await ConnectToDB();
            const res = await User.findOne({
              username: email,
              password: password,
            });
            if (res) {
              return res;
            } else {
              return null;
            }
          } catch (error) {
            console.log(error);
            return null;
          }
        },
      }),
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      }),
    ],
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
  //   debug: process.env.NODE_ENV === "development",
    pages: {
      signIn: "/login",
      newUser: "/register",
      error:"/login"
    },
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider === "credentials") {
          return user;
        }
        await ConnectToDB();
        try {        
          const res = await User.findOne({ username: user.email });
          if (!res) {
            const userid = await fetch("/api/gen", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (userid.ok) {
              const { accountid } = await userid.json();
              const response: Response = await fetch("/api/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  username: user.email,
                  id: accountid,
                }),
              });
              const body = await response.json();
              if (response.ok) {
                if (body?.status == "ok") return user;
                else return false;
  
              } else return false;
  
            } else return false;
          }
  
        } catch (error) {
          console.log(error);
          return false;
        }
        return user;
      },
      async jwt({ token, user, account }) {
        if (account?.provider == "credentials") {
          if (user) {
            token = {
              ...token,
              email: user.username,
              picture: user.image,
              id: user.id,
            };
            return token;
          }
        } else if (account?.provider != "credentials") {
          if (user) {
            const res = await User.findOne({ username: user.email });
            token = { ...token, user,id:res.id };
            return token;
          }
        }
  
        return token;
      },
      async session({ token, user, session }) {      
        return { ...session, user: { ...session.user, id: token.id } };
      },
    },
  };
  