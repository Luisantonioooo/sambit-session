import { useState, useEffect, useCallback } from "react";

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
const SESSION_KEY = `sambit_session_${new Date().toISOString().split("T")[0]}`;
const ANTONIO_PHONE = "3472213354";

const WARMUP = [
  { id: "arm_small", label: "Arm circles — 10 small, both directions", cue: "Loose arms. Let the shoulder joint move freely. No forcing range." },
  { id: "arm_large", label: "Arm circles — 10 large, both directions", cue: "Bigger arc. If anything pinches — stop and go smaller." },
  { id: "neck", label: "Neck circles — slow, both directions", cue: "Chin to chest first, then slow full circle each way. Trap relaxation — not a stretch, a release." },
  { id: "serratus", label: "Serratus wall slide — 10 reps (ball)", cue: "Pin the ball between both palms and the wall at chest height. Elbows soft. Push the ball UP the wall — think wrapping shoulder blades around your rib cage, not shrugging up. Feel it under your armpit / side of your ribcage, not in the shoulder joint." },
  { id: "pec", label: "Doorframe pec stretch — 2 min each side", cue: "Forearm on the frame, elbow at 90°. Gentle lean. Structural remodeling — not a push. Breathe into it." },
  { id: "jog_warmup", label: "Easy jog — 5 min @ 50–60% (treadmill)", cue: "Cardiovascular prep for the run at the end. Conversational pace. Just get the heart rate up gently." },
];

// CORRECT ORDER: core first, then pulling
const EXERCISES = [
  { id: "dead_bug", name: "Dead Bug", sets: 3, targetReps: 10, unit: "reps", isBodyweight: true, isPlank: false, note: "Flat on your back. Lower back PRESSED into the floor — non-negotiable. Arms up, knees at 90°. Lower opposite arm and leg, exhale, return. Never let the lower back lift.", commonMistake: "Lower back arching off the floor. Reduce range until it stays down.", target: "Anti-extension core. Rib flare control. Stable trunk = less load on the shoulder." },
  { id: "plank", name: "Forearm Plank", sets: 2, targetReps: 45, unit: "sec", isBodyweight: false, isPlank: true, note: "Forearms down, elbows under shoulders. CORE exercise — not shoulder. Squeeze glutes, brace abs, push the floor away slightly. If you feel this in your shoulders — drop immediately.", commonMistake: "Hips too high or too low, holding breath. All mean the core has stopped working.", target: "Feel it in abs and glutes only. Shoulder sensation = red flag, drop now." },
  { id: "hk_row", name: "Half-Kneeling Row", sets: 3, targetReps: 12, lastWeight: 70, unit: "lbs", isBodyweight: false, isPlank: false, note: "Down knee on pad. Tall spine — don't rotate the torso to pull. Drive the elbow back, not up. Squeeze at end range for 1 second.", commonMistake: "Torso rotation to compensate for load. If you're twisting — slow down.", target: "Scapular retraction + mid-back strength. Shoulder stays pain-free." },
  { id: "archer_row", name: "Archer Row", sets: 3, targetReps: 15, lastWeight: 20, unit: "lbs", isBodyweight: false, isPlank: false, note: "Staggered stance. One arm reaches long while the other pulls. The reach is as important as the pull. Slow and controlled.", commonMistake: "Losing the reach on the extended arm. Both arms work the whole time.", target: "Scapular control and serratus engagement. Control exercise, not strength." },
  { id: "pulldown", name: "Cable Straight-Arm Pulldown", sets: 3, targetReps: 10, lastWeight: 50, unit: "lbs", isBodyweight: false, isPlank: false, note: "Stand tall, slight hip hinge. Arms straight — elbows locked throughout. Sweep the rope down to your hips. Core braced before you move. If you feel it in the shoulder joint — stop.", commonMistake: "Bending the elbows mid-rep. Locked elbows = shoulder protected.", target: "Lat strength through a shoulder-safe pulling pattern." },
];

const STOP_RULES = [
  "Any joint pain in the right shoulder — joint pain, not muscle burn",
  "Pain above 3/10 anywhere",
  "Pinching, deep ache, or new sensation in the shoulder",
  "Feeling the forearm plank in your shoulder — drop immediately",
  "Dizziness or anything wrong during the run",
];

const RUN_NOTE = "Set a pace that feels hard but controlled — like you could hold it 30 more seconds after you finish. Start conservative first 100m, then commit.";
const RUN_MISTAKE = "Going out too fast. First 100m should feel almost easy — effort builds into the second half.";
const RUN_TARGET = "First baseline time. Effort matters more than pace today. We have something to beat next session.";
const WIN = "Leave feeling better than when you walked in. No night pain tonight.";

const C = {
  bg: "#06080F", surface: "#0C1018", card: "#0F1420", cardActive: "#111828",
  border: "#1A2235", borderActive: "#2A4A7A", accent: "#3D7FD4", accentLight: "#5A9FEF",
  text: "#D8E4F8", textMuted: "#4A5A7A", textDim: "#2A3550",
  green: "#3DAA6A", greenBg: "#0A1A12", greenBorder: "#1A3A2A",
  red: "#D45A5A", redBg: "#1A0A0A", redBorder: "#3A1A1A",
  gold: "#C4A460", goldBg: "#1A1408", goldBorder: "#3A2A10",
};

const st = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" },
  header: { position: "sticky", top: 0, zIndex: 20, background: "rgba(6,8,15,0.96)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}`, padding: "14px 20px" },
  body: { maxWidth: 500, margin: "0 auto", padding: "16px 20px 120px", display: "flex", flexDirection: "column", gap: 10 },
  adj: { background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 8, width: 42, height: 42, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  primaryBtn: { background: C.accent, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 16px", cursor: "pointer", width: "100%" },
  ghostBtn: { background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 11, padding: "5px 10px", cursor: "pointer" },
  numInput: { background: "transparent", border: "none", color: C.text, fontSize: 30, fontFamily: "Georgia, serif", width: 72, textAlign: "center", outline: "none" },
};

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

function NumStepper({ value, onChange, unit, step = 1, label }) {
  const adjust = (d) => onChange(Math.max(0, +(parseFloat(value || 0) + d).toFixed(1)));
  return (
    <div>
      {label && <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.textMuted, fontWeight: 600, marginBottom: 8 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button style={st.adj} onClick={() => adjust(-step * 2)}>−{step * 2}</button>
        <button style={st.adj} onClick={() => adjust(-step)}>−{step}</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} style={st.numInput} />
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase", marginTop: -4 }}>{unit}</div>
        </div>
        <button style={st.adj} onClick={() => adjust(step)}>+{step}</button>
        <button style={st.adj} onClick={() => adjust(step * 2)}>+{step * 2}</button>
      </div>
    </div>
  );
}

function CueBox({ note, commonMistake, target }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ background: C.surface, borderRadius: 8, padding: "10px 14px", borderLeft: `2px solid ${C.accent}`, color: C.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>{note}</div>
      <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: C.textDim, fontSize: 12, cursor: "pointer", padding: 0 }}>{open ? "▲ Hide" : "▼ Mistake + target"}</button>
      {open && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: "9px 12px", color: "#C47070", fontSize: 12, lineHeight: 1.5 }}>⚠️ {commonMistake}</div>
          <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 8, padding: "9px 12px", color: "#4A8A6A", fontSize: 12, lineHeight: 1.5 }}>🎯 {target}</div>
        </div>
      )}
    </div>
  );
}

function getSetSummary(ex, data) {
  if (ex.isPlank) return `${data.duration}s`;
  if (ex.isBodyweight) return `${data.reps} reps`;
  return `${data.weight}${ex.unit} × ${data.reps}`;
}

function SetRow({ ex, setIdx, completed, isActive, onComplete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(completed?.weight ?? ex.lastWeight ?? 0);
  const [reps, setReps] = useState(completed?.reps ?? ex.targetReps ?? 10);
  const [duration, setDuration] = useState(completed?.duration ?? ex.targetReps ?? 45);
  const [notes, setNotes] = useState(completed?.notes ?? "");

  // Reset local state when completed changes
  useEffect(() => {
    if (completed) {
      setWeight(completed.weight ?? ex.lastWeight ?? 0);
      setReps(completed.reps ?? ex.targetReps ?? 10);
      setDuration(completed.duration ?? ex.targetReps ?? 45);
      setNotes(completed.notes ?? "");
    }
  }, [completed]);

  const buildData = () => ex.isPlank ? { duration, notes, ts: Date.now() } : ex.isBodyweight ? { reps, notes, ts: Date.now() } : { weight, reps, notes, ts: Date.now() };
  const vsLast = !ex.isBodyweight && !ex.isPlank && ex.lastWeight > 0 && completed ? (completed.weight - ex.lastWeight) : null;

  // COMPLETED — show summary with edit button (always visible)
  if (completed && !editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: C.greenBg, borderRadius: 10, border: `1px solid ${C.greenBorder}` }}>
        <span style={{ color: C.green }}>✓</span>
        <span style={{ color: "#4A8A6A", fontSize: 13, flex: 1 }}>
          Set {setIdx + 1} — {getSetSummary(ex, completed)}{completed.notes ? ` · ${completed.notes}` : ""}
        </span>
        {vsLast !== null && <span style={{ fontSize: 11, color: vsLast > 0 ? C.green : vsLast < 0 ? C.red : C.textMuted }}>{vsLast > 0 ? `↑+${vsLast}` : `↓${vsLast}`}</span>}
        <button onClick={() => setEditing(true)} style={st.ghostBtn}>edit</button>
      </div>
    );
  }

  // EDITING
  if (completed && editing) {
    return (
      <div style={{ background: C.bg, borderRadius: 12, border: `1px solid ${C.borderActive}`, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 11, color: C.accentLight, letterSpacing: 1.5, textTransform: "uppercase" }}>Editing Set {setIdx + 1}</div>
        {ex.isPlank ? <NumStepper value={duration} onChange={setDuration} unit="sec" step={5} label="Duration" /> :
          ex.isBodyweight ? <NumStepper value={reps} onChange={setReps} unit="reps" step={1} label="Reps" /> : (
            <><NumStepper value={weight} onChange={setWeight} unit={ex.unit} step={2.5} label="Weight" /><div style={{ height: 10 }} /><NumStepper value={reps} onChange={setReps} unit="reps" step={1} label="Reps" /></>
          )}
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 13, padding: "10px 14px", outline: "none", fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { onEdit(setIdx, buildData()); setEditing(false); }} style={st.primaryBtn}>Save</button>
          <button onClick={() => setEditing(false)} style={{ ...st.ghostBtn, padding: "10px 16px" }}>Cancel</button>
        </div>
      </div>
    );
  }

  // PENDING
  if (!isActive) {
    return <div style={{ padding: "9px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, color: C.textDim, fontSize: 13 }}>Set {setIdx + 1}{ex.targetReps ? ` — ${ex.targetReps}${ex.isPlank ? "s" : " reps"} target` : ""}</div>;
  }

  // ACTIVE
  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.accent}`, padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.accentLight, fontWeight: 600 }}>Set {setIdx + 1} of {ex.sets}</div>
      {ex.isPlank ? <NumStepper value={duration} onChange={setDuration} unit="sec" step={5} label="Duration" /> :
        ex.isBodyweight ? <NumStepper value={reps} onChange={setReps} unit="reps" step={1} label="Reps" /> : (
          <><NumStepper value={weight} onChange={setWeight} unit={ex.unit} step={2.5} label="Weight" /><div style={{ height: 10 }} /><NumStepper value={reps} onChange={setReps} unit="reps" step={1} label="Reps" /></>
        )}
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes — pain, difficulty, anything worth flagging..." style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 13, padding: "10px 14px", outline: "none", fontFamily: "inherit" }} />
      <button onClick={() => onComplete(setIdx, buildData())} style={st.primaryBtn}>Log Set ✓</button>
    </div>
  );
}

function ExerciseCard({ ex, isActive, isDone, onDone, onOpen, onUndone, sessionSets, onSetsUpdate }) {
  const completed = sessionSets || {};
  const [activeSi, setActiveSi] = useState(() => {
    const next = Array.from({ length: ex.sets }).findIndex((_, i) => !completed[i]);
    return next === -1 ? 0 : next;
  });

  const handleComplete = (si, data) => {
    const updated = { ...completed, [si]: data };
    onSetsUpdate(ex.id, updated);
    if (si + 1 < ex.sets) setActiveSi(si + 1);
    else onDone(ex.id, updated);
  };

  const handleEdit = (si, data) => {
    onSetsUpdate(ex.id, { ...completed, [si]: data });
  };

  return (
    <div style={{ background: isDone ? C.greenBg : isActive ? C.cardActive : C.card, borderRadius: 16, border: `1px solid ${isDone ? C.greenBorder : isActive ? C.borderActive : C.border}`, padding: 18, transition: "all 0.2s" }}>
      <div
        onClick={!isActive && !isDone ? onOpen : undefined}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isActive || isDone ? 14 : 0, cursor: !isActive && !isDone ? "pointer" : "default" }}
      >
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div style={{ fontSize: 15, color: isDone ? C.green : isActive ? C.text : C.textMuted, marginBottom: 3, lineHeight: 1.3 }}>{isDone ? "✓ " : ""}{ex.name}</div>
          <div style={{ fontSize: 11, color: C.textDim }}>{ex.sets} sets · {ex.isPlank ? `${ex.targetReps}s` : ex.isBodyweight ? `${ex.targetReps} reps` : `${ex.targetReps} reps · Last: ${ex.lastWeight}${ex.unit}`}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isDone && <button onClick={(e) => { e.stopPropagation(); onUndone(ex.id); }} style={st.ghostBtn}>redo</button>}
          {!isActive && !isDone && <span style={{ color: C.textDim, fontSize: 18 }}>›</span>}
          {isDone && <span style={{ color: C.green }}>✓</span>}
        </div>
      </div>

      {(isActive || isDone) && (
        <>
          {isActive && <CueBox note={ex.note} commonMistake={ex.commonMistake} target={ex.target} />}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: ex.sets }).map((_, i) => (
              <SetRow
                key={i} ex={ex} setIdx={i}
                completed={completed[i] || null}
                isActive={isActive && i === activeSi && !completed[i]}
                onComplete={handleComplete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RunCard({ isDone, isActive, onOpen, onDone, onUndo, savedData }) {
  const [mins, setMins] = useState(5);
  const [secs, setSecs] = useState(0);
  const [notes, setNotes] = useState("");

  if (isDone) return (
    <div style={{ background: C.goldBg, borderRadius: 16, border: `1px solid ${C.goldBorder}`, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 15, color: C.gold, marginBottom: 3 }}>✓ ½ Mile Run</div>
          <div style={{ fontSize: 11, color: C.textDim }}>Time: {String(savedData?.mins || 0).padStart(2, "0")}:{String(savedData?.secs || 0).padStart(2, "0")} · Baseline locked ✓</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onUndo} style={st.ghostBtn}>redo</button>
          <span>🏁</span>
        </div>
      </div>
    </div>
  );

  if (!isActive) return (
    <div onClick={onOpen} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 18, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 15, color: C.textMuted, marginBottom: 3 }}>½ Mile Run</div>
          <div style={{ fontSize: 11, color: C.textDim }}>0.5 miles · 85% effort · Log your time</div>
        </div>
        <span style={{ color: C.textDim, fontSize: 18 }}>›</span>
      </div>
    </div>
  );

  return (
    <div style={{ background: C.goldBg, borderRadius: 16, border: `1px solid ${C.gold}`, padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
      <div><div style={{ fontSize: 16, color: C.gold, marginBottom: 4 }}>🏁 ½ Mile Run — 85% effort</div><div style={{ fontSize: 11, color: C.textDim }}>Treadmill · Log your finish time</div></div>
      <div style={{ background: C.surface, borderRadius: 8, padding: "10px 14px", borderLeft: `2px solid ${C.gold}`, color: C.textMuted, fontSize: 13, lineHeight: 1.6 }}>{RUN_NOTE}</div>
      <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: "9px 12px", color: "#C47070", fontSize: 12 }}>⚠️ {RUN_MISTAKE}</div>
      <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 8, padding: "9px 12px", color: "#4A8A6A", fontSize: 12 }}>🎯 {RUN_TARGET}</div>
      <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.textMuted, fontWeight: 600 }}>Finish Time</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
        <NumStepper value={mins} onChange={setMins} unit="min" step={1} />
        <div style={{ color: C.textMuted, fontSize: 24, fontFamily: "Georgia, serif", textAlign: "center" }}>:</div>
        <NumStepper value={secs} onChange={setSecs} unit="sec" step={1} />
      </div>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel? Anything to flag..." style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 13, padding: "10px 14px", outline: "none", fontFamily: "inherit" }} />
      <button onClick={() => onDone({ mins, secs, notes, ts: Date.now() })} style={{ ...st.primaryBtn, background: C.gold, color: "#0A0800" }}>Log Run ✓</button>
    </div>
  );
}

function WarmupCard({ done, onToggle }) {
  const [expanded, setExpanded] = useState(true);
  const doneCount = WARMUP.filter(w => done[w.id]).length;
  const allDone = doneCount === WARMUP.length;
  return (
    <div style={{ background: allDone ? C.greenBg : C.card, borderRadius: 16, border: `1px solid ${allDone ? C.greenBorder : C.border}`, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div><div style={{ fontSize: 15, color: allDone ? C.green : C.text, marginBottom: 3 }}>{allDone ? "✓ " : ""}Warm Up</div><div style={{ fontSize: 11, color: C.textDim }}>{doneCount}/{WARMUP.length} complete</div></div>
        <span style={{ color: C.textDim, fontSize: 14, alignSelf: "center" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {WARMUP.map((w) => (
            <div key={w.id} onClick={() => onToggle(w.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", background: done[w.id] ? C.greenBg : C.surface, borderRadius: 10, border: `1px solid ${done[w.id] ? C.greenBorder : C.border}`, cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${done[w.id] ? C.green : C.textDim}`, background: done[w.id] ? C.green : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {done[w.id] && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: done[w.id] ? "#4A8A6A" : C.text, lineHeight: 1.4 }}>{w.label}</div><div style={{ fontSize: 11, color: C.textDim, marginTop: 4, lineHeight: 1.5 }}>{w.cue}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildMsg(completedEx, runData, elapsed) {
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  let m = `💪 Session Complete — Sambit\n📅 ${TODAY}\n⏱ ${fmt(elapsed)}\n\nSTRENGTH\n`;
  EXERCISES.forEach(ex => {
    const sets = completedEx[ex.id] || {};
    if (!Object.keys(sets).length) return;
    m += `\n${ex.name}\n`;
    Object.entries(sets).forEach(([si, s]) => {
      m += `  Set ${parseInt(si) + 1}: ${getSetSummary(ex, s)}${s.notes ? ` — ${s.notes}` : ""}\n`;
    });
  });
  if (runData) m += `\nRUN\n½ Mile — ${String(runData.mins).padStart(2, "0")}:${String(runData.secs).padStart(2, "0")}${runData.notes ? ` — ${runData.notes}` : ""}\n`;
  m += `\n—\nHow do you feel? Any night pain? 🙏`;
  return m;
}

function RestartBlock({ onRestart }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 14, padding: 16, marginTop: 8 }}>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10, lineHeight: 1.5 }}>Need to start over? This clears all logged data.</div>
      {!confirm
        ? <button onClick={() => setConfirm(true)} style={{ background: "none", border: `1px solid ${C.redBorder}`, borderRadius: 8, color: C.red, fontSize: 13, padding: "10px 16px", cursor: "pointer", width: "100%" }}>🔄 Restart Session</button>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, color: C.red, textAlign: "center" }}>Are you sure? All data will be lost.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onRestart} style={{ background: C.red, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px", cursor: "pointer", flex: 1 }}>Yes, restart</button>
              <button onClick={() => setConfirm(false)} style={{ ...st.ghostBtn, flex: 1, padding: "10px" }}>Cancel</button>
            </div>
          </div>
        )}
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────────

function StartScreen({ onStart }) {
  return (
    <div style={{ ...st.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 20 }}>💙</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 28, marginBottom: 8 }}>Good morning, Sambit</div>
      <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 4 }}>{TODAY}</div>
      <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 28 }}>Back + Core + Run · 60 min</div>
      <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 14, padding: "14px 20px", marginBottom: 20, maxWidth: 360, width: "100%" }}>
        <div style={{ color: C.green, fontSize: 14, lineHeight: 1.6 }}>🏆 {WIN}</div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, maxWidth: 360, width: "100%", textAlign: "left" }}>
        <div style={{ color: C.textMuted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Today's session</div>
        {["🔥 Warm Up — 6 items", "💪 Dead Bug — 3×10", "💪 Forearm Plank — 2×45s", "💪 Half-Kneeling Row — 3×12 @ 70lbs", "💪 Archer Row — 3×15 @ 20lbs", "💪 Cable Straight-Arm Pulldown — 3×10 @ 50lbs"].map((item, i) => (
          <div key={i} style={{ fontSize: 13, color: C.textMuted, marginBottom: 6 }}>{item}</div>
        ))}
        <div style={{ fontSize: 13, color: C.gold, marginTop: 4 }}>🏁 ½ Mile Run — 85% effort</div>
      </div>
      <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 12, padding: "12px 16px", marginBottom: 28, maxWidth: 360, width: "100%", color: "#C47070", fontSize: 13, lineHeight: 1.5, textAlign: "left" }}>
        🛑 Stop at any shoulder joint pain. When in doubt — stop and text Antonio.
      </div>
      <button onClick={onStart} style={{ ...st.primaryBtn, maxWidth: 360, fontSize: 16, padding: "16px", borderRadius: 14 }}>Start Session →</button>
    </div>
  );
}

function FinishScreen({ elapsed, completedEx, runData, onSend, onBack }) {
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const totalSets = Object.values(completedEx).reduce((a, s) => a + Object.keys(s).length, 0);
  const [sent, setSent] = useState(false);
  return (
    <div style={{ ...st.app, padding: 24 }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0 }}>← Back to session</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔥</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 28, marginBottom: 6 }}>Session Complete</div>
          <div style={{ color: C.textMuted, fontSize: 14 }}>{fmt(elapsed)} · {totalSets} sets logged</div>
        </div>
        <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 12, padding: "13px 18px", marginBottom: 12, color: C.green, fontSize: 14 }}>🏆 {WIN}</div>
        {runData && <div style={{ background: C.goldBg, border: `1px solid ${C.goldBorder}`, borderRadius: 12, padding: "13px 18px", marginBottom: 12, color: C.gold, fontSize: 14 }}>🏁 ½ Mile — {String(runData.mins).padStart(2, "0")}:{String(runData.secs).padStart(2, "0")} · First baseline locked 🎯</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {EXERCISES.map((ex) => {
            const sets = completedEx[ex.id] || {};
            return <div key={ex.id} style={{ background: C.card, borderRadius: 10, padding: "11px 16px", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textMuted, fontSize: 13 }}>{ex.name}</span><span style={{ color: Object.keys(sets).length === ex.sets ? C.green : C.textDim, fontSize: 12 }}>{Object.keys(sets).length}/{ex.sets}</span></div>;
          })}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 15, color: C.text, marginBottom: 6 }}>📲 Send session to Antonio</div>
          <div style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>Tap below to open iMessage with your full session pre-written. Just hit send.</div>
          <button onClick={() => { onSend(); setSent(true); }} style={{ background: sent ? C.greenBg : "#1A7FFF", border: `1px solid ${sent ? C.greenBorder : "#1A7FFF"}`, borderRadius: 12, color: sent ? C.green : "#fff", fontSize: 15, fontWeight: 600, padding: "14px", cursor: "pointer", width: "100%" }}>
            {sent ? "✓ Message opened — hit send in iMessage" : "📩 Send to Antonio via iMessage"}
          </button>
        </div>
        <div style={{ color: C.textDim, fontSize: 12, textAlign: "center" }}>Session saved on this device.</div>
      </div>
    </div>
  );
}

function CoachScreen({ completedEx, runData, elapsed, onBack, onSend }) {
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const [sent, setSent] = useState(false);

  return (
    <div style={{ ...st.app, padding: 24 }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0 }}>← Back</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, marginBottom: 4 }}>Coach View — Sambit</div>
        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>{TODAY} · {fmt(elapsed)} elapsed</div>

        {!Object.keys(completedEx).length && !runData
          ? <div style={{ color: C.textDim, marginBottom: 20 }}>No sets logged yet.</div>
          : (
            <>
              {EXERCISES.map((ex) => {
                const sets = completedEx[ex.id] || {};
                if (!Object.keys(sets).length) return null;
                return (
                  <div key={ex.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
                    <div style={{ fontSize: 14, color: C.text, marginBottom: 10 }}>{ex.name}</div>
                    {Object.entries(sets).map(([si, set]) => (
                      <div key={si} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${C.border}`, fontSize: 13 }}>
                        <span style={{ color: C.textMuted }}>Set {parseInt(si) + 1}</span>
                        <span style={{ color: C.text }}>{getSetSummary(ex, set)}</span>
                        {set.notes ? <span style={{ color: C.textDim, fontSize: 11, maxWidth: 120, textAlign: "right" }}>{set.notes}</span> : null}
                      </div>
                    ))}
                  </div>
                );
              })}
              {runData && (
                <div style={{ background: C.goldBg, borderRadius: 14, border: `1px solid ${C.goldBorder}`, padding: 16, marginBottom: 10 }}>
                  <div style={{ fontSize: 14, color: C.gold, marginBottom: 8 }}>🏁 ½ Mile Run</div>
                  <div style={{ color: C.textMuted, fontSize: 13 }}>Time: {String(runData.mins).padStart(2, "0")}:{String(runData.secs).padStart(2, "0")}</div>
                  {runData.notes && <div style={{ color: C.textDim, fontSize: 12, marginTop: 4 }}>{runData.notes}</div>}
                </div>
              )}
            </>
          )}

        {/* SEND TO ANTONIO — always visible in coach view */}
        <div style={{ marginTop: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 14, color: C.text, marginBottom: 6 }}>📲 Send session to Antonio</div>
          <div style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>Opens iMessage with everything logged so far. Just hit send.</div>
          <button
            onClick={() => { onSend(); setSent(true); }}
            style={{ background: sent ? C.greenBg : "#1A7FFF", border: `1px solid ${sent ? C.greenBorder : "#1A7FFF"}`, borderRadius: 12, color: sent ? C.green : "#fff", fontSize: 14, fontWeight: 600, padding: "13px", cursor: "pointer", width: "100%" }}
          >
            {sent ? "✓ Message opened — hit send in iMessage" : "📩 Send to Antonio via iMessage"}
          </button>
        </div>

      </div>
    </div>
  );
}

function StopScreen({ onBack }) {
  return (
    <div style={{ ...st.app, padding: 24 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0 }}>← Back</button>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 26, color: C.red, marginBottom: 6 }}>🛑 Stop Rules</div>
      <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>Shoulder preservation protocol. Non-negotiable.</div>
      {STOP_RULES.map((r, i) => <div key={i} style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 12, padding: "13px 16px", marginBottom: 8, color: "#C47070", fontSize: 14, lineHeight: 1.6 }}>{r}</div>)}
      <div style={{ marginTop: 16, background: C.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
        <div style={{ color: C.accent, fontSize: 14, marginBottom: 6 }}>🏆 Win condition</div>
        <div style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.5 }}>{WIN}</div>
        <div style={{ color: C.textMuted, fontSize: 13, marginTop: 10 }}>📞 Text Antonio any time.</div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("start");
  const [warmupDone, setWarmupDone] = useState({});
  const [activeEx, setActiveEx] = useState(0);
  const [completedEx, setCompletedEx] = useState({});
  const [sessionSets, setSessionSets] = useState({});
  const [runDone, setRunDone] = useState(false);
  const [runData, setRunData] = useState(null);
  const [runActive, setRunActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.warmup) setWarmupDone(d.warmup);
        if (d.sets) setSessionSets(d.sets);
        if (d.completed) setCompletedEx(d.completed);
        if (d.activeEx !== undefined) setActiveEx(d.activeEx);
        if (d.run) { setRunData(d.run); setRunDone(true); }
        if (d.startTime) setStartTime(d.startTime);
        if (d.screen && !["rules", "coach"].includes(d.screen)) setScreen(d.screen);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const save = useCallback((updates) => {
    try {
      const existing = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...existing, ...updates, savedAt: Date.now() }));
    } catch {}
  }, []);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now); setScreen("session");
    save({ startTime: now, screen: "session" });
  };

  const handleRestart = () => {
    clearSession();
    setScreen("start"); setWarmupDone({}); setActiveEx(0);
    setCompletedEx({}); setSessionSets({}); setRunDone(false);
    setRunData(null); setRunActive(false); setStartTime(null); setElapsed(0);
  };

  const toggleWarmup = (id) => { const u = { ...warmupDone, [id]: !warmupDone[id] }; setWarmupDone(u); save({ warmup: u }); };

  const handleSetsUpdate = (exId, sets) => {
    const u = { ...sessionSets, [exId]: sets }; setSessionSets(u); save({ sets: u });
  };

  const handleExDone = (exId, sets) => {
    const uc = { ...completedEx, [exId]: sets };
    const us = { ...sessionSets, [exId]: sets };
    setCompletedEx(uc); setSessionSets(us);
    const next = EXERCISES.findIndex(e => !uc[e.id]);
    const na = next !== -1 ? next : activeEx;
    setActiveEx(na);
    save({ sets: us, completed: uc, activeEx: na });
  };

  const handleExUndone = (exId) => {
    const uc = { ...completedEx }; delete uc[exId]; setCompletedEx(uc);
    const idx = EXERCISES.findIndex(e => e.id === exId); setActiveEx(idx);
    save({ completed: uc, activeEx: idx });
  };

  const handleRunDone = (data) => { setRunData(data); setRunDone(true); setRunActive(false); save({ run: data }); };
  const handleRunUndo = () => { setRunData(null); setRunDone(false); setRunActive(true); save({ run: null }); };
  const handleFinish = () => { setScreen("finish"); save({ screen: "finish" }); };
  const handleSend = () => { window.open(`sms:${ANTONIO_PHONE}&body=${encodeURIComponent(buildMsg(completedEx, runData, elapsed))}`, "_blank"); };

  // Progress = exercises only (run is bonus, not counted in %)
  const exProgress = Object.keys(completedEx).length / EXERCISES.length;
  const allExDone = EXERCISES.every(e => completedEx[e.id]);
  const allDone = allExDone && runDone;

  if (screen === "start") return <StartScreen onStart={handleStart} />;
  if (screen === "finish") return <FinishScreen elapsed={elapsed} completedEx={completedEx} runData={runData} onSend={handleSend} onBack={() => setScreen("session")} />;
  if (screen === "rules") return <StopScreen onBack={() => setScreen("session")} />;
  if (screen === "coach") return <CoachScreen completedEx={completedEx} runData={runData} elapsed={elapsed} onBack={() => setScreen("session")} onSend={handleSend} />;

  return (
    <div style={st.app}>
      <div style={st.header}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>Sambit's Session</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{TODAY} · {fmt(elapsed)}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={() => setScreen("coach")} style={st.ghostBtn}>👁 Coach</button>

              <button onClick={() => setScreen("rules")} style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, color: C.red, fontSize: 12, padding: "6px 10px", cursor: "pointer" }}>🛑</button>
            </div>
          </div>
          {/* Progress bar = exercises only */}
          <div style={{ background: C.border, borderRadius: 3, height: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`, width: `${exProgress * 100}%`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: C.textDim }}>{Object.keys(completedEx).length}/{EXERCISES.length} exercises{runDone ? " · run ✓" : ""}</span>
            <span style={{ fontSize: 10, color: C.textDim }}>{Math.round(exProgress * 100)}%</span>
          </div>
        </div>
      </div>

      <div style={st.body}>
        <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 12, padding: "11px 16px", color: C.green, fontSize: 13 }}>🏆 {WIN}</div>
        <WarmupCard done={warmupDone} onToggle={toggleWarmup} />
        {EXERCISES.map((ex, i) => (
          <ExerciseCard
            key={ex.id} ex={ex}
            isActive={activeEx === i && !completedEx[ex.id]}
            isDone={!!completedEx[ex.id]}
            onDone={handleExDone}
            onOpen={() => setActiveEx(i)}
            onUndone={handleExUndone}
            sessionSets={sessionSets[ex.id]}
            onSetsUpdate={handleSetsUpdate}
          />
        ))}
        <RunCard isDone={runDone} isActive={runActive} onOpen={() => setRunActive(true)} onDone={handleRunDone} onUndo={handleRunUndo} savedData={runData} />
        {/* Always-visible restart at bottom */}
        <RestartBlock onRestart={handleRestart} />

        {/* Finish button appears when everything is done */}
        {allDone && (
          <button onClick={handleFinish} style={{ ...st.primaryBtn, background: C.green, fontSize: 16, padding: "16px", borderRadius: 14 }}>
            🏁 Finish Session & Send to Antonio
          </button>
        )}
      </div>
    </div>
  );
}
