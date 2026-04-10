import { useState, useEffect, useCallback } from "react";

const HABITS = [
  { id: "stretch",    name: "Morning stretch",      detail: "Start the day loose" },
  { id: "meditation", name: "Meditation",            detail: "15 minutes" },
  { id: "journal",    name: "Gratitude journal",     detail: "Write 3 things" },
  { id: "acv",        name: "ACV morning drink",     detail: "Baja Gold, cayenne & lemon" },
  { id: "pushups",    name: "75 push-ups",           detail: "Non-negotiable" },
  { id: "supps",      name: "Supplements",           detail: "Full stack" },
  { id: "cold",       name: "Cold shower",           detail: "3 minutes" },
  { id: "ai",         name: "AI revenue focus",      detail: "60 minutes" },
  { id: "water",      name: "110 oz of water",       detail: "Stay hydrated all day" },
  { id: "fasting",    name: "Intermittent fasting",  detail: "Stick to the protocol" },
  { id: "steps",      name: "15,000 steps",          detail: "Walk it out" },
  { id: "workout",    name: "Workout",               detail: "Strength or cardio" },
  { id: "vibration",  name: "Vibration plate",       detail: "15 minutes" },
  { id: "sauna",      name: "SaunaBox",              detail: "20 minutes — evening" },
  { id: "quality",    name: "Quality time",          detail: "30 min with a loved one" },
];

const TOTAL = HABITS.length;

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function offsetKey(base, days) {
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDate(key) {
  const d = new Date(key + "T12:00:00");
  const today = todayKey();
  const yesterday = offsetKey(today, -1);
  if (key === today) return "Today — " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (key === yesterday) return "Yesterday — " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function loadStorage() {
  try { return JSON.parse(localStorage.getItem("habits_v2") || "{}"); } catch { return {}; }
}

function saveStorage(data) {
  localStorage.setItem("habits_v2", JSON.stringify(data));
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(todayKey());
  const [allData, setAllData] = useState(loadStorage);

  useEffect(() => { saveStorage(allData); }, [allData]);

  const getDay = useCallback((key) => allData[key] || {}, [allData]);

  const toggle = (id) => {
    setAllData(prev => {
      const day = { ...(prev[currentDate] || {}) };
      day[id] = !day[id];
      return { ...prev, [currentDate]: day };
    });
  };

  const resetDay = () => {
    setAllData(prev => ({ ...prev, [currentDate]: {} }));
  };

  const getHabitStreak = (id) => {
    let streak = 0;
    let key = todayKey();
    while (streak <= 365) {
      if ((allData[key] || {})[id]) { streak++; key = offsetKey(key, -1); } else break;
    }
    return streak;
  };

  const calcStreak = () => {
    let streak = 0;
    let key = todayKey();
    const todayDone = Object.values(getDay(key)).filter(Boolean).length;
    if (todayDone < TOTAL) key = offsetKey(key, -1);
    while (streak <= 365) {
      const done = Object.values(allData[key] || {}).filter(Boolean).length;
      if (done >= TOTAL) { streak++; key = offsetKey(key, -1); } else break;
    }
    return streak;
  };

  const day = getDay(currentDate);
  const doneCount = Object.values(day).filter(Boolean).length;
  const pct = Math.round((doneCount / TOTAL) * 100);
  const tomorrow = offsetKey(todayKey(), 1);

  const s = {
    wrap: { fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" },
    title: { fontSize: 20, fontWeight: 600, color: "#111" },
    dateNav: { display: "flex", alignItems: "center", gap: 8 },
    navBtn: { background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 14, color: "#666" },
    dateLabel: { fontSize: 13, fontWeight: 500, minWidth: 165, textAlign: "center", color: "#444" },
    statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: "1.25rem" },
    stat: { background: "#f7f7f5", borderRadius: 10, padding: "10px 12px", textAlign: "center" },
    statNum: { fontSize: 24, fontWeight: 600, color: "#111" },
    statLabel: { fontSize: 11, color: "#999", marginTop: 2 },
    progressWrap: { background: "#f0f0ee", borderRadius: 100, height: 5, marginBottom: "1.25rem", overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 100, background: "#16a37f", transition: "width 0.3s ease" },
    row: (done) => ({
      display: "flex", alignItems: "center", gap: 12, padding: "9px 10px",
      borderRadius: 9, cursor: "pointer",
      border: "1px solid " + (done ? "#86efcf" : "transparent"),
      background: done ? "#ecfdf5" : "transparent",
      marginBottom: 3, transition: "background 0.12s",
    }),
    check: (done) => ({
      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "1.5px solid " + (done ? "#16a37f" : "#ccc"),
      background: done ? "#16a37f" : "#fff",
    }),
    habitName: (done) => ({ fontSize: 14, color: done ? "#065f46" : "#222", fontWeight: 400 }),
    habitDetail: (done) => ({ fontSize: 12, color: done ? "#10b981" : "#999", marginTop: 1 }),
    badge: (done) => ({
      fontSize: 11, borderRadius: 100, padding: "2px 8px", flexShrink: 0,
      background: done ? "#a7f3d0" : "#f0f0ee",
      color: done ? "#065f46" : "#999",
    }),
    resetBtn: { fontSize: 12, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginTop: "0.75rem" },
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.title}>Daily habits</div>
        <div style={s.dateNav}>
          <button style={s.navBtn} onClick={() => setCurrentDate(d => offsetKey(d, -1))}>←</button>
          <span style={s.dateLabel}>{formatDate(currentDate)}</span>
          <button style={{ ...s.navBtn, opacity: currentDate >= tomorrow ? 0.3 : 1 }}
            disabled={currentDate >= tomorrow}
            onClick={() => setCurrentDate(d => offsetKey(d, 1))}>→</button>
        </div>
      </div>
      <div style={s.statsRow}>
        <div style={s.stat}><div style={s.statNum}>{doneCount}</div><div style={s.statLabel}>completed</div></div>
        <div style={s.stat}><div style={s.statNum}>{pct}%</div><div style={s.statLabel}>of today</div></div>
        <div style={s.stat}><div style={s.statNum}>{calcStreak()}</div><div style={s.statLabel}>day streak</div></div>
      </div>
      <div style={s.progressWrap}>
        <div style={{ ...s.progressFill, width: pct + "%" }} />
      </div>
      {HABITS.map(h => {
        const done = !!day[h.id];
        const streak = getHabitStreak(h.id);
        return (
          <div key={h.id} style={s.row(done)} onClick={() => toggle(h.id)}>
            <div style={s.check(done)}>
              {done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.habitName(done)}>{h.name}</div>
              <div style={s.habitDetail(done)}>{h.detail}</div>
            </div>
            <div style={s.badge(done)}>{streak}d</div>
          </div>
        );
      })}
      <button style={s.resetBtn} onClick={resetDay}>Reset today</button>
    </div>
  );
}
