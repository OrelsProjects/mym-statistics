"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onClose?: () => void;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onClose,
  ...props
}: CalendarProps) {
  return (
    <div className="relative">
      {/* Close button at the top right */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-transparent rounded-full hover:bg-muted focus:outline-none 4k:top-4 4k:right-4 4k:p-2"
        >
          <X className="h-4 w-4 text-muted-foreground 4k:h-8 4k:w-8" />
        </button>
      )}
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 pt-10 4k:p-6 4k:pt-20", className)}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 4k:space-y-8 4k:sm:space-x-8",
          month: "space-y-4 4k:space-y-8",
          caption:
            "flex justify-center pt-1 relative items-center 4k:pt-2 4k:text-3xl",
          caption_label: "text-sm font-medium 4k:text-4xl",
          caption_dropdowns: "flex justify-center gap-1 4k:gap-2",
          nav: "space-x-1 flex items-center 4k:space-x-2",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 4k:h-14 4k:w-14"
          ),
          nav_button_previous: "absolute left-1 4k:left-2",
          nav_button_next: "absolute right-1 4k:right-2",
          table: "w-full border-collapse space-y-1 4k:space-y-2",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] 4k:w-16 4k:text-xl",
          row: "flex w-full mt-2 4k:mt-4",
          cell:
            "text-center text-sm p-0 relative 4k:text-2xl [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 4k:h-16 4k:w-16 4k:text-2xl"
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          Dropdown: ({
            value,
            onChange,
            children,
            ...props
          }: DropdownProps) => {
            const options = React.Children.toArray(
              children
            ) as React.ReactElement<
              React.HTMLProps<HTMLOptionElement>
            >[];
            const selected = options.find(
              (child) => child.props.value === value
            );
            const handleChange = (value: string) => {
              const changeEvent = {
                target: { value },
              } as React.ChangeEvent<HTMLSelectElement>;
              onChange?.(changeEvent);
            };
            return (
              <Select
                value={value?.toString()}
                onValueChange={(value) => {
                  handleChange(value);
                }}
              >
                <SelectTrigger className="pr-1.5 focus:ring-0 4k:pr-3 4k:h-12 4k:text-2xl">
                  <SelectValue>{selected?.props?.children}</SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" className="4k:text-2xl">
                  <ScrollArea className="h-80 4k:h-[40rem]">
                    {options.map((option, id: number) => (
                      <SelectItem
                        key={`${option.props.value}-${id}`}
                        value={option.props.value?.toString() ?? ""}
                      >
                        {option.props.children}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            );
          },
          IconLeft: ({ ...props }) => (
            <ChevronLeft className="h-4 w-4 4k:h-8 4k:w-8" />
          ),
          IconRight: ({ ...props }) => (
            <ChevronRight className="h-4 w-4 4k:h-8 4k:w-8" />
          ),
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
