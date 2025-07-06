import { DocumentReference, Timestamp } from "firebase/firestore";

export type Patient = {
    id: string;
    role: string;
    email?: string;
    display_name?: string;
    cancer_type?: string;
    consents_agreed?: boolean;
    last_submission_date?: Timestamp;
    treatment_start_date?: Timestamp;
    triage_level?: string;
    key_symptoms?: string;
    action_taken?: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  };

export type SymptomSubmission = {
  id: string;
  patient_id: DocumentReference<Patient>;
  severity: number;
  symptoms: {
    symptom: string;
    severity: number;
    temperature?: number;
  }[];
  is_baseline?: boolean;
  triage_level?: string;
  timestamp: Timestamp; // Firestore Timestamp
  action_taken?: boolean;
  notes?: string;
};
