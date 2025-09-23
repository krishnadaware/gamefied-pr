export default function ParentDashboard() {
  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Parent Dashboard</h1>
        <p className="text-muted-foreground">Read-only view of your child’s progress, tasks, points, badges, and ranking. Optionally send feedback to teachers.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4"><div className="text-sm text-muted-foreground">Quiz performance</div><div className="text-2xl font-bold">82%</div></div>
        <div className="rounded-xl border bg-card p-4"><div className="text-sm text-muted-foreground">Points</div><div className="text-2xl font-bold">410</div></div>
        <div className="rounded-xl border bg-card p-4"><div className="text-sm text-muted-foreground">Badges</div><div className="text-2xl font-bold">5</div></div>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="font-semibold mb-2">Activity Log</div>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>2025-09-12: Completed Climate Quiz (8/10)</li>
          <li>2025-09-10: Submitted Tree Planting task (Approved, +150 pts)</li>
          <li>2025-09-05: Earned badge “Water Guardian”</li>
        </ul>
      </div>
    </div>
  );
}
