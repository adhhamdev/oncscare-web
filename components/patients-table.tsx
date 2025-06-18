import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Patient } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  Header,
  HeaderGroup,
  Row,
} from "@tanstack/react-table";

export default function PatientsTable({
  table,
  handleRowClick,
  columns,
}: {
  table: any;
  handleRowClick: (patient: Patient) => void;
  columns: ColumnDef<Patient>[];
}) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup: HeaderGroup<Patient>) => (
          <TableRow key={headerGroup.id} className="bg-gray-50">
            {headerGroup.headers.map((header: Header<Patient, unknown>) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row: Row<Patient>) => (
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
  );
}
