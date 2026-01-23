import { ErrorBoundary } from "@/app/shared/ui/ErrorBoundary";

export const ErrorBoundaryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};
