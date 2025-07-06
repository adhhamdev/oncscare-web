"use client";

import Drawer from "@/components/drawer";
import Insights from "@/components/insights";
import { Logo } from "@/components/logo";
import PatientsTable from "@/components/patients-table";
import ProtectedRoute from "@/components/ProtectedRoute";
import TableControls from "@/components/table-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { Patient } from "@/lib/types";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Loading from "./loading";

function Dashboard() {
  const { user, logout, loading } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientData, setPatientData] = useState<Patient[]>([]);

  async function getPatients() {
    try {
      setPatientsLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "Patient"));
      const querySnapshot = (await getDocs(q)).docs;
      const patients: Patient[] = [];
      querySnapshot.forEach((doc) => {
        patients.push({
          id: doc.id,
          ...doc.data(),
        } as Patient);
      });
      console.log("Patients", patients);
      setPatientData(patients);
    } catch (e) {
      console.error("Error getting documents: ", e);
    } finally {
      setPatientsLoading(false);
    }
  }

  useEffect(() => {
    getPatients();
  }, []);

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      // {
      //   id: "select",
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={table.getIsAllPageRowsSelected()}
      //       onCheckedChange={(value) =>
      //         table.toggleAllPageRowsSelected(!!value)
      //       }
      //       aria-label="Select all"
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       checked={row.getIsSelected()}
      //       onCheckedChange={(value) => row.toggleSelected(!!value)}
      //       aria-label="Select row"
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      // },
      {
        accessorKey: "displayName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Study ID
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">
            {row.getValue("displayName")}
          </div>
        ),
      },
      {
        accessorKey: "cancer_type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Tumour Site
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("cancer_type")}</div>,
      },
      {
        accessorKey: "last_submission_date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Last Submission
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => {
          const date: Timestamp = row.getValue("last_submission_date");
          if (!date) return null;
          return <div>{new Date(date.toDate()).toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: "triage_level",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Triage Level
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => {
          const triageLevel = row.getValue("triage_level") as string;
          let badgeColor;
          switch (triageLevel) {
            case "Hard Red":
              badgeColor = "bg-red-500 text-white";
              break;
            case "Red":
              badgeColor = "bg-red-100 text-red-800";
              break;
            case "Amber":
              badgeColor = "bg-yellow-100 text-yellow-800";
              break;
            case "Green":
              badgeColor = "bg-green-100 text-green-800";
              break;
            default:
              badgeColor = "bg-gray-100 text-gray-800";
          }
          return <Badge className={badgeColor}>{triageLevel}</Badge>;
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "key_symptoms",
        header: "Key Symptoms",
        cell: ({ row }) => <div>{row.getValue("key_symptoms")}</div>,
      },
      {
        accessorKey: "action_taken",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Action Taken?
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => {
          const actionTaken = row.getValue("action_taken");
          return <div>{actionTaken ? "Yes" : "No"}</div>;
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: patientData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    enableRowSelection: false,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDrawerOpen(true);
  };

  if (loading || patientsLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Logo" width={36} height={36} />
            <Logo />
            <span className="text-xl font-normal text-gray-700">
              Clinician Dashboard
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden sm:block text-sm text-gray-600">
              Welcome, {user?.displayName || user?.email}
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Insights Section */}
        <Insights />

        {/* Patients Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Patients
          </h2>

          {/* Table Controls */}
          <TableControls
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            table={table}
          />

          {/* Patients Table */}
          <Card className="bg-white">
            <div className="overflow-x-auto">
              <PatientsTable
                table={table}
                handleRowClick={handleRowClick}
                columns={columns}
              />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4 px-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Patient Details Drawer */}
      <Drawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        selectedPatient={selectedPatient}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
