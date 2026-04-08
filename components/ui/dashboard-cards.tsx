import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

interface DashboardCardsProps {
  totalAssets: number;
  statusBreakdown: { inUse: number; retired: number; disposed: number };
  lifecycleCounts?: { upcoming: number; today: number; past: number }; // optional
}

export function DashboardCards({ totalAssets, statusBreakdown, lifecycleCounts }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3">
      {/* Total Assets */}
      <Card className="@container/card shadow-md">
        <CardHeader>
          <CardDescription>Total Assets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {totalAssets}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm h-full">
          <div className="text-muted-foreground">All asset types</div>
        </CardFooter>
      </Card>

      {/* Status Breakdown */}
      <Card className="@container/card shadow-md">
        <CardHeader>
          <CardDescription>Status Breakdown</CardDescription>
          <CardTitle className="text-lg font-semibold">
            In Use: {statusBreakdown.inUse} | Retired: {statusBreakdown.retired} | Disposed: {statusBreakdown.disposed}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm h-full">
          <div className="text-muted-foreground">
            Active, awaiting disposition, or no longer in use
          </div>
        </CardFooter>
      </Card>

      {/* Lifecycle Review (Upcoming / Today / Past) */}
      {lifecycleCounts && (
        <Card className="@container/card shadow-md">
          <CardHeader>
            <CardDescription>Lifecycle Review</CardDescription>
            <CardTitle className="text-lg font-semibold">
              Upcoming: {lifecycleCounts.upcoming} | Today: {lifecycleCounts.today} | Past: {lifecycleCounts.past}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm h-full">
            <div className="text-muted-foreground">
              Assets scheduled for review
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}