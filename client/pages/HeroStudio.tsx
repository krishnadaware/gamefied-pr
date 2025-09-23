import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import CharacterAvatar from "@/components/CharacterAvatar";
import { Button } from "@/components/ui/button";

export default function HeroStudio() {
  const [primary, setPrimary] = useState<string>("#22c55e");
  const [accent, setAccent] = useState<string>("#10b981");
  const [skin, setSkin] = useState<string>("#fef3c7");
  const [showCape, setShowCape] = useState(true);
  const [showMask, setShowMask] = useState(true);
  const [emblem, setEmblem] = useState<"leaf" | "water" | "bolt" | "heart">("leaf");

  useEffect(() => {
    const raw = localStorage.getItem("ecoquest_hero");
    if (raw) {
      try {
        const v = JSON.parse(raw);
        setPrimary(v.primary ?? primary);
        setAccent(v.accent ?? accent);
        setSkin(v.skin ?? skin);
        setShowCape(v.showCape ?? showCape);
        setShowMask(v.showMask ?? showMask);
        setEmblem(v.emblem ?? emblem);
      } catch {}
    }
  }, []);

  const heroProps = useMemo(() => ({ primary, accent, skin, showCape, showMask, emblem }), [primary, accent, skin, showCape, showMask, emblem]);

  function save() {
    localStorage.setItem("ecoquest_hero", JSON.stringify(heroProps));
  }

  function randomize() {
    const rand = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;
    setPrimary(rand());
    setAccent(rand());
    setSkin(["#fde68a", "#fcd34d", "#f59e0b", "#fef3c7"][Math.floor(Math.random() * 4)]);
    setShowCape(Math.random() > 0.4);
    setShowMask(Math.random() > 0.3);
    setEmblem(["leaf", "water", "bolt", "heart"][Math.floor(Math.random() * 4)] as any);
  }

  return (
    <Layout>
      <div className="container py-10 grid lg:grid-cols-2 gap-8">
        <div className="neon-frame bg-card p-6">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Hero Studio</h1>
          <p className="text-muted-foreground mb-6">Design your eco‑superhero! Customize colors, mask, cape and emblem. Saved to your device.</p>
          <div className="flex gap-3 mb-4">
            <Button onClick={randomize} variant="secondary">Randomize</Button>
            <Button onClick={save} className="glow-primary">Save</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"><span>Primary</span><input aria-label="Primary color" type="color" value={primary} onChange={(e)=>setPrimary(e.target.value)} className="h-9 w-12 rounded-md border"/></label>
            <label className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"><span>Accent</span><input aria-label="Accent color" type="color" value={accent} onChange={(e)=>setAccent(e.target.value)} className="h-9 w-12 rounded-md border"/></label>
            <label className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"><span>Skin</span><input aria-label="Skin color" type="color" value={skin} onChange={(e)=>setSkin(e.target.value)} className="h-9 w-12 rounded-md border"/></label>
            <label className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"><span>Emblem</span>
              <select aria-label="Emblem" value={emblem} onChange={(e)=>setEmblem(e.target.value as any)} className="h-9 rounded-md border bg-background px-2">
                <option value="leaf">Leaf</option>
                <option value="water">Water</option>
                <option value="bolt">Bolt</option>
                <option value="heart">Heart</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-md border bg-background p-3 col-span-2"><input type="checkbox" checked={showCape} onChange={(e)=>setShowCape(e.target.checked)} className="accent-emerald-500"/><span>Show cape</span></label>
            <label className="flex items-center gap-2 rounded-md border bg-background p-3 col-span-2"><input type="checkbox" checked={showMask} onChange={(e)=>setShowMask(e.target.checked)} className="accent-emerald-500"/><span>Show mask</span></label>
          </div>
        </div>
        <div className="neon-frame bg-card p-6 flex items-center justify-center">
          <div className="text-center">
            <CharacterAvatar size={220} {...heroProps} />
            <div className="mt-4 text-sm text-muted-foreground">Preview</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
