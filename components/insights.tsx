import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AlertTriangle, FileText, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Insights {
  responses: {
    label: string;
    value: number;
    icon: React.ReactNode;
  };
  patients: {
    label: string;
    value: number;
    icon: React.ReactNode;
  };
  symptomSubmissions: {
    label: string;
    value: number;
    icon: React.ReactNode;
  };
  redAlerts: {
    label: string;
    value: number;
    icon: React.ReactNode;
  };
}

export default function Insights() {
  const [insights, setInsights] = useState<Insights>({
    responses: {
      label: "Responses",
      value: 0,
      icon: <TrendingUp />,
    },
    patients: {
      label: "Patients",
      value: 0,
      icon: <Users />,
    },
    symptomSubmissions: {
      label: "Symptom Submissions",
      value: 0,
      icon: <FileText />,
    },
    redAlerts: {
      label: "Red Alerts",
      value: 0,
      icon: <AlertTriangle />,
    },
  });

  useEffect(() => {
    const fetchInsights = async () => {
      const [patientsCount, symptomSubmissionsCount, redAlertsCount] =
        await Promise.all([
          getDocs(
            query(collection(db, "users"), where("role", "==", "Patient"))
          ).then((snapshot) => snapshot.docs.length),
          getDocs(query(collection(db, "symptom_submissions"))).then(
            (snapshot) => snapshot.docs.length
          ),
          getDocs(
            query(
              collection(db, "symptom_submissions"),
              where("triage_level", "==", "Red")
            )
          ).then((snapshot) => snapshot.docs.length),
        ]);

      setInsights((prev) => {
        return {
          responses: {
            ...prev.responses,
            value: 0,
          },
          patients: {
            ...prev.patients,
            value: patientsCount,
          },
          symptomSubmissions: {
            ...prev.symptomSubmissions,
            value: symptomSubmissionsCount,
          },
          redAlerts: {
            ...prev.redAlerts,
            value: redAlertsCount,
          },
        };
      });
    };
    fetchInsights();
  }, []);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(insights).map(([key, insight]) => (
          <Card key={key} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {insight.label}
              </CardTitle>
              {insight.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {insight.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
