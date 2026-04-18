"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type SearchableSelectSearchMode = "local" | "remote"

export interface SearchableSelectProps<TOption, TValue = string> {
  options: TOption[]
  value?: TValue | null
  onValueChange?: (value: TValue | null, option: TOption | null) => void
  getOptionValue: (option: TOption) => TValue
  /** Plain-text label for the trigger fallback and accessibility. */
  getOptionLabel: (option: TOption) => string
  /**
   * Text used for client-side filtering (cmdk). Defaults to
   * `label + " " + String(value)`.
   */
  getOptionKeywords?: (option: TOption) => string
  /** Full control over how each row looks inside the list. */
  renderOption: (option: TOption, meta: { selected: boolean }) => React.ReactNode
  /** Custom trigger content. Defaults to selected label or placeholder. */
  renderValue?: (option: TOption | null) => React.ReactNode

  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean

  /** When true, shows a search field. Default: true. */
  searchable?: boolean
  /**
   * `local`: cmdk filters `options` in the browser (default).
   * `remote`: disables cmdk filter; use `onSearchChange` + debouncing to load `options` from an API.
   */
  searchMode?: SearchableSelectSearchMode
  /**
   * Remote only: called with the debounced search string whenever it changes
   * (including `""` when the popover opens or the query is cleared).
   */
  onSearchChange?: (query: string) => void
  searchDebounceMs?: number
  /** Remote loading indicator in the list panel. */
  isLoading?: boolean

  clearable?: boolean

  className?: string
  triggerClassName?: string
  contentClassName?: string
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

function defaultKeywords<TOption, TValue>(
  option: TOption,
  valueGetter: (option: TOption) => TValue,
  labelGetter: (option: TOption) => string,
): string {
  return `${labelGetter(option)} ${String(valueGetter(option))}`
}

/**
 * Select-like control with optional search.
 *
 * - **Custom options**: pass `renderOption`.
 * - **Local search** (default): full client list + cmdk filtering via `getOptionKeywords`.
 * - **Remote search**: set `searchMode="remote"` and load `options` from an API inside `onSearchChange` (debounced).
 */
export function SearchableSelect<TOption, TValue = string>(
  props: SearchableSelectProps<TOption, TValue>,
) {
  const {
    options,
    value,
    onValueChange,
    getOptionValue,
    getOptionLabel,
    getOptionKeywords,
    renderOption,
    renderValue,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyMessage = "No results.",
    disabled = false,
    searchable = true,
    searchMode = "local",
    onSearchChange,
    searchDebounceMs = 300,
    isLoading = false,
    clearable = false,
    className,
    triggerClassName,
    contentClassName,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
  } = props

  const [open, setOpen] = React.useState(false)
  /** Remount cmdk between opens so local filter / selection state resets cleanly. */
  const [cmdkKey, setCmdkKey] = React.useState(0)
  const [searchQuery, setSearchQuery] = React.useState("")

  const onSearchChangeRef = React.useRef(onSearchChange)
  const remoteSearchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    onSearchChangeRef.current = onSearchChange
  }, [onSearchChange])

  React.useEffect(() => {
    return () => {
      if (remoteSearchTimerRef.current) clearTimeout(remoteSearchTimerRef.current)
    }
  }, [])

  const scheduleRemoteSearch = React.useCallback(
    (query: string) => {
      if (searchMode !== "remote") return
      if (remoteSearchTimerRef.current) clearTimeout(remoteSearchTimerRef.current)
      const run = () => onSearchChangeRef.current?.(query)
      if (query === "") {
        run()
        return
      }
      remoteSearchTimerRef.current = setTimeout(() => {
        remoteSearchTimerRef.current = null
        run()
      }, searchDebounceMs)
    },
    [searchMode, searchDebounceMs],
  )

  const selectedOption = React.useMemo(() => {
    if (value === null || value === undefined) return null
    return options.find((o) => Object.is(getOptionValue(o), value)) ?? null
  }, [options, value, getOptionValue])

  const optionKeys = React.useMemo(() => {
    const map = new Map<string, TOption>()
    for (const opt of options) {
      const k = String(getOptionValue(opt))
      if (!map.has(k)) map.set(k, opt)
    }
    return map
  }, [options, getOptionValue])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setCmdkKey((k) => k + 1)
      if (remoteSearchTimerRef.current) {
        clearTimeout(remoteSearchTimerRef.current)
        remoteSearchTimerRef.current = null
      }
      setSearchQuery("")
      if (searchMode === "remote") {
        scheduleRemoteSearch("")
      }
    }
  }

  const selectByKey = React.useCallback(
    (key: string) => {
      const opt = optionKeys.get(key)
      if (!opt) return
      onValueChange?.(getOptionValue(opt), opt)
      setOpen(false)
    },
    [optionKeys, onValueChange, getOptionValue],
  )

  const clear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onValueChange?.(null, null)
  }

  const showSearch = searchable
  const commandFilter = searchMode === "local"

  const triggerContent = renderValue
    ? renderValue(selectedOption)
    : selectedOption
      ? getOptionLabel(selectedOption)
      : placeholder

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className={cn("relative w-full", className)}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            disabled={disabled}
            className={cn(
              "border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
              !selectedOption && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">{triggerContent}</span>
            <span className="flex shrink-0 items-center gap-1">
              {clearable && selectedOption != null && !disabled ? (
                <span
                  role="button"
                  tabIndex={-1}
                  className="hover:bg-muted inline-flex rounded-sm p-0.5 opacity-70 hover:opacity-100"
                  onPointerDown={clear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      clear(e as unknown as React.MouseEvent)
                    }
                  }}
                  aria-label="Clear selection"
                >
                  <X className="size-3.5" />
                </span>
              ) : null}
              <ChevronDown className="size-4 opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        className={cn(
          "min-w-(--radix-popover-trigger-width) max-w-(--radix-popover-trigger-width) p-0",
          contentClassName,
        )}
        align="start"
      >
        <Command key={cmdkKey} shouldFilter={showSearch && commandFilter}>
          {showSearch ? (
            searchMode === "remote" ? (
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onValueChange={(q) => {
                  setSearchQuery(q)
                  scheduleRemoteSearch(q)
                }}
              />
            ) : (
              <CommandInput placeholder={searchPlaceholder} />
            )
          ) : null}
          <CommandList>
            {isLoading ? (
              <div className="text-muted-foreground py-6 text-center text-sm">Loading…</div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const optValue = getOptionValue(option)
                    const key = String(optValue)
                    const label = getOptionLabel(option)
                    const keywordsText = (getOptionKeywords ?? defaultKeywords)(
                      option,
                      getOptionValue,
                      getOptionLabel,
                    )
                    const keywords =
                      keywordsText === label ? [label] : [label, keywordsText]

                    const isSelected =
                      value !== null &&
                      value !== undefined &&
                      Object.is(optValue, value)

                    return (
                      <CommandItem
                        key={key}
                        value={key}
                        keywords={keywords}
                        onSelect={() => selectByKey(key)}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="flex min-w-0 flex-1">
                            {renderOption(option, { selected: isSelected })}
                          </span>
                          {isSelected ? (
                            <Check className="text-foreground size-4 shrink-0" />
                          ) : null}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
