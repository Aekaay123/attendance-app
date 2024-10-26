import { NextResponse } from "next/server";
import { auth } from "../auth/[...nextauth]/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { app } from "@/app/firebase/config";

export async function POST(req) {
  const session = await auth();
  const email = session?.user?.email;
  const { selectedDate } = await req.json();
  const db = getFirestore(app);
  try {
    const employeeQuery = query(
      collection(db, "employees"),
      where("email", "==", email)
    );
    const employeeSnapshot = await getDocs(employeeQuery);

    if (employeeSnapshot.empty) {
      return NextResponse.json({ message: "Employee not found" });
    }

    const employeeDoc = employeeSnapshot.docs[0];
    const employeeId = employeeDoc.id;

    const attendanceDocRef = doc(
      db,
      "employees",
      employeeId,
      "attendance",
      selectedDate
    );
    const attendanceDocSnap = await getDoc(attendanceDocRef)
    if (!attendanceDocSnap.exists()) {
      return NextResponse.json({
        message: "No records found for the date you selected",
      });
    }

    return NextResponse.json({
      id:attendanceDocSnap.id,
      ...attendanceDocSnap.data(),
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "internal server error" });
  }
}
