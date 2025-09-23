import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HumanAvatar from "@/components/HumanAvatar";

export type ChatMsg = { id: number; role: "bot" | "user"; text: string };

const KB: { topic: string; keywords: string[]; answer: string }[] = [
  {
    topic: "recycling",
    keywords: ["recycle", "recycling", "plastic bottle", "paper", "glass", "metal"],
    answer:
      "Recycling means turning used materials (paper, glass, metal, plastic) into new products. Rinse containers, remove food, and check your local rules. Plastic bottles, cans, and clean cardboard are usually OK; greasy pizza boxes and tissues are not.",
  },
  {
    topic: "water",
    keywords: ["water", "save water", "conserve", "short shower", "tap", "leak"],
    answer:
      "To save water: take 5–7 minute showers, turn off the tap while brushing, fix drips, and water plants in the morning. Every drop counts!",
  },
  {
    topic: "energy",
    keywords: ["energy", "electricity", "turn off", "lights", "renewable", "solar", "wind"],
    answer:
      "Save energy by switching off lights and devices, using LED bulbs, and opening curtains for daylight. Clean energy sources include solar, wind, hydro, and geothermal.",
  },
  {
    topic: "climate",
    keywords: ["climate", "global warming", "greenhouse", "co2", "carbon dioxide", "temperature"],
    answer:
      "Climate change happens when greenhouse gases like CO₂ trap heat. We can help by using public transport, biking, planting trees, and wasting less energy and food.",
  },
  {
    topic: "plastic",
    keywords: ["plastic", "single-use", "bag", "straw", "bottle", "microplastic"],
    answer:
      "Reduce plastic by carrying a reusable bottle and bag, choosing fewer single‑use items, and recycling correctly. Avoid products with microbeads when possible.",
  },
  {
    topic: "compost",
    keywords: ["compost", "food waste", "banana peel", "soil", "fertilizer"],
    answer:
      "Composting turns fruit/veg scraps and yard waste into nutrient‑rich soil. Do not compost meat, dairy, or oily foods. Composting cuts trash and helps gardens!",
  },
  {
    topic: "biodiversity",
    keywords: ["biodiversity", "habitat", "animals", "species", "ecosystem"],
    answer:
      "Biodiversity is the variety of life. Protect it by keeping habitats clean, planting native species, and avoiding litter and pollution.",
  },
  {
    topic: "air",
    keywords: ["air", "pollution", "smog", "breathe", "clean air"],
    answer:
      "Air pollution comes from vehicles, factories, and burning fuels. Walking, biking, or carpooling lowers pollution and keeps the air (and you) healthier.",
  },
  {
    topic: "footprint",
    keywords: ["footprint", "carbon", "emissions", "co2e"],
    answer:
      "Your carbon footprint is the total greenhouse gases your activities produce. Lower it by eating more plants, saving energy, and reducing car and airplane travel.",
  },
  {
    topic: "trees",
    keywords: ["tree", "planting", "forest", "deforest"],
    answer:
      "Trees absorb CO₂, cool cities, and provide homes for animals. Planting and protecting trees is one of the best climate actions.",
  },
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function findAnswer(q: string) {
  const nq = normalize(q);
  let best: { score: number; answer: string } | null = null;
  for (const item of KB) {
    let score = 0;
    for (const k of item.keywords) if (nq.includes(k)) score += 1;
    if (score > 0) {
      const boost = nq.includes(item.topic) ? 1 : 0;
      score += boost;
      if (!best || score > best.score) best = { score, answer: item.answer };
    }
  }
  if (best) return best.answer;
  // fuzzy: choose by shared words
  const words = nq.split(" ").filter((w) => w.length > 3);
  for (const item of KB) {
    const shared = item.keywords.filter((k) => words.some((w) => k.includes(w))).length;
    if (shared >= 1) return item.answer;
  }
  return "I’m not sure yet. Try asking about recycling, water saving, energy, climate, plastic, compost, biodiversity, air, carbon footprint, or trees.";
}

function useChatMemory() {
  const idRef = useRef(1);
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    id: 0,
    role: "bot",
    text: "Hi! I’m Coach Maya 👩🏽‍🏫 Ask me any doubt about the environment. I’ll also guide and cheer you during quizzes!",
  }]);
  const push = (m: Omit<ChatMsg, "id">) => setMsgs((arr) => [...arr, { id: idRef.current++, ...m }].slice(-60));
  return { msgs, push };
}

export default function ChatbotAvatar() {
  const { msgs, push } = useChatMemory();
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(m.matches);
    onChange();
    if ((m as any).addEventListener) (m as any).addEventListener("change", onChange);
    else (m as any).addListener(onChange);
    return () => {
      if ((m as any).removeEventListener) (m as any).removeEventListener("change", onChange);
      else (m as any).removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (isDesktop) setOpen(true);
  }, [isDesktop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "b" || e.key === "B")) setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Quiz event listeners
  useEffect(() => {
    const onStart = (e: Event) => {
      const ev = e as CustomEvent<{ total: number }>;
      if (isDesktop) setOpen(true);
      push({ role: "bot", text: `Quiz time! I’m here with tips and encouragement. There are ${ev.detail?.total ?? 0} questions.` });
    };
    const onInteract = (e: Event) => {
      const ev = e as CustomEvent<{ topic?: string; questionId?: number }>;
      if (ev.detail?.topic) {
        push({ role: "bot", text: `Nice focus on ${ev.detail.topic}! Want a hint? Type: hint about ${ev.detail.topic.toLowerCase()}.` });
      } else {
        push({ role: "bot", text: "Great thinking! Keep going, and ask for a hint anytime." });
      }
    };
    const onSubmit = (e: Event) => {
      const ev = e as CustomEvent<{ total: number; correct: number; score: number }>;
      const c = ev.detail?.correct ?? 0;
      const t = ev.detail?.total ?? 0;
      push({ role: "bot", text: `You finished the quiz! Score: ${ev.detail?.score ?? c * 10} pts • Correct: ${c}/${t}. Proud of you! 🌟` });
    };
    const onEnd = () => push({ role: "bot", text: "Quiz closed. Ask me anything or start another round when you’re ready." });

    window.addEventListener("quiz:started", onStart as EventListener);
    window.addEventListener("quiz:interaction", onInteract as EventListener);
    window.addEventListener("quiz:submitted", onSubmit as EventListener);
    window.addEventListener("quiz:ended", onEnd as EventListener);
    return () => {
      window.removeEventListener("quiz:started", onStart as EventListener);
      window.removeEventListener("quiz:interaction", onInteract as EventListener);
      window.removeEventListener("quiz:submitted", onSubmit as EventListener);
      window.removeEventListener("quiz:ended", onEnd as EventListener);
    };
  }, [push, isDesktop]);

  const ask = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    push({ role: "user", text: trimmed });
    const a = findAnswer(trimmed);
    push({ role: "bot", text: a });
    setInput("");
  };

  const quickies = useMemo(() => [
    "What is recycling?",
    "How can I save water at home?",
    "What is a carbon footprint?",
    "How does plastic harm oceans?",
    "Best ways to save energy?",
  ], []);

  return (
    <div className="pointer-events-auto">
      {/* Toggle button */}
      <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
        {open && (
          <div className="neon-frame bg-card w-[340px] sm:w-[380px] md:w-[420px] max-h-[70vh] rounded-xl overflow-hidden flex flex-col card-glow">
            <div className="flex items-center gap-2 p-3 border-b bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.15),transparent_60%)]">
              <HumanAvatar size={36} />
              <div className="leading-tight">
                <div className="text-sm font-bold">Coach Maya</div>
                <div className="text-xs text-muted-foreground">Human tutor • Eco & quiz buddy</div>
              </div>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {msgs.map((m) => (
                <div key={m.id} className={m.role === "bot" ? "text-sm" : "text-sm text-right"}>
                  <div className={m.role === "bot" ? "inline-block max-w-[85%] rounded-lg bg-secondary px-3 py-2" : "inline-block max-w-[85%] rounded-lg bg-primary text-primary-foreground px-3 py-2"}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t space-y-2">
              <div className="flex items-center gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about recycling, water, energy…" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }} />
                <Button size="sm" onClick={() => ask(input)}>Send</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickies.map((q) => (
                  <button key={q} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80" onClick={() => ask(q)}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          aria-label={open ? "Close SproutBot" : "Open SproutBot"}
          onClick={() => setOpen((v) => !v)}
          className="relative h-14 w-14 rounded-full glow-primary ring-2 ring-emerald-400/50 bg-gradient-to-br from-emerald-500 to-green-700 text-white flex items-center justify-center"
        >
          <span className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">{open ? "close" : "hi"}</span>
          <HumanAvatar size={40} />
        </button>
      </div>
    </div>
  );
}
