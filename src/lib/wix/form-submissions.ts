import { ensureVisitorTokens, wixClient } from "./client";

export async function submitWixForm(formId: string, submissions: Record<string, string | boolean>) {
  await ensureVisitorTokens();
  const response = await wixClient.fetchWithAuth("https://www.wixapis.com/form-submission-service/v4/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submission: { formId, submissions } }),
  });
  if (!response.ok) throw new Error("Wix rejected the form submission");

  const result = (await response.json()) as { submission?: { id?: string; _id?: string; status?: string } };
  const submission = result.submission;
  if (!(submission?.id || submission?._id)) throw new Error("Wix returned no submission ID");
  if (submission.status === "CONFIRMED") return "confirmed";
  if (submission.status === "PENDING") return "pending";
  throw new Error("Wix returned an unexpected submission status");
}
