"use client";

import React, { useRef } from "react";

// div props and extra
export interface LongPressDivProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onLongPress?: () => void;
}

export default function LongPressDiv({
  onLongPress,
  onClick,
  onDoubleClick,
  ...props
}: LongPressDivProps) {
  const [timer, setTimer] = React.useState<number | undefined>(undefined);
  const longPressed = useRef(false);

  const handleTouchStart = () => {
    console.log("touch start");
    setTimer(
      window.setTimeout(() => {
        longPressed.current = true;
        onLongPress?.();
      }, 500),
    );
  };

  const handleTouchEnd = (event: any) => {
    if (timer) {
      clearTimeout(timer);
    }
  };

  const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onMouseDown={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleOnClick}
      {...props}
    >
      {props.children}
    </div>
  );
}
