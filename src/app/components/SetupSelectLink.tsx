"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type SetupSelectLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export default function SetupSelectLink({ href, className, children }: SetupSelectLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <a
        href={href}
        className={className}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
          }
          event.preventDefault();
          startTransition(() => {
            router.push(href);
          });
        }}
      >
        {children}
      </a>
      {isPending ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/20">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#23a936]/25 border-t-[#23a936]" />
        </div>
      ) : null}
    </>
  );
}
