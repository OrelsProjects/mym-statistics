import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingProps {
  text?: string;
  className?: string;
  spinnerClassName?: string;
}

const separateBackslashN = (text: string): React.ReactNode[] => {
  let splitText = text.split("\\n");
  const textNodes: React.ReactNode[] = [];
  splitText.forEach((t, index) => {
    textNodes.push(
      <span
        className={`${index === 0 ? "font-bold" : ""}`}
        key={`loading-text-${index}`}
      >
        {t}
      </span>,
    );
    if (index !== splitText.length - 1) {
      textNodes.push(<br key={`br-${index}`} />);
    }
  });
  return textNodes;
};

export const LoadingSvg = ({
  className,
}: {
  className?: string;
}): React.ReactNode => <Loader2 />;

const Loading: React.FC<LoadingProps> = ({
  text,
  className,
  spinnerClassName,
}) => (
  <div
    className={`flex flex-col justify-center items-center animate-spin ${
      text ? "gap-6" : ""
    } ${className ?? ""}`}
    role="status"
  >
    <LoadingSvg className={spinnerClassName} />
    <div className="text-foreground line-clamp-2 w-full text-center gap-0">
      {text ? separateBackslashN(text) : null}
    </div>
  </div>
);

export default Loading;
