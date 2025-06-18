import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Patient } from "@/lib/types";
import { createColumnHelper } from "@tanstack/react-table";
import { Brain, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function Drawer({
  isDrawerOpen,
  setIsDrawerOpen,
  selectedPatient,
}: {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  selectedPatient: Patient | null;
}) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1M");

  const timePeriods = [
    { value: "1D", label: "1D" },
    { value: "1M", label: "1M" },
    { value: "3M", label: "3M" },
    { value: "6M", label: "6M" },
    { value: "1Y", label: "1Y" },
  ];

  const columnHelper = createColumnHelper<Patient>();

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
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent
        side="right"
        className="w-full sm:w-[900px] sm:max-w-[900px] overflow-y-auto"
      >
        <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Patient Details
          </SheetTitle>
          <SheetDescription>
            Detailed information and trends for the selected patient
          </SheetDescription>
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
                    <label className="text-sm font-medium text-gray-500">
                      Study ID
                    </label>
                    <p className="text-lg font-semibold">
                      {selectedPatient.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tumour Site
                    </label>
                    <p className="text-lg">{selectedPatient.tumourSite}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Submission
                    </label>
                    <p className="text-lg">{selectedPatient.lastSubmission}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Triage Level
                    </label>
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
                        variant={
                          selectedTimePeriod === period.value
                            ? "default"
                            : "outline"
                        }
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
                        data={
                          chartData[
                            selectedTimePeriod as keyof typeof chartData
                          ]
                        }
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-4">
                    AI-powered analysis and recommendations will be available
                    here soon.
                  </p>
                  <div className="text-left bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      What to expect:
                    </h4>
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
  );
}
