import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TRex,
  Cup,
  GlassIcon,
  Sun,
  Cloud,
  House,
  Hill,
  Flower,
  HATS,
} from './pixels.jsx';

const STORAGE_KEY = 'trex-water-app-v1';
const INTERVAL_OPTIONS = [15, 30, 45, 60];
const GOAL_OPTIONS = [8, 10, 12, 16];

const MESSAGES = [
  "Pie had water, now it's your turn",
  'drink your water',
  "not drinking water - maybe that's what killed us?",
  'hydrate yourself silly',
  'make me proud, drink some water',
  "drink, don't skip",
  "you're doing great, now drink up",
  'Lera says hi and "drink water"',
  "Pie is happy when you're hydrated",
  'one more glass of water, comoooooon',
  'water is good for you',
];

const REMINDER_AUTO_DISMISS_MS = 90 * 1000;

function todayStr() {
  return new Date().toDateString();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const DEFAULT_STATE = {
  date: todayStr(),
  glasses: 0,
  totalGlasses: 0,
  interval: 30,
  dailyGoal: 8,
  hat: 'none',
  lastDrinkAt: null,
  goalHitToday: false,
};

export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadState();
    if (!saved) return DEFAULT_STATE;
    if (saved.date !== todayStr()) {
      return { ...saved, date: todayStr(), glasses: 0, goalHitToday: false };
    }
    return { ...DEFAULT_STATE, ...saved };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const [secondsLeft, setSecondsLeft] = useState(state.interval * 60);
  const [reminding, setReminding] = useState(false);
  const [message, setMessage] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHats, setShowHats] = useState(false);
  const [wiggle, setWiggle] = useState(false);

  const [look, setLook] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let timeoutId;
    const tick = () => {
      const dirs = [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
      ];
      setLook(dirs[Math.floor(Math.random() * dirs.length)]);
      timeoutId = setTimeout(tick, 1800 + Math.random() * 2200);
    };
    tick();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !import.meta.env.DEV) return;
    window.__forceRemind = () => {
      setMessage(MESSAGES[0]);
      setReminding(true);
    };
    return () => {
      delete window.__forceRemind;
    };
  }, []);

  const resetCountdown = useCallback(() => {
    setSecondsLeft(state.interval * 60);
  }, [state.interval]);

  useEffect(() => {
    resetCountdown();
  }, [state.interval, resetCountdown]);

  function triggerReminder() {
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setReminding(true);
  }

  useEffect(() => {
    if (reminding) return;
    const id = setInterval(() => {
      setSecondsLeft((t) => {
        if (t <= 1) {
          triggerReminder();
          return state.interval * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [reminding, state.interval]);

  useEffect(() => {
    if (!reminding) return;
    const id = setTimeout(() => {
      setReminding(false);
      setMessage('');
    }, REMINDER_AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [reminding]);

  function drink() {
    setState((s) => {
      if (s.glasses >= s.dailyGoal) return s;
      const newGlasses = s.glasses + 1;
      const justHitGoal = newGlasses === s.dailyGoal && !s.goalHitToday;
      if (justHitGoal) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 5000);
      }
      return {
        ...s,
        glasses: newGlasses,
        totalGlasses: (s.totalGlasses || 0) + 1,
        lastDrinkAt: Date.now(),
        goalHitToday: justHitGoal ? true : s.goalHitToday,
      };
    });
    if (reminding) {
      setReminding(false);
      setMessage('');
    }
    resetCountdown();
  }

  function setDailyGoal(g) {
    setState((s) => {
      const newGlasses = Math.min(s.glasses, g);
      return {
        ...s,
        dailyGoal: g,
        glasses: newGlasses,
        goalHitToday: newGlasses >= g,
      };
    });
  }

  function setIntervalMins(mins) {
    setState((s) => ({ ...s, interval: mins }));
    setSecondsLeft(mins * 60);
  }

  function setHat(id) {
    setState((s) => ({ ...s, hat: id }));
  }

  function resetToday() {
    setState((s) => ({ ...s, glasses: 0, goalHitToday: false }));
    setReminding(false);
    setMessage('');
    resetCountdown();
  }

  function pokeTrex() {
    if (reminding) {
      drink();
      return;
    }
    setWiggle(true);
    setTimeout(() => setWiggle(false), 900);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const trexClass = reminding ? 'reminding' : wiggle ? 'wiggle' : 'idle';

  return (
    <div className="window" role="application" aria-label="T-Rex water reminder">
      <div className="titlebar">
        <span className="dot" aria-hidden="true"></span>
        <span className="title">T-REX H2O</span>
        <span className="countdown" title="Time until next reminder">
          {mm}:{ss}
        </span>
        <button className="gear" onClick={() => setShowSettings(true)} aria-label="Settings">
          ≡
        </button>
      </div>

      <div className="scene">
        <div className="sun">
          <Sun scale={4} />
        </div>

        <div className="cloud cloud-1">
          <Cloud scale={4} />
        </div>
        <div className="cloud cloud-2">
          <Cloud scale={3} />
        </div>
        <div className="cloud cloud-3">
          <Cloud scale={3} />
        </div>

        <div className="hills">
          <div style={{ transform: 'translateY(20px) scale(1.6)', opacity: 0.7 }}>
            <Hill scale={3} />
          </div>
          <div style={{ transform: 'translateY(8px) scale(2)', opacity: 0.85 }}>
            <Hill scale={3} />
          </div>
        </div>

        <div className="house">
          <House scale={3} />
        </div>

        <div className="ground"></div>

        <div className="flower flower-1">
          <Flower scale={3} />
        </div>
        <div className="flower flower-2">
          <Flower scale={2} />
        </div>
        <div className="flower flower-3">
          <Flower scale={3} />
        </div>

        <div className={`trex-wrap ${trexClass}`} onClick={pokeTrex} role="button" aria-label="T-Rex">
          <div className="bubble" aria-live="polite">
            {message}
          </div>
          <div className="trex-shadow"></div>
          <TRex scale={5} hatId={state.hat} lookDir={look.x} lookV={look.y} />
          <div className="cup-held">
            <Cup scale={4} />
          </div>
        </div>

        {confetti && <Confetti />}
      </div>

      <div className="panel">
        <div className="row">
          <span className="stat-label">DAILY GOAL</span>
          <span className="stat-value">
            {state.glasses} / {state.dailyGoal}
          </span>
        </div>
        <div className="glasses" aria-label="Glasses tracker">
          {Array.from({ length: state.dailyGoal }).map((_, i) => {
            const full = i < state.glasses;
            return (
              <div key={i} className={`glass-slot ${full ? 'full' : ''}`}>
                <GlassIcon full={full} scale={3} />
              </div>
            );
          })}
        </div>

        <button
          className={`drink-btn ${state.glasses >= state.dailyGoal ? 'done' : ''}`}
          onClick={drink}
          disabled={state.glasses >= state.dailyGoal}
        >
          {state.glasses >= state.dailyGoal ? '★ GOAL HIT — GOOD BOY ★' : 'I DRANK WATER'}
        </button>

        <div className="controls">
          <button className="ctrl-btn" onClick={() => setShowHats(true)}>
            HATS
          </button>
          <span className="next-reminder">
            next nag in{' '}
            <strong>
              {mm}:{ss}
            </strong>
          </span>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          state={state}
          onClose={() => setShowSettings(false)}
          onSetInterval={setIntervalMins}
          onSetGoal={setDailyGoal}
          onReset={resetToday}
        />
      )}

      {showHats && <HatModal state={state} onClose={() => setShowHats(false)} onPick={setHat} />}
    </div>
  );
}

function SettingsModal({ state, onClose, onSetInterval, onSetGoal, onReset }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span>SETTINGS</span>
          <button className="x" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>
        <div className="modal-body">
          <div className="section-label">REMIND ME EVERY</div>
          <div className="interval-row">
            {INTERVAL_OPTIONS.map((m) => (
              <button
                key={m}
                className={`interval-btn ${state.interval === m ? 'active' : ''}`}
                onClick={() => onSetInterval(m)}
              >
                {m}m
              </button>
            ))}
          </div>

          <div className="section-label">DAILY GOAL</div>
          <div className="interval-row">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                className={`interval-btn ${state.dailyGoal === g ? 'active' : ''}`}
                onClick={() => onSetGoal(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="section-label">TODAY</div>
          <div
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: 18,
              lineHeight: 1.3,
              color: 'var(--ink)',
            }}
          >
            Glasses drunk: <strong>{state.glasses}</strong> / {state.dailyGoal}
            <br />
            Lifetime glasses: <strong>{state.totalGlasses || 0}</strong>
            <br />
            {state.lastDrinkAt ? (
              <>
                Last drink:{' '}
                {new Date(state.lastDrinkAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            ) : (
              <>No drinks logged yet today</>
            )}
          </div>

          <div className="section-label">DANGER ZONE</div>
          <button
            className="reset-btn"
            onClick={() => {
              if (confirm("Reset today's glasses to 0?")) onReset();
            }}
          >
            RESET TODAY
          </button>

          <div
            style={{
              marginTop: 18,
              fontFamily: 'VT323, monospace',
              fontSize: 16,
              color: 'var(--ink-soft)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            tip: tap the t-rex to poke him
            <br />
            click any glass to mark it
          </div>
        </div>
      </div>
    </div>
  );
}

function HatModal({ state, onClose, onPick }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span>T-REX WARDROBE</span>
          <button className="x" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>
        <div className="modal-body">
          <div className="section-label">UNLOCK HATS BY DRINKING WATER</div>
          <div className="hat-grid">
            {HATS.map((hat) => {
              const unlocked = (state.totalGlasses || 0) >= hat.unlock;
              const active = state.hat === hat.id;
              return (
                <div
                  key={hat.id}
                  className={`hat-card ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                  onClick={() => unlocked && onPick(hat.id)}
                  title={unlocked ? hat.name : `Drink ${hat.unlock} glasses to unlock`}
                >
                  <div className="preview-trex">
                    <TRex scale={3} hatId={hat.id} lookDir={0} lookV={0} />
                  </div>
                  <div className="name">{hat.name}</div>
                  {!unlocked && (
                    <div className="lock-overlay">
                      <div>LOCKED</div>
                      <div>{hat.unlock} TOTAL</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: 'VT323, monospace',
              fontSize: 16,
              color: 'var(--ink-soft)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            you've drunk <strong>{state.totalGlasses || 0}</strong> glasses ever ✦
          </div>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(() => {
    const colors = ['#ff8aa8', '#ffd34a', '#74c46d', '#6cc4e8', '#a78bfa', '#ff9e7c'];
    return Array.from({ length: 60 }).map((_, i) => ({
      key: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.4 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 6,
      rot: Math.random() * 360,
      shape: Math.random() < 0.5 ? '0' : '50%',
    }));
  }, []);
  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className="confetti-piece"
          style={{
            left: p.left + '%',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animationDelay: p.delay + 's',
            animationDuration: p.duration + 's',
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
