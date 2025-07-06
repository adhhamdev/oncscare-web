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
              table.getColumn("cancer_type")?.getFilterValue() as string[]
            )?.join(",") || "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("cancer_type")
              ?.setFilterValue(value === "all" ? undefined : value.split(","))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tumour Site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="breast">Breast</SelectItem>
            <SelectItem value="colorectal">Colorectal</SelectItem>
            <SelectItem value="ovarian">Ovarian</SelectItem>
            <SelectItem value="lung">Lung</SelectItem>
            <SelectItem value="melanoma">Melanoma</SelectItem>
            <SelectItem value="renalcellcarcinoma">
              Renal Cell Carcinoma
            </SelectItem>
            <SelectItem value="urolethial">Urolethial Cancer</SelectItem>
            <SelectItem value="endometrial">Endometrial</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
