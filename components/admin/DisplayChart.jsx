import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import GenerateReport from "../../components/admin/GenerateReport"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { getFirestore, getDocs, collection, doc, getDoc } from "firebase/firestore"
import { app } from "@/app/firebase/config";
import { format } from "date-fns";

const DisplayChart = () => {
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  const COLORS = {
    present: "#4CAF50",
    absent: "#F44336",
    late: "#FFC107",
  };
 
  const getLast7Weekdays = useCallback(() => {
    const days = [];
    let count = 0;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); 

    let currentDate = yesterday;

    while (count < 7) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push(new Date(currentDate)); 
        count++;
      }

      currentDate.setDate(currentDate.getDate() - 1); 
    }

    return days.reverse();
  }, []);

  // Memoize the fetchAttendanceData function to avoid unnecessary re-renders
  const fetchAttendanceData = useCallback(async () => {
    const db = getFirestore(app);
    const employeeSnapShot = await getDocs(collection(db, "employees"));
    const workingDays = getLast7Weekdays();

    let attendanceResults = [];

    for (const date of workingDays) {
      const formattedDate = format(date, "dd-MM-yyyy");

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      for (const employeeDoc of employeeSnapShot.docs) {
        const employeeID = employeeDoc.id;
        const attendanceDocRef = doc(db, "employees", employeeID, "attendance", formattedDate);

        const attendanceSnap = await getDoc(attendanceDocRef);

        if (attendanceSnap.exists()) {
          const attendanceData = attendanceSnap.data();
          const status = attendanceData.status;

          if (status === "Present") {
            presentCount++;
          } else if (status === "Late") {
            lateCount++;
          } else if (status === "Absent") {
            absentCount++;
          }
        } else {
          absentCount++; // Mark absent if no attendance record is found
        }
      }

      attendanceResults.push({
        name: format(date, "EEE"),
        date: formattedDate,     
        present: presentCount,
        absent: absentCount,
        late: lateCount,
      });
    }

    return attendanceResults;
  }, [getLast7Weekdays]);

  useEffect(() => {
    const getAttendanceData = async () => {
      setLoading(true);
      const fetchedData = await fetchAttendanceData();
      setAttendanceData(fetchedData);
      setLoading(false);
    };

    getAttendanceData();
  }, [fetchAttendanceData]);

  const memoizedAttendanceData = useMemo(() => attendanceData, [attendanceData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Weekly Attendance Overview</CardTitle>
        <GenerateReport/>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[300px] bg-gray-300 rounded-2xl" />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={memoizedAttendanceData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  border: "none",
                  borderRadius: "4px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar dataKey="present" stackId="a" fill={COLORS.present}>
                {memoizedAttendanceData.map((entry, index) => (
                  <Cell key={`cell-present-${index}`} fill={COLORS.present} />
                ))}
              </Bar>
              <Bar dataKey="absent" stackId="a" fill={COLORS.absent}>
                {memoizedAttendanceData.map((entry, index) => (
                  <Cell key={`cell-absent-${index}`} fill={COLORS.absent} />
                ))}
              </Bar>
              <Bar dataKey="late" stackId="a" fill={COLORS.late}>
                {memoizedAttendanceData.map((entry, index) => (
                  <Cell key={`cell-late-${index}`} fill={COLORS.late} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DisplayChart;
