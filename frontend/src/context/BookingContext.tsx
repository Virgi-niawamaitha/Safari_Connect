import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { BookingState, SearchQuery, BusResult, SeatClass, PassengerDetails } from '../types';
import { bookingsApi, paymentsApi } from '../services/api';

interface BookingContextValue {
  booking: BookingState;
  setSearch:      (q: SearchQuery) => void;
  selectBus:      (bus: BusResult) => void;
  selectSeat:     (seatLabel: string, cls: SeatClass, fare: number, seatId: string) => void;
  setPassenger:   (p: PassengerDetails) => void;
  setPhone:       (phone: string) => void;
  /** Creates booking in backend. Returns bookingCode on success. */
  submitBooking:  () => Promise<string>;
  /** Initiates M-Pesa STK push. Returns checkoutRequestId. */
  initiatePayment: (phone: string) => Promise<string>;
  /** Poll payment status. Returns 'SUCCESS' | 'PENDING' | 'FAILED' */
  pollPayment:    () => Promise<string>;
  reset: () => void;
  // Legacy — kept so existing pages that call confirmBooking() don't break
  confirmBooking: () => string;
}

const initial: BookingState = {
  searchQuery:   null,
  selectedBus:   null,
  selectedSeat:  null,
  seatClass:     'economy',
  fare:          0,
  passenger:     null,
  phone:         '',
  bookingRef:    '',
  // extended
  tripId:        '',
  seatId:        '',
  bookingId:     '',
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(initial);

  const setSearch = useCallback((q: SearchQuery) =>
    setBooking(p => ({ ...p, searchQuery: q })), []);

  const selectBus = useCallback((bus: BusResult) =>
    setBooking(p => ({ ...p, selectedBus: bus, tripId: bus.id })), []);

  const selectSeat = useCallback((seatLabel: string, cls: SeatClass, fare: number, seatId: string) =>
    setBooking(p => ({ ...p, selectedSeat: seatLabel, seatClass: cls, fare, seatId })), []);

  const setPassenger = useCallback((passenger: PassengerDetails) =>
    setBooking(p => ({ ...p, passenger })), []);

  const setPhone = useCallback((phone: string) =>
    setBooking(p => ({ ...p, phone })), []);

  /** POST /bookings — create booking, store bookingId + bookingRef */
  const submitBooking = useCallback(async (): Promise<string> => {
    const { tripId, seatId, passenger, phone } = booking;
    if (!tripId || !seatId || !passenger) throw new Error('Missing booking details');

    const res = await bookingsApi.create({
      tripId,
      seatId,
      firstName:  passenger.firstName,
      lastName:   passenger.lastName,
      email:      passenger.email || undefined,
      phone:      phone || passenger.email,
      nationalId: passenger.idNumber,
      residence:  passenger.residence || undefined,
    });

    const bookingCode = res.data.bookingCode;
    const bookingId   = res.data.id;
    setBooking(p => ({ ...p, bookingRef: bookingCode, bookingId }));
    return bookingCode;
  }, [booking]);

  /** POST /payments/stk-push */
  const initiatePayment = useCallback(async (phone: string): Promise<string> => {
    const { bookingId } = booking;
    if (!bookingId) throw new Error('No booking to pay for');
    setBooking(p => ({ ...p, phone }));
    const res = await paymentsApi.stkPush(bookingId, phone);
    return res.data.checkoutRequestId ?? '';
  }, [booking]);

  /** GET /payments/status/:bookingId */
  const pollPayment = useCallback(async (): Promise<string> => {
    const { bookingId } = booking;
    if (!bookingId) return 'FAILED';
    try {
      const res = await paymentsApi.status(bookingId);
      return res.data.status; // 'SUCCESS' | 'PENDING' | 'FAILED'
    } catch {
      return 'FAILED';
    }
  }, [booking]);

  /** Legacy shim so old pages don't break */
  const confirmBooking = useCallback((): string => {
    const ref = booking.bookingRef ||
      `SC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setBooking(p => ({ ...p, bookingRef: ref }));
    return ref;
  }, [booking.bookingRef]);

  const reset = useCallback(() => setBooking(initial), []);

  return (
    <BookingContext.Provider value={{
      booking, setSearch, selectBus, selectSeat,
      setPassenger, setPhone, submitBooking,
      initiatePayment, pollPayment, confirmBooking, reset,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
