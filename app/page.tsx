"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  LogOut,
  Brain,
  ChevronUp,
  ChevronDown,
  Search,
  Bell,
} from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

const insights = [
  {
    title: "Responses",
    value: "143",
    change: "+12%",
    icon: TrendingUp,
    changeType: "positive",
  },
  {
    title: "Patients",
    value: "1,250",
    change: "+5%",
    icon: Users,
    changeType: "positive",
  },
  {
    title: "Symptom Submissions",
    value: "856",
    change: "+8%",
    icon: FileText,
    changeType: "positive",
  },
  {
    title: "Red Alerts",
    value: "32",
    change: "-2%",
    icon: AlertTriangle,
    changeType: "negative",
  },
]

type Patient = {
  id: string
  tumourSite: string
  lastSubmission: string
  triageLevel: string
  keySymptoms: string
  actionTaken: boolean
}

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
]

const chartData = {
  "1D": [
    { time: "00:00", score: 65 },
    { time: "06:00", score: 72 },
    { time: "12:00", score: 68 },
    { time: "18:00", score: 75 },
  ],
  "1M": [
    { time: "Week 1", score: 65 },
    { time: "Week 2", score: 72 },
    { time: "Week 3", score: 68 },
    { time: "Week 4", score: 75 },
  ],
  "3M": [
    { time: "Month 1", score: 65 },
    { time: "Month 2", score: 72 },
    { time: "Month 3", score: 78 },
  ],
  "6M": [
    { time: "Jan", score: 60 },
    { time: "Feb", score: 65 },
    { time: "Mar", score: 72 },
    { time: "Apr", score: 68 },
    { time: "May", score: 75 },
    { time: "Jun", score: 78 },
  ],
}

const timePeriods = [
  { value: "1D", label: "1D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
]

const columnHelper = createColumnHelper<Patient>()

function Dashboard() {
  const { user, logout } = useAuth()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1M")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

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
  ]

  const handleNotificationClick = (notification: any) => {
    if (notification.patientId) {
      const patient = patientData.find((p) => p.id === notification.patientId)
      if (patient) {
        setSelectedPatient(patient)
        setIsDrawerOpen(true)
        setIsNotificationOpen(false)
      }
    }
  }

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Study ID
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          )
        },
        cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("id")}</div>,
      },
      {
        accessorKey: "tumourSite",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Tumour Site
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-gray-700">{row.getValue("tumourSite")}</div>,
      },
      {
        accessorKey: "lastSubmission",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Last Submission
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-gray-700">{row.getValue("lastSubmission")}</div>,
      },
      {
        accessorKey: "triageLevel",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Triage Level
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          )
        },
        cell: ({ row }) => {
          const level = row.getValue("triageLevel") as string
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
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: "keySymptoms",
        header: "Key Symptoms",
        cell: ({ row }) => <div className="text-gray-700">{row.getValue("keySymptoms")}</div>,
      },
      {
        accessorKey: "actionTaken",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent"
            >
              Action Taken?
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          )
        },
        cell: ({ row }) => {
          const actionTaken = row.getValue("actionTaken") as boolean
          return (
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 hover:bg-teal-100">
              {actionTaken ? "YES" : "NO"}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
    ],
    [],
  )

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
  })

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-teal-600">OncsCare</span>
            <span className="hidden sm:block text-xl font-normal text-gray-700">Clinician Dashboard</span>
          </div>
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden sm:block text-sm text-gray-600">Welcome, {user?.displayName || user?.email}</div>

            {/* Notifications */}
            <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">{notifications.length} new notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === "urgent"
                              ? "bg-red-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                        {notification.patientId && (
                          <Button size="sm" variant="ghost" className="text-xs">
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Mark All Read
                    </Button>
                    <Button size="sm" className="flex-1">
                      View All
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{insight.title}</CardTitle>
                  <insight.icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{insight.value}</div>
                  <p className={`text-xs ${insight.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                    {insight.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Patients Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Patients</h2>

          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search all columns..."
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(String(event.target.value))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={(table.getColumn("triageLevel")?.getFilterValue() as string[])?.join(",") || ""}
                onValueChange={(value) =>
                  table.getColumn("triageLevel")?.setFilterValue(value ? value.split(",") : undefined)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Triage Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                  <SelectItem value="Amber">Amber</SelectItem>
                  <SelectItem value="Green">Green</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={(table.getColumn("actionTaken")?.getFilterValue() as boolean[])?.join(",") || ""}
                onValueChange={(value) =>
                  table.getColumn("actionTaken")?.setFilterValue(value ? [value === "true"] : undefined)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Action Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="true">Action Taken</SelectItem>
                  <SelectItem value="false">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Patient Table */}
          <Card className="bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-gray-50">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4 px-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                selected.
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:w-[900px] sm:max-w-[900px] overflow-y-auto">
          <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Details
            </SheetTitle>
            <SheetDescription>Detailed information and trends for the selected patient</SheetDescription>
          </SheetHeader>

          {selectedPatient && (
            <div className="py-6 space-y-6">
              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Study ID</label>
                      <p className="text-lg font-semibold">{selectedPatient.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tumour Site</label>
                      <p className="text-lg">{selectedPatient.tumourSite}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Submission</label>
                      <p className="text-lg">{selectedPatient.lastSubmission}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Triage Level</label>
                      <Badge
                        variant="secondary"
                        className={
                          selectedPatient.triageLevel === "Red"
                            ? "bg-red-100 text-red-800"
                            : selectedPatient.triageLevel === "Amber"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {selectedPatient.triageLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trends Chart */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Symptom Score Trends
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {timePeriods.map((period) => (
                        <Button
                          key={period.value}
                          variant={selectedTimePeriod === period.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimePeriod(period.value)}
                          className="h-8 px-3"
                        >
                          {period.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[250px] sm:h-[300px]">
                    <ChartContainer
                      config={{
                        score: {
                          label: "Symptom Score",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData[selectedTimePeriod as keyof typeof chartData]}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" fontSize={12} tickMargin={5} />
                          <YAxis fontSize={12} tickMargin={5} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="var(--color-score)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-score)", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Brain className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-gray-600 mb-4">
                      AI-powered analysis and recommendations will be available here soon.
                    </p>
                    <div className="text-left bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">What to expect:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Automated symptom pattern recognition</li>
                        <li>• Personalized treatment recommendations</li>
                        <li>• Risk assessment and early warning alerts</li>
                        <li>• Predictive modeling for patient outcomes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
