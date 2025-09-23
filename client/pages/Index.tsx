import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(90rem_60rem_at_10%_-10%,rgba(16,185,129,0.25),transparent),radial-gradient(50rem_30rem_at_110%_-10%,rgba(34,197,94,0.25),transparent)]" />
        <div className="container py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Learn. Act. Earn. <span className="text-emerald-600">Save the Planet.</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-prose">
              EcoQuest is a gamified, interactive platform for ages 10–18 to master environmental preservation through engaging quizzes, real‑world challenges, and a rewarding points & badges system.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="shadow-sm">
                <Link to="/dashboard/student">Start as Student</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/dashboard/teacher">I’m a Teacher</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard/parent">Parent View</Link>
              </Button>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="neon-frame bg-card p-3"><div className="font-semibold">Quizzes</div><p className="text-muted-foreground">Pollution • Recycling • Biodiversity • Climate</p></div>
              <div className="neon-frame bg-card p-3"><div className="font-semibold">Tasks</div><p className="text-muted-foreground">Weekly challenges with media uploads</p></div>
              <div className="neon-frame bg-card p-3"><div className="font-semibold">Rewards</div><p className="text-muted-foreground">Points, badges, leaderboards</p></div>
            </div>
          </div>
          <div>
            <div className="relative mx-auto max-w-md neon-frame bg-card p-6 backdrop-blur">
              <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 opacity-20" />
              <div className="absolute -bottom-8 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 opacity-20" />
              <h3 className="font-bold">Your Eco Progress</h3>
              <p className="text-sm text-muted-foreground">Grow your tree as you earn points.</p>
              <div className="mt-4 h-44 rounded-xl border bg-gradient-to-b from-emerald-100 to-emerald-50 relative overflow-hidden">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 bg-emerald-700 rounded-full" style={{ height: "60%" }} />
                <svg className="absolute bottom-0 left-1/2 -translate-x-1/2" width="220" height="160" viewBox="0 0 220 160">
                  <circle cx="110" cy={80} r="28" fill="#22c55e" />
                  <circle cx="75" cy={110} r="20" fill="#34d399" />
                  <circle cx="145" cy={105} r="22" fill="#10b981" />
                </svg>
                <div className="absolute top-2 right-2 text-xs font-medium bg-white/80 px-2 py-1 rounded">120 pts</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="neon-frame p-2 bg-card"><div className="text-muted-foreground">Points</div><div className="font-semibold">120</div></div>
                <div className="neon-frame p-2 bg-card"><div className="text-muted-foreground">Badges</div><div className="font-semibold">3</div></div>
                <div className="neon-frame p-2 bg-card"><div className="text-muted-foreground">Rank</div><div className="font-semibold">#7</div></div>
              </div>
              <div className="mt-4 rounded-lg border p-3 text-sm">
                <div className="font-semibold">Weekly Challenge</div>
                <p className="text-muted-foreground">Reduce plastic use for a week • +100 pts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="container py-14 grid lg:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">For Students</h2>
            <p className="mt-2 text-muted-foreground">Interactive quizzes, real‑life tasks, and a rewarding gamification system with progress bars and growing trees.</p>
            <Button asChild className="mt-4"><Link to="/dashboard/student">Go to Student Dashboard</Link></Button>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">For Teachers</h2>
            <p className="mt-2 text-muted-foreground">View student points, badges and rankings, assign/approve tasks, and export progress reports. Manage student accounts and send announcements.</p>
            <Button asChild variant="secondary" className="mt-4"><Link to="/dashboard/teacher">Go to Teacher Dashboard</Link></Button>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">For Parents</h2>
            <p className="mt-2 text-muted-foreground">Read‑only view of quiz performance, completed tasks, points, badges and ranking. Option to send feedback to teachers.</p>
            <Button asChild variant="outline" className="mt-4"><Link to="/dashboard/parent">Go to Parent Dashboard</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-t bg-gradient-to-b from-emerald-50 to-background">
        <div className="container py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">How Points Work</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="rounded-xl border bg-card p-4"><div className="font-semibold">Quizzes</div><p className="text-muted-foreground">10 points per correct answer.</p></div>
            <div className="rounded-xl border bg-card p-4"><div className="font-semibold">Tasks</div><p className="text-muted-foreground">50–200 points based on difficulty.</p></div>
            <div className="rounded-xl border bg-card p-4"><div className="font-semibold">Badges</div><p className="text-muted-foreground">Unlock Water Guardian, Forest Friend, and more.</p></div>
            <div className="rounded-xl border bg-card p-4"><div className="font-semibold">Leaderboards</div><p className="text-muted-foreground">Compete at class or school level.</p></div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
