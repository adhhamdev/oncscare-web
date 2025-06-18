import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, TrendingUp, Users } from "lucide-react";

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
];

export default function Insights() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {insight.title}
              </CardTitle>
              <insight.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {insight.value}
              </div>
              <p
                className={`text-xs ${
                  insight.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {insight.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
