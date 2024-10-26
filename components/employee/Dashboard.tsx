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

interface AttendanceRecord {
  date: string;
  checkInTime: string;
  checkOutLocation: string[];
  checkOutTime: string;
  status: string;
  checkInLocation: string[];
  totalHoursWorked: number;
}

type LocationInfo = {
  countryName: string;
  locality: string;
  principalSubdivision: string;
};

const Dashboard = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [checkinloading, setCheckInloading] = useState(false);
  const [checkoutloading, setCheckoutloading] = useState(false);
  const [rowloading, setrowloading] = useState(true);

  const { toast } = useToast();
  const { data: session } = useSession();
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [checkin, setcheckin] = useState(false);
  const [checkout, setcheckout] = useState(false);
  const formattedDate = format(new Date(), "dd-MM-yyyy");
  const formattedTime = format(new Date(), "hh:mm a");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchAttendanceRecord = async (currentDate: Date) => {
    const response = await fetch("http://localhost:3000/api/fetchAttendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedDate: format(currentDate, "dd-MM-yyyy"),
      }),
    });
    const data = await response.json();
    if (data) {
      setAttendanceRecords(data);
      setrowloading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecord(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const validateCheckin = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/validateCheckin"
        );
        const checkIn = await response.json();
        if (checkIn.message.hasCheckedIn) {
          setcheckin(true);
        } else {
          setcheckin(false);
        }
        if (checkIn.message.hasCheckedOut) {
          setcheckout(true);
        } else {
          setcheckout(false);
        }
      } catch (error) {
        console.error("Check-in validation failed:", error);
      }
    };

    validateCheckin();
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const locationData = await fetchUserLocation(); // Fetch location data
        setLocation(locationData);
      } catch (err) {
        toast({
          title: "Error",
          description:
            "Failed to get location. Please enable location services.",
          variant: "default",
        });
      }
    };

    getLocation();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  };
  const handleCheckIn = async () => {
    setCheckInloading(true);
    try {
      if (!location) {
        toast({
          title: "Error",
          description: "Location is not available.",
          variant: "default",
        });
        return;
      }

      const response = await fetch("http://localhost:3000/api/checkin", {
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
      setCheckInloading(false);
      const data = await response.json();
      if (data.message) {
        toast({
          title: "CheckedIn",
          description: `${data.message} at ${format(new Date(), "hh:mm a")}`,
          variant: "default",
        });
        setcheckin(true);
        await fetchAttendanceRecord(selectedDate);
      } else {
        throw new Error("Failed to check in");
      }
    } catch (error) {
      toast({
        title: "Checked in failed",
        description: `Check in failed:${error}`,
        variant: "default",
      });
    }
  };

  const handleCheckOut = async () => {
    setCheckoutloading(true);
    try {
      if (!location) {
        toast({
          title: "Error",
          description: "Location is not available.",
          variant: "default",
        });
        return;
      }

      const response = await fetch("http://localhost:3000/api/checkout", {
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

      setCheckoutloading(false);
      const data = await response.json();
      if (data.message == "Checkout successfull") {
        toast({
          title: "CheckedOut",
          description: `${data.message} at ${format(new Date(), "hh:mm a")}`,
          variant: "default",
        });
        setcheckout(true);
        await fetchAttendanceRecord(selectedDate);
      } else {
        throw new Error("Failed to check out");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Checked out failed",
        description: `Check in first`,
        variant: "default",
      });
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
        <Card className="flex flex-col gap-3 justify-center">
          <CardHeader>
            <CardTitle className="text-center">Check In / Check Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-2">
              <AlertDialog>
                <AlertDialogTrigger
                  className="flex items-center justify-center disabled:text-gray-500 cursor-pointer disabled:hover:bg-white text-xl  py-2 px-4 hover:bg-black hover:text-white border border-black"
                  disabled={!isToday(selectedDate) || checkin}
                >
                  {checkinloading ? (
                    <h1>Checking in...</h1>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Check in
                    </>
                  )}
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/50 max-w-sm tracking-wide text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.You cannot check in again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckIn}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger
                  className="flex items-center justify-center text-xl py-2 px-4 cursor-pointer disabled:text-gray-500 disabled:hover:bg-white hover:bg-black hover:text-white text-black border border-black"
                  disabled={!isToday(selectedDate) || checkout}
                >
                  {checkoutloading ? (
                    <h1>Checking out...</h1>
                  ) : (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" /> Check out
                    </>
                  )}
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/50 max-w-sm tracking-wide text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.You cannot check out again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckOut}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Select date to check your status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => isBefore(new Date(), date)}
              defaultMonth={new Date()}
              className="rounded-md border"
              classNames={{
                day_selected: "bg-black text-white rounded-[9999px] hover:rounded-[9999px] hover:bg-black hover:text-white",
              }}
              initialFocus
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-center">
            Attendance Record for the date: {format(selectedDate, "dd-MM-yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="border border-gray-300 px-4 py-2">
                  Date
                </TableHead>
                <TableHead className="border border-gray-300 px-4 py-2">
                  Check in time
                </TableHead>
                <TableHead className="border border-gray-300 px-4 py-2">
                  Check in location
                </TableHead>
                <TableHead className="border border-gray-300 px-4 py-2">
                  Check out time
                </TableHead>
                <TableHead className="border border-gray-300 px-4 py-2">
                  Check out location
                </TableHead>
                <TableHead className="border text-center border-gray-300 px-4 py-2">
                  Total hours worked
                </TableHead>
                <TableHead className="border border-gray-300 px-4 py-2">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rowloading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full bg-gray-300 rounded-xl p-5" />
                  </TableCell>
                </TableRow>
              ) : attendanceRecords &&
                Object.keys(attendanceRecords).length > 0 ? (
                <TableRow className="border border-gray-300">
                  <TableCell className="border border-gray-300 px-4 py-2">
                    {attendanceRecords.id}
                  </TableCell>
                  <TableCell className="border border-gray-300 px-4 py-2">
                    {attendanceRecords.checkInTime}
                  </TableCell>
                  <TableCell className="border border-gray-300 px-4 py-2">
                    {attendanceRecords.checkInLocation}
                  </TableCell>
                  <TableCell className="border border-gray-300 px-4 py-2">
                    {attendanceRecords.checkOutTime}
                  </TableCell>
                  <TableCell className="border border-gray-300 px-4 py-2">
                    {attendanceRecords.checkOutLocation}
                  </TableCell>
                  <TableCell className="border text-center border-gray-300 px-4 py-2">
                    {attendanceRecords.totalHoursWorked}
                  </TableCell>
                  <TableCell className="border border-gray-300 px-4 py-2">
                    {attendanceRecords.status}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center border border-gray-300 px-4 py-2"
                  >
                    No records found for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default Dashboard;