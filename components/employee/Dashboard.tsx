"use client";
import { fetchUserLocation } from "../../lib/getLocation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "../../hooks/use-toast";
import { UserCheck, UserMinus, LogOut } from "lucide-react";
import { format, isBefore, isToday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";

type AttendanceRecord = {
  date: string;
  checkInTime: string;
  checkOutLocation: string[];
  checkOutTime: string;
  status: string;
  checkInLocation: string[];
  totalHoursWorked: number;
};

type LocationInfo = {
  countryName: string;
  locality: string;
  principalSubdivision: string;
};

const Dashboard = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState(true);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [checkin, setCheckin] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { toast } = useToast();
  const { data: session } = useSession();
  const formattedDate = format(new Date(), "dd-MM-yyyy");
  const formattedTime = format(new Date(), "hh:mm a");

  // Fetch attendance records for the selected date
  const fetchAttendanceRecord = async (currentDate: Date) => {
    try {
      const response = await fetch("/api/fetchAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedDate: format(currentDate, "dd-MM-yyyy") }),
      });
      const data = await response.json();
      if (data) {
        setAttendanceRecords(data);
        setRowLoading(false);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceRecord(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const validateCheckinStatus = async () => {
      try {
        const response = await fetch("/api/validateCheckin");
        const checkInStatus = await response.json();
        setCheckin(checkInStatus.message.hasCheckedIn);
        setCheckout(checkInStatus.message.hasCheckedOut);
      } catch (error) {
        console.error("Check-in validation failed:", error);
      }
    };
    validateCheckinStatus();
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const locationData = await fetchUserLocation();
        setLocation(locationData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get location. Please enable location services.",
          variant: "default",
        });
      }
    };
    getLocation();
  }, [toast]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  };

  const handleCheckIn = async () => {
    setCheckinLoading(true);
    try {
      if (!location) {
        toast({
          title: "Error",
          description: "Location is not available.",
          variant: "default",
        });
        return;
      }
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          date: formattedDate,
          checkInTime: formattedTime,
          countryName: location.countryName,
          gewog: location.locality,
          dzongkhag: location.principalSubdivision,
        }),
      });
      const data = await response.json();
      if (data.message) {
        toast({
          title: "Checked In",
          description: `${data.message} at ${formattedTime}`,
          variant: "default",
        });
        setCheckin(true);
        await fetchAttendanceRecord(selectedDate);
      } else {
        throw new Error("Failed to check in");
      }
    } catch (error: any) {
      toast({
        title: "Check-in Failed",
        description: `Error: ${error.message}`,
        variant: "default",
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckoutLoading(true);
    try {
      if (!location) {
        toast({
          title: "Error",
          description: "Location is not available.",
          variant: "default",
        });
        return;
      }
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          date: formattedDate,
          checkOutTime: formattedTime,
          countryName: location.countryName,
          gewog: location.locality,
          dzongkhag: location.principalSubdivision,
        }),
      });
      const data = await response.json();
      if (data.message === "Checkout successful") {
        toast({
          title: "Checked Out",
          description: `${data.message} at ${formattedTime}`,
          variant: "default",
        });
        setCheckout(true);
        await fetchAttendanceRecord(selectedDate);
      } else {
        throw new Error("Failed to check out");
      }
    } catch (error) {
      toast({
        title: "Check-out Failed",
        description: "Check-in first",
        variant: "default",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              sizes="500px"
              src={session?.user?.image ?? undefined}
              alt="Avatar"
            />
            <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{session?.user?.name}</span>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <h1 className="text-5xl font-bold mb-6 p-3 border-b text-zinc-500 border-gray-200 text-center ">
        Employee Attendance
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Check In / Check Out Card */}
        <Card className="flex flex-col gap-3 justify-center">
          <CardHeader>
            <CardTitle className="text-center">Check In / Check Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-2">
              {/* Check In AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger
                  className="flex items-center justify-center disabled:text-gray-500 cursor-pointer disabled:hover:bg-white text-xl py-2 px-4 hover:bg-black hover:text-white border border-black"
                  disabled={!isToday(selectedDate) || checkin}
                >
                  {checkinLoading ? "Checking in..." : <><UserCheck className="mr-2 h-4 w-4" /> Check in</>}
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/50 max-w-sm tracking-wide text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You cannot check in again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckIn}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Check Out AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger
                  className="flex items-center justify-center text-xl py-2 px-4 cursor-pointer disabled:text-gray-500 disabled:hover:bg-white hover:bg-black hover:text-white border border-black"
                  disabled={!isToday(selectedDate) || checkout}
                >
                  {checkoutLoading ? "Checking out..." : <><UserMinus className="mr-2 h-4 w-4" /> Check out</>}
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/50 max-w-sm tracking-wide text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You cannot check out again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckOut}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Select a Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date as Date)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <div className="p-3 mt-10">
        <h2 className="text-center font-medium text-lg mb-4">
          Attendance Records for {format(selectedDate, "MMM dd, yyyy")}
        </h2>
        <Table className="mt-2">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check-In Time</TableHead>
              <TableHead>Check-Out Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : attendanceRecords.length > 0 ? (
              attendanceRecords.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkInTime}</TableCell>
                  <TableCell>{record.checkOutTime || "-"}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>
                    {record.checkInLocation?.[0]} | {record.checkOutLocation?.[0] ?? "-"}
                  </TableCell>
                  <TableCell>{record.totalHoursWorked ?? "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No attendance records available for this date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
