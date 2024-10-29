import React, { useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { jsPDF } from "jspdf";
import { format, startOfMonth } from "date-fns";
import { Button } from "../ui/button";
import { FileText, Clock } from "lucide-react";
import { app } from "@/app/firebase/config";
import { useSelector } from "react-redux";

const GenerateReport = () => {
  const [loading, setLoading] = useState(false);

  const selectedTheme = useSelector((state) => state.theme.mode);

  const fetchAttendanceData = async () => {
    setLoading(true);
    const db = getFirestore(app);
    const employeesSnap = await getDocs(collection(db, "employees"));
    const currentDate = new Date();
    const startDate = startOfMonth(currentDate);

    const reportData = [];
    for (const employeeDoc of employeesSnap.docs) {
      const employeeData = employeeDoc.data();
      const attendanceRef = collection(
        db,
        "employees",
        employeeDoc.id,
        "attendance"
      );
      const attendanceSnap = await getDocs(attendanceRef);

      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;

      attendanceSnap.forEach((attendanceDoc) => {
        const { status } = attendanceDoc.data();
        const attendanceDate = attendanceDoc.id;
        const [day, month, year] = attendanceDate.split("-");
        const attendanceDateObj = new Date(`${year}-${month}-${day}`);

        if (
          attendanceDateObj >= startDate &&
          attendanceDateObj <= currentDate
        ) {
          if (status === "Present") presentDays++;
          else if (status === "Absent") absentDays++;
          else if (status === "Late") lateDays++;
        }
      });

      reportData.push({
        name: employeeData.name,
        email: employeeData.email,
        presentDays,
        absentDays,
        lateDays,
      });
    }

    setLoading(false);
    return reportData;
  };

  const handleGenerateReport = async () => {
    const reportData = await fetchAttendanceData();
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Attendance Report", doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });

    // Date range
    doc.setFontSize(10);
    doc.text(
      `Date Range: ${format(
        startOfMonth(new Date()),
        "dd-MM-yyyy"
      )} to ${format(new Date(), "dd-MM-yyyy")}`,
      doc.internal.pageSize.getWidth() / 2,
      30,
      { align: "center" }
    );

    // Table setup
    const headers = [
      "S.No",
      "Name",
      "Email",
      "Days Present",
      "Days Absent",
      "Days Late",
    ];
    const headerYPosition = 40;
    const columnWidths = [10, 40, 55, 30, 30, 30];
    const startX = 10; // Draw header row with borders
    headers.forEach((header, index) => {
      const xPos =
        startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.text(header, xPos + columnWidths[index] / 2, headerYPosition, {
        align: "center",
      });
      doc.rect(xPos, headerYPosition - 7, columnWidths[index], 10); // Draw header cell border
    });

    let yPosition = headerYPosition + 10;

    // Draw data rows with borders
    reportData.forEach((employee, index) => {
      const rowValues = [
        String(index + 1),
        employee.name,
        employee.email,
        String(employee.presentDays),
        String(employee.absentDays),
        String(employee.lateDays),
      ];

      rowValues.forEach((value, colIndex) => {
        const xPos =
          startX + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.text(value, xPos + columnWidths[colIndex] / 2, yPosition, {
          align: "center",
        });
        doc.rect(xPos, yPosition - 7, columnWidths[colIndex], 10);
      });

      yPosition += 10;
    });
    doc.save("Attendance_Report.pdf");
  };

  return (
    <Button
      onClick={handleGenerateReport}
      className={`flex items-center justify-self-end text-sm hover:bg-gray-300 md:text-md gap-2 rounded-lg mt-3 ${
        selectedTheme === "dark" ? "text-white hover:text-black" : "text-black"
      }`}
      disabled={loading}
    >
      {loading ? (
        <>
          <Clock className="animate-spin h-4 w-4" />
          Generating report ...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          <span>Generate Report</span>
        </>
      )}
    </Button>
  );
};

export default GenerateReport;
