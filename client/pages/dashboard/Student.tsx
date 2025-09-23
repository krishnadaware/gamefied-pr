import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EcoDefense3D from "./EcoDefense3D";
import Runner3D from "./Runner3D";
import ChatbotAvatar from "@/components/ChatbotAvatar";

type QuizQ = { id: number; topic: string; q: string; a: string[]; correct: number };
const QUESTIONS: QuizQ[] = [
  { id: 1, topic: "Recycling", q: "Which item is recyclable?", a: ["Food waste", "Plastic bottle", "Ceramic plate", "Tissue"], correct: 1 },
  { id: 2, topic: "Climate", q: "Main gas causing climate change is?", a: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correct: 2 },
  { id: 3, topic: "Biodiversity", q: "Protecting habitats helps?", a: ["Species survival", "More pollution", "Soil erosion", "None"], correct: 0 },
];

function ProgressTree({ points }: { points: number }) {
  const height = Math.min(100, Math.round(points / 4));
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg border bg-gradient-to-b from-emerald-100 to-emerald-50">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 rounded-full bg-emerald-700" style={{ height: `${height * 0.6}%` }} />
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2" width="220" height="160" viewBox="0 0 220 160">
        <g>
          <circle cx="110" cy={160 - height * 1.1} r="28" fill="#22c55e" className="transition-all duration-700" />
          <circle cx="75" cy={160 - height * 0.8} r="20" fill="#34d399" />
          <circle cx="145" cy={160 - height * 0.9} r="22" fill="#10b981" />
        </g>
      </svg>
      <div className="absolute top-2 right-2 text-xs font-medium bg-white/80 px-2 py-1 rounded">{points} pts</div>
    </div>
  );
}

export default function StudentDashboard() {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [taskMsg, setTaskMsg] = useState<string>("");

  const correctCount = useMemo(() =>
    QUESTIONS.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.correct ? 1 : 0), 0),
  [answers]);

  const basePoints = correctCount * 10; // 10 per correct answer

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("quiz:started", { detail: { total: QUESTIONS.length } }));
    return () => {
      window.dispatchEvent(new CustomEvent("quiz:ended"));
    };
  }, []);

  function submitQuiz(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    window.dispatchEvent(new CustomEvent("quiz:submitted", { detail: { total: QUESTIONS.length, correct: correctCount, score: correctCount * 10 } }));
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "video/mp4"];
    if (!allowed.includes(f.type)) {
      setTaskMsg("Unsupported file type. Use JPG, PNG, or MP4.");
      setFile(null);
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setTaskMsg("File is too large (max 20MB).");
      setFile(null);
      return;
    }
    setTaskMsg("");
    setFile(f);
  }

  function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskDesc || !file) {
      setTaskMsg("Please describe the task and attach media evidence.");
      return;
    }
    setTaskMsg("Submitted for review. A teacher will approve and award points (50–200 based on difficulty).");
    setTaskDesc("");
    setFile(null);
  }

  return (
    <div className="container py-10 space-y-10">
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full ring-2 ring-emerald-300 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-green-600 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
                  <circle cx="32" cy="36" r="16" fill="#fef3c7" />
                  <path d="M24 36c2 4 14 4 16 0" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <circle cx="26" cy="32" r="2.5" fill="#0f172a"/>
                  <circle cx="38" cy="32" r="2.5" fill="#0f172a"/>
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">Lv 1</div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Welcome, Eco Hero!</h1>
              <p className="text-muted-foreground -mt-1">Let’s grow your tree today! 🌳</p>
            </div>
          </div>
          <ProgressTree points={basePoints} />
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="neon-frame p-4 bg-card neon-pulse"><div className="text-sm text-muted-foreground">Points</div><div className="text-2xl font-bold">{basePoints}</div></div>
            <div className="neon-frame p-4 bg-card"><div className="text-sm text-muted-foreground">Badges</div><div className="text-2xl font-bold">{basePoints >= 20 ? 2 : basePoints >= 10 ? 1 : 0}</div></div>
            <div className="neon-frame p-4 bg-card"><div className="text-sm text-muted-foreground">Rank</div><div className="text-2xl font-bold">#{Math.max(1, 50 - basePoints)}</div></div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-semibold">Leaderboard (Demo)</h2>
          <ul className="neon-frame divide-y bg-card">
            {["Mia", "Noah", "Ava", "Liam"].map((n, i) => (
              <li key={n} className="flex items-center justify-between p-3">
                <span className="flex items-center gap-2"><span className="text-muted-foreground">#{i + 1}</span>{n}</span>
                <span className="font-semibold">{200 - i * 30}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submitQuiz} className="space-y-4 neon-frame bg-card p-6">
          <div>
            <h2 className="text-xl font-bold">Quick Quiz</h2>
            <p className="text-sm text-muted-foreground">Topics: Pollution, Recycling, Biodiversity, Climate change. 10 points per correct answer.</p>
          </div>
          {QUESTIONS.map((q) => (
            <div key={q.id} className="neon-frame p-3 bg-card">
              <div className="text-sm font-medium">{q.topic}: {q.q}</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.a.map((opt, idx) => (
                  <label key={idx} className={cn("flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer", (answers[q.id] ?? -1) === idx ? "bg-emerald-50 border-emerald-300" : "hover:bg-accent")}> 
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      className="accent-emerald-600"
                      checked={(answers[q.id] ?? -1) === idx}
                      onChange={() => { setAnswers((a) => ({ ...a, [q.id]: idx })); window.dispatchEvent(new CustomEvent("quiz:interaction", { detail: { topic: q.topic, questionId: q.id } })); }}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Button type="submit">Submit Quiz</Button>
            {submitted && (
              <div className="text-sm font-medium">Score: {correctCount * 10} pts</div>
            )}
          </div>
        </form>

        <form onSubmit={submitTask} className="space-y-4 neon-frame bg-card p-6">
          <div>
            <h2 className="text-xl font-bold">Weekly Challenge</h2>
            <p className="text-sm text-muted-foreground">Upload evidence for tasks like recycling, tree planting, or reducing plastic use.</p>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="desc">Task description</label>
            <input id="desc" className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="E.g., I collected 2kg of plastic for recycling" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="file">Attach evidence (JPG, PNG, MP4, max 20MB)</label>
            <input id="file" type="file" accept="image/jpeg,image/png,video/mp4" onChange={onFileChange} className="mt-1 block w-full text-sm" />
          </div>
          {taskMsg && <div className="text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded-md p-2">{taskMsg}</div>}
          <div className="flex gap-2">
            <Button type="submit">Submit for Review</Button>
            <span className="text-xs text-muted-foreground self-center">Teachers approve and assign 50–200 pts.</span>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">Eco Defense 3D</h2>
        <p className="text-sm text-muted-foreground mb-3">Defend the school from pollution waves using eco‑plants. Earn points and learn eco facts.</p>
        <div className="neon-frame bg-card p-2">
          <EcoDefense3D />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">Eco Runner 3D</h2>
        <p className="text-sm text-muted-foreground mb-3">Dodge pollution monsters, collect eco‑tokens, and clean the city as you run. Swipe or use arrow keys to move, jump, or slide.</p>
        <div className="neon-frame bg-card p-2">
          <Runner3D />
        </div>
      </section>

      <ChatbotAvatar />
    </div>
  );
}
