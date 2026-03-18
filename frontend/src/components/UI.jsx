import { useState, useEffect, useCallback } from 'react';
import { setToastHandler, showToast } from './toast';

// eslint-disable-next-line react-refresh/only-export-components
export { showToast };

// ---- TOAST ----
export function Toast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    setToastHandler((msg, type = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 2600);
    });
    return () => setToastHandler(null);
  }, []);
  if (!toast) return null;
  const bg = toast.type === 'success' ? '#0ea371' : toast.type === 'error' ? '#ef4444' : '#f59e0b';
  return <div className="toast" style={{ background: bg }}>{toast.msg}</div>;
}

// ---- MODAL ----
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ width }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---- BADGE ----
export function Badge({ variant = 'gray', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ---- AI BANNER ----
export function AiBanner({ text, action }) {
  return (
    <div className="ai-banner">
      <span className="ai-badge">AI</span>
      <span className="ai-text" dangerouslySetInnerHTML={{ __html: text }} />
      {action && action}
    </div>
  );
}

// ---- AUTONOMOUS DECISION GRID ----
export function AiDecisionGrid({ title = 'Autonomous AI Decisions', decisions = [] }) {
  const [autopilotMode, setAutopilotMode] = useState('human_approve');
  const [appliedMap, setAppliedMap] = useState({});
  const [history, setHistory] = useState([]);

  const recordHistory = (text, tone = 'blue') => {
    setHistory((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        tone,
        at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ].slice(0, 8));
  };

  const applyDecision = useCallback((decision, source = 'manual') => {
    if (autopilotMode === 'suggest_only' && source !== 'auto') {
      showToast('Autopilot is in Suggest only mode', 'warning');
      recordHistory(`Suggestion reviewed: ${decision.label}`, 'amber');
      return;
    }

    setAppliedMap((prev) => ({ ...prev, [decision.id || decision.label]: true }));
    showToast(`${decision.label} applied`, 'success');
    recordHistory(`Applied ${decision.label}${source === 'auto' ? ' automatically' : ''}`, 'green');
  }, [autopilotMode]);

  const rollbackDecision = useCallback((decision) => {
    setAppliedMap((prev) => ({ ...prev, [decision.id || decision.label]: false }));
    showToast(`${decision.label} rolled back`, 'warning');
    recordHistory(`Rolled back ${decision.label}`, 'amber');
  }, []);

  useEffect(() => {
    if (autopilotMode !== 'auto_apply') return;
    const nextDecision = decisions.find((decision) => !appliedMap[decision.id || decision.label]);
    if (!nextDecision) return;

    const timer = setTimeout(() => applyDecision(nextDecision, 'auto'), 450);
    return () => clearTimeout(timer);
  }, [autopilotMode, decisions, appliedMap, applyDecision]);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="ai-decision-topbar">
        <div className="card-title" style={{ marginBottom: 0 }}>{title}</div>
        <div className="ai-autopilot-wrap">
          <span className="ai-autopilot-label">Autopilot</span>
          <select className="ai-autopilot-select" value={autopilotMode} onChange={(event) => setAutopilotMode(event.target.value)}>
            <option value="suggest_only">Suggest only</option>
            <option value="human_approve">Human approve</option>
            <option value="auto_apply">Auto apply</option>
          </select>
        </div>
      </div>

      <div className="ai-decision-grid">
        {decisions.map((decision) => (
          <div key={decision.id || decision.label} className="ai-decision-card">
            <div className="ai-decision-head">
              <span className="ai-decision-label">{decision.label}</span>
              <span className={`ai-pill ${appliedMap[decision.id || decision.label] ? 'green' : (decision.tone || 'blue')}`}>
                {appliedMap[decision.id || decision.label] ? 'Applied' : decision.status}
              </span>
            </div>
            <div className="ai-decision-value">{decision.value}</div>
            {decision.detail && <div className="ai-decision-detail">{decision.detail}</div>}

            <div className="ai-decision-provenance">
              <span>Confidence: {decision.confidence || 'n/a'}</span>
              <span>Updated: {decision.updatedAt || 'now'}</span>
            </div>

            {Array.isArray(decision.evidence) && decision.evidence.length > 0 && (
              <div className="ai-evidence-row">
                {decision.evidence.slice(0, 3).map((signal) => (
                  <span key={signal} className="ai-evidence-pill">{signal}</span>
                ))}
              </div>
            )}

            <div className="ai-decision-actions">
              <button className="btn btn-sm btn-primary" onClick={() => applyDecision(decision)}>
                {decision.actionLabel || 'Apply'}
              </button>
              <button
                className="btn btn-sm"
                onClick={() => rollbackDecision(decision)}
                disabled={!appliedMap[decision.id || decision.label]}
              >
                {decision.rollbackLabel || 'Rollback'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="ai-timeline">
        <div className="ai-timeline-title">Decision history</div>
        {history.length === 0 ? (
          <div className="ai-timeline-empty">No autonomous actions yet.</div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="ai-timeline-item">
              <span className={`ai-dot ${entry.tone}`}></span>
              <span className="ai-timeline-text">{entry.text}</span>
              <span className="ai-timeline-time">{entry.at}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---- METRIC ----
export function Metric({ label, value, sub, neg }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-val">{value}</div>
      {sub && <div className={`metric-sub${neg ? ' neg' : ''}`}>{sub}</div>}
    </div>
  );
}

// ---- CHART BAR ----
export function ChartBar({ label, pct, display, val }) {
  return (
    <div className="chart-row">
      <div className="chart-label">{label}</div>
      <div className="chart-track">
        <div className="chart-fill" style={{ width: `${pct}%` }}>{display}</div>
      </div>
      {val && <div className="chart-val">{val}</div>}
    </div>
  );
}

// ---- STEPS ----
export function Steps({ steps, current }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <>
          <div className="step-item" key={s}>
            <div className={`step-circle${i < current ? ' done' : i === current ? ' active' : ''}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`step-label${i < current ? ' done' : i === current ? ' active' : ''}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line${i < current ? ' done' : ''}`} key={`line-${i}`} />}
        </>
      ))}
    </div>
  );
}

// ---- SEAT MAP ----
const LAYOUT = [
  'vip','vip','aisle','vip','vip',
  'business','business','aisle','business','business',
  'business','business','aisle','business','business',
  'available','available','aisle','booked','available',
  'available','booked','aisle','available','available',
  'available','available','aisle','available','booked',
  'available','available','aisle','available','available',
  'available','available','aisle','available','available',
  'booked','available','aisle','available','available',
  'available','available','aisle','available','available',
];
const COLS = ['A','B','','C','D'];

export function SeatMap({ onSelect, interactive = true }) {
  const [selected, setSelected] = useState(null);
  const handleClick = (i, type) => {
    if (!interactive || type === 'booked' || type === 'aisle') return;
    const row = Math.floor(i / 5) + 1;
    const col = COLS[i % 5];
    const label = row + col;
    if (selected === i) { setSelected(null); onSelect?.(null); return; }
    setSelected(i);
    onSelect?.(label, type);
  };
  return (
    <div className="seat-map-wrap">
      <div className="bus-front">🚌 Driver · Front of bus</div>
      <div className="seat-grid">
        {LAYOUT.map((type, i) => {
          const row = Math.floor(i / 5) + 1;
          const col = COLS[i % 5];
          const cls = selected === i ? 'selected' : type;
          return (
            <div key={i} className={`seat ${cls}`} onClick={() => handleClick(i, type)}>
              {type !== 'aisle' ? row + col : ''}
            </div>
          );
        })}
      </div>
      <div className="seat-legend">
        {[['var(--purple-light)','#c4b5fd','VIP'],['var(--blue-light)','#93c5fd','Business'],['var(--green-light)','#6ee7b7','Available'],['var(--red-light)','#fca5a5','Booked'],['var(--green)','var(--green-dark)','Selected']].map(([bg,bc,lbl]) => (
          <div className="legend-item" key={lbl}><div className="legend-dot" style={{background:bg,borderColor:bc}}/>{lbl}</div>
        ))}
      </div>
    </div>
  );
}

// ---- PIE CHART ----
export function PieChart({ segments }) {
  return (
    <div className="pie-wrap">
      <svg width="110" height="110" viewBox="0 0 36 36">
        <circle r="15.9" cx="18" cy="18" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
        {segments.map((s,i) => (
          <circle key={i} r="15.9" cx="18" cy="18" fill="none" stroke={s.color} strokeWidth="4"
            strokeDasharray={`${s.pct} ${100-s.pct}`} strokeDashoffset={s.offset}/>
        ))}
      </svg>
      <div className="pie-legend">
        {segments.map(s => (
          <div className="pie-legend-item" key={s.label}>
            <div className="pie-dot" style={{background:s.color}}/>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
