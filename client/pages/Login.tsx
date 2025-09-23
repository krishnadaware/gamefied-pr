import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const roles = [
  { key: "student", label: "Student" },
  { key: "teacher", label: "Teacher" },
  { key: "parent", label: "Parent" },
];

export default function Login() {
  const [search] = useSearchParams();
  const initial = search.get("role") ?? "student";
  const [role, setRole] = useState<string>(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const destination = useMemo(() => {
    if (role === "teacher") return "/dashboard/teacher";
    if (role === "parent") return "/dashboard/parent";
    return "/dashboard/student";
  }, [role]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(destination);
  }

  return (
    <div className="container py-16 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Sign in to EcoQuest</h1>
        <p className="mt-3 text-muted-foreground">Choose your role and use email/password. (Demo only)</p>
        <div className="mt-6 flex gap-2">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={
                "px-4 py-2 rounded-md border text-sm " +
                (role === r.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent")
              }
              aria-pressed={role === r.key}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={onSubmit} className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <Button type="submit" className="w-full">Continue as {role}</Button>
        <p className="text-xs text-muted-foreground">Teachers can register and manage student accounts in their dashboard.</p>
      </form>
    </div>
  );
}
