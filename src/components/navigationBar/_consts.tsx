import { ElementType } from "react";
import { GoHomeFill as HomeActive, GoHome as Home } from "react-icons/go";
import { FaRegEnvelope } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa6";
import { FaRegFolder } from "react-icons/fa6";
import { FaFolder } from "react-icons/fa";

export interface NavigationBarItem {
  icon: ElementType;
  iconActive: ElementType;
  label: "סטטיסטקות" | "הודעות" | "תיקיות";
  href: string;
}

const className = "w-6 h-6 fill-muted-foreground/40 text-muted-foreground/40";
const classNameActive = "w-6 h-6 fill-muted-foreground";

export const BottomBarItems: NavigationBarItem[] = [
  {
    icon: () => <FaRegEnvelope className={className} />,
    iconActive: () => <FaEnvelope className={classNameActive} />,
    label: "הודעות",
    href: "/messages",
  },
  {
    icon: () => <Home className={className} />,
    iconActive: () => <HomeActive className={classNameActive} />,
    label: "סטטיסטקות",
    href: "/home",
  },
  {
    icon: () => <FaRegFolder className={className} />,
    iconActive: () => <FaFolder className={classNameActive} />,
    label: "תיקיות",
    href: "/folders",
  },
];
