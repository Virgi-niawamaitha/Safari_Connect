import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { BookingState, SearchQuery, BusResult, SeatClass, PassengerDetails } from '../types';

interface BookingContextValue {
  booking: BookingState;
  setSearch: (q: SearchQuery) => void;
  selectBus: (bus: BusResult) => void;
  selectSeat: (seat: string, cls: SeatClass, fare: number) => void;
  setPassenger: (p: PassengerDetails) => void;
  setPhone: (phone: string) => void;
  confirmBooking: () => string;
  reset: () => void;
}

const initial: BookingState = {
  searchQuery: null,
  selectedBus: null,
  selectedSeat: null,
  seatClass: 'economy',
  fare: 0,
  passenger: null,
  phone: '',
  bookingRef: '',
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(initial);

  const setSearch = useCallback((q: SearchQuery) =>
    setBooking(p => ({ ...p, searchQuery: q })), []);

  const selectBus = useCallback((bus: BusResult) =>
    setBooking(p => ({ ...p, selectedBus: bus })), []);

  const selectSeat = useCallback((seat: string, cls: SeatClass, fare: number) =>
    setBooking(p => ({ ...p, selectedSeat: seat, seatClass: cls, fare })), []);

  const setPassenger = useCallback((passenger: PassengerDetails) =>
    setBooking(p => ({ ...p, passenger })), []);

  const setPhone = useCallback((phone: string) =>
    setBooking(p => ({ ...p, phone })), []);

  const confirmBooking = useCallback((): string => {
    const ref = `SC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setBooking(p => ({ ...p, bookingRef: ref }));
    return ref;
  }, []);

  const reset = useCallback(() => setBooking(initial), []);

  return (
    <BookingContext.Provider value={{ booking, setSearch, selectBus, selectSeat, setPassenger, setPhone, confirmBooking, reset }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
