"use client";
import * as React from "react";

import { usePathname, useRouter } from "next/navigation";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Build search items from sidebar items
  const searchItems = React.useMemo(() => {
    const items: Array<{
      group: string;
      label: string;
      url: string;
      icon?: React.ComponentType<{ className?: string }>;
    }> = [];

    sidebarItems.forEach((group) => {
      group.items.forEach((item) => {
        items.push({
          group: group.label || "Other",
          label: item.title,
          url: item.url,
          icon: item.icon,
        });

        // Add sub-items if they exist
        if (item.subItems) {
          item.subItems.forEach((subItem) => {
            items.push({
              group: group.label || "Other",
              label: `${item.title} - ${subItem.title}`,
              url: subItem.url,
              icon: subItem.icon || item.icon,
            });
          });
        }
      });
    });

    return items;
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  /**
   * Most specific sidebar item for this route: exact URL first, else longest prefix match.
   * Avoids `/dashboard` winning for every `/dashboard/...` path.
   */
  const currentPage = React.useMemo(() => {
    const matches = searchItems.filter(
      (item) => pathname === item.url || (item.url !== "/" && pathname.startsWith(`${item.url}/`)),
    );
    if (!matches.length) return undefined;
    const exact = matches.find((m) => m.url === pathname);
    if (exact) return exact;
    return matches.reduce((best, item) => (item.url.length > best.url.length ? item : best));
  }, [pathname, searchItems]);

  const otherPagesByGroup = React.useMemo(() => {
    const groups = [...new Set(searchItems.map((item) => item.group))];
    return groups
      .map((group) => ({
        group,
        items: searchItems
          .filter((item) => item.group === group)
          .filter((item) => {
            if (currentPage == null) return true;
            return !(
              item.url === currentPage.url &&
              item.label === currentPage.label &&
              item.group === currentPage.group
            );
          }),
      }))
      .filter((g) => g.items.length > 0);
  }, [searchItems, currentPage]);

  return (
    <>
      <Button
        variant="link"
        className="!px-0 font-normal text-muted-foreground hover:no-underline"
        onClick={() => setOpen(true)}
        title={currentPage ? `Search · ${currentPage.label}` : "Search pages (⌘J)"}
      >
        <Search className="size-4 shrink-0" />
        <span className="ml-1 hidden max-w-[9rem] truncate sm:inline md:max-w-[14rem]">
          {currentPage ? currentPage.label : "Search"}
        </span>
        <kbd className="ml-1 inline-flex h-5 shrink-0 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={currentPage ? `Search… · now: ${currentPage.label}` : "Search pages and navigate…"}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Current Page Section */}
          {currentPage && (
            <>
              <CommandGroup heading="Current page">
                <CommandItem
                  className="!py-1.5"
                  value={`current ${currentPage.label} ${currentPage.url}`}
                  onSelect={() => handleSelect(currentPage.url)}
                >
                  {currentPage.icon && <currentPage.icon className="mr-2 h-4 w-4" />}
                  <span>{currentPage.label}</span>
                  <span className="ml-auto font-medium text-primary text-xs">Active</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Other pages (active route is only under "Current page") */}
          {otherPagesByGroup.map((g, i) => (
            <React.Fragment key={g.group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={g.group}>
                {g.items.map((item) => (
                  <CommandItem
                    className="!py-1.5"
                    key={`${item.url}-${item.label}-${item.group}`}
                    value={`${item.label} ${item.url} ${item.group}`}
                    onSelect={() => handleSelect(item.url)}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
