'use client';

import Drawer from '@/components/drawer';
import Insights from '@/components/insights';
import { Logo } from '@/components/logo';
import PatientsTable from '@/components/patients-table';
import ProtectedRoute from '@/components/ProtectedRoute';
import TableControls from '@/components/table-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Patient, SymptomSubmission } from '@/lib/types';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import Loading from './loading';

function Dashboard() {
  const { user, logout, loading } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientData, setPatientData] = useState<Patient[]>([]);

  const handleExport = async () => {
    try {
      // Fetch all patients
      const patientsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Patient')
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const patients = patientsSnapshot.docs.map((doc) => ({
        ...(doc.data() as Patient),
        docRefPath: doc.ref.path,
      }));

      const patientRefMap = new Map(
        patients.map((p) => [p.docRefPath, p.display_name])
      );

      // Fetch all symptom submissions
      const submissionsQuery = query(collection(db, 'symptom_submissions'));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissions = submissionsSnapshot.docs.map((doc) => {
        const data = doc.data() as SymptomSubmission;
        return {
          ...data,
          id: doc.id,
          patient_display_name: patientRefMap.get(data.patient_id.path),
        };
      });

      // Format data for Excel
      const patientsSheet = patients.map((p) => ({
        'Study ID': p.display_name,
        'Cancer Type': p.cancer_type,
        'Triage Level': p.triage_level,
        'Last Submission Date': p.last_submission_date
          ? (p.last_submission_date as Timestamp).toDate().toLocaleDateString()
          : 'N/A',
      }));

      const submissionsSheet = submissions.map((s) => ({
        'Patient Study ID': s.patient_display_name,
        'Submission Date': s.timestamp
          ? (s.timestamp as Timestamp).toDate().toLocaleString()
          : 'N/A',
        'Triage Level': s.triage_level,
        Symptoms: s.symptoms
          .map((sym: any) => {
            let symptomDesc = sym.symptom;
            if (sym.severity) {
              symptomDesc += ` (Severity: ${sym.severity}`;
              if (sym.symptom === 'Fever' && sym.temperature) {
                symptomDesc += `, Temperature: ${sym.temperature}`;
              }
              symptomDesc += ')';
            } else if (sym.symptom === 'Fever' && sym.temperature) {
              symptomDesc += ` (Temperature: ${sym.temperature})`;
            }
            return symptomDesc;
          })
          .join(', '),
        'Is Baseline': s.is_baseline ? 'Yes' : 'No',
        Notes: s.notes,
      }));

      // Create workbook and worksheets
      const wb = XLSX.utils.book_new();
      const wsSubmissions = XLSX.utils.json_to_sheet(submissionsSheet);
      const wsPatients = XLSX.utils.json_to_sheet(patientsSheet);

      // --- Styling --- //
      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F81BD' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      // Style Submissions Sheet
      const subRange = XLSX.utils.decode_range(wsSubmissions['!ref']!);
      for (let C = subRange.s.c; C <= subRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!wsSubmissions[address]) continue;
        wsSubmissions[address].s = headerStyle;
      }
      wsSubmissions['!cols'] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 50 },
        { wch: 15 },
        { wch: 50 },
      ];
      for (let R = subRange.s.r + 1; R <= subRange.e.r; ++R) {
        const symptomsCell =
          wsSubmissions[XLSX.utils.encode_cell({ r: R, c: 3 })];
        if (symptomsCell) symptomsCell.s = { alignment: { wrapText: true } };
        const notesCell = wsSubmissions[XLSX.utils.encode_cell({ r: R, c: 5 })];
        if (notesCell) notesCell.s = { alignment: { wrapText: true } };
      }

      // Style Patients Sheet
      const patRange = XLSX.utils.decode_range(wsPatients['!ref']!);
      for (let C = patRange.s.c; C <= patRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!wsPatients[address]) continue;
        wsPatients[address].s = headerStyle;
      }
      wsPatients['!cols'] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
      ];

      // Append sheets to workbook
      XLSX.utils.book_append_sheet(wb, wsSubmissions, 'Submissions');
      XLSX.utils.book_append_sheet(wb, wsPatients, 'Patients');

      // Write workbook to file
      XLSX.writeFile(wb, 'OncScare_Report.xlsx');
    } catch (error) {
      console.error('Failed to export data:', error);
      // You might want to show a notification to the user here
    }
  };

  async function getPatients() {
    if (!user) {
      setPatientData([]);
      return;
    }
    try {
      setPatientsLoading(true);
      const patientsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Patient')
      );
      const querySnapshot = await getDocs(patientsQuery);
      const patients = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const patient = { id: doc.id, ...doc.data() } as Patient;
          const submissionsQuery = query(
            collection(db, 'symptom_submissions'),
            where('patient_id', '==', doc.ref),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          const submissionSnapshot = await getDocs(submissionsQuery);
          if (!submissionSnapshot.empty) {
            const latestSubmission = submissionSnapshot.docs[0].data();
            patient.key_symptoms = latestSubmission.symptoms
              .filter((s: any) => s.severity > 0)
              .map((s: any) => s.symptom)
              .join(', ');
          }
          return patient;
        })
      );
      setPatientData(patients);
    } catch (e) {
      console.error('Error getting documents: ', e);
    } finally {
      setPatientsLoading(false);
    }
  }

  useEffect(() => {
    getPatients();
  }, [user]);

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
        accessorKey: 'display_name',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='h-auto p-0 font-medium text-gray-700 hover:bg-transparent'>
              Study ID
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className='ml-2 h-4 w-4' />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className='ml-2 h-4 w-4' />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className='font-medium text-gray-900'>
            {row.getValue('display_name')}
          </div>
        ),
      },
      {
        accessorKey: 'cancer_type',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='h-auto p-0 font-medium text-gray-700 hover:bg-transparent'>
              Tumour Site
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className='ml-2 h-4 w-4' />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className='ml-2 h-4 w-4' />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue('cancer_type')}</div>,
      },
      {
        accessorKey: 'last_submission_date',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='h-auto p-0 font-medium text-gray-700 hover:bg-transparent'>
              Last Submission
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className='ml-2 h-4 w-4' />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className='ml-2 h-4 w-4' />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => {
          const date: Timestamp = row.getValue('last_submission_date');
          if (!date) return null;
          return <div>{new Date(date.toDate()).toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: 'triage_level',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='h-auto p-0 font-medium text-gray-700 hover:bg-transparent'>
              Triage Level
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className='ml-2 h-4 w-4' />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className='ml-2 h-4 w-4' />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => {
          const triageLevel = row.getValue('triage_level') as string;

          if (!triageLevel) {
            return <Badge variant='outline'>N/A</Badge>;
          }

          return (
            <Badge
              variant={
                triageLevel === 'Hard Red' || triageLevel === 'Red'
                  ? 'destructive'
                  : 'default'
              }
              className={
                triageLevel === 'Hard Red' || triageLevel === 'Red'
                  ? 'bg-red-500'
                  : triageLevel === 'Amber'
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }>
              {triageLevel}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'key_symptoms',
        header: 'Key Symptoms',
        cell: ({ row }) => <div>{row.getValue('key_symptoms') || 'N/A'}</div>,
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
    globalFilterFn: 'includesString',
    enableRowSelection: false,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 60,
      },
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
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
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Image src='/logo.png' alt='Logo' width={36} height={36} />
            <Logo />
            <span className='text-xl font-normal text-gray-700'>
              Clinician Dashboard
            </span>
          </div>
          <div className='flex items-center space-x-3'>
            {/* User Info */}
            <div className='hidden sm:block text-sm text-gray-600'>
              Welcome, Team!
            </div>

            {/* Logout Button */}
            <Button
              variant='outline'
              onClick={handleLogout}
              className='flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50'>
              <LogOut className='h-4 w-4' />
              <span className='hidden sm:inline'>Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className='px-4 py-6 sm:px-6 lg:px-8'>
        {/* Insights Section */}
        <Insights />

        {/* Patients Section */}
        <section>
          <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
            Patients
          </h2>

          {/* Table Controls */}
          <TableControls
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            table={table}
            onExport={handleExport}
            onRefresh={getPatients}
          />

          {/* Patients Table */}
          <Card className='bg-white'>
            <div className='overflow-x-auto'>
              <PatientsTable
                table={table}
                handleRowClick={handleRowClick}
                columns={columns}
              />
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-between space-x-2 py-4 px-4'>
              <div className='flex items-center space-x-2'>
                <p className='text-sm font-medium'>
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </p>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}>
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}>
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
