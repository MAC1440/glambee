
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: OptionType[];
  value: OptionType[];
  onChange: (value: OptionType[]) => void;
  placeholder?: string;
  className?: string;
}

function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: OptionType) => {
    onChange(value.filter((i) => i.value !== item.value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {value.length > 0 ? (
              value.map((item) => (
                <Badge
                  variant="secondary"
                  key={item.value}
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent opening the popover
                    handleUnselect(item);
                  }}
                >
                  {item.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    const isSelected = value.some(v => v.value === option.value);
                    if (isSelected) {
                      onChange(value.filter((v) => v.value !== option.value));
                    } else {
                      onChange([...value, option]);
                    }
                    setOpen(true);
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
