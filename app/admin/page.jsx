"use client";
import React, { useEffect, useState } from "react";
import DisplayChart from "../../components/admin/DisplayChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { format } from "date-fns";
import {
  collection,
  getDocs,
  doc,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { app } from "@/app/firebase/config";
import { Skeleton } from "@/components/ui/skeleton";

const Admin = () => {
  const [empcnt, setEmpcnt] = useState(0);
  const [checkoutCnt, setCheckoutCnt] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loadingTotalEmployees, setLoadingTotalEmployees] = useState(true);
  const [loadingEmpcnt, setLoadingEmpcnt] = useState(true);
  const [loadingCheckoutCnt, setLoadingCheckoutCnt] = useState(true);

  const currentDate = format(new Date(), "dd-MM-yyyy");
  const db = getFirestore(app);
  const employeeRef = collection(db, "employees");

  useEffect(() => {
    const getEmpCntCurrentDate = async () => {
      const employeeSnapShot = await getDocs(employeeRef);
      let employeeCheckInStatus = {};
      let employeeCheckOutStatus = {};

      employeeSnapShot.forEach((employeeDoc) => {
        const employeeID = employeeDoc.id;
        const attendanceDocRef = doc(
          db,
          "employees",
          employeeID,
          "attendance",
          currentDate
        );

        onSnapshot(attendanceDocRef, (attendanceDocSnap) => {
          if (attendanceDocSnap.exists()) {
            const attendanceData = attendanceDocSnap.data();
            employeeCheckInStatus[employeeID] = !!attendanceData.checkInTime;
            employeeCheckOutStatus[employeeID] = !!attendanceData.checkOutTime;
          } else {
            // If no document exists for current date, set to false
            employeeCheckInStatus[employeeID] = false;
            employeeCheckOutStatus[employeeID] = false;
          }

          // Update the counts after each snapshot
          const checkedInCount = Object.values(employeeCheckInStatus).filter(
            (status) => status
          ).length;
          const checkedOutCount = Object.values(employeeCheckOutStatus).filter(
            (status) => status
          ).length;

          setEmpcnt(checkedInCount);
          setCheckoutCnt(checkedOutCount);

          // Set loading states to false once data is fetched
          setLoadingEmpcnt(false);
          setLoadingCheckoutCnt(false);
        });
      });
    };

    getEmpCntCurrentDate();
    return () => {
      setEmpcnt(0);
      setCheckoutCnt(0);
    };
  }, [db, currentDate]);

  useEffect(() => {
    const getTotalEmployees = async () => {
      const employeeSnapShot = await getDocs(employeeRef);
      setTotalEmployees(employeeSnapShot.size);
      setLoadingTotalEmployees(false);
    };
    getTotalEmployees();
  }, [db]);

  const loading = loadingTotalEmployees || loadingEmpcnt || loadingCheckoutCnt;

  return (
    <>
      <div>
        {loading ? (
          <div className="flex gap-3 w-full mx-auto justify-evenly p-3">
            <Skeleton className="w-[300px] bg-gray-300 h-[100px] rounded-2xl" />
            <Skeleton className="w-[300px] bg-gray-300 h-[100px] rounded-2xl" />
            <Skeleton className="w-[300px] bg-gray-300 h-[100px] rounded-2xl" />
          </div>
        ) : (
          <div className="grid md:max-w-4xl w-full mx-auto mt-4 grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:p-3 py-7 md:py-0 p-5">
            <Card className="rounded-lg border border-gray-300">
              <CardHeader className="flex flex-row items-center justify-center gap-x-5 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-center font-bold">
                  {totalEmployees}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-lg border border-gray-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total checkin today: {format(new Date(), "dd-MM-yyyy")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-center font-bold">{empcnt}</div>
              </CardContent>
            </Card>
            <Card className="rounded-lg border border-gray-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total checkout today: {format(new Date(), "dd-MM-yyyy")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-center font-bold">
                  {checkoutCnt}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <DisplayChart />
      </div>
    </>
  );
};

export default Admin;
