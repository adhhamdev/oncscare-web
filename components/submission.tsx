import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { SymptomSubmission } from "@/lib/types";
import { debounce } from "@/lib/utils";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Check } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface SubmissionProps {
  submission: SymptomSubmission;
  actions: {
    [key: string]: { actionTaken: boolean; notes: string };
  };
  handleActionChange: (submissionId: string, actionTaken: string) => void;
  handleNotesChange: (submissionId: string, notes: string) => void;
  handleSave: (submissionId: string) => void;
}

export default function Submission({
  submission,
  actions,
  handleActionChange,
  handleNotesChange,
  handleSave,
}: SubmissionProps) {
  console.log(submission);
  const [notes, setNotes] = useState(actions[submission.id]?.notes || "");

  useEffect(() => {
    setNotes(actions[submission.id]?.notes || "");
  }, [actions, submission.id]);

  const debouncedHandleNotesChange = useCallback(
    debounce((submissionId: string, newNotes: string) => {
      handleNotesChange(submissionId, newNotes);
    }, 500),
    [handleNotesChange]
  );

  const onNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    debouncedHandleNotesChange(submission.id, newNotes);
  };

  return (
    <AccordionItem key={submission.id} value={submission.id}>
      <AccordionTrigger>
        <div className="flex justify-between w-full pr-4">
          <span>
            {format((submission.timestamp as Timestamp).toDate(), "PPpp")}
          </span>
          <div className="flex gap-2">
            {submission.is_baseline && (
              <Badge variant="outline">Baseline</Badge>
            )}

            {!submission.is_baseline && (
              <Badge
                variant={
                  submission.triage_level === "Hard Red" ||
                  submission.triage_level === "Red"
                    ? "destructive"
                    : "default"
                }
                className={
                  submission.triage_level === "Hard Red" ||
                  submission.triage_level === "Red"
                    ? "bg-red-500"
                    : submission.triage_level === "Amber"
                    ? "bg-amber-500"
                    : "bg-green-500"
                }
              >
                {submission.triage_level || "N/A"}
              </Badge>
            )}
            {actions[submission.id]?.actionTaken && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="space-y-2 bg-gray-100 p-4 rounded-md">
            <h4 className="font-semibold text-lg">Symptoms Reported:</h4>
            <div className="flex flex-wrap gap-2">
              {submission.symptoms.map((s: any, i: any) => (
                <Badge
                  variant={s.symptom === "Fever" ? "destructive" : "secondary"}
                  key={i}
                  className="flex items-center space-x-1 text-base"
                >
                  <span>{s.symptom}</span>
                  {s.symptom !== "Fever" ? (
                    <span className="font-bold text-gray-700">
                      (Severity: {s.severity})
                    </span>
                  ) : (
                    <span className="font-bold text-white">
                      ({s.temperature} ℃)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
          {!submission.is_baseline && submission.triage_level !== "Green" && (
            <>
              {submission.action_taken && submission.notes && (
                <div className="space-y-2 bg-gray-100 p-4 rounded-md">
                  <h4 className="font-semibold text-lg">Action Taken:</h4>
                  <p>{submission.notes}</p>
                  {submission.action_taken_timestamp && (
                    <div className="flex justify-end space-x-2 text-muted-foreground">
                      <p>
                        {format(
                          (
                            submission.action_taken_timestamp as Timestamp
                          ).toDate(),
                          "PPpp"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {(!submission.action_taken || !submission.notes) && (
                <>
                  <div className="space-y-2">
                    <Label>Action Taken</Label>
                    <RadioGroup
                      value={
                        actions[submission.id]?.actionTaken === true
                          ? "Yes"
                          : "No"
                      }
                      onValueChange={(value: string) =>
                        handleActionChange(submission.id, value)
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Yes"
                          id={`yes-${submission.id}`}
                        />
                        <Label htmlFor={`yes-${submission.id}`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id={`no-${submission.id}`} />
                        <Label htmlFor={`no-${submission.id}`}>No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${submission.id}`}>Notes</Label>
                    <Textarea
                      id={`notes-${submission.id}`}
                      placeholder="Add notes here..."
                      className="w-full"
                      value={notes}
                      onChange={onNotesChange}
                    />
                  </div>
                  <Button onClick={() => handleSave(submission.id)} size="sm">
                    Save Action
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
