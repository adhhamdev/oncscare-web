import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function TableControls({
  globalFilter,
  setGlobalFilter,
  table,
}: {
  globalFilter: string | null;
  setGlobalFilter: (filter: string) => void;
  table: any;
}) {
  return (
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
          value={
            (
              table.getColumn("triageLevel")?.getFilterValue() as string[]
            )?.join(",") || ""
          }
          onValueChange={(value) =>
            table
              .getColumn("triageLevel")
              ?.setFilterValue(value ? value.split(",") : undefined)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Triage Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Red"> Red</SelectItem>
            <SelectItem value="Amber">🟡 Amber</SelectItem>
            <SelectItem value="Green">🟢 Green</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={
            (
              table.getColumn("actionTaken")?.getFilterValue() as boolean[]
            )?.join(",") || ""
          }
          onValueChange={(value) =>
            table
              .getColumn("actionTaken")
              ?.setFilterValue(value ? [value === "true"] : undefined)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Action Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="true">✅ Action Taken</SelectItem>
            <SelectItem value="false">❌ No Action</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
