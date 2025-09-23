import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CharacterAvatar from "@/components/CharacterAvatar";

import { useEffect, useState } from "react";

function Header() {
  const location = useLocation();
  const navLink = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "text-primary-foreground bg-primary/90"
            : "text-foreground/80 hover:text-foreground hover:bg-accent"
        )
      }
    >
      {label}
    </NavLink>
  );

  const [hero, setHero] = useState<any | null>(null);
  useEffect(() => {
    const load = () => {
      try { const v = localStorage.getItem("ecoquest_hero"); setHero(v ? JSON.parse(v) : null); } catch {}
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white font-black">🌱</span>
          <span className="text-lg font-extrabold tracking-tight">EcoQuest</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navLink("/", "Home")}
          {navLink("/dashboard/student", "Quizzes & Tasks")}
          {navLink("/dashboard/student", "Leaderboard")}
          {navLink("/dashboard/teacher", "For Teachers")}
          {navLink("/dashboard/parent", "For Parents")}
          {navLink("/hero", "Hero Studio")}
        </nav>
        <div className="flex items-center gap-3">
          {location.pathname.startsWith("/dashboard") ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs text-muted-foreground">Welcome</div>
                <div className="text-sm font-semibold">Eco Hero</div>
              </div>
              <div className="relative">
                <CharacterAvatar size={40} {...(hero ?? {})} />
                <span className="absolute -bottom-2 -right-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">Lv 1</span>
              </div>
            </div>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Button asChild variant="secondary">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
              <Button asChild>
                <Link to="/dashboard/student">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 grid gap-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-extrabold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white">🌿</span>
            EcoQuest
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            A gamified platform that helps kids learn and practice environmental stewardship.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Explore</h4>
          <ul className="space-y-1 text-sm">
            <li><Link className="hover:underline" to="/dashboard/student">Quizzes</Link></li>
            <li><Link className="hover:underline" to="/dashboard/student">Tasks</Link></li>
            <li><Link className="hover:underline" to="/dashboard/teacher">Teacher tools</Link></li>
            <li><Link className="hover:underline" to="/dashboard/parent">Parent view</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <p className="text-sm text-muted-foreground">Have feedback? We’d love to hear it.</p>
          <a className="text-sm text-primary hover:underline" href="#">hello@ecoquest.app</a>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} EcoQuest. All rights reserved.</div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
