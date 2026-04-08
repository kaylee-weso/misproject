
import { getLifecycleReviewTable } from "@/lib/query/lifecycle/lifecycle-query";

export async function GET() {
  try {
    const upcomingResult= await getLifecycleReviewTable(1, 1, "", {}, undefined, undefined, "upcoming");
    const todayResult = await getLifecycleReviewTable(1, 1, "", {}, undefined, undefined, "today");
    const pastResult = await getLifecycleReviewTable(1, 1, "", {}, undefined, undefined, "past");

    return new Response(
      JSON.stringify({
        upcoming: upcomingResult?.total || 0,
        today: todayResult?.total || 0,
        past: pastResult?.total || 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch counts" }), { status: 500 });
  }
}