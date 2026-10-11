import { Resend } from "resend";

export interface LeadDeliveryPayload {
  slug: string;
  lead: Record<string, string | undefined>;
  inputs: Record<string, unknown>;
  metrics: { key: string; label: string; value?: number; formatted: string }[];
  utm: Record<string, string | undefined>;
  submittedAt: string;
}

export interface DeliveryResult {
  sheet: "sent" | "skipped" | "failed";
  email: "sent" | "skipped" | "failed";
  ownerEmail: "sent" | "skipped" | "failed";
}

export function isLeadDeliveryConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.RESEND_API_KEY,
  );
}

/** Append the lead + results as a row via a Google Apps Script web app. */
async function appendToSheet(payload: LeadDeliveryPayload): Promise<DeliveryResult["sheet"]> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return "skipped";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

async function sendReportEmail(
  payload: LeadDeliveryPayload,
  html: { subject: string; html: string },
): Promise<DeliveryResult["email"]> {
  const resend = getResend();
  const from = process.env.RESEND_FROM;
  const to = payload.lead.email;
  if (!resend || !from || !to) return "skipped";

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: html.subject,
      html: html.html,
    });
    return error ? "failed" : "sent";
  } catch {
    return "failed";
  }
}

async function sendOwnerNotification(
  payload: LeadDeliveryPayload,
): Promise<DeliveryResult["ownerEmail"]> {
  const resend = getResend();
  const from = process.env.RESEND_FROM;
  const owner = process.env.OWNER_EMAIL;
  if (!resend || !from || !owner) return "skipped";

  const lines = payload.metrics
    .map((metric) => `<li><strong>${metric.label}:</strong> ${metric.formatted}</li>`)
    .join("");

  try {
    const { error } = await resend.emails.send({
      from,
      to: owner,
      subject: `New ${payload.slug} lead${payload.lead.company ? `: ${payload.lead.company}` : ""}`,
      html: `<h2>New lead</h2>
        <ul>
          <li>Name: ${payload.lead.name ?? "—"}</li>
          <li>Email: ${payload.lead.email ?? "—"}</li>
          <li>Company: ${payload.lead.company ?? "—"}</li>
        </ul>
        <h3>Results</h3>
        <ul>${lines}</ul>
        <h3>UTM</h3>
        <pre>${JSON.stringify(payload.utm, null, 2)}</pre>`,
    });
    return error ? "failed" : "sent";
  } catch {
    return "failed";
  }
}

export async function deliverLead(
  payload: LeadDeliveryPayload,
  report: { subject: string; html: string },
): Promise<DeliveryResult> {
  const [sheet, email, ownerEmail] = await Promise.all([
    appendToSheet(payload),
    sendReportEmail(payload, report),
    sendOwnerNotification(payload),
  ]);
  return { sheet, email, ownerEmail };
}
