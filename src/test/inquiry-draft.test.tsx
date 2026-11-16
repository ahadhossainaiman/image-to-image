import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useSearch: () => ({}) };
});

import { Contact } from "@/routes/contact";

describe("inquiry phone draft", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("saves a telephone number with the existing inquiry values and restores it", () => {
    const view = render(<Contact />);
    fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: "Collector" } });
    fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "collector@example.com" } });
    fireEvent.change(screen.getByLabelText(/Tell us your story/), { target: { value: "A woodland commission" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "+44 7700 900123" } });
    fireEvent.click(screen.getByRole("button", { name: "Save inquiry draft" }));
    const draft = JSON.parse(window.localStorage.getItem("thoa-inquiry-draft") ?? "{}");
    expect(draft).toMatchObject({ phone: "+44 7700 900123", name: "Collector", email: "collector@example.com", vision: "A woodland commission" });
    view.unmount();
    render(<Contact />);
    expect(screen.getByLabelText("Phone Number")).toHaveValue("+44 7700 900123");
  });
});
