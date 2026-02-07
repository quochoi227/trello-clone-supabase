"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Home, 
  ChevronDown,
  Trello,
  Users,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Mock data for workspaces
const workspaces = [
  {
    id: "1",
    name: "Personal Workspace",
    icon: "🏠",
  },
  {
    id: "2",
    name: "Team Project",
    icon: "💼",
  },
  {
    id: "3",
    name: "Design Team",
    icon: "🎨",
  },
];

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  {
    title: "Boards",
    href: "/boards",
    icon: LayoutDashboard,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FileText,
  },
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
];

interface WorkspaceNavItem {
  title: string;
  href: (workspaceId: string) => string;
  icon: React.ComponentType<{ className?: string }>;
}

const workspaceNavItems: WorkspaceNavItem[] = [
  {
    title: "Boards",
    href: (id) => `/workspace/${id}/boards`,
    icon: Trello,
  },
  {
    title: "Members",
    href: (id) => `/workspace/${id}/members`,
    icon: Users,
  },
  {
    title: "Settings",
    href: (id) => `/workspace/${id}/settings`,
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openWorkspaces, setOpenWorkspaces] = useState<Record<string, boolean>>({
    "1": true,
  });

  const toggleWorkspace = (id: string) => {
    setOpenWorkspaces((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background py-3">
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 px-3 pb-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  active && "bg-secondary font-medium"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="px-3 pb-2">
          <h2 className="mb-2 px-2 text-sm font-semibold tracking-tight">
            Workspaces
          </h2>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <Collapsible
                key={workspace.id}
                open={openWorkspaces[workspace.id]}
                onOpenChange={() => toggleWorkspace(workspace.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2"
                  >
                    <span className="mr-2">{workspace.icon}</span>
                    <span className="flex-1 text-left">{workspace.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        openWorkspaces[workspace.id] && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-1 space-y-1">
                  {workspaceNavItems.map((item) => {
                    const Icon = item.icon;
                    const href = item.href(workspace.id);
                    const active = isActive(href);

                    return (
                      <Button
                        key={item.title}
                        variant={active ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start",
                          active && "bg-secondary font-medium"
                        )}
                        asChild
                      >
                        <Link href={href}>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Link>
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
