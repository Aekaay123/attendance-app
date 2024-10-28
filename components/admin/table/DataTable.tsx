"use client";

import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoChevronForward } from "react-icons/io5";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddEmployee from "../AddEmployee";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  handleDeleteEmployee: (id: string) => void;
  getManagers: () => void;
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  handleDeleteEmployee,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 7,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });
  
  const selectedTheme = useSelector((state: any) => state.theme.mode);

  const rowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
        <input
          placeholder="Search manager by name..."
          className={`w-full sm:w-64 outline-none border ${
            selectedTheme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"
          } rounded-md text-black p-2 mb-2 sm:mb-0`}
          value={(table.getColumn("name")?.getFilterValue() as string) || ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
        />
        <AddEmployee />
      </div>
      <div className="overflow-x-auto rounded-md border-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-gray-300"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center text-sm sm:text-md font-bold border-r border-gray-300 last:border-r-0 p-2 sm:p-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
                <TableHead className="text-center text-sm sm:text-md font-bold border-r border-gray-300 last:border-r-0 p-2 sm:p-4">
                  Actions
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rowCount ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="text-center  group border-b border-gray-300"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-r border-gray-300 last:border-r-0 p-2 sm:p-4 text-sm sm:text-base"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell
                    key={row.id}
                    className="border-r border-gray-300 last:border-r-0 p-2 sm:p-4"
                  >
                    <button
                      className="text-red-600 text-sm sm:text-base"
                      onClick={() => {
                        handleDeleteEmployee(row.original.id);
                      }}
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : data.length > 0 ? ( 
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  <span>No records found</span>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  <div className="w-full space-y-3">
                    <Skeleton className="w-full bg-gray-300 h-[40px] sm:h-[50px] rounded-md" />
                    <Skeleton className="w-full bg-gray-300 h-[40px] sm:h-[50px] rounded-md" />
                    <Skeleton className="w-full bg-gray-300 h-[40px] sm:h-[50px] rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-gray-200 rounded-full disabled:opacity-50 "
        >
          <IoIosArrowBack size={20} className={`rounded-full ${selectedTheme === "dark" ? "text-white bg-black" : "text-black"}`} />
        </button>
        <span className="text-sm sm:text-base">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-gray-200 rounded-full disabled:opacity-50"
        >
          <IoChevronForward size={20} className={`rounded-full ${selectedTheme === "dark" ? "text-white bg-black" : "text-black"}`} />
        </button>
      </div>
    </div>
  );
}