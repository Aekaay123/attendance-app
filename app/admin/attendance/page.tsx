"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isSameDay, isAfter, subDays, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { app } from "@/app/firebase/config";

interface AttendanceRecord {
  id: string; // Attendance document ID
  email: string;
  checkinTime: string;
  checkoutTime: string;
  checkinLocation: string;
  checkoutLocation: string;
  totalHoursWorked: number | string; // Could be 0 or "-"
  status: string;
}

const Attendance = () => {
  const [attendanceTableData, setAttendanceTableData] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(subDays(new Date(), 1));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const rowsPerPage = 6;

  const db = getFirestore(app);
  const employeeRef = collection(db, "employees");

  const fetchAttendanceForDate = async (date: string) => {
    setLoading(true); // Start loading state
    try {
      const employeeSnapshot: QuerySnapshot<DocumentData> = await getDocs(employeeRef);
      const attendanceArray: AttendanceRecord[] = [];

      // Loop through each employee document
      for (const employeeDoc of employeeSnapshot.docs) {
        const employeeID = employeeDoc.id;
        const employeeData = employeeDoc.data();
        const attendanceDocRef = doc(db, "employees", employeeID, "attendance", date);

        const attendanceDocSnap = await getDoc(attendanceDocRef);

        if (attendanceDocSnap.exists()) {
          // If attendance record exists for the selected date
          const attendanceData = attendanceDocSnap.data();
          attendanceArray.push({
            id: attendanceDocSnap.id,
            email: employeeData.email || "-",
            checkinTime: attendanceData.checkInTime || "-",
            checkoutTime: attendanceData.checkOutTime || "-",
            checkinLocation: attendanceData.checkInLocation || "-",
            checkoutLocation: attendanceData.checkOutLocation || "-",
            totalHoursWorked: attendanceData.totalHoursWorked || "-",
            status: attendanceData.status || "Present",
          });
        } else {
          // If attendance record doesn't exist for the selected date
          attendanceArray.push({
            id: date,
            email: employeeData.email || "-",
            checkinTime: "-",
            checkoutTime: "-",
            checkinLocation: "-",
            checkoutLocation: "-",
            totalHoursWorked: 0,
            status: "Absent",
          });
        }
      }

      // Update the state with formatted attendance data
      setAttendanceTableData(attendanceArray);
    } catch (error) {
      console.error("Error fetching attendance data: ", error);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  // useEffect to fetch data when the selected date changes
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd-MM-yyyy"); // Format date as "dd-MM-yyyy"
      fetchAttendanceForDate(formattedDate);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setAttendanceTableData([]); // Clear previous data when selecting a new date
      setIsCalendarOpen(false);
      setCurrentPage(1); // Reset to first page when date changes
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    return isAfter(date, yesterday) || isSameDay(date, today);
  };

  // Pagination 
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  
  // Filtered attendance data based on search query
  const filteredAttendanceData = attendanceTableData.filter((row) =>
    row.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentRows = filteredAttendanceData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredAttendanceData.length / rowsPerPage);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-center font-bold text-xl">Attendance</CardTitle>
        <hr className="w-full"></hr>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "dd-MM-yyyy") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto " align="end">
            <Calendar
              mode="single"
              className="bg-black/80 text-white"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              classNames={{ day_selected: "bg-white text-black hover:bg-white hover:text-black rounded-full" }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
   
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/4 outline-none p-2 border border-black rounded-md"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="border border-gray-300 bg-gray-300">Sl. No</TableHead>
                <TableHead className="border text-center border-gray-300 bg-gray-300">Email</TableHead>
                <TableHead className="border text-center border-gray-300 bg-gray-300">Check-in Time</TableHead>
                <TableHead className="border text-center border-gray-300 bg-gray-300">Check-out Time</TableHead>
                <TableHead className="border text-center border-gray-300 bg-gray-300">Check-in Location</TableHead>
                <TableHead className="border text-center border-gray-300 bg-gray-300">Check-out Location</TableHead>
                <TableHead className="border text-center border-gray-300 bg-gray-300">Hours Worked</TableHead>
                <TableHead className="border text-center border-gray-300 bg-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center space-y-2">
                    <Skeleton className="w-full p-6 bg-gray-300 h-8 rounded" />
                    <Skeleton className="w-full p-6 bg-gray-300 h-8 rounded" />
                    <Skeleton className="w-full p-6 bg-gray-300 h-8 rounded" />
                    <Skeleton className="w-full p-6 bg-gray-300 h-8 rounded" />
                  </TableCell>
                </TableRow>
              ) : currentRows.length > 0 ? (
                currentRows.map((row, index) => (
                  <TableRow key={row.id} className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}>
                    <TableCell className="text-center border border-gray-300">{index + 1 + indexOfFirstRow}</TableCell>
                    <TableCell className="text-left border border-gray-300">{row.email}</TableCell>
                    <TableCell className="text-center border border-gray-300">{row.checkinTime}</TableCell>
                    <TableCell className="text-center border border-gray-300">{row.checkoutTime}</TableCell>
                    <TableCell className="text-center border border-gray-300">{row.checkinLocation}</TableCell>
                    <TableCell className="text-center border border-gray-300">{row.checkoutLocation}</TableCell>
                    <TableCell className="text-center border border-gray-300">{row.totalHoursWorked}</TableCell>
                    <TableCell className="text-center border border-gray-300">{row.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No attendance records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Attendance;
