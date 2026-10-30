# iReserve Client

The iReserve client is a React application built with Vite. It connects to the
[iReserve API](https://github.com/gitahidave/iReserve-server) for authentication, listings, bookings,
notifications, exports, and M-Pesa payments.

## Development

```sh
npm install
npm run dev
```

By default, Vite proxies `/api` requests to `http://localhost:5000`, where the
backend development server listens. Set `VITE_API_BASE_URL` when the API is
running at a different origin; use either the server origin
(`https://api.example.com`) or its API root (`https://api.example.com/api`).

```sh
VITE_API_BASE_URL=http://localhost:5000/api npm run dev
```

## Payments

Clients create a pending booking, then start payment from their dashboard. The
client sends the booking ID and Kenyan phone number to
`POST /api/payments/mpesa/initialize`. After the customer approves the M-Pesa
prompt, the backend verifies the callback and confirms the booking. The client
can refresh the booking status from the dashboard; no payment-status polling
endpoint is currently provided by the API.

Run `npm run lint` and `npm run build` to validate the client.
