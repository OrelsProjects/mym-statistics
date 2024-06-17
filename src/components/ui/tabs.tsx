import React from "react";
import { Button } from "./button";

interface TabItem<T> {
  label: string;
  value: T;
}

interface TabsProps<T> {
  items: TabItem<T>[];
  defaultValue: T;
  onChange: (value: string) => void;
}

export function Tabs<T>({ items, onChange, defaultValue }: TabsProps<T>) {
  const [selectedTab, setSelectedTab] = React.useState<T>(defaultValue);

  return (
    <div className="flex flex-row gap-0">
      {items.map(tab => (
        <Button
          variant={selectedTab === tab.value ? "default" : "ghost"}
          key={tab.label}
          onClick={() => {
            setSelectedTab(tab.value);
            onChange(tab.label);
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
