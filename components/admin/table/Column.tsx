"use client";
import { ColumnDef } from "@tanstack/react-table";

export type managersInfo = {
  id: string;
  SlNo: number;
  Name: string;
  email: string; // Ensure casing matches your Firestore fields
  Number: number; 
  Date: Date; 
};

export const columns: ColumnDef<managersInfo>[] = [
  {
    accessorKey: "SlNo",
    header: "Sl. No.",
    cell: (info) => info.row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email", // Ensure the casing is correct
    header: "Email",
  },
  {
    accessorKey: "phonenumber", // Ensure the casing matches your Firestore fields
    header: "Phone Number",
  },

];
