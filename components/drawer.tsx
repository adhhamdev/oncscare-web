import { Accordion } from "@/components/ui/accordion";
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
import { db } from "@/lib/firebase";
import { Patient, SymptomSubmission } from "@/lib/types";
import { format } from "date-fns";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Brain, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import Submission from "./submission";

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
  const [chartData, setChartData] = useState<any>({});
  const [submissions, setSubmissions] = useState<SymptomSubmission[]>([]);
  const [actions, setActions] = useState<{
    [key: string]: { actionTaken: boolean; notes: string };
  }>(
    submissions.reduce(
      (acc, s) => ({ ...acc, [s.id]: { actionTaken: false, notes: "" } }),
      {}
    )
  );
  const [symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {
    if (selectedPatient) {
      const fetchSubmissions = async () => {
        const docRef = doc(db, "users", selectedPatient.id);
        const q = query(
          collection(db, "symptom_submissions"),
          where("patient_id", "==", docRef),
          orderBy("timestamp")
        );
        const querySnapshot = await getDocs(q);
        console.log(querySnapshot.docs);
        let submissions = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as SymptomSubmission)
        );
        setSubmissions(submissions);
        setActions(
          submissions.reduce(
            (acc, s) => ({
              ...acc,
              [s.id]: {
                actionTaken: s.action_taken || false,
                notes: s.notes || "",
              },
            }),
            {}
          )
        );
        submissions.sort(
          (a, b) =>
            (a.timestamp as Timestamp).toMillis() -
            (b.timestamp as Timestamp).toMillis()
        );
        processSubmissions(submissions);
      };
      fetchSubmissions();
    }
  }, [selectedPatient]);

  const processSubmissions = (submissions: SymptomSubmission[]) => {
    const now = new Date();

    const allSymptoms = Array.from(
      submissions.reduce((acc, s) => {
        s.symptoms.forEach((sym) => acc.add(sym.symptom));
        return acc;
      }, new Set<string>())
    );
    console.log(allSymptoms);
    setSymptoms(allSymptoms);

    const allDataPoints = submissions.map((s) => {
      const submissionDate = (s.timestamp as Timestamp).toDate();
      const currentSeverities: { [key: string]: number | null } = {};
      allSymptoms.forEach((symptom) => {
        currentSeverities[symptom] = null;
      });

      s.symptoms.forEach((sym) => {
        currentSeverities[sym.symptom] = sym.severity;
      });

      return {
        date: submissionDate,
        ...currentSeverities,
      };
    });
    console.log(allDataPoints);

    const chartDataForPeriods: { [key: string]: any[] } = {
      "1D": [],
      "1M": [],
      "3M": [],
      "6M": [],
      "1Y": [],
    };

    allDataPoints.forEach((point) => {
      const diffDays =
        (now.getTime() - point.date.getTime()) / (1000 * 3600 * 24);

      if (diffDays <= 1) {
        chartDataForPeriods["1D"].push({
          ...point,
          time: format(point.date, "HH:mm"),
        });
      }
      if (diffDays <= 30) {
        chartDataForPeriods["1M"].push({
          ...point,
          time: format(point.date, "dd MMM"),
        });
      }
      if (diffDays <= 90) {
        chartDataForPeriods["3M"].push({
          ...point,
          time: format(point.date, "dd MMM"),
        });
      }
      if (diffDays <= 180) {
        chartDataForPeriods["6M"].push({
          ...point,
          time: format(point.date, "MMM yy"),
        });
      }
      if (diffDays <= 365) {
        chartDataForPeriods["1Y"].push({
          ...point,
          time: format(point.date, "MMM yy"),
        });
      }
    });

    setChartData(chartDataForPeriods);
  };

  const timePeriods = [
    { value: "1D", label: "1D" },
    { value: "1M", label: "1M" },
    { value: "3M", label: "3M" },
    { value: "6M", label: "6M" },
    { value: "1Y", label: "1Y" },
  ];

  const chartConfig = symptoms.reduce((acc, symptom, index) => {
    acc[symptom] = {
      label: symptom,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as any);
  console.log("chartConfig", chartConfig);
  console.log("chartData", chartData);
  console.log("submissions", submissions);

  const reds = submissions.filter(
    (s) =>
      (s as SymptomSubmission)?.triage_level === "Red" ||
      (s as SymptomSubmission)?.triage_level === "Hard Red"
  );

  const handleActionChange = (submissionId: string, actionTaken: string) => {
    const actionTakenValue = actionTaken === "Yes";
    setActions((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], actionTaken: actionTakenValue },
    }));
  };

  const handleNotesChange = (submissionId: string, notes: string) => {
    setActions((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], notes },
    }));
  };

  const handleSave = async (submissionId: string) => {
    const action = actions[submissionId];
    if (action) {
      const submissionRef = doc(db, "symptom_submissions", submissionId);
      try {
        await updateDoc(submissionRef, {
          action_taken: action.actionTaken,
          notes: action.notes,
        });
        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((submission) =>
            submission.id === submissionId
              ? {
                  ...submission,
                  action_taken: action.actionTaken,
                  notes: action.notes,
                }
              : submission
          )
        );
      } catch (error) {
        console.error("Error saving action:", error);
      }
    }
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent
        side="right"
        className="w-full sm:w-[900px] sm:max-w-[900px] overflow-y-auto"
      >
        <SheetHeader className="bg-slate pb-4 border-b">
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
                      {selectedPatient.display_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tumour Site
                    </label>
                    <p className="text-lg">
                      {selectedPatient.cancer_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Submission
                    </label>
                    <p className="text-lg">
                      {new Date(
                        selectedPatient.last_submission_date?.toDate() ||
                          new Date()
                      ).toLocaleDateString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Triage Level
                    </label>
                    <div>
                      <Badge
                        variant="secondary"
                        className={
                          selectedPatient.triage_level === "Red" ||
                          selectedPatient.triage_level === "Hard Red"
                            ? "bg-red-100 text-red-800"
                            : selectedPatient.triage_level === "Amber"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {selectedPatient.triage_level || "N/A"}
                      </Badge>
                    </div>
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
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <LineChart data={chartData[selectedTimePeriod]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        fontSize={12}
                        tickMargin={5}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[1, 5]}
                        fontSize={12}
                        tickMargin={2}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      {symptoms.map((symptom, index) => (
                        <Line
                          key={symptom}
                          type="monotone"
                          dataKey={symptom}
                          stroke={chartConfig[symptom]?.color}
                          strokeWidth={2}
                          dot={{
                            fill: chartConfig[symptom]?.color,
                          }}
                        />
                      ))}
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Red Submissions Section */}
            {reds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-500" />
                    Red Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {reds.map((submission) => (
                      <Submission
                        key={submission.id}
                        submission={submission}
                        actions={actions}
                        handleActionChange={handleActionChange}
                        handleNotesChange={handleNotesChange}
                        handleSave={handleSave}
                      />
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* All Submissions Section */}
            {submissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {submissions.map((submission: SymptomSubmission) => (
                      <Submission
                        key={submission.id}
                        submission={submission}
                        actions={actions}
                        handleActionChange={handleActionChange}
                        handleNotesChange={handleNotesChange}
                        handleSave={handleSave}
                      />
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

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
