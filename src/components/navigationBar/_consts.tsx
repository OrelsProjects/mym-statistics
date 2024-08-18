import { ElementType } from "react";
import { IoStatsChartOutline, IoStatsChart } from "react-icons/io5";

import { FaRegEnvelope } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa6";
import { FaRegFolder } from "react-icons/fa6";
import { FaFolder } from "react-icons/fa";
import { cn } from "../../lib/utils";

export interface NavigationBarItem {
  icon: ElementType;
  iconActive: ElementType;
  label: "סטטיסטקות" | "הודעות" | "תיקיות";
  href: string;
}

const classNameInActive =
  "w-6 h-6 4k:w-12 4k:h-12 fill-muted-foreground/40 text-muted-foreground/40";
const classNameActive = "w-6 h-6 4k:w-12 4k:h-12 fill-muted-foreground";

export const BottomBarItems: NavigationBarItem[] = [
  {
    icon: ({ className }: { className?: string }) => (
      <FaRegEnvelope className={cn(classNameInActive, className)} />
    ),
    iconActive: ({ className }: { className?: string }) => (
      <FaEnvelope className={cn(classNameActive, className)} />
    ),
    label: "הודעות",
    href: "/messages",
  },
  {
    icon: ({ className }: { className?: string }) => (
      <FaRegFolder className={cn(classNameInActive, className)} />
    ),
    iconActive: ({ className }: { className?: string }) => (
      <FaFolder className={cn(classNameActive, className)} />
    ),
    label: "תיקיות",
    href: "/folders",
  },
  {
    icon: ({ className }: { className?: string }) => (
      <IoStatsChartOutline className={cn(classNameInActive, className)} />
    ),
    iconActive: ({ className }: { className?: string }) => (
      <IoStatsChart className={cn(classNameActive, className)} />
    ),
    label: "סטטיסטקות",
    href: "/home",
  },
];
