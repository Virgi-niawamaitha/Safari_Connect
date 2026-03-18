import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useBooking } from '../../context/BookingContext';
import type { SearchQuery, Category, TripType } from '../../types';

export default function Search() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setSearch } = useBooking();

  const [form, setForm] = useState<SearchQuery>({
    category:   (params.get('cat') ?? 'bus') as Category,
    from:       params.get('from') ?? '',
    to:         params.get('to') ?? '',
    date:       new Date().toISOString().split('T')[0],
    time:       '08:00',
    tripType:   'one-way',
    returnDate: '',
    returnTime: '17:00',
    passengers: 1,
  });

  const [errors, setErrors] = useState<{ from?: string; to?: string; date?: string }>({});

  const set = <K extends keyof SearchQuery>(k: K, v: SearchQuery[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.from) e.from = 'Please enter a departure location';
    if (!form.to)   e.to   = 'Please enter a destination';
    if (!form.date) e.date = 'Please select a travel date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSearch(form);
    navigate('/passenger/results');
  };

  const CATS: { id: Category; icon: string; label: string }[] = [
    { id: 'bus',       icon: '🚌', label: 'Bus' },
    { id: 'matatu',    icon: '🚐', label: 'Matatu' },
    { id: 'motorbike', icon: '🏍️', label: 'Motorbike' },
  ];

  return (
    <DashboardLayout title="Search trips" subtitle="Find available transport on your route">
      <div style={{ maxWidth: 660 }}>
        {/* Category selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {CATS.map(c => (
            <button key={c.id}
              className={`btn${form.category === c.id ? ' btn-primary' : ''}`}
              onClick={() => set('category', c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Departure (from)</label>
                <input className={`input${errors.from ? ' has-error' : ''}`}
                  placeholder="e.g. Nairobi CBD"
                  value={form.from} onChange={e => set('from', e.target.value)} />
                {errors.from && <span className="form-error">{errors.from}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Destination (to)</label>
                <input className={`input${errors.to ? ' has-error' : ''}`}
                  placeholder="e.g. Nakuru"
                  value={form.to} onChange={e => set('to', e.target.value)} />
                {errors.to && <span className="form-error">{errors.to}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Travel date</label>
                <input className={`input${errors.date ? ' has-error' : ''}`}
                  type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Preferred time</label>
                <input className="input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>

            {/* Trip type */}
            <div className="form-group">
              <label className="form-label">Trip type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['one-way', 'return'] as TripType[]).map(t => (
                  <button key={t} type="button"
                    className={`btn${form.tripType === t ? ' btn-primary' : ''}`}
                    onClick={() => set('tripType', t)}>
                    {t === 'one-way' ? 'One-way' : 'Return trip'}
                  </button>
                ))}
              </div>
            </div>

            {form.tripType === 'return' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Return date</label>
                  <input className="input" type="date"
                    value={form.returnDate ?? ''} onChange={e => set('returnDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Return time</label>
                  <input className="input" type="time"
                    value={form.returnTime ?? ''} onChange={e => set('returnTime', e.target.value)} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Passengers</label>
              <select className="select" value={form.passengers}
                onChange={e => set('passengers', Number(e.target.value))}>
                {[1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: 220 }}>
              Search available trips →
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
