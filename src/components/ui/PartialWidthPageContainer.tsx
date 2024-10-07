import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
  className?: string;
}

export const PartialWidthPageContainer = ({ children, className }: IProps) => {
  return (
    <div
      className={`max-w-screen-lg min-h-screen p-6  flex  m-auto ${className}`}
    >
      {children}
    </div>
  );
};
