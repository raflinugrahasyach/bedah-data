/**
 * Domain types. Row shapes mirror schema.sql; camelCase is used in app code.
 */

export const ORDER_STATUSES = ["pending", "in_progress", "qc", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ANALYST_STATUSES = ["not_started", "in_progress", "ready_for_qc", "approved"] as const;
export type AnalystStatus = (typeof ANALYST_STATUSES)[number];

export const DELIVERABLE_KINDS = ["cleaned_data", "syntax", "report"] as const;
export type DeliverableKind = (typeof DELIVERABLE_KINDS)[number];

export interface Client {
  id: string;
  name: string;
  email: string;
}

export interface BriefVariables {
  summary: string;
  independent: string[];
  dependent: string[];
}

/** Output of the Tahap 1 chatbot. Null means "not collected yet". */
export interface ResearchBrief {
  objective: string | null;
  variables: BriefVariables | null;
  dataProfile: string | null;
  method: string | null;
}

/** A brief with every field collected; this is what gets persisted with an order. */
export type CompletedBrief = {
  [K in keyof ResearchBrief]: NonNullable<ResearchBrief[K]>;
};

export interface Deliverable {
  kind: DeliverableKind;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface WorkItem {
  id: string;
  analystStatus: AnalystStatus;
  deliverables: Deliverable[];
}

export interface ActivityEntry {
  at: string;
  text: string;
}

/** Order joined with the records the admin dashboard needs to render a card or detail page. */
export interface OrderRecord {
  id: string;
  code: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
  brief: CompletedBrief;
  workItem: WorkItem;
  activity: ActivityEntry[];
}
