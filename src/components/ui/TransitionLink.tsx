"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useNavigate } from "@/components/providers/TransitionProvider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** A Next <Link> that routes through the fade-to-black transition. Modified clicks behave normally. */
export function TransitionLink({ href, onClick, ...rest }: Props) {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href);
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}
