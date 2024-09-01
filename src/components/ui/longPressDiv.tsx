"use client";

import React from "react";

// div props and extra
export interface LongPressDivProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onLongPress?: () => void;
}

export default function LongPressDiv({
  onLongPress,
  ...props
}: LongPressDivProps) {
  const [timer, setTimer] = React.useState<number | undefined>(undefined);

  const handleTouchStart = () => {
    setTimer(window.setTimeout(() => onLongPress?.(), 500));
  };

  const handleTouchEnd = () => {
    if (timer) {
      clearTimeout(timer);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onMouseDown={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleTouchEnd}
      {...props}
    >
      {props.children}
    </div>
  );
}
