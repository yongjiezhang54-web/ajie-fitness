"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/login";

  return (
    <>
      <div className={hideNav ? "" : "pb-14"}>{children}</div>
      {!hideNav && <BottomNav />}
    </>
  );
}
