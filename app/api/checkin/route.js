import { NextResponse } from "next/server";
import { collection, getDocs, getFirestore, query, where, doc, setDoc } from "firebase/firestore"; // Added missing imports
import { app } from "../../firebase/config";

export async function POST(req) {
  try {
    const { email, date, checkInTime, countryName, gewog, dzongkhag } = await req.json();

    const db = getFirestore(app);
    const employeeRef = collection(db, "employees");

    const employeeQuery = query(employeeRef, where("email", "==", email));
    const employeesQuerySnapshot = await getDocs(employeeQuery);

    if (employeesQuerySnapshot.empty) {
      return NextResponse.json({ message: "Employee not found" });
    }

    // Correct variable name for iteration
    let employeeDocId;
    employeesQuerySnapshot.forEach((doc) => {
      employeeDocId = doc.id; // Get the auto-generated document ID for the employee
    });

    // Set attendance document reference with `date` as document ID
    const attendanceRef = doc(db, `employees/${employeeDocId}/attendance/${date}`);

    // Create check-in location array
    const checkInLocation = [countryName, gewog, dzongkhag];

    // Attendance data with required fields, leaving some for future update
    const attendanceData = {
      checkInTime: checkInTime, // Check-in time from request
      checkOutTime: null, // Will be filled later
      checkInLocation: checkInLocation, // Array of [countryName, gewog, dzongkhag]
      checkOutLocation: [], // Empty for now, to be filled later
      status: null, // Will be calculated later when checkOutTime is provided
      totalHoursWorked: null, // Will be calculated later
    };

    // Set the document in attendance subcollection
    await setDoc(attendanceRef, attendanceData);

    return NextResponse.json({ message: "Successully checked in" });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Error checking registration or setting attendance" });
  }
}
