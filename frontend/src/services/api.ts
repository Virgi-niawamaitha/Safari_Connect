// ─── API Service — all backend calls in one place ────────────────────────────
// Backend: http://localhost:5000/api  (set VITE_API_URL to override)

const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'sc_token';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken  = () => localStorage.getItem(TOKEN_KEY);
export const setToken  = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = json?.message ?? json?.error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return json as T;
}

const get  = <T>(path: string, auth = true) => request<T>('GET',    path, undefined, auth);
const post = <T>(path: string, body: unknown, auth = true) => request<T>('POST',   path, body, auth);
const patch = <T>(path: string, body: unknown) => request<T>('PATCH', path, body);

// ─── Response shapes from backend ────────────────────────────────────────────
export interface ApiUser {
  id: string; firstName: string; lastName: string;
  email: string; phone?: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  status?: string; isVerified?: boolean;
  ownerProfile?: { id: string; sacco?: { id: string; name: string } | null } | null;
}

export interface ApiTrip {
  id: string; tripType: string; status: string;
  departureTime: string; arrivalTime: string;
  basePrice: string; duration: string;
  sacco: { id: string; name: string; logoUrl?: string };
  bus: { id: string; name: string; plateNumber: string; seatCapacity: number };
  route: { id: string; origin: string; destination: string; distanceKm?: number; estimatedTime?: number };
  availableSeatsCount: number;
  seatClasses: string[];
}

export interface ApiSeat {
  id: string; seatNumber: string; seatClass: string;
  price: string; isBooked: boolean;
}

export interface ApiTripSeats {
  trip: {
    id: string; departureTime: string; arrivalTime: string; status: string;
    sacco: { id: string; name: string }; route: { id: string; origin: string; destination: string };
    bus: { id: string; name: string; plateNumber: string };
  };
  seats: ApiSeat[];
}

export interface ApiBooking {
  id: string; bookingCode: string; status: string;
  firstName: string; lastName: string; email?: string;
  phone: string; nationalId: string; residence?: string;
  amount: string; createdAt: string;
  trip: ApiTrip & { sacco: { name: string }; route: { origin: string; destination: string }; bus: { plateNumber: string } };
  seat: ApiSeat;
  payment?: ApiPayment | null;
}

export interface ApiPayment {
  id: string; status: string; amount: string;
  phoneNumber: string; transactionRef?: string;
  checkoutRequestId?: string; createdAt: string;
}

export interface ApiCategory {
  id: string; name: string; slug: string; description?: string;
}

export interface ApiRoute {
  id: string; origin: string; destination: string;
  distanceKm?: number; estimatedTime?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    post<{ data: { token: string; user: ApiUser } }>('/auth/login', { email, password }, false),

  register: (payload: {
    firstName: string; lastName: string; email: string; phone?: string;
    password: string; role: 'USER' | 'OWNER' | 'ADMIN';
  }) => post<{ data: { token: string; user: ApiUser } }>('/auth/register', payload, false),

  me: () => get<{ data: ApiUser }>('/auth/me'),
};

// ─── Trips ────────────────────────────────────────────────────────────────────
export const tripsApi = {
  search: (params: {
    origin?: string; destination?: string; date?: string;
    time?: string; tripType?: string; categoryId?: string;
  }) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
    return get<{ data: ApiTrip[] }>(`/trips/search?${q.toString()}`, false);
  },

  getById: (tripId: string) => get<{ data: ApiTrip }>(`/trips/${tripId}`, false),

  getSeats: (tripId: string) => get<{ data: ApiTripSeats }>(`/trips/${tripId}/seats`, false),

  // Owner
  myTrips: () => get<{ data: ApiTrip[] }>('/trips/me'),
  create: (data: {
    busId: string; routeId: string; tripType?: string;
    departureTime: string; arrivalTime: string; basePrice: number;
  }) => post<{ data: ApiTrip }>('/trips', data),
  updateStatus: (tripId: string, status: string) =>
    patch<{ data: ApiTrip }>(`/trips/${tripId}/status`, { status }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (data: {
    tripId: string; seatId: string; firstName: string; lastName: string;
    email?: string; phone: string; nationalId: string; residence?: string;
  }) => post<{ data: ApiBooking }>('/bookings', data),

  mine: () => get<{ data: ApiBooking[] }>('/bookings/me'),

  getById: (bookingId: string) => get<{ data: ApiBooking }>(`/bookings/${bookingId}`),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  stkPush: (bookingId: string, phoneNumber: string) =>
    post<{ data: { checkoutRequestId: string; merchantRequestId: string } }>(
      '/payments/stk-push', { bookingId, phoneNumber }),

  status: (bookingId: string) =>
    get<{ data: ApiPayment }>(`/payments/status/${bookingId}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => get<{ data: ApiCategory[] }>('/categories', false),
};

// ─── Routes ───────────────────────────────────────────────────────────────────
export const routesApi = {
  list: () => get<{ data: ApiRoute[] }>('/routes', false),
  create: (data: { origin: string; destination: string; distanceKm?: number; estimatedTime?: number }) =>
    post<{ data: ApiRoute }>('/routes', data),
};

// ─── Buses ────────────────────────────────────────────────────────────────────
export const busesApi = {
  mine: () => get<{ data: any[] }>('/buses/me'),
  create: (data: { name: string; plateNumber: string; seatCapacity: number }) =>
    post<{ data: any }>('/buses', data),
  addSeats: (busId: string, seats: Array<{ seatNumber: string; seatClass: string; price: number }>) =>
    post<{ data: any }>(`/buses/${busId}/seats`, { seats }),
  getSeats: (busId: string) => get<{ data: any[] }>(`/buses/${busId}/seats`),
};

// ─── Saccos ───────────────────────────────────────────────────────────────────
export const saccosApi = {
  mine: () => get<{ data: any }>('/saccos/me'),
  create: (data: { name: string; slug: string; categoryId: string; supportPhone?: string; supportEmail?: string }) =>
    post<{ data: any }>('/saccos', data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => get<{ data: any }>('/admins/stats'),
  users: (params?: { role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.role)   q.set('role',   params.role);
    if (params?.status) q.set('status', params.status);
    return get<{ data: any }>(`/admins/users?${q.toString()}`);
  },
  bookings: (params?: { status?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    return get<{ data: any }>(`/admins/bookings?${q.toString()}`);
  },
  saccos: () => get<{ data: any[] }>('/admins/saccos'),
  payments: (params?: { status?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    return get<{ data: any }>(`/admins/payments?${q.toString()}`);
  },
  updateUserStatus: (userId: string, status: string) =>
    patch<{ data: any }>(`/admins/users/${userId}/status`, { status }),
  updateSaccoStatus: (saccoId: string, isActive: boolean) =>
    patch<{ data: any }>(`/admins/saccos/${saccoId}/status`, { isActive }),
};
