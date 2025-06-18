import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Patient } from "@/lib/types";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";

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

export default function Notifications({
  isNotificationOpen,
  setIsNotificationOpen,
  setSelectedPatient,
  setIsDrawerOpen,
  patientData,
}: {
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  setSelectedPatient: (patient: any) => void;
  setIsDrawerOpen: (open: boolean) => void;
  patientData: Patient[];
}) {
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
  return (
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
          <p className="text-sm text-gray-500">
            {notifications.length} new notifications
          </p>
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
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
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
  );
}
