import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../../../firebase/config";

export const authconfig={
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  pages:{},
  callbacks: {
    async signIn({ user }) {
      try {
        const db = getFirestore(app);
        const collectionRef = collection(db, "employees");
        const querySnapshot = await getDocs(collectionRef);

        let isRegistered= false;
        querySnapshot.forEach((doc) => {
          if (doc.data().email=== user.email.toLowerCase().trim() || user.email==="kenchowangdi936@gmail.com") {
            isRegistered = true;
            return; 
          }
        });
        if (isRegistered) {
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
