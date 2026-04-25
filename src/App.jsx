import React, { useState, useCallback } from 'react';
import emailjs from '@emailjs/browser';

// ─── EmailJS Config (replace with your credentials) ───────────────
const EMAILJS_SERVICE_ID  = 'service_xntm5qq';
const EMAILJS_TEMPLATE_ID = 'template_b3fwife';
const EMAILJS_PUBLIC_KEY  = 'wT8m-90ZGx11yCGbH';

// ─── Property email routing ────────────────────────────────────────
const PROPERTY_EMAILS = {
  'Embrey':        'dtownes@queencityelite.com',
  'Optimist Hall': 'dtownes@queencityelite.com',
};

const NAVY   = '#0D2B55';
const GOLD   = '#B8963E';
const LGOLD  = '#FBF5EA';
const LNAVY  = '#EBF0F8';
const WHITE  = '#FFFFFF';
const GRAY   = '#F4F5F7';
const BORDER = '#D1D9E6';
const TEXT   = '#1A2535';
const MUTED  = '#6B7A99';

// ─── Global styles ─────────────────────────────────────────────────
const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Barlow', sans-serif;
    background: #0A1929;
    min-height: 100vh;
    color: ${TEXT};
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }
  .fade-in { animation: fadeSlideIn 0.35s ease both; }
  input, textarea, select {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${LNAVY}; }
  ::-webkit-scrollbar-thumb { background: ${NAVY}; border-radius: 3px; }
`;

// ─── Shared component styles ───────────────────────────────────────
const card = {
  background: WHITE,
  borderRadius: 10,
  border: `1px solid ${BORDER}`,
  overflow: 'hidden',
  marginBottom: 20,
  boxShadow: '0 2px 8px rgba(13,43,85,0.08)',
};

const sectionHead = {
  background: NAVY,
  color: GOLD,
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: '0.1em',
  padding: '10px 18px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  borderBottom: `3px solid ${GOLD}`,
};

const fieldWrap = { padding: '4px 0' };
const label = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: NAVY,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 4,
};
const input = {
  width: '100%',
  border: `1.5px solid ${BORDER}`,
  borderRadius: 6,
  padding: '9px 12px',
  fontSize: 14,
  color: TEXT,
  background: WHITE,
  outline: 'none',
  transition: 'border-color 0.2s',
};
const textarea = { ...input, resize: 'vertical', lineHeight: 1.55 };
const select = { ...input, cursor: 'pointer' };

// ─── App ───────────────────────────────────────────────────────────
export default function App() {
  const today = new Date().toISOString().split('T')[0];

  // ── Form state ──────────────────────────────────────────────────
  const [form, setForm] = useState({
    property:       '',
    date:           today,
    shiftType:      '',
    shiftStart:     '',
    shiftEnd:       '',
    officerName:    '',
    employeeId:     '',
    postZone:       '',
    supervisor:     '',
    reliefOfficer:  '',
    clientRep:      '',
    weather:        '',
    summary:        '',
    endStatus:      '',
    endNotes:       '',
    recipientEmail: '',
  });

  // ── Patrol log rows ─────────────────────────────────────────────
  const [logRows, setLogRows] = useState([
    { id: 1, time: '', location: '', activity: '' },
    { id: 2, time: '', location: '', activity: '' },
    { id: 3, time: '', location: '', activity: '' },
  ]);

  // ── Observation checkboxes ──────────────────────────────────────
  const [observations, setObservations] = useState({
    noUnsecuredEntries:   false,
    unsecuredDoorsFound:  false,
    perimeterGateOpen:    false,
    unauthorizedVehicle:  false,
    unauthorizedPerson:   false,
    forcedEntryVandalism: false,
    keyCardIssue:         false,
    lightingAllGood:      false,
    lightingIssue:        false,
    hazardousCondition:   false,
    constructionDebris:   false,
    slipHazard:           false,
    parkingLotClear:      false,
    commonAreasClear:     false,
    noIncidents:          false,
    disturbanceObserved:  false,
    suspiciousActivity:   false,
    medicalConcern:       false,
    policeEmsCalled:      false,
    propertyDamage:       false,
    noiseComplaint:       false,
    observeReportRefer:   false,
    checkInsCompleted:    false,
    postOrdersReviewed:   false,
    escalatedToSupervisor:false,
    qceManagementNotified:false,
    clientNotified:       false,
    called911:            false,
  });

  // ── Actions taken checkboxes ────────────────────────────────────
  const [actions, setActions] = useState({
    securedDoors:         false,
    documentedEntries:    false,
    maintainedPatrol:     false,
    contactedPropertyMgr: false,
    contactedQCESupervisor:false,
    called911Action:      false,
    escortedIndividual:   false,
    completedIncidentRpt: false,
  });
  const [actionsNotes, setActionsNotes] = useState('');

  // ── Recommendations ─────────────────────────────────────────────
  const [recs, setRecs] = useState({
    contractorsSecureDoors:  false,
    provideKeyCard:          false,
    reviewPostOrders:        false,
    increasePatrolFrequency: false,
    maintenanceLighting:     false,
    lockUpVerification:      false,
  });
  const [recsNotes, setRecsNotes] = useState('');

  // ── Photo log rows ───────────────────────────────────────────────
  const [photoRows, setPhotoRows] = useState([
    { id: 1, time: '', location: '', description: '', fileName: '' },
    { id: 2, time: '', location: '', description: '', fileName: '' },
    { id: 3, time: '', location: '', description: '', fileName: '' },
  ]);

  // ── Send state ───────────────────────────────────────────────────
  const [sending, setSending]   = useState(false);
  const [sendMsg, setSendMsg]   = useState(null);
  const [errors, setErrors]     = useState({});

  // ── Handlers ────────────────────────────────────────────────────
  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const updateLog = (id, field, val) =>
    setLogRows(r => r.map(row => row.id === id ? { ...row, [field]: val } : row));
  const addLogRow = () =>
    setLogRows(r => [...r, { id: Date.now(), time: '', location: '', activity: '' }]);
  const removeLogRow = (id) =>
    setLogRows(r => r.length > 1 ? r.filter(row => row.id !== id) : r);

  const updatePhoto = (id, field, val) =>
    setPhotoRows(r => r.map(row => row.id === id ? { ...row, [field]: val } : row));
  const addPhotoRow = () =>
    setPhotoRows(r => [...r, { id: Date.now(), time: '', location: '', description: '', fileName: '' }]);
  const removePhotoRow = (id) =>
    setPhotoRows(r => r.length > 1 ? r.filter(row => row.id !== id) : r);

  const toggleObs  = (k) => setObservations(p => ({ ...p, [k]: !p[k] }));
  const toggleAct  = (k) => setActions(p => ({ ...p, [k]: !p[k] }));
  const toggleRec  = (k) => setRecs(p => ({ ...p, [k]: !p[k] }));

  const validate = () => {
    const e = {};
    if (!form.property)    e.property    = true;
    if (!form.date)        e.date        = true;
    if (!form.officerName) e.officerName = true;
    if (!form.shiftStart)  e.shiftStart  = true;
    if (!form.shiftEnd)    e.shiftEnd    = true;
    if (!form.endStatus)   e.endStatus   = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildEmailBody = () => {
    const checkedObs  = Object.entries(observations).filter(([,v]) => v).map(([k]) => OBS_LABELS[k]).join('\n  ');
    const checkedActs = Object.entries(actions).filter(([,v]) => v).map(([k]) => ACT_LABELS[k]).join('\n  ');
    const checkedRecs = Object.entries(recs).filter(([,v]) => v).map(([k]) => REC_LABELS[k]).join('\n  ');
    const logStr = logRows
      .filter(r => r.time || r.activity)
      .map(r => `  ${r.time || '--:--'} | ${r.location || '—'} | ${r.activity}`)
      .join('\n');
    const photoStr = photoRows
      .filter(r => r.time || r.description)
      .map((r, i) => `  #${i+1}: ${r.time} | ${r.location} | ${r.description} | ${r.fileName}`)
      .join('\n');

    return `
QUEEN CITY ELITE — SECURITY SHIFT REPORT
==========================================

PROPERTY:       ${form.property}
DATE:           ${form.date}
SHIFT:          ${form.shiftType || '—'}  |  ${form.shiftStart} – ${form.shiftEnd}
OFFICER:        ${form.officerName} (${form.employeeId || 'No ID'})
POST / ZONE:    ${form.postZone || '—'}
SUPERVISOR:     ${form.supervisor || '—'}
RELIEF:         ${form.reliefOfficer || 'N/A'}
CLIENT REP:     ${form.clientRep || 'None'}
WEATHER:        ${form.weather || '—'}

────────────────────────────────────────
SHIFT SUMMARY
────────────────────────────────────────
${form.summary || '(No summary provided)'}

────────────────────────────────────────
PATROL ACTIVITY LOG
────────────────────────────────────────
${logStr || '(No entries logged)'}

────────────────────────────────────────
OBSERVATIONS
────────────────────────────────────────
${checkedObs ? '  ☑ ' + checkedObs.split('\n  ').join('\n  ☑ ') : '(None selected)'}

────────────────────────────────────────
ACTIONS TAKEN
────────────────────────────────────────
${checkedActs ? '  ☑ ' + checkedActs.split('\n  ').join('\n  ☑ ') : '(None selected)'}
${actionsNotes ? '\nNotes: ' + actionsNotes : ''}

────────────────────────────────────────
RECOMMENDATIONS
────────────────────────────────────────
${checkedRecs ? '  ☑ ' + checkedRecs.split('\n  ').join('\n  ☑ ') : '(None selected)'}
${recsNotes ? '\nNotes: ' + recsNotes : ''}

────────────────────────────────────────
PHOTO DOCUMENTATION
────────────────────────────────────────
${photoStr || '(No photos logged)'}

────────────────────────────────────────
END-OF-SHIFT STATUS
────────────────────────────────────────
STATUS: ${form.endStatus || '—'}
${form.endNotes ? 'Notes: ' + form.endNotes : ''}

==========================================
Submitted via QCE Security Shift Report System
    `.trim();
  };

  const handleSend = async () => {
    if (!validate()) return;

    const recipients = form.recipientEmail ||
      PROPERTY_EMAILS[form.property] ||
      'hleake@queencityelite.com';

    setSending(true);
    setSendMsg(null);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:    recipients,
          subject:     `QCE Security Shift Report — ${form.property} — ${form.date}`,
          officer:     form.officerName,
          property:    form.property,
          date:        form.date,
          shift_start: form.shiftStart,
          shift_end:   form.shiftEnd,
          end_status:  form.endStatus,
          report_body: buildEmailBody(),
        },
        EMAILJS_PUBLIC_KEY
      );
      setSendMsg({ ok: true, text: `Report sent successfully to ${recipients}` });
    } catch (err) {
      setSendMsg({ ok: false, text: 'Send failed. Check your connection or EmailJS credentials.' });
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setForm({ property:'', date:today, shiftType:'', shiftStart:'', shiftEnd:'', officerName:'', employeeId:'', postZone:'', supervisor:'', reliefOfficer:'', clientRep:'', weather:'', summary:'', endStatus:'', endNotes:'', recipientEmail:'' });
    setLogRows([{ id:1, time:'', location:'', activity:'' },{ id:2, time:'', location:'', activity:'' },{ id:3, time:'', location:'', activity:'' }]);
    setObservations(Object.fromEntries(Object.keys(observations).map(k => [k, false])));
    setActions(Object.fromEntries(Object.keys(actions).map(k => [k, false])));
    setActionsNotes('');
    setRecs(Object.fromEntries(Object.keys(recs).map(k => [k, false])));
    setRecsNotes('');
    setPhotoRows([{ id:1, time:'', location:'', description:'', fileName:'' },{ id:2, time:'', location:'', description:'', fileName:'' },{ id:3, time:'', location:'', description:'', fileName:'' }]);
    setSendMsg(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      <style>{globalStyles}</style>

      {/* ── Background ─────────────────────────────────── */}
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0A1929 0%, #0D2B55 60%, #0A1929 100%)' }}>

        {/* ── Top banner ─────────────────────────────────── */}
        <div style={{ background: NAVY, borderBottom: `3px solid ${GOLD}`, padding: '0 0 0 0' }}>
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: GOLD, letterSpacing: '0.05em' }}>QUEEN CITY ELITE LLC</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', marginTop: 1 }}>UNARMED SECURITY · SHIFT REPORT</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: '0.08em' }}>CONFIDENTIAL</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Internal Use Only</div>
            </div>
          </div>
        </div>

        {/* ── Form wrapper ────────────────────────────────── */}
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px 40px' }}>

          {/* ══ S1: OFFICER & ASSIGNMENT ══════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}>
              <span style={{ fontSize: 16 }}>🛡</span> SECTION 1 — OFFICER &amp; ASSIGNMENT INFORMATION
            </div>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>

                <div style={fieldWrap}>
                  <label style={{ ...label, color: errors.property ? '#c0392b' : NAVY }}>Property *</label>
                  <select style={{ ...select, borderColor: errors.property ? '#c0392b' : BORDER }} value={form.property} onChange={set('property')}>
                    <option value="">— Select Property —</option>
                    <option>Embrey</option>
                    <option>Optimist Hall</option>
                  </select>
                </div>

                <div style={fieldWrap}>
                  <label style={{ ...label, color: errors.date ? '#c0392b' : NAVY }}>Date *</label>
                  <input style={{ ...input, borderColor: errors.date ? '#c0392b' : BORDER }} type="date" value={form.date} onChange={set('date')} />
                </div>

                <div style={fieldWrap}>
                  <label style={{ ...label, color: errors.officerName ? '#c0392b' : NAVY }}>Officer Name *</label>
                  <input style={{ ...input, borderColor: errors.officerName ? '#c0392b' : BORDER }} type="text" placeholder="Full Name" value={form.officerName} onChange={set('officerName')} />
                </div>

                <div style={fieldWrap}>
                  <label style={label}>Employee ID</label>
                  <input style={input} type="text" placeholder="EMP-XXXX" value={form.employeeId} onChange={set('employeeId')} />
                </div>

                <div style={fieldWrap}>
                  <label style={{ ...label, color: errors.shiftStart ? '#c0392b' : NAVY }}>Shift Start *</label>
                  <input style={{ ...input, borderColor: errors.shiftStart ? '#c0392b' : BORDER }} type="time" value={form.shiftStart} onChange={set('shiftStart')} />
                </div>

                <div style={fieldWrap}>
                  <label style={{ ...label, color: errors.shiftEnd ? '#c0392b' : NAVY }}>Shift End *</label>
                  <input style={{ ...input, borderColor: errors.shiftEnd ? '#c0392b' : BORDER }} type="time" value={form.shiftEnd} onChange={set('shiftEnd')} />
                </div>

                <div style={fieldWrap}>
                  <label style={label}>Shift Type</label>
                  <select style={select} value={form.shiftType} onChange={set('shiftType')}>
                    <option value="">— Select —</option>
                    <option>Day</option>
                    <option>Night</option>
                    <option>Overnight</option>
                  </select>
                </div>

                <div style={fieldWrap}>
                  <label style={label}>Post / Zone</label>
                  <input style={input} type="text" placeholder="Exterior / Interior / Lot / etc." value={form.postZone} onChange={set('postZone')} />
                </div>

                <div style={fieldWrap}>
                  <label style={label}>Supervisor / POC</label>
                  <input style={input} type="text" placeholder="Name" value={form.supervisor} onChange={set('supervisor')} />
                </div>

                <div style={fieldWrap}>
                  <label style={label}>Relief Officer</label>
                  <input style={input} type="text" placeholder="Name or N/A" value={form.reliefOfficer} onChange={set('reliefOfficer')} />
                </div>

                <div style={fieldWrap}>
                  <label style={label}>Client Rep on Duty</label>
                  <input style={input} type="text" placeholder="Name or None" value={form.clientRep} onChange={set('clientRep')} />
                </div>

                <div style={fieldWrap}>
                  <label style={label}>Weather Conditions</label>
                  <select style={select} value={form.weather} onChange={set('weather')}>
                    <option value="">— Select —</option>
                    <option>Clear</option>
                    <option>Cloudy</option>
                    <option>Rain</option>
                    <option>Heavy Rain</option>
                    <option>Fog</option>
                    <option>Wind</option>
                    <option>Snow / Ice</option>
                    <option>Hot / Extreme Heat</option>
                    <option>Other</option>
                  </select>
                </div>

              </div>
            </div>
          </div>

          {/* ══ S2: SHIFT SUMMARY ════════════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>📋</span> SECTION 2 — SHIFT SUMMARY</div>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 10, fontStyle: 'italic' }}>
                Provide a brief narrative overview of the shift. Note overall conditions, major activities, and any significant findings.
              </p>
              <textarea style={{ ...textarea, minHeight: 100 }} placeholder="Conducted continuous patrols throughout the shift…" value={form.summary} onChange={set('summary')} />
            </div>
          </div>

          {/* ══ S3: PATROL ACTIVITY LOG ══════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>🚶</span> SECTION 3 — PATROL ACTIVITY LOG</div>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, fontStyle: 'italic' }}>
                Log each patrol entry with the time, location, and a clear description. Add rows as needed.
              </p>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '110px 150px 1fr 36px', gap: 6, marginBottom: 6 }}>
                {['TIME', 'LOCATION / ZONE', 'ACTIVITY / OBSERVATION', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 700, color: NAVY, letterSpacing: '0.08em', padding: '4px 0' }}>{h}</div>
                ))}
              </div>

              {logRows.map((row, idx) => (
                <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '110px 150px 1fr 36px', gap: 6, marginBottom: 6, alignItems: 'start', background: idx % 2 === 0 ? WHITE : GRAY, borderRadius: 6, padding: '4px 4px' }}>
                  <input
                    style={{ ...input, padding: '8px 10px', background: 'transparent' }}
                    type="time"
                    value={row.time}
                    onChange={e => updateLog(row.id, 'time', e.target.value)}
                  />
                  <input
                    style={{ ...input, padding: '8px 10px', background: 'transparent' }}
                    type="text"
                    placeholder="Zone / Area"
                    value={row.location}
                    onChange={e => updateLog(row.id, 'location', e.target.value)}
                  />
                  <input
                    style={{ ...input, padding: '8px 10px', background: 'transparent' }}
                    type="text"
                    placeholder="Describe activity or observation…"
                    value={row.activity}
                    onChange={e => updateLog(row.id, 'activity', e.target.value)}
                  />
                  <button
                    onClick={() => removeLogRow(row.id)}
                    title="Remove row"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: 18, lineHeight: 1, paddingTop: 8 }}
                  >×</button>
                </div>
              ))}

              <button onClick={addLogRow} style={{ marginTop: 8, background: LNAVY, border: `1.5px dashed ${NAVY}`, color: NAVY, borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                + Add Row
              </button>
            </div>
          </div>

          {/* ══ S4: OBSERVATIONS ═════════════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>👁</span> SECTION 4 — OBSERVATIONS</div>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 14, fontStyle: 'italic' }}>
                Check all that apply. Attach photos in Section 7 for any checked items.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
                <ObsGroup title="ACCESS & SECURITY" items={[
                  ['noUnsecuredEntries',   'No unsecured entry points observed'],
                  ['unsecuredDoorsFound',  'Unsecured door(s) found — documented & reported'],
                  ['perimeterGateOpen',    'Perimeter gate(s) found open'],
                  ['unauthorizedVehicle',  'Unauthorized vehicle(s) on property'],
                  ['unauthorizedPerson',   'Unauthorized individual(s) on property'],
                  ['forcedEntryVandalism', 'Forced entry or vandalism suspected'],
                  ['keyCardIssue',         'Key card / access issue noted'],
                ]} state={observations} toggle={toggleObs} />

                <ObsGroup title="PROPERTY CONDITIONS" items={[
                  ['lightingAllGood',     'Lighting functioning — all areas'],
                  ['lightingIssue',       'Lighting issue(s) noted'],
                  ['hazardousCondition',  'Hazardous condition observed'],
                  ['constructionDebris',  'Construction debris / materials unsecured'],
                  ['slipHazard',          'Slip / trip hazard identified'],
                  ['parkingLotClear',     'Parking lot / exterior area clear'],
                  ['commonAreasClear',    'Common areas clean and clear'],
                ]} state={observations} toggle={toggleObs} />

                <ObsGroup title="INCIDENTS & ACTIVITY" items={[
                  ['noIncidents',          'No incidents to report'],
                  ['disturbanceObserved',  'Disturbance / altercation observed'],
                  ['suspiciousActivity',   'Suspicious activity — documented in log'],
                  ['medicalConcern',       'Medical / wellness concern'],
                  ['policeEmsCalled',      'Police / EMS contact made'],
                  ['propertyDamage',       'Property damage observed'],
                  ['noiseComplaint',       'Noise complaint / resident concern'],
                ]} state={observations} toggle={toggleObs} />

                <ObsGroup title="COMPLIANCE & PROTOCOLS" items={[
                  ['observeReportRefer',     'OBSERVE-REPORT-REFER protocol followed'],
                  ['checkInsCompleted',      'All hourly check-ins completed on time'],
                  ['postOrdersReviewed',     'Post orders reviewed at start of shift'],
                  ['escalatedToSupervisor',  'Incident escalated to supervisor'],
                  ['qceManagementNotified',  'QCE management notified'],
                  ['clientNotified',         'Client / property manager notified'],
                  ['called911',              '911 contacted — details in log'],
                ]} state={observations} toggle={toggleObs} />
              </div>
            </div>
          </div>

          {/* ══ S5: ACTIONS TAKEN ════════════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>✅</span> SECTION 5 — ACTIONS TAKEN</div>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, fontStyle: 'italic' }}>Document all corrective or responsive actions performed during this shift.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 28px' }}>
                {[
                  ['securedDoors',           'Secured accessible door(s) / entry points'],
                  ['documentedEntries',       'Documented unsecured entry points with photos'],
                  ['maintainedPatrol',        'Maintained consistent patrol schedule'],
                  ['contactedPropertyMgr',    'Contacted property manager / client rep'],
                  ['contactedQCESupervisor',  'Contacted QCE supervisor / on-call management'],
                  ['called911Action',         'Called 911 / coordinated with law enforcement or EMS'],
                  ['escortedIndividual',      'Escorted individual off property'],
                  ['completedIncidentRpt',    'Completed written incident report (attach separately)'],
                ].map(([k, lbl]) => (
                  <CheckRow key={k} id={k} label={lbl} checked={actions[k]} onChange={() => toggleAct(k)} />
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={label}>Additional Notes</label>
                <textarea style={{ ...textarea, minHeight: 70 }} placeholder="Describe any additional actions taken…" value={actionsNotes} onChange={e => setActionsNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ══ S6: RECOMMENDATIONS ══════════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>💡</span> SECTION 6 — RECOMMENDATIONS</div>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, fontStyle: 'italic' }}>
                Recommended follow-up actions for QCE management or the client. Remember: OBSERVE-REPORT-REFER.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 28px' }}>
                {[
                  ['contractorsSecureDoors',  'Ensure all contractors secure doors at end of workday'],
                  ['provideKeyCard',          'Provide security officer with key card / full access'],
                  ['reviewPostOrders',        'Review and update post orders'],
                  ['increasePatrolFrequency', 'Increase patrol frequency in problem area(s)'],
                  ['maintenanceLighting',     'Schedule maintenance review for lighting issues'],
                  ['lockUpVerification',      'Implement end-of-day lock-up verification protocol'],
                ].map(([k, lbl]) => (
                  <CheckRow key={k} id={k} label={lbl} checked={recs[k]} onChange={() => toggleRec(k)} />
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={label}>Additional Notes</label>
                <textarea style={{ ...textarea, minHeight: 70 }} placeholder="Describe any additional recommendations…" value={recsNotes} onChange={e => setRecsNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ══ S7: PHOTO DOCUMENTATION ══════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>📷</span> SECTION 7 — PHOTO DOCUMENTATION</div>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, fontStyle: 'italic' }}>
                Log all photos taken during this shift. Required for: unsecured entry points, property damage, hazardous conditions, suspicious activity, or any escalated incident. Upload photos separately to your property folder.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '100px 140px 1fr 150px 36px', gap: 6, marginBottom: 6 }}>
                {['TIME', 'LOCATION', 'DESCRIPTION', 'FILE NAME', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 700, color: NAVY, letterSpacing: '0.08em', padding: '4px 0' }}>{h}</div>
                ))}
              </div>

              {photoRows.map((row, idx) => (
                <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '100px 140px 1fr 150px 36px', gap: 6, marginBottom: 6, alignItems: 'start', background: idx % 2 === 0 ? WHITE : GRAY, borderRadius: 6, padding: '4px 4px' }}>
                  <input style={{ ...input, padding: '8px 8px', background: 'transparent', fontSize: 13 }} type="time" value={row.time} onChange={e => updatePhoto(row.id, 'time', e.target.value)} />
                  <input style={{ ...input, padding: '8px 8px', background: 'transparent', fontSize: 13 }} type="text" placeholder="Zone / Area" value={row.location} onChange={e => updatePhoto(row.id, 'location', e.target.value)} />
                  <input style={{ ...input, padding: '8px 8px', background: 'transparent', fontSize: 13 }} type="text" placeholder="What the photo shows…" value={row.description} onChange={e => updatePhoto(row.id, 'description', e.target.value)} />
                  <input style={{ ...input, padding: '8px 8px', background: 'transparent', fontSize: 13 }} type="text" placeholder="IMG_001.jpg" value={row.fileName} onChange={e => updatePhoto(row.id, 'fileName', e.target.value)} />
                  <button onClick={() => removePhotoRow(row.id)} title="Remove row" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: 18, lineHeight: 1, paddingTop: 8 }}>×</button>
                </div>
              ))}

              <button onClick={addPhotoRow} style={{ marginTop: 8, background: LNAVY, border: `1.5px dashed ${NAVY}`, color: NAVY, borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                + Add Photo Row
              </button>
            </div>
          </div>

          {/* ══ S8: END-OF-SHIFT STATUS ══════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>🔒</span> SECTION 8 — END-OF-SHIFT STATUS</div>
            <div style={{ padding: '18px 20px' }}>

              <div style={{ marginBottom: 18 }}>
                <label style={{ ...label, color: errors.endStatus ? '#c0392b' : NAVY }}>Overall Shift Status *</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                  {['ALL CLEAR', 'PENDING FOLLOW-UP', 'INCIDENT REPORTED'].map(opt => (
                    <button key={opt} onClick={() => setForm(p => ({ ...p, endStatus: opt }))}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 7,
                        border: `2px solid ${form.endStatus === opt ? GOLD : BORDER}`,
                        background: form.endStatus === opt ? LGOLD : GRAY,
                        color: form.endStatus === opt ? NAVY : MUTED,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}>
                      {form.endStatus === opt ? '✓ ' : ''}{opt}
                    </button>
                  ))}
                </div>
                {errors.endStatus && <p style={{ color: '#c0392b', fontSize: 11, marginTop: 4 }}>Please select an end-of-shift status.</p>}
              </div>

              <div>
                <label style={label}>End-of-Shift Notes</label>
                <textarea style={{ ...textarea, minHeight: 80 }} placeholder="Property secure. No incidents to report…" value={form.endNotes} onChange={set('endNotes')} />
              </div>
            </div>
          </div>

          {/* ══ SEND SECTION ══════════════════════════════════ */}
          <div style={card} className="fade-in">
            <div style={sectionHead}><span style={{ fontSize: 16 }}>📤</span> SUBMIT REPORT</div>
            <div style={{ padding: '18px 20px' }}>

              {/* Policy reminder */}
              <div style={{ background: LNAVY, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 6, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                <strong style={{ color: NAVY }}>REMINDER:</strong> QCE security officers operate under the OBSERVE-REPORT-REFER protocol at all times. Officers should never independently investigate, intervene, or resolve incidents beyond their authorized scope. All emergencies must be escalated immediately to QCE management and/or 911.
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Additional Recipients (optional)</label>
                <input style={input} type="email" placeholder="email@example.com, another@example.com" value={form.recipientEmail} onChange={set('recipientEmail')} />
                <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Leave blank to send to the default email list for the selected property.</p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  style={{
                    background: sending ? MUTED : NAVY,
                    color: sending ? WHITE : GOLD,
                    border: 'none',
                    borderRadius: 8,
                    padding: '13px 32px',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: '0.08em',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    animation: sending ? 'pulse 1.2s ease infinite' : 'none',
                  }}>
                  {sending ? 'SENDING…' : 'SEND REPORT'}
                </button>

                <button onClick={resetForm} style={{ background: 'none', border: `1.5px solid ${BORDER}`, color: MUTED, borderRadius: 8, padding: '12px 22px', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.06em' }}>
                  START NEW REPORT
                </button>
              </div>

              {sendMsg && (
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 7, background: sendMsg.ok ? '#eafaf1' : '#fdedec', border: `1px solid ${sendMsg.ok ? '#2ecc71' : '#e74c3c'}`, color: sendMsg.ok ? '#1a7040' : '#922b21', fontSize: 13, fontWeight: 500 }}>
                  {sendMsg.ok ? '✓ ' : '⚠ '}{sendMsg.text}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', paddingBottom: 20, lineHeight: 1.8 }}>
            Queen City Elite LLC · 4321 Stuart Andrew Blvd, Suite K, Charlotte, NC 28217<br />
            hi@queencityelite.com · (980) 867-2426
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────
function ObsGroup({ title, items, state, toggle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `2px solid ${GOLD}`, paddingBottom: 4, marginBottom: 8 }}>{title}</div>
      {items.map(([k, lbl]) => (
        <CheckRow key={k} id={k} label={lbl} checked={state[k]} onChange={() => toggle(k)} />
      ))}
    </div>
  );
}

function CheckRow({ id, label: lbl, checked, onChange }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 13, color: TEXT, lineHeight: 1.4 }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginTop: 2, accentColor: NAVY, width: 14, height: 14, flexShrink: 0 }}
      />
      <span style={{ color: checked ? NAVY : '#555', fontWeight: checked ? 600 : 400 }}>{lbl}</span>
    </label>
  );
}

// ─── Label maps for email body ─────────────────────────────────────
const OBS_LABELS = {
  noUnsecuredEntries:   'No unsecured entry points observed',
  unsecuredDoorsFound:  'Unsecured door(s) found — documented & reported',
  perimeterGateOpen:    'Perimeter gate(s) found open',
  unauthorizedVehicle:  'Unauthorized vehicle(s) on property',
  unauthorizedPerson:   'Unauthorized individual(s) on property',
  forcedEntryVandalism: 'Forced entry or vandalism suspected',
  keyCardIssue:         'Key card / access issue noted',
  lightingAllGood:      'Lighting functioning — all areas',
  lightingIssue:        'Lighting issue(s) noted',
  hazardousCondition:   'Hazardous condition observed',
  constructionDebris:   'Construction debris / materials unsecured',
  slipHazard:           'Slip / trip hazard identified',
  parkingLotClear:      'Parking lot / exterior area clear',
  commonAreasClear:     'Common areas clean and clear',
  noIncidents:          'No incidents to report',
  disturbanceObserved:  'Disturbance / altercation observed',
  suspiciousActivity:   'Suspicious activity — documented in log',
  medicalConcern:       'Medical / wellness concern',
  policeEmsCalled:      'Police / EMS contact made',
  propertyDamage:       'Property damage observed',
  noiseComplaint:       'Noise complaint / resident concern',
  observeReportRefer:   'OBSERVE-REPORT-REFER protocol followed',
  checkInsCompleted:    'All hourly check-ins completed on time',
  postOrdersReviewed:   'Post orders reviewed at start of shift',
  escalatedToSupervisor:'Incident escalated to supervisor',
  qceManagementNotified:'QCE management notified',
  clientNotified:       'Client / property manager notified',
  called911:            '911 contacted — details in log',
};
const ACT_LABELS = {
  securedDoors:          'Secured accessible door(s) / entry points',
  documentedEntries:     'Documented unsecured entry points with photos',
  maintainedPatrol:      'Maintained consistent patrol schedule',
  contactedPropertyMgr:  'Contacted property manager / client rep',
  contactedQCESupervisor:'Contacted QCE supervisor / on-call management',
  called911Action:       'Called 911 / coordinated with law enforcement or EMS',
  escortedIndividual:    'Escorted individual off property',
  completedIncidentRpt:  'Completed written incident report',
};
const REC_LABELS = {
  contractorsSecureDoors:  'Ensure all contractors secure doors at end of workday',
  provideKeyCard:          'Provide security officer with key card / full access',
  reviewPostOrders:        'Review and update post orders',
  increasePatrolFrequency: 'Increase patrol frequency in problem area(s)',
  maintenanceLighting:     'Schedule maintenance review for lighting issues',
  lockUpVerification:      'Implement end-of-day lock-up verification protocol',
};
