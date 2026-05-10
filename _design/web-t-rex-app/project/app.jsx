// Main App
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const STORAGE_KEY = 'trex-water-app-v1';
const DAILY_GOAL = 8;
const INTERVAL_OPTIONS = [15, 30, 45, 60];

const MESSAGES = [
  "drink you water",
  "not drinking water — that's what killed us",
  "pie had his water, now it's you turn",
  "make me proud — drink water",
];

const REMINDER_AUTO_DISMISS_MS = 90 * 1000;

function todayStr() {
  return new Date().toDateString();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch { return null; }
}

const DEFAULT_STATE = {
  date: todayStr(),
  glasses: 0,
  totalGlasses: 0,
  interval: 30,
  hat: 'none',
  lastDrinkAt: null,
  goalHitToday: false,
};

function App() {
  const [state, setState] = useState(() => {
    const saved = loadState();
    if (!saved) return DEFAULT_STATE;
    if (saved.date !== todayStr()) {
      return { ...saved, date: todayStr(), glasses: 0, goalHitToday: false };
    }
    return { ...DEFAULT_STATE, ...saved };
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ----- reminder timer -----
  const [secondsLeft, setSecondsLeft] = useState(state.interval * 60);
  const [reminding, setReminding] = useState(false);
  const [message, setMessage] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHats, setShowHats] = useState(false);
  const [wiggle, setWiggle] = useState(false);

  // Idle eye look — random direction every few seconds
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

  // Reset countdown when interval changes or after reminding ends/drink
  const resetCountdown = useCallback(() => {
    setSecondsLeft(state.interval * 60);
  }, [state.interval]);

  useEffect(() => { resetCountdown(); }, [state.interval]);

  // Tick
  useEffect(() => {
    if (reminding) return; // pause timer while actively reminding
    const id = setInterval(() => {
      setSecondsLeft(t => {
        if (t <= 1) {
          triggerReminder();
          return state.interval * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [reminding, state.interval]);

  // Auto-dismiss reminder after a bit (he hovers, doesn't pester forever)
  useEffect(() => {
    if (!reminding) return;
    const id = setTimeout(() => {
      setReminding(false);
      setMessage('');
    }, REMINDER_AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [reminding]);

  function triggerReminder() {
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setReminding(true);
  }

  function drink() {
    setState(s => {
      if (s.glasses >= DAILY_GOAL) return s;
      const newGlasses = s.glasses + 1;
      const justHitGoal = newGlasses === DAILY_GOAL && !s.goalHitToday;
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

  function setGlasses(n) {
    setState(s => ({ ...s, glasses: Math.max(0, Math.min(DAILY_GOAL, n)) }));
  }

  function setInterval_(mins) {
    setState(s => ({ ...s, interval: mins }));
    setSecondsLeft(mins * 60);
  }

  function setHat(id) {
    setState(s => ({ ...s, hat: id }));
  }

  function resetToday() {
    setState(s => ({ ...s, glasses: 0, goalHitToday: false }));
    setReminding(false);
    setMessage('');
    resetCountdown();
  }

  function dismissReminder() {
    setReminding(false);
    setMessage('');
    resetCountdown();
  }

  function pokeTrex() {
    if (reminding) {
      // tapping during reminder = drink
      drink();
      return;
    }
    setWiggle(true);
    setTimeout(() => setWiggle(false), 900);
    // Sometimes show a passing thought
    if (Math.random() < 0.5) {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setReminding(true);
    }
  }

  // formatting
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const trexClass = reminding ? 'reminding' : (wiggle ? 'wiggle' : 'idle');

  return (
    <div className="window" role="application" aria-label="T-Rex water reminder">
      {/* Title bar */}
      <div className="titlebar">
        <span className="dot" aria-hidden="true"></span>
        <span className="title">T-REX H2O</span>
        <span className="countdown" title="Time until next reminder">{mm}:{ss}</span>
        <button className="gear" onClick={() => setShowSettings(true)} aria-label="Settings">≡</button>
      </div>

      {/* Scene */}
      <div className="scene">
        <div className="sun"><Sun scale={4} /></div>

        <div className="cloud cloud-1"><Cloud scale={4} /></div>
        <div className="cloud cloud-2"><Cloud scale={3} /></div>
        <div className="cloud cloud-3"><Cloud scale={3} /></div>

        <div className="hills">
          <div style={{ transform: 'translateY(20px) scale(1.6)', opacity: 0.7 }}><Hill scale={3} /></div>
          <div style={{ transform: 'translateY(8px) scale(2)', opacity: 0.85 }}><Hill scale={3} /></div>
        </div>

        <div className="house"><House scale={3} /></div>

        <div className="ground"></div>

        <div className="flower flower-1"><Flower scale={3} /></div>
        <div className="flower flower-2"><Flower scale={2} /></div>
        <div className="flower flower-3"><Flower scale={3} /></div>

        <div className={`trex-wrap ${trexClass}`} onClick={pokeTrex} role="button" aria-label="T-Rex">
          <div className="bubble" aria-live="polite">{message}</div>
          <div className="trex-shadow"></div>
          <TRex scale={5} hatId={state.hat} lookDir={look.x} lookV={look.y} />
          <div className="cup-held"><Cup scale={4} /></div>
        </div>

        {confetti && <Confetti />}
      </div>

      {/* Panel */}
      <div className="panel">
        <div className="row">
          <span className="stat-label">DAILY GOAL</span>
          <span className="stat-value">{state.glasses} / {DAILY_GOAL}</span>
        </div>
        <div className="glasses" aria-label="Glasses tracker">
          {Array.from({ length: DAILY_GOAL }).map((_, i) => {
            const full = i < state.glasses;
            return (
              <div
                key={i}
                className={`glass-slot ${full ? 'full' : ''}`}
                onClick={() => setGlasses(full ? i : i + 1)}
                title={full ? 'Click to un-mark' : 'Mark this glass'}
              >
                <GlassIcon full={full} scale={3} />
              </div>
            );
          })}
        </div>

        <button
          className={`drink-btn ${state.glasses >= DAILY_GOAL ? 'done' : ''}`}
          onClick={drink}
          disabled={state.glasses >= DAILY_GOAL}
        >
          {state.glasses >= DAILY_GOAL ? '★ GOAL HIT — GOOD BOY ★' : 'I DRANK A GLASS'}
        </button>

        <div className="controls">
          <button className="ctrl-btn primary" onClick={triggerReminder} title="Trigger reminder right now">
            TEST
          </button>
          <button className="ctrl-btn" onClick={() => setShowHats(true)}>
            HATS
          </button>
          <span className="next-reminder">
            next nag in <strong>{mm}:{ss}</strong>
          </span>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          state={state}
          onClose={() => setShowSettings(false)}
          onSetInterval={setInterval_}
          onReset={resetToday}
        />
      )}

      {showHats && (
        <HatModal
          state={state}
          onClose={() => setShowHats(false)}
          onPick={setHat}
        />
      )}
    </div>
  );
}

// =============== SETTINGS MODAL ===============
function SettingsModal({ state, onClose, onSetInterval, onReset }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span>SETTINGS</span>
          <button className="x" onClick={onClose} aria-label="Close">X</button>
        </div>
        <div className="modal-body">
          <div className="section-label">REMIND ME EVERY</div>
          <div className="interval-row">
            {INTERVAL_OPTIONS.map(m => (
              <button
                key={m}
                className={`interval-btn ${state.interval === m ? 'active' : ''}`}
                onClick={() => onSetInterval(m)}
              >
                {m}m
              </button>
            ))}
          </div>

          <div className="section-label">TODAY</div>
          <div style={{ fontFamily: 'VT323, monospace', fontSize: 18, lineHeight: 1.3, color: 'var(--ink)' }}>
            Glasses drunk: <strong>{state.glasses}</strong> / {DAILY_GOAL}<br/>
            Lifetime glasses: <strong>{state.totalGlasses || 0}</strong><br/>
            {state.lastDrinkAt
              ? <>Last drink: {new Date(state.lastDrinkAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</>
              : <>No drinks logged yet today</>}
          </div>

          <div className="section-label">DANGER ZONE</div>
          <button className="reset-btn" onClick={() => {
            if (confirm('Reset today\'s glasses to 0?')) onReset();
          }}>
            RESET TODAY
          </button>

          <div style={{ marginTop: 18, fontFamily: 'VT323, monospace', fontSize: 16, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.2 }}>
            tip: tap the t-rex to poke him<br/>
            click any glass to mark it
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== HAT MODAL ===============
function HatModal({ state, onClose, onPick }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span>T-REX WARDROBE</span>
          <button className="x" onClick={onClose} aria-label="Close">X</button>
        </div>
        <div className="modal-body">
          <div className="section-label">UNLOCK HATS BY DRINKING WATER</div>
          <div className="hat-grid">
            {HATS.map(hat => {
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
          <div style={{ marginTop: 14, fontFamily: 'VT323, monospace', fontSize: 16, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.2 }}>
            you've drunk <strong>{state.totalGlasses || 0}</strong> glasses ever ✦
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== CONFETTI ===============
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
      {pieces.map(p => (
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

// =============== ROOT ===============
function Root() {
  return (
    <>
      <App />
      <div className="footer">
        made with <span className="heart">♥</span> · stay hydrated
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
