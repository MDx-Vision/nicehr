import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  Calendar,
  FileText,
  Settings,
  User,
  Clock,
  Ticket,
  BarChart3,
  MessageSquare,
  BookOpen,
  Award,
  DollarSign,
  Plane,
  Shield,
  Search,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  type: "page" | "project" | "consultant" | "hospital" | "document";
  url: string;
  description?: string;
}

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { title: "Hospitals", url: "/hospitals", icon: Building2, keywords: ["clients", "sites"] },
  { title: "Consultants", url: "/consultants", icon: Users, keywords: ["people", "staff", "team"] },
  { title: "Projects", url: "/projects", icon: FolderKanban, keywords: ["implementations"] },
  { title: "My Projects", url: "/my-projects", icon: FolderKanban, keywords: ["assigned"] },
  { title: "Schedules", url: "/schedules", icon: Calendar, keywords: ["calendar", "shifts"] },
  { title: "My Schedule", url: "/my-schedule", icon: Calendar, keywords: ["my shifts"] },
  { title: "Timesheets", url: "/timesheets", icon: Clock, keywords: ["time", "hours"] },
  { title: "Documents", url: "/documents", icon: FileText, keywords: ["files", "uploads"] },
  { title: "Support Tickets", url: "/support-tickets", icon: Ticket, keywords: ["help", "issues"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, keywords: ["reports", "stats"] },
  { title: "Chat", url: "/chat", icon: MessageSquare, keywords: ["messages", "communication"] },
  { title: "Training", url: "/training", icon: BookOpen, keywords: ["courses", "learning"] },
  { title: "Gamification", url: "/gamification", icon: Award, keywords: ["achievements", "badges"] },
  { title: "Expenses", url: "/expenses", icon: DollarSign, keywords: ["costs", "reimbursement"] },
  { title: "Travel Bookings", url: "/travel-bookings", icon: Plane, keywords: ["flights", "hotels"] },
  { title: "Settings", url: "/settings", icon: Settings, keywords: ["preferences", "config"] },
  { title: "Profile", url: "/profile", icon: User, keywords: ["account", "me"] },
  { title: "Access Control", url: "/access-control", icon: Shield, keywords: ["permissions", "roles"] },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  // Quick search API
  const { data: searchResults = [] } = useQuery<SearchResult[]>({
    queryKey: ["/api/search/quick", search],
    queryFn: async () => {
      const response = await fetch(`/api/search/quick?q=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: search.length >= 2,
  });

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false);
      setSearch("");
      setLocation(url);
    },
    [setLocation]
  );

  const filteredNavItems = navigationItems.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.keywords.some((k) => k.includes(searchLower))
    );
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "project":
        return FolderKanban;
      case "consultant":
        return Users;
      case "hospital":
        return Building2;
      case "document":
        return FileText;
      default:
        return Search;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search pages, projects, consultants..."
        value={search}
        onValueChange={setSearch}
        data-testid="input-command-search"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation Pages */}
        {filteredNavItems.length > 0 && (
          <CommandGroup heading="Pages">
            {filteredNavItems.slice(0, 6).map((item) => (
              <CommandItem
                key={item.url}
                value={item.title}
                onSelect={() => handleSelect(item.url)}
                data-testid={`command-item-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Dynamic Search Results */}
        {searchResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Search Results">
              {searchResults.map((result) => {
                const Icon = getIconForType(result.type);
                return (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    value={result.title}
                    onSelect={() => handleSelect(result.url)}
                    data-testid={`command-result-${result.id}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{result.title}</span>
                      {result.description && (
                        <span className="text-xs text-muted-foreground">
                          {result.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// Search trigger button for the header
export function SearchTrigger({ className }: { className?: string }) {
  const [, setOpen] = useState(false);

  const handleClick = () => {
    // Dispatch keyboard event to open command menu
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-lg hover:bg-muted transition-colors ${className}`}
      data-testid="button-search-trigger"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
