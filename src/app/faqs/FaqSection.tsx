"use client";

import { useState } from "react";
import { FaqIllustration } from "./FaqIllustration";
import { FaqList } from "./FaqList";

/** The questions, with the illustration beside them on wide screens, staying in view while you read. */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
      <FaqList open={open} setOpen={setOpen} />
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <FaqIllustration open={open} />
        </div>
      </div>
    </div>
  );
}
