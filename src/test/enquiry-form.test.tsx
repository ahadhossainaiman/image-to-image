import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchWithAuth = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useSearch: () => ({ piece: "MUSH-30" }), Link: ({ children }: { children: ReactNode }) => <a>{children}</a> };
});

vi.mock("@/lib/wix/client", () => ({
  isWixConfigured: () => true,
  ensureVisitorTokens: vi.fn(),
  wixClient: { fetchWithAuth },
}));

import { Contact } from "@/routes/contact";
import { SiteFooter } from "@/components/SiteHeader";

function fillForm() {
  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: "Collector" } });
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "collector@example.com" } });
  fireEvent.change(screen.getByLabelText(/Tell us your story/), { target: { value: "A woodland commission" } });
}

describe("Enquiry form", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fetchWithAuth.mockReset();
    vi.stubEnv("VITE_WIX_ENQUIRY_FORM_ID", undefined);
    vi.stubEnv("VITE_WIX_ENQUIRY_FIELD_TARGETS", "");
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("sends form values to Wix and clears the form after confirmation", async () => {
    fetchWithAuth.mockResolvedValue(Response.json({ submission: { id: "created", status: "CONFIRMED" } }));
    render(<Contact />);
    const preference = screen.getByRole("combobox", { name: "Enquiry type" });
    expect(preference).toHaveValue("Bespoke Enquiry");
    expect(screen.getByRole("link", { name: "(813) 588-3201" })).toHaveAttribute("href", "tel:+18135883201");
    expect(screen.getByRole("link", { name: "Studio@ThyHouseOfArt.com" })).toHaveAttribute("href", "mailto:Studio@ThyHouseOfArt.com");
    fillForm();
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+44 7700 900123" } });
    fireEvent.change(preference, { target: { value: "Please Contact Me" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Enquiry" }));
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(await screen.findByRole("status")).toHaveTextContent("Your enquiry has been submitted");
    expect(fetchWithAuth).toHaveBeenCalledExactlyOnceWith("https://www.wixapis.com/form-submission-service/v4/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission: {
          formId: "812d9a26-54a4-4f06-81ce-87c0a6314de8",
          submissions: {
            name: "Collector", email_1139: "collector@example.com", phone_b88d: "+447700900123",
            inquiry_type: "Please Contact Me", tell_us_your_story: "Artwork: MUSH-30\n\nA woodland commission",
          },
        },
      }),
    });
    expect(screen.getByLabelText(/Tell us your story/)).toHaveValue("");
    expect(preference).toHaveValue("Bespoke Enquiry");
  });

  it("keeps the visitor's values if Wix rejects the submission", async () => {
    fetchWithAuth.mockResolvedValue(new Response(null, { status: 503 }));
    window.localStorage.setItem("thoa-inquiry-draft", JSON.stringify({ phone: "+44 7700 900123", inquiryType: "Please Contact Me" }));
    render(<Contact />);
    expect(screen.getByRole("combobox", { name: "Enquiry type" })).toHaveValue("Please Contact Me");
    expect(screen.getByLabelText("Phone Number")).toHaveValue("+44 7700 900123");
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Send Enquiry" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t submit");
    expect(screen.getByLabelText(/Tell us your story/)).toHaveValue("A woodland commission");
    expect(screen.getByRole("button", { name: "Send Enquiry" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("reports missing configuration without claiming the form was sent", async () => {
    vi.stubEnv("VITE_WIX_ENQUIRY_FORM_ID", "");
    render(<Contact />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Send Enquiry" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Online enquiries are unavailable");
    expect(fetchWithAuth).not.toHaveBeenCalled();
  });

  it("resets the form and shows the pending acknowledgement for three seconds", async () => {
    vi.useFakeTimers();
    fetchWithAuth.mockResolvedValue(Response.json({ submission: { id: "created", status: "PENDING" } }));
    render(<Contact />);
    fillForm();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Send Enquiry" })); });
    expect(screen.getByRole("status")).toHaveTextContent("We received your enquiry request");
    expect(screen.getByLabelText(/Tell us your story/)).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Enquiry" })).toBeDisabled();
    act(() => { vi.advanceTimersByTime(2999); });
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Enquiry" })).toBeEnabled();
  });

  it("asks for a country code before sending an optional phone number", async () => {
    render(<Contact />);
    fillForm();
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "813 555 0100" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Enquiry" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("with its country code");
    expect(fetchWithAuth).not.toHaveBeenCalled();
  });
});

describe("Collector notes signup", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    fetchWithAuth.mockReset();
    vi.unstubAllEnvs();
  });

  it.each(["CONFIRMED", "PENDING"])("submits the footer email and shows feedback for %s", async (status) => {
    vi.useFakeTimers();
    vi.stubEnv("VITE_WIX_SUBSCRIBE_FORM_ID", undefined);
    vi.stubEnv("VITE_WIX_SUBSCRIBE_EMAIL_TARGET", undefined);
    vi.stubEnv("VITE_WIX_SUBSCRIBE_CONSENT_TARGET", undefined);
    fetchWithAuth.mockResolvedValue(Response.json({ submission: { id: "signup", status } }));
    render(<SiteFooter />);
    const email = screen.getByLabelText("Email address");
    fireEvent.change(email, { target: { value: "collector@example.com" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Subscribe" })); });

    const confirmed = status === "CONFIRMED";
    expect(screen.getByRole("status")).toHaveTextContent(confirmed ? "signup request has been submitted" : "We received your signup request");
    expect(email).toHaveValue("");
    act(() => { vi.advanceTimersByTime(2999); });
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(fetchWithAuth).toHaveBeenCalledExactlyOnceWith("https://www.wixapis.com/form-submission-service/v4/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission: { formId: "b6aea537-a696-46f9-bdd4-5b666d8b008f", submissions: { email: "collector@example.com" } } }),
    });
  });

  it("preserves the email and allows a retry when Wix rejects signup", async () => {
    fetchWithAuth.mockResolvedValue(new Response(null, { status: 503 }));
    render(<SiteFooter />);
    const email = screen.getByLabelText("Email address");
    fireEvent.change(email, { target: { value: "collector@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please try again");
    expect(email).toHaveValue("collector@example.com");
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeEnabled();
  });
});
