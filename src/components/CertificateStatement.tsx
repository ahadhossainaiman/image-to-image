import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function CertificateStatement({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-3 text-[10px] uppercase leading-6 tracking-[.15em] text-muted-foreground", className)}>
      <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.2} />
      <span>ALL WORKS ACQUIRED FROM US WILL BE SIGNED BY THE ARTIST, AND A 'CERTIFICATE OF AUTHENTICITY' WILL BE ISSUED.</span>
    </p>
  );
}