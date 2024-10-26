import { NextResponse } from "next/server";
import { doc, updateDoc, getDoc, getFirestore, query, collection, where, getDocs } from "firebase/firestore"; // Import necessary functions
import { app } from "../../firebase/config";
import { parse } from 'date-fns'; 

export async function POST(req) {
  try {
    const { email, date, checkOutTime, countryName, gewog, dzongkhag } = await req.json();

    const db = getFirestore(app);
    
    // Reference to the employees collection and query for the specific employee by email
    const employeeRef = collection(db, "employees");
    const employeeQuery = query(employeeRef, where("email", "==", email));
    const employeesQuerySnapshot = await getDocs(employeeQuery);

    if (employeesQuerySnapshot.empty) {
      return NextResponse.json({ message: "Employee not found" });
    }

    // Get the document ID of the found employee
    const employeeDocId = employeesQuerySnapshot.docs[0].id; // Assuming only one employee will match
    const attendanceRef = doc(db, `employees/${employeeDocId}/attendance/${date}`);

    // Fetch existing attendance document
    const attendanceSnapshot = await getDoc(attendanceRef);
    if (!attendanceSnapshot.exists()) {
      return NextResponse.json({ message: "Attendance record not found. Check in first." });
    }

    const attendanceData = attendanceSnapshot.data();
    const checkInTime = attendanceData.checkInTime;

    // Check if checkout is happening on the same day
    if (!checkInTime) {
      return NextResponse.json({ message: "Check-in is required before checkout" });
    }

    // Parse checkInTime and checkOutTime to Date objects
    const checkInDate = parse(checkInTime, 'hh:mm a', new Date()); // Current date as a reference
    const checkOutDate = parse(checkOutTime, 'hh:mm a', new Date()); // Current date as a reference

    // Check if both dates are valid
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ message: "Invalid check-in or check-out time" });
    }

    // Calculate total minutes worked
    const totalMinutesWorked = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60); // Minutes
    const totalHoursWorked = totalMinutesWorked / 60; 
    // Determine status based on total minutes worked
    let status;
    if (totalMinutesWorked >= 480) { // 8 hours in minutes
      status = "Present";
    } else if (totalMinutesWorked > 0 && totalMinutesWorked < 480) {
      status = "Late";
    } else {
      status = "Absent";
    }

    // Update the attendance document with check-out details
    const checkOutLocation = [countryName, gewog, dzongkhag];
    await updateDoc(attendanceRef, {
      checkOutTime: checkOutTime,
      checkOutLocation: checkOutLocation,
      totalHoursWorked: totalHoursWorked, // Store in minutes
      status: status,
    });

    return NextResponse.json({ message: "Checkout successfull" });
  } catch (error) {
    console.error("Error during checkout:", error);
    return NextResponse.json({ message: "Error during checkout" });
  }
}
