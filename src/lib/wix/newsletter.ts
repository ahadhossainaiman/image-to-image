import { isWixConfigured } from "./client";
import { submitWixForm } from "./form-submissions";

export function requestNewsletterSignup(email: string) {
  if (!isWixConfigured()) throw new Error("Wix is unavailable");

  const formId = (import.meta.env["VITE_WIX_SUBSCRIBE_FORM_ID"] as string | undefined)?.trim()
    || "b6aea537-a696-46f9-bdd4-5b666d8b008f";
  const emailTarget = (import.meta.env["VITE_WIX_SUBSCRIBE_EMAIL_TARGET"] as string | undefined)?.trim() || "email";
  const consentTarget = (import.meta.env["VITE_WIX_SUBSCRIBE_CONSENT_TARGET"] as string | undefined)?.trim();
  const values: Record<string, string | boolean> = { [emailTarget]: email };
  if (consentTarget && consentTarget !== emailTarget) values[consentTarget] = true;

  return submitWixForm(formId, values);
}
