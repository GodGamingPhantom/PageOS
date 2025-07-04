
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Library,
  Settings,
  User,
  Power,
  LogIn,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/auth-provider";

const menuItems = [
  { href: "/", label: "System Feed", icon: Home },
  { href: "/library", label: "Archive", icon: Library },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/legal", label: "Legal", icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader className="border-b border-border/50 p-2">
        <div className="flex items-center justify-between p-2">
            <Link href="/" className="font-headline text-2xl text-accent text-glow">
              PageOS
            </Link>
          <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            v1.0
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-border/50 p-4">
        {user ? (
            <Button variant="ghost" className="w-full justify-start gap-2 p-2" onClick={handleSignOut}>
              <Power className="h-4 w-4 text-destructive" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
        ) : (
          <Button variant="ghost" asChild className="w-full justify-start gap-2 p-2">
            <Link href="/profile">
              <LogIn className="h-4 w-4 text-accent" />
              <span className="group-data-[collapsible=icon]:hidden">Login</span>
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </div>
  );
}
