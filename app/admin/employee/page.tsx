"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DisplayEmployees from "../../../components/admin/DisplayEmployees";

const Employee = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">Employee List</CardTitle>
          <hr className="w-full"></hr>
        </CardHeader>
        <CardContent>
          <DisplayEmployees />
        </CardContent>
      </Card>
    </>
  );
};

export default Employee;
