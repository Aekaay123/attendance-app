import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const authconfig={
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  pages:{},
  callbacks: {
    async signIn({ user }) {
      try {
        const response =await fetch("http://localhost:3000/api/isRegistered", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Email: user?.email,
          }),
        });
        const data= await response.json();
        if (data.isRegistered) {
          return user;
        } else {
          throw new Error("Not a registered tutor");
        }
      } catch (error) {
        console.error(error);
    
      }
    },
    async jwt({ user, token }) {
      if (user) {
        if (user?.email.toLowerCase().trim() === "kenchowangdi936@gmail.com") {
          token.role = "admin";
        } else {
          token.role = "user";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.userID = token.sub;
      }
      return session;
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authconfig);
