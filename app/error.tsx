"use client";

import GlobalResolveForm from "@/app/components/global-resolve-form";
import ResolverPage, { homeBreadcrumb } from "@/app/components/resolver-page";
import StatusInfoCard from "@/app/components/status-info-card";
import { serviceNotAvailable } from "@/lib/user-facing";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ResolverPage
      breadcrumbs={[homeBreadcrumb(), { label: "Error" }]}
      resolve={<GlobalResolveForm />}
      info={
        <div className="space-y-4">
          <StatusInfoCard
            status={500}
            title={serviceNotAvailable.title}
            message={serviceNotAvailable.message}
          />
          <button type="button" className="btn-primary" onClick={() => retry()}>
            Try again
          </button>
        </div>
      }
    />
  );
}
