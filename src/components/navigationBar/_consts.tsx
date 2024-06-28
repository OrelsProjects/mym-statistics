import { ElementType } from "react";
import { GoHomeFill as HomeActive, GoHome as Home } from "react-icons/go";
import { FaEnvelope } from "react-icons/fa";

export interface NavigationBarItem {
  icon: ElementType;
  iconActive: ElementType;
  label: "Home" | "Messages";
  href: string;
}

const className = "w-6 h-6 fill-muted-foreground/40 text-muted-foreground/40";
const classNameActive = "w-6 h-6 fill-muted-foreground";

export const BottomBarItems: NavigationBarItem[] = [
  {
    icon: () => <Home className={className} />,
    iconActive: () => <HomeActive className={classNameActive} />,
    label: "Home",
    href: "/home",
  },
  {
    icon: () => <FaEnvelope className={className} />,
    iconActive: () => <FaEnvelope className={classNameActive} />,
    label: "Messages",
    href: "/messages",
  },
];
