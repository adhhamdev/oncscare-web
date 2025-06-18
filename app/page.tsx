"use client";

import Drawer from "@/components/drawer";
import Insights from "@/components/insights";
import Notifications from "@/components/notifications";
import PatientsTable from "@/components/patients-table";
import ProtectedRoute from "@/components/ProtectedRoute";
import TableControls from "@/components/table-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
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
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { useMemo, useState } from "react";

const patientData: Patient[] = [
  {
    id: "ONC_UHL001",
    tumourSite: "Breast",
    lastSubmission: "02/02/2025",
    triageLevel: "Red",
    keySymptoms: "Severe pain, fatigue",
    actionTaken: true,
  },
  {
    id: "ONC_UHL002",
    tumourSite: "Lung",
    lastSubmission: "01/02/2025",
    triageLevel: "Amber",
    keySymptoms: "Shortness of breath",
    actionTaken: false,
  },
  {
    id: "ONC_UHL003",
    tumourSite: "Breast",
    lastSubmission: "03/02/2025",
    triageLevel: "Red",
    keySymptoms: "Nausea, dizziness",
    actionTaken: true,
  },
  {
    id: "ONC_UHL004",
    tumourSite: "Prostate",
    lastSubmission: "31/01/2025",
    triageLevel: "Green",
    keySymptoms: "Mild discomfort",
    actionTaken: false,
  },
  {
    id: "ONC_UHL005",
    tumourSite: "Colorectal",
    lastSubmission: "04/02/2025",
    triageLevel: "Red",
    keySymptoms: "Abdominal pain",
    actionTaken: true,
  },
  {
    id: "ONC_UHL006",
    tumourSite: "Breast",
    lastSubmission: "30/01/2025",
    triageLevel: "Amber",
    keySymptoms: "Fatigue, headache",
    actionTaken: false,
  },
  {
    id: "ONC_UHL007",
    tumourSite: "Lung",
    lastSubmission: "05/02/2025",
    triageLevel: "Green",
    keySymptoms: "Mild cough",
    actionTaken: false,
  },
  {
    id: "ONC_UHL008",
    tumourSite: "Prostate",
    lastSubmission: "02/02/2025",
    triageLevel: "Red",
    keySymptoms: "Severe pain",
    actionTaken: true,
  },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "High Priority Alert",
      message: "Patient ONC_UHL001 requires immediate attention",
      time: "2 minutes ago",
      type: "urgent",
      patientId: "ONC_UHL001",
    },
    {
      id: 2,
      title: "New Symptom Submission",
      message: "3 new symptom reports received",
      time: "15 minutes ago",
      type: "info",
    },
    {
      id: 3,
      title: "Weekly Report Ready",
      message: "Your weekly patient summary is available",
      time: "1 hour ago",
      type: "info",
    },
    {
      id: 4,
      title: "System Maintenance",
      message: "Scheduled maintenance tonight at 11 PM",
      time: "3 hours ago",
      type: "warning",
    },
  ];

  const handleNotificationClick = (notification: any) => {
    if (notification.patientId) {
      const patient = patientData.find((p) => p.id === notification.patientId);
      if (patient) {
        setSelectedPatient(patient);
        setIsDrawerOpen(true);
        setIsNotificationOpen(false);
      }
    }
  };

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
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
          <div className="font-medium text-gray-900">{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "tumourSite",
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
        cell: ({ row }) => (
          <div className="text-gray-700">{row.getValue("tumourSite")}</div>
        ),
      },
      {
        accessorKey: "lastSubmission",
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
        cell: ({ row }) => (
          <div className="text-gray-700">{row.getValue("lastSubmission")}</div>
        ),
      },
      {
        accessorKey: "triageLevel",
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
          const level = row.getValue("triageLevel") as string;
          return (
            <Badge
              variant="secondary"
              className={
                level === "Red"
                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                  : level === "Amber"
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  : "bg-green-100 text-green-800 hover:bg-green-100"
              }
            >
              {level}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "keySymptoms",
        header: "Key Symptoms",
        cell: ({ row }) => (
          <div className="text-gray-700">{row.getValue("keySymptoms")}</div>
        ),
      },
      {
        accessorKey: "actionTaken",
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
          const actionTaken = row.getValue("actionTaken") as boolean;
          return (
            <Badge
              variant="secondary"
              className="bg-teal-100 text-teal-800 hover:bg-teal-100"
            >
              {actionTaken ? "YES" : "NO"}
            </Badge>
          );
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
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      rowSelection,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-teal-600">
              OncsCare
            </span>
            <span className="hidden sm:block text-xl font-normal text-gray-700">
              Clinician Dashboard
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden sm:block text-sm text-gray-600">
              Welcome, {user?.displayName || user?.email}
            </div>

            {/* Notifications */}
            <Notifications
              isNotificationOpen={isNotificationOpen}
              setIsNotificationOpen={setIsNotificationOpen}
              setSelectedPatient={setSelectedPatient}
              setIsDrawerOpen={setIsDrawerOpen}
              patientData={patientData}
            />

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
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
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
