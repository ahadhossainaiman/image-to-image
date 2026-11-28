import { isWixConfigured } from "./client";
import { submitWixForm } from "./form-submissions";

export const enquiryOptions = ["Bespoke enquiry", "I have a question and would love you to contact me"] as const;

const studioFormId = "812d9a26-54a4-4f06-81ce-87c0a6314de8";
const fields = ["name", "email", "phone", "enquiryType", "vision"] as const;
type Enquiry = Record<(typeof fields)[number] | "piece", string>;
type FieldTargets = Omit<Enquiry, "piece"> & { piece?: string };

export class EnquiryUnavailableError extends Error {}
export class InvalidEnquiryPhoneError extends Error {}

function fieldTargets(formId: string): FieldTargets {
  const configured = import.meta.env["VITE_WIX_ENQUIRY_FIELD_TARGETS"] as string | undefined;
  if (!configured && formId === studioFormId) {
    return {
      name: "name",
      email: "email_1139",
      phone: "phone_b88d",
      enquiryType: "inquiry_type",
      vision: "tell_us_your_story",
    };
  }
  try {
    const targets = JSON.parse(configured ?? "null") as Partial<FieldTargets> | null;
    const keys = fields.map((field) => targets?.[field]);
    if (targets?.piece !== undefined) keys.push(targets.piece);
    if (keys.every((key) => typeof key === "string" && key.trim() === key && key.length > 0) && new Set(keys).size === keys.length) {
      return targets as FieldTargets;
    }
  } catch {
    // Invalid public configuration makes the form unavailable.
  }
  throw new EnquiryUnavailableError();
}

export async function sendEnquiry(enquiry: Enquiry) {
  const formId = (import.meta.env["VITE_WIX_ENQUIRY_FORM_ID"] as string | undefined)?.trim() ?? studioFormId;
  if (!isWixConfigured() || !formId) throw new EnquiryUnavailableError();

  const targets = fieldTargets(formId);
  const phone = enquiry.phone.replace(/[\s().-]/g, "").replace(/^00/, "+");
  if (enquiry.phone && !/^\+[1-9]\d{1,14}$/.test(phone)) throw new InvalidEnquiryPhoneError();
  const values = {
    ...enquiry,
    phone,
    vision: enquiry.piece && !targets.piece ? `Artwork: ${enquiry.piece}\n\n${enquiry.vision}` : enquiry.vision,
  };
  const submissions = Object.fromEntries(fields.filter((field) => values[field]).map((field) => [targets[field], values[field]]));
  if (targets.piece && enquiry.piece) submissions[targets.piece] = enquiry.piece;

  return submitWixForm(formId, submissions);
}
