import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

// Three lanes: -1, 0, 1 (x positions)
const LANES = [-1.5, 0, 1.5];

type ObstacleKind = "trash" | "barrel" | "smog" | "monster" | "plastic";
type TokenKind = "leaf" | "water" | "energy";
type PowerKind = "shield" | "boost" | "magnet";

interface Entity { id: number; x: number; z: number; kind: string; vy?: number; }
interface PlayerState {
  lane: number; // -1,0,1 index
  y: number;
  vy: number;
  sliding: boolean;
  shield: boolean;
  magnet: boolean;
  boost: boolean;
}

function Box({ position, color = "#16a34a", emissive = color, scale = [1,1,1] as [number,number,number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.25} />
    </mesh>
  );
}

function TokenMesh({ e }: { e: Entity }) {
  const color = e.kind === "leaf" ? "#22c55e" : e.kind === "water" ? "#38bdf8" : "#f59e0b";
  return (
    <mesh position={[e.x, 0.6 + Math.sin(e.z * 2) * 0.1, e.z]}>
      <icosahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

function ObstacleMesh({ e }: { e: Entity }) {
  // Smog creature (floating)
  if (e.kind === "smog") {
    return (
      <group position={[e.x, 1.2, e.z]}>
        <mesh>
          <sphereGeometry args={[0.8, 18, 18]} />
          <meshStandardMaterial color="#94a3b8" emissive="#22c55e" emissiveIntensity={0.05} opacity={0.6} transparent />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.18, 0.15, 0.6]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.18, 0.15, 0.6]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    );
  }

  // Plastic beast (bag with handles)
  if (e.kind === "plastic") {
    return (
      <group position={[e.x, 0.9, e.z]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.65, 20, 20]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.25} opacity={0.75} transparent />
        </mesh>
        {/* Handles */}
        <mesh position={[-0.35, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.07, 10, 18]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.25} opacity={0.75} transparent />
        </mesh>
        <mesh position={[0.35, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.07, 10, 18]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.25} opacity={0.75} transparent />
        </mesh>
        {/* Face */}
        <mesh position={[-0.18, -0.1, 0.6]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.18, -0.1, 0.6]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, -0.28, 0.6]} rotation={[0,0,0]}>
          <boxGeometry args={[0.22, 0.06, 0.06]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    );
  }

  // Garbage pile with eyes
  if (e.kind === "trash") {
    return (
      <group position={[e.x, 0.7, e.z]}>
        <Box position={[0, 0.3, 0]} color="#57534e" scale={[0.9, 0.6, 0.9]} />
        <Box position={[0.35, 0.8, 0.1]} color="#84cc16" scale={[0.5, 0.5, 0.5]} />
        <Box position={[-0.4, 0.9, -0.1]} color="#ef4444" scale={[0.45, 0.45, 0.45]} />
        <mesh position={[-0.15, 1.0, 0.45]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.15, 1.0, 0.45]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    );
  }

  // Pollution monster (toxic blob with spikes)
  if (e.kind === "monster") {
    return (
      <group position={[e.x, 0.9, e.z]}>
        <mesh>
          <sphereGeometry args={[0.7, 20, 20]} />
          <meshStandardMaterial color="#9333ea" emissive="#9333ea" emissiveIntensity={0.35} />
        </mesh>
        {/* Spikes */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[Math.cos((i/6)*Math.PI*2)*0.8, 0.2, Math.sin((i/6)*Math.PI*2)*0.8]} rotation={[Math.PI/2, 0, 0]}>
            <coneGeometry args={[0.12, 0.3, 8]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} />
          </mesh>
        ))}
        {/* Eyes */}
        <mesh position={[-0.18, 0.15, 0.6]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.18, 0.15, 0.6]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    );
  }

  // Toxic barrel (keep)
  const color = "#f97316";
  const h = 1.2;
  return <Box position={[e.x, h/2, e.z]} color={color} scale={[1, h, 1]} />;
}

function PlantHeroMesh({ p, colors }: { p: PlayerState; colors: { primary: string; accent: string; skin: string } }) {
  const groupRef = useRef<any>(null);
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(performance.now() / 600) * 0.05;
    }
  });
  const yOffset = p.sliding ? -0.35 : 0;
  const petalCount = 10;
  const petals = Array.from({ length: petalCount }, (_, i) => i);
  return (
    <group ref={groupRef} position={[LANES[p.lane + 1], p.y + yOffset, 0]}>
      {/* Stem */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, p.sliding ? 0.8 : 1.4, 12]} />
        <meshStandardMaterial color={colors.primary} emissive={colors.primary} emissiveIntensity={0.35} />
      </mesh>
      {/* Leaves (arms) */}
      <mesh position={[-0.35, 1.2 + (p.sliding ? -0.2 : 0), 0]} rotation={[0, 0, Math.PI / 6]}>
        <coneGeometry args={[0.18, 0.5, 8]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.35, 1.2 + (p.sliding ? -0.2 : 0), 0]} rotation={[0, Math.PI, -Math.PI / 6]}>
        <coneGeometry args={[0.18, 0.5, 8]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.25} />
      </mesh>
      {/* Flower head */}
      <group position={[0, 1.8 + (p.sliding ? -0.3 : 0), 0]}>
        {petals.map((i) => (
          <mesh key={i} rotation={[0, (i / petalCount) * Math.PI * 2, 0]} position={[0, 0, 0]}>
            <torusGeometry args={[0.55, 0.16, 8, 24]} />
            <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.6} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color={colors.skin} emissive={colors.primary} emissiveIntensity={0.25} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.13, 0.06, 0.35]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#00120c" />
        </mesh>
        <mesh position={[0.13, 0.06, 0.35]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#00120c" />
        </mesh>
      </group>
      {/* Shield */}
      {p.shield && (
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[1.0, 24, 24]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.35} opacity={0.22} transparent />
        </mesh>
      )}
      {/* Boost/Magnet FX */}
      {p.boost && (
        <mesh position={[0, 0.9, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 1.1, 24]} />
          <meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={0.45} opacity={0.35} transparent />
        </mesh>
      )}
      {p.magnet && (
        <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.25, 24]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} opacity={0.28} transparent />
        </mesh>
      )}
    </group>
  );
}

function Ground({ greener }: { greener: number }) {
  const color = `hsl(${145 + greener * 10} 50% ${12 + greener * 12}%)`;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 400]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

let RUNNER_ID = 1;

type LoopProps = {
  running: boolean;
  setRunning: (v: boolean) => void;
  statsRef: React.MutableRefObject<{ distance: number; tokens: number; best: number; score: number }>;
  playerRef: React.MutableRefObject<PlayerState>;
  obstaclesRef: React.MutableRefObject<Entity[]>;
  tokensRef: React.MutableRefObject<Entity[]>;
  powersRef: React.MutableRefObject<Entity[]>;
  speedRef: React.MutableRefObject<number>;
  envGreenerRef: React.MutableRefObject<number>;
  setHud: React.Dispatch<React.SetStateAction<{shield:number;boost:number;magnet:number}>>;
};

function RunnerLoop({ running, setRunning, statsRef, playerRef, obstaclesRef, tokensRef, powersRef, speedRef, envGreenerRef, setHud }: LoopProps) {
  const spawnObsTimer = useRef(0);
  const spawnTokTimer = useRef(0);
  const spawnPowTimer = useRef(0);
  const powerTimers = useRef({ shield: 0, boost: 0, magnet: 0 });

  useFrame((_, delta) => {
    if (!running) return;
    // Speed and distance
    const s = speedRef.current * (playerRef.current.boost ? 1.35 : 1);
    statsRef.current.distance += s * delta;
    statsRef.current.score = Math.floor(statsRef.current.distance * 10 + statsRef.current.tokens * 5);

    // Environment greener over distance
    envGreenerRef.current = Math.min(1, statsRef.current.distance / 600);

    // Spawn obstacles
    spawnObsTimer.current += delta;
    const obsEvery = Math.max(0.6, 1.6 - envGreenerRef.current); // faster later
    if (spawnObsTimer.current >= obsEvery) {
      spawnObsTimer.current = 0;
      const kinds: ObstacleKind[] = ["trash", "plastic", "barrel", "smog", "monster"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const laneIdx = Math.floor(Math.random() * 3) - 1;
      obstaclesRef.current.push({ id: RUNNER_ID++, x: LANES[laneIdx + 1], z: -30, kind });
    }

    // Spawn tokens
    spawnTokTimer.current += delta;
    if (spawnTokTimer.current >= 0.8) {
      spawnTokTimer.current = 0;
      const kinds: TokenKind[] = ["leaf", "water", "energy"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const laneIdx = Math.floor(Math.random() * 3) - 1;
      tokensRef.current.push({ id: RUNNER_ID++, x: LANES[laneIdx + 1], z: -28, kind });
    }

    // Spawn powerups
    spawnPowTimer.current += delta;
    if (spawnPowTimer.current >= 9) {
      spawnPowTimer.current = 0;
      const kinds: PowerKind[] = ["shield", "boost", "magnet"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const laneIdx = Math.floor(Math.random() * 3) - 1;
      powersRef.current.push({ id: RUNNER_ID++, x: LANES[laneIdx + 1], z: -35, kind });
    }

    // Move entities towards player (+z)
    const dz = s * 10 * delta;
    obstaclesRef.current.forEach((o) => (o.z += dz));
    tokensRef.current.forEach((t) => (t.z += dz));
    powersRef.current.forEach((p) => (p.z += dz));

    // Player gravity
    playerRef.current.vy -= 18 * delta;
    playerRef.current.y = Math.max(0, playerRef.current.y + playerRef.current.vy * delta);
    if (playerRef.current.y === 0) playerRef.current.vy = 0;

    // Magnet attraction
    if (playerRef.current.magnet) {
      tokensRef.current.forEach((t) => {
        const dx = t.x - LANES[playerRef.current.lane + 1];
        const dzp = t.z - 0;
        const d2 = dx * dx + dzp * dzp;
        if (d2 < 25) {
          t.x += (-dx) * 0.1;
          t.z += (-dzp) * 0.1;
        }
      });
    }

    // Collisions (AABB approximate)
    const px = LANES[playerRef.current.lane + 1];
    const pyTop = playerRef.current.sliding ? 1.1 : 1.8;
    // Obstacles
    obstaclesRef.current = obstaclesRef.current.filter((o) => {
      const near = Math.abs(o.z) < 1.1 && Math.abs(o.x - px) < 0.8;
      const isSmog = o.kind === "smog";
      const isLow = o.kind === "barrel" || o.kind === "trash" || o.kind === "plastic";
      const hitVert = isSmog ? playerRef.current.y < 1.4 : playerRef.current.y < pyTop;
      if (near && hitVert) {
        if (playerRef.current.shield) {
          playerRef.current.shield = false;
          return false;
        }
        setRunning(false);
        statsRef.current.best = Math.max(statsRef.current.best, statsRef.current.score);
        localStorage.setItem("eco_runner_best", String(statsRef.current.best));
        return false;
      }
      return o.z < 10;
    });

    // Tokens
    tokensRef.current = tokensRef.current.filter((t) => {
      if (Math.abs(t.z) < 1 && Math.abs(t.x - px) < 0.8 && playerRef.current.y < 1.6) {
        statsRef.current.tokens += 1;
        return false;
      }
      return t.z < 10;
    });

    // Powerups
    powersRef.current = powersRef.current.filter((p) => {
      if (Math.abs(p.z) < 1 && Math.abs(p.x - px) < 0.8) {
        if (p.kind === "shield") { playerRef.current.shield = true; powerTimers.current.shield = 6; }
        if (p.kind === "boost") { playerRef.current.boost = true; powerTimers.current.boost = 4; }
        if (p.kind === "magnet") { playerRef.current.magnet = true; powerTimers.current.magnet = 6; }
        return false;
      }
      return p.z < 10;
    });

    // Power timers
    const pt = powerTimers.current;
    if (pt.shield > 0) { pt.shield -= delta; if (pt.shield <= 0) playerRef.current.shield = false; }
    if (pt.boost > 0) { pt.boost -= delta; if (pt.boost <= 0) playerRef.current.boost = false; }
    if (pt.magnet > 0) { pt.magnet -= delta; if (pt.magnet <= 0) playerRef.current.magnet = false; }
    setHud({ shield: Math.max(0, pt.shield), boost: Math.max(0, pt.boost), magnet: Math.max(0, pt.magnet) });
  });
  return null;
}

export default function Runner3D() {
  const [running, setRunning] = useState(true);
  const [hud, setHud] = useState({ shield: 0, boost: 0, magnet: 0 });
  const [heroColors, setHeroColors] = useState<{ primary: string; accent: string; skin: string }>({ primary: "#22c55e", accent: "#10b981", skin: "#fef3c7" });
  const statsRef = useRef({ distance: 0, tokens: 0, best: 0, score: 0 });
  const playerRef = useRef<PlayerState>({ lane: 0, y: 0, vy: 0, sliding: false, shield: false, magnet: false, boost: false });
  const obstaclesRef = useRef<Entity[]>([]);
  const tokensRef = useRef<Entity[]>([]);
  const powersRef = useRef<Entity[]>([]);
  const speedRef = useRef(0.9);
  const envGreenerRef = useRef(0);

  useEffect(() => {
    const b = Number(localStorage.getItem("eco_runner_best") || 0);
    statsRef.current.best = b;
    try {
      const v = localStorage.getItem("ecoquest_hero");
      if (v) {
        const parsed = JSON.parse(v);
        setHeroColors({
          primary: parsed.primary || "#22c55e",
          accent: parsed.accent || "#10b981",
          skin: parsed.skin || "#fef3c7",
        });
      }
    } catch {}
  }, []);

  // Controls: arrows/WASD and swipe
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running) return;
      if (e.key === "ArrowLeft" || e.key === "a") playerRef.current.lane = Math.max(-1, playerRef.current.lane - 1);
      if (e.key === "ArrowRight" || e.key === "d") playerRef.current.lane = Math.min(1, playerRef.current.lane + 1);
      if (e.key === "ArrowUp" || e.key === "w") { if (playerRef.current.y === 0) { playerRef.current.vy = 7.6; } }
      if (e.key === "ArrowDown" || e.key === "s") { playerRef.current.sliding = true; setTimeout(() => (playerRef.current.sliding = false), 600); }
      if (e.key === "r") restart();
    };
    window.addEventListener("keydown", onKey);
    let startX = 0, startY = 0;
    const onTouchStart = (e: TouchEvent) => { const t = e.touches[0]; startX = t.clientX; startY = t.clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0]; const dx = t.clientX - startX; const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -20) playerRef.current.lane = Math.max(-1, playerRef.current.lane - 1);
        if (dx > 20) playerRef.current.lane = Math.min(1, playerRef.current.lane + 1);
      } else {
        if (dy < -20) { if (playerRef.current.y === 0) playerRef.current.vy = 7.6; }
        if (dy > 20) { playerRef.current.sliding = true; setTimeout(() => (playerRef.current.sliding = false), 600); }
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true } as any);
    window.addEventListener("touchend", onTouchEnd, { passive: true } as any);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("touchstart", onTouchStart as any); window.removeEventListener("touchend", onTouchEnd as any); };
  }, [running]);

  function restart() {
    statsRef.current = { distance: 0, tokens: 0, best: statsRef.current.best, score: 0 } as any;
    playerRef.current = { lane: 0, y: 0, vy: 0, sliding: false, shield: false, magnet: false, boost: false };
    obstaclesRef.current = [];
    tokensRef.current = [];
    powersRef.current = [];
    envGreenerRef.current = 0;
    setHud({ shield: 0, boost: 0, magnet: 0 });
    setRunning(true);
  }

  const greener = envGreenerRef.current;

  return (
    <div className="neon-frame bg-card p-4">
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded bg-secondary/50">Score: {statsRef.current.score}</span>
          <span className="px-2 py-1 rounded bg-secondary/50">Tokens: {statsRef.current.tokens}</span>
          <span className="px-2 py-1 rounded bg-secondary/50">Best: {statsRef.current.best}</span>
          <span className="px-2 py-1 rounded bg-secondary/50">Distance: {Math.floor(statsRef.current.distance)}m</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={restart}>Restart</Button>
        </div>
      </div>
      <div className="w-full h-[420px] rounded-lg overflow-hidden bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.2),transparent_60%)]">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 4.5, 6.5], fov: 60 }} shadows>
            <color attach="background" args={[`hsl(${200 - greener * 60} 60% ${8 + greener * 10}%)`]} />
            <fog attach="fog" args={[`hsl(${200 - greener * 60} 60% ${8 + greener * 10}%)`, 5, 28]} />
            <ambientLight intensity={0.5 + greener * 0.3} />
            <directionalLight position={[4, 8, 4]} intensity={1.0} castShadow color="#22c55e" />

            <RunnerLoop
              running={running}
              setRunning={setRunning}
              statsRef={statsRef}
              playerRef={playerRef}
              obstaclesRef={obstaclesRef}
              tokensRef={tokensRef}
              powersRef={powersRef}
              speedRef={speedRef}
              envGreenerRef={envGreenerRef}
              setHud={setHud}
            />

            {/* Ground and lanes */}
            <Ground greener={greener} />
            {LANES.map((x, i) => (
              <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, 0]} receiveShadow>
                <planeGeometry args={[0.98, 200]} />
                <meshStandardMaterial color="#052e2a" />
              </mesh>
            ))}
            {/* Lane dividers */}
            {[-0.75, 0.75].map((x, i) => (
              <mesh key={i} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.05, 200]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#22d3ee" emissiveIntensity={0.2} />
              </mesh>
            ))}

            {/* Entities */}
            <PlantHeroMesh p={playerRef.current} colors={heroColors} />
            {obstaclesRef.current.map((e) => (
              <ObstacleMesh key={e.id} e={e} />
            ))}
            {tokensRef.current.map((e) => (
              <TokenMesh key={e.id} e={e} />
            ))}
            {powersRef.current.map((e) => (
              <mesh key={e.id} position={[e.x, 0.6, e.z]}>
                <torusGeometry args={[0.35, 0.12, 12, 24]} />
                <meshStandardMaterial color={e.kind === "shield" ? "#22d3ee" : e.kind === "boost" ? "#84cc16" : "#f59e0b"} emissive={e.kind === "shield" ? "#22d3ee" : e.kind === "boost" ? "#84cc16" : "#f59e0b"} emissiveIntensity={0.5} />
              </mesh>
            ))}
          </Canvas>
        </Suspense>
      </div>

      {!running && (
        <div className="mt-3 p-3 rounded-md border bg-background">
          <div className="font-semibold">Run over!</div>
          <div className="text-sm text-muted-foreground">Score: {statsRef.current.score} • Tokens: {statsRef.current.tokens} • Best: {statsRef.current.best}</div>
          <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => setRunning(true)}>Continue</Button><Button size="sm" variant="secondary" onClick={restart}>Restart</Button></div>
        </div>
      )}

      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
        <div className="neon-frame p-3 bg-card">
          <div className="font-semibold mb-1">Missions & Achievements</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>Clean 1km: <span className="font-medium text-foreground">{Math.floor(statsRef.current.distance / 1000)} / 1 km</span></li>
            <li>Collect 100 tokens: <span className="font-medium text-foreground">{statsRef.current.tokens} / 100</span></li>
            <li>Unlock 3 avatars: <span className="font-medium text-foreground">0 / 3</span></li>
          </ul>
        </div>
        <div className="neon-frame p-3 bg-card">
          <div className="font-semibold mb-1">Power‑ups</div>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded bg-secondary/50">Shield: {hud.shield.toFixed(1)}s</span>
            <span className="px-2 py-1 rounded bg-secondary/50">Boost: {hud.boost.toFixed(1)}s</span>
            <span className="px-2 py-1 rounded bg-secondary/50">Magnet: {hud.magnet.toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
