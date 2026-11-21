import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Gem, MessageCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InquiryDialog({ children, artwork }: { children: ReactNode; artwork?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="glass-strong max-h-[90svh] max-w-xl overflow-y-auto rounded-none p-4 text-foreground sm:p-10">
        <DialogHeader className="pr-6 text-left">
          <div className="mb-2 flex sm:mb-5 h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.25} />
          </div>
          <p className="eyebrow">A private conversation</p>
          <DialogTitle className="mt-2 font-display text-3xl sm:mt-3 font-normal leading-tight sm:text-5xl">
            Begin a bespoke inquiry
          </DialogTitle>
          <DialogDescription className="mt-2 leading-relaxed sm:mt-4 text-muted-foreground">
            {artwork
              ? `Ask about “${artwork}”, arrange a private viewing, or discuss a related commission.`
              : "Share your space, your story and the piece you imagine. Every commission begins with a personal conversation."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid gap-2 sm:mt-5 sm:gap-3 sm:grid-cols-2">
          <div className="border border-border bg-background/25 p-3 sm:p-5">
            <Gem className="h-4 w-4 text-primary" strokeWidth={1.25} />
            <p className="mt-2 font-display text-xl sm:mt-4 sm:text-2xl">Made for your story</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">A singular work, conceived and finished by hand.</p>
          </div>
          <div className="border border-border bg-background/25 p-3 sm:p-5">
            <MessageCircle className="h-4 w-4 text-primary" strokeWidth={1.25} />
            <p className="mt-2 font-display text-xl sm:mt-4 sm:text-2xl">Atelier guidance</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Materials, scale, timing and presentation, discussed privately.</p>
          </div>
        </div>
        <DialogClose asChild>
          <Link to="/contact" search={artwork ? { piece: artwork } : {}} className="btn-art mt-2 w-full sm:mt-5">
            Continue to inquiry <ArrowUpRight className="h-4 w-4" />
          </Link>
        </DialogClose>
        <p className="text-center text-[10px] leading-relaxed tracking-wide text-muted-foreground">
          No obligation. Your vision remains entirely your own.
        </p>
      </DialogContent>
    </Dialog>
  );
}
