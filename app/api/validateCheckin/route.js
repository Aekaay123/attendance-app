import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth } from "../auth/[...nextauth]/auth";
import { NextResponse } from "next/server";
import { app } from "@/app/firebase/config";
import { format } from "date-fns"; // Use this for date formatting

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  const db = getFirestore(app);

  try {
    if (!email) {
      return NextResponse.json({ message: "user not found" });
    }
    // Step 1: Search for employee by email in the `employees` collection
    const employeeQuery = query(
      collection(db, "employees"),
      where("email", "==", email)
    );
    const employeeSnapshot = await getDocs(employeeQuery);

    if (employeeSnapshot.empty) {
      return NextResponse.json({ message: "Employee not found" });
    }

    // Step 2: Get the employee document ID (auto-generated ID)
    const employeeDoc = employeeSnapshot.docs[0]; // Assuming one result
    const employeeId = employeeDoc.id;

    // Step 3: Format current date as "d-m-y" (day-month-year)
    const currentDate = format(new Date(), "dd-MM-yyyy"); // Example: 23-10-2024

    // Step 4: Check the attendance subcollection for the current date
    const attendanceDocRef = doc(
      db,
      "employees",
      employeeId,
      "attendance",
      currentDate
    );
    const attendanceDocSnap = await getDoc(attendanceDocRef);

    if (!attendanceDocSnap.exists()) {
      // Date doesn't exist in the attendance subcollection
      return NextResponse.json({ message: false });
    }

    // Step 5: Check if the `checkinTime` field exists and has a value
    const attendanceData = attendanceDocSnap.data();
    const hasCheckedIn = !!attendanceData.checkInTime;
    const hasCheckedOut = !!attendanceData.checkOutTime;

    // Step 6: Return the response based on whether checkinTime exists
    return NextResponse.json({ message:{hasCheckedIn,hasCheckedOut}});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "internal server error" });
  }
}
