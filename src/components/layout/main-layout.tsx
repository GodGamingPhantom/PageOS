"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { AppHeader } from "./header";
import { useReaderSettings } from "@/context/reader-settings-provider";
import { Bootloader } from "@/components/bootloader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { showBootAnimation } = useReaderSettings();
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    try {
      const hasBooted = sessionStorage.getItem('pageos-booted');
      if (hasBooted === 'true' || !showBootAnimation) {
        setIsBooting(false);
      }
    } catch (error) {
      // If sessionStorage is not available (e.g. in private browsing on some browsers),
      // we'll just skip the boot animation to avoid issues.
      console.warn("Could not read sessionStorage for boot status, skipping animation.", error);
      setIsBooting(false);
    }
  }, [showBootAnimation]);

  const handleBootComplete = () => {
    try {
      sessionStorage.setItem('pageos-booted', 'true');
    } catch (error) {
      console.warn("Could not set sessionStorage for boot status.", error);
    }
    setIsBooting(false);
  };
  
  if (isBooting) {
    return <Bootloader onComplete={handleBootComplete} />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <AppSidebar />
        </Sidebar>
        <SidebarInset className="bg-background">
          <AppHeader />
          <main className="flex-1 animate-fade-in">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
