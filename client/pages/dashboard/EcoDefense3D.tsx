import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

type TowerType = "sun" | "vine" | "flower" | "tree" | "mush";

type HazardType = "plastic" | "garbage" | "oil" | "smog" | "chem";

interface Tower {
  id: number;
  r: number; // row
  c: number; // column
  type: TowerType;
  hp: number;
  cooldown: number; // for attacks or energy gen
  level: number;
}

interface Hazard {
  id: number;
  r: number;
  x: number; // world X position along lane
  hp: number;
  speed: number;
  type: HazardType;
}

interface Projectile {
  id: number;
  r: number;
  x: number;
  speed: number;
  dmg: number;
}

const ROWS = 5;
const COLS = 9;
const CELL = 1; // world units per cell

const COST: Record<TowerType, number> = { sun: 50, vine: 75, flower: 100, tree: 125, mush: 90 };

const HAZARD_BASE: Record<HazardType, { hp: number; speed: number; color: string }> = {
  plastic: { hp: 40, speed: 0.35, color: "#60a5fa" },
  garbage: { hp: 60, speed: 0.3, color: "#a3a3a3" },
  oil: { hp: 90, speed: 0.28, color: "#0f172a" },
  smog: { hp: 70, speed: 0.38, color: "#64748b" },
  chem: { hp: 110, speed: 0.26, color: "#9333ea" },
};

const FACTS = [
  "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
  "Planting trees helps absorb CO₂ and cool cities.",
  "Turning off lights you’re not using saves energy and money.",
  "Plastic can take hundreds of years to decompose.",
  "Biking or walking reduces air pollution and keeps you healthy!",
];

function worldX(c: number) {
  return (c - (COLS - 1) / 2) * CELL;
}
function worldZ(r: number) {
  return (r - (ROWS - 1) / 2) * CELL;
}

function TowerMesh({ t }: { t: Tower }) {
  const color = useMemo(() => {
    if (t.type === "sun") return "#fde047";
    if (t.type === "vine") return "#22c55e";
    if (t.type === "flower") return "#f472b6";
    if (t.type === "tree") return "#16a34a";
    return "#8b5cf6"; // mush
  }, [t.type]);
  const scaleY = t.type === "tree" ? 1.4 : 1;
  return (
    <group position={[worldX(t.c), 0.5 * scaleY, worldZ(t.r)]}>
      <mesh>
        <boxGeometry args={[0.8, 0.8 * scaleY, 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {t.type === "flower" && (
        <mesh position={[0, 0.6 * scaleY, 0]}>
          <coneGeometry args={[0.25, 0.4, 6]} />
          <meshStandardMaterial color="#fda4af" emissive="#fda4af" emissiveIntensity={0.3} />
        </mesh>
      )}
      {t.type === "sun" && (
        <mesh position={[0, 0.6 * scaleY, 0]}>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function HazardMesh({ h }: { h: Hazard }) {
  const base = HAZARD_BASE[h.type];
  return (
    <group position={[h.x, 0.45, worldZ(h.r)]}>
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={base.color} emissive={base.color} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function ProjectileMesh({ p }: { p: Projectile }) {
  return (
    <group position={[p.x, 0.6, worldZ(p.r)]}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

type LoopProps = {
  towers: React.MutableRefObject<Tower[]>;
  hazards: React.MutableRefObject<Hazard[]>;
  projectiles: React.MutableRefObject<Projectile[]>;
  nextId: React.MutableRefObject<number>;
  spawnTimer: React.MutableRefObject<number>;
  spawnedInWave: React.MutableRefObject<number>;
  waveSize: React.MutableRefObject<number>;
  lastRain: React.MutableRefObject<number>;
  lastWind: React.MutableRefObject<number>;
  passiveTimer: React.MutableRefObject<number>;
  setEnergy: React.Dispatch<React.SetStateAction<number>>;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  setWave: React.Dispatch<React.SetStateAction<number>>;
  setFact: React.Dispatch<React.SetStateAction<string | null>>;
  wave: number;
};

function GameLoop({ towers, hazards, projectiles, nextId, spawnTimer, spawnedInWave, waveSize, lastRain, lastWind, passiveTimer, setEnergy, setLives, setWave, setFact, wave }: LoopProps) {
  useFrame((_, delta) => {
    passiveTimer.current += delta;
    if (passiveTimer.current >= 2) {
      setEnergy((e) => e + 1);
      passiveTimer.current = 0;
    }
    towers.current.forEach((t) => {
      t.cooldown -= delta;
      if (t.type === "sun" && t.cooldown <= 0) {
        setEnergy((e) => e + 1);
        t.cooldown = Math.max(0.6, 1.2 - 0.1 * (t.level - 1));
      }
      if (t.type === "flower" && t.cooldown <= 0) {
        projectiles.current.push({ id: nextId.current++, r: t.r, x: worldX(t.c), speed: 3.5, dmg: 20 + 5 * (t.level - 1) });
        t.cooldown = Math.max(0.6, 1.4 - 0.15 * (t.level - 1));
      }
      if (t.type === "mush") {
        hazards.current.forEach((h) => {
          if (h.r === t.r && Math.abs(h.x - worldX(t.c)) < 1.4) h.hp -= delta * 6;
        });
      }
      if (t.type === "vine") {
        hazards.current.forEach((h) => {
          if (h.r === t.r && Math.abs(h.x - worldX(t.c)) < 0.9) h.speed = Math.min(h.speed, 0.16);
        });
      }
    });

    projectiles.current.forEach((p) => (p.x += p.speed * delta));
    projectiles.current = projectiles.current.filter((p) => {
      const laneHaz = hazards.current.filter((h) => h.r === p.r);
      for (const h of laneHaz) {
        if (Math.abs(p.x - h.x) < 0.5) {
          h.hp -= p.dmg;
          return false;
        }
      }
      return p.x < worldX(COLS - 1) + 2;
    });

    spawnTimer.current += delta;
    if (spawnedInWave.current < waveSize.current && spawnTimer.current >= 2.2) {
      spawnTimer.current = 0;
      const r = Math.floor(Math.random() * ROWS);
      const types: HazardType[] = ["plastic", "garbage", "smog", "oil", "chem"];
      const t = types[Math.floor(Math.random() * types.length)];
      const base = HAZARD_BASE[t];
      hazards.current.push({ id: nextId.current++, r, x: worldX(COLS) + 1.2, hp: base.hp + 10 * (wave - 1), speed: base.speed + 0.02 * (wave - 1), type: t });
      spawnedInWave.current++;
    }

    hazards.current.forEach((h) => {
      h.x -= h.speed * delta;
      towers.current.forEach((t) => {
        if (t.type === "tree" && t.r === h.r) {
          if (Math.abs(h.x - worldX(t.c)) < 0.55) {
            h.x += h.speed * delta;
            t.hp -= delta * 10;
          }
        }
      });
    });

    hazards.current = hazards.current.filter((h) => h.hp > 0 && h.x > worldX(0) - 1.6);
    towers.current = towers.current.filter((t) => t.hp > 0);

    const leaked = hazards.current.filter((h) => h.x <= worldX(0) - 1.5);
    if (leaked.length) {
      hazards.current = hazards.current.filter((h) => h.x > worldX(0) - 1.5);
      setLives((L) => Math.max(0, L - leaked.length));
    }

    if (spawnedInWave.current >= waveSize.current && hazards.current.length === 0) {
      spawnedInWave.current = 0;
      waveSize.current += 2;
      setWave((w) => w + 1);
      setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
    }
  });
  return null;
}

export default function EcoDefense3D() {
  const [selected, setSelected] = useState<TowerType>("flower");
  const [energy, setEnergy] = useState(100);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [fact, setFact] = useState<string | null>(null);

  const towers = useRef<Tower[]>([]);
  const hazards = useRef<Hazard[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const nextId = useRef(1);
  const spawnTimer = useRef(0);
  const spawnedInWave = useRef(0);
  const waveSize = useRef(6);
  const lastRain = useRef(0);
  const lastWind = useRef(0);

  // passive energy
  const passiveTimer = useRef(0);

  const placeTower = useCallback((r: number, c: number) => {
    if (towers.current.some((t) => t.r === r && t.c === c)) return;
    const cost = COST[selected];
    setEnergy((e) => {
      if (e < cost) return e;
      const t: Tower = {
        id: nextId.current++,
        r,
        c,
        type: selected,
        hp: selected === "tree" ? 300 : 120,
        cooldown: 0,
        level: 1,
      };
      towers.current.push(t);
      return e - cost;
    });
  }, [selected]);

  const onGridClick = (e: any) => {
    const point = e.point as { x: number; z: number };
    const c = Math.round(point.x / CELL + (COLS - 1) / 2);
    const r = Math.round(point.z / CELL + (ROWS - 1) / 2);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      placeTower(r, c);
    }
  };

  const useRain = () => {
    const now = performance.now();
    if (now - lastRain.current < 15000) return; // 15s cooldown
    lastRain.current = now;
    hazards.current.forEach((h) => {
      if (h.type === "plastic" || h.type === "smog") h.hp -= 60;
    });
  };
  const useWind = () => {
    const now = performance.now();
    if (now - lastWind.current < 15000) return; // 15s cooldown
    lastWind.current = now;
    hazards.current.forEach((h) => (h.x += 1.5));
  };

  // Upgrade last placed tower (simple)
  const upgrade = () => {
    const t = towers.current[towers.current.length - 1];
    if (!t) return;
    const cost = 60;
    setEnergy((e) => {
      if (e < cost) return e;
      t.level += 1;
      return e - cost;
    });
  };

  const canRain = performance.now() - lastRain.current >= 15000;
  const canWind = performance.now() - lastWind.current >= 15000;

  return (
    <div className="neon-frame bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setSelected("sun")} variant={selected === "sun" ? "default" : "secondary"}>☀️ Sun</Button>
          <Button size="sm" onClick={() => setSelected("vine")} variant={selected === "vine" ? "default" : "secondary"}>🌿 Vine</Button>
          <Button size="sm" onClick={() => setSelected("flower")} variant={selected === "flower" ? "default" : "secondary"}>🌻 Flower</Button>
          <Button size="sm" onClick={() => setSelected("tree")} variant={selected === "tree" ? "default" : "secondary"}>🌳 Tree</Button>
          <Button size="sm" onClick={() => setSelected("mush")} variant={selected === "mush" ? "default" : "secondary"}>🍄 Mushroom</Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-secondary/50">Energy: {energy}</span>
          <span className="px-2 py-1 rounded bg-secondary/50">Wave: {wave}</span>
          <span className="px-2 py-1 rounded bg-secondary/50">Lives: {lives}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button size="sm" onClick={upgrade} className="glow-primary">Upgrade last (60)</Button>
        <Button size="sm" onClick={useRain} disabled={!canRain} variant="secondary">🌧️ Rain (15s)</Button>
        <Button size="sm" onClick={useWind} disabled={!canWind} variant="secondary">🌬️ Wind (15s)</Button>
        <div className="text-xs text-muted-foreground">Costs — Sun: {COST.sun}, Vine: {COST.vine}, Flower: {COST.flower}, Tree: {COST.tree}, Mush: {COST.mush}</div>
      </div>
      <div className="w-full h-[420px] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.25),transparent_60%)] rounded-lg overflow-hidden">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 6.5, 6.5], fov: 55 }} shadows>
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 8, 5]} intensity={1.2} color="#22c55e" />
            <pointLight position={[-6, 6, -6]} intensity={0.8} color="#14b8a6" />

            <GameLoop
              towers={towers}
              hazards={hazards}
              projectiles={projectiles}
              nextId={nextId}
              spawnTimer={spawnTimer}
              spawnedInWave={spawnedInWave}
              waveSize={waveSize}
              lastRain={lastRain}
              lastWind={lastWind}
              passiveTimer={passiveTimer}
              setEnergy={setEnergy}
              setLives={setLives}
              setWave={setWave}
              setFact={setFact}
              wave={wave}
            />

            {/* Ground grid */}
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <mesh onClick={onGridClick} receiveShadow>
                <planeGeometry args={[COLS * CELL, ROWS * CELL]} />
                <meshStandardMaterial color="#0b1f1a" opacity={0.9} transparent />
              </mesh>
              {/* Grid lines */}
              {Array.from({ length: COLS + 1 }, (_, i) => (
                <mesh key={`v-${i}`} position={[worldX(i - 1), 0.01, 0]}>
                  <boxGeometry args={[0.02, ROWS * CELL, 0.02]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={i % 3 === 0 ? 0.25 : 0.12} />
                </mesh>
              ))}
              {Array.from({ length: ROWS + 1 }, (_, i) => (
                <mesh key={`h-${i}`} position={[0, 0.01, worldZ(i - 1)]}>
                  <boxGeometry args={[COLS * CELL, 0.02, 0.02]} />
                  <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={i % 2 === 0 ? 0.25 : 0.12} />
                </mesh>
              ))}
            </group>

            {/* Towers */}
            {towers.current.map((t) => (
              <TowerMesh key={t.id} t={t} />
            ))}
            {/* Hazards */}
            {hazards.current.map((h) => (
              <HazardMesh key={h.id} h={h} />
            ))}
            {/* Projectiles */}
            {projectiles.current.map((p) => (
              <ProjectileMesh key={p.id} p={p} />
            ))}

            <OrbitControls enablePan={false} enableRotate={false} minDistance={8} maxDistance={12} />
          </Canvas>
        </Suspense>
      </div>

      {fact && (
        <div className="mt-3 p-3 rounded-md border bg-background">
          <div className="font-semibold">Eco Fact</div>
          <div className="text-sm text-muted-foreground">{fact}</div>
          <div className="mt-2 text-xs text-muted-foreground">New wave incoming!</div>
        </div>
      )}
    </div>
  );
}
