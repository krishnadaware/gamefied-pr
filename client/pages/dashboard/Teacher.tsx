import { Button } from "@/components/ui/button";

export default function TeacherDashboard() {
  const students = [
    { name: "Mia", points: 220, badges: 3, rank: 1 },
    { name: "Noah", points: 190, badges: 2, rank: 2 },
    { name: "Ava", points: 160, badges: 2, rank: 3 },
  ];

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage students, approve tasks, and export progress reports.</p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Students</div>
          <div className="flex gap-2">
            <Button variant="secondary">Add Student</Button>
            <Button>Export Reports</Button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-accent/50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Points</th>
              <th className="text-left p-3">Badges</th>
              <th className="text-left p-3">Rank</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.name} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.points}</td>
                <td className="p-3">{s.badges}</td>
                <td className="p-3">#{s.rank}</td>
                <td className="p-3"><div className="flex gap-2"><Button size="sm">Approve Task</Button><Button size="sm" variant="secondary">Message</Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="font-semibold mb-2">Announcements</div>
        <div className="text-sm text-muted-foreground">Send announcements or private messages to students.</div>
      </div>
    </div>
  );
}
