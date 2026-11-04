# RYTHM — Play • Shop • Inspire

A React + Vite musical-instruments storefront built for the RYTHM team project.

## Run locally

1. Install Node.js (LTS).
2. Configure the backend in `backend/Doodleblue_final_Task-`. Set `MONGO_URI`, `JWT_SECRET`, `PORT`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in its `.env` file. Run `npm install`, then run `npm run create-admin` once to create the single admin account. The command will not create another admin if one already exists. Run `npm run seed-coupon` once to enable KADAI10, then start the API with `npm run dev`.
3. In this `frontend` folder, run `npm install`.
4. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend API base URL (default: `http://localhost:5000/api`).
5. Run `npm run dev`.

## Build

- `npm run build` — create the production build in `dist/`.
- `npm run preview` — preview the production build.
- `npm run lint` — run ESLint.

## Main routes

- `/` — storefront, search, filters, sorting and pagination
- `/product/:id` — product information, quantity, add to cart and buy now
- `/cart` — persistent cart, coupon and order summary
- `/login`, `/signup` — JWT authentication
- `/checkout`, `/payment`, `/orders`, `/orders/:id` — delivery, Cash on Delivery, and order pages
- `/admin` — Products and Orders dashboard (admin account only)
- `/admin/add-product`, `/admin/edit-product/:id` — product management

## Backend contract

The frontend connects to the Express API in `backend/Doodleblue_final_Task-`:
- `POST /auth/register`, `POST /auth/login`
- `GET /products`, `GET /products/:id`
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id` (admin)
- `POST /coupons/validate` (authenticated)
- `POST /orders`, `GET /orders/my-orders`, `GET /orders/:id` (authenticated)
- `GET /orders`, `PATCH /orders/:id/status` (admin dashboard)

The frontend converts its product form fields to the API's `title`, `thumbnail`, and `instrumentType` fields. Authentication requests use the backend's `/auth/register` endpoint; JWTs are attached to protected requests. Cart coupon validation and order totals are validated and recalculated by the backend.

Checkout supports Cash on Delivery only. The `npm run seed-coupon` setup command enables KADAI10 for 10% off for one year and deactivates the former SAVE10 code.

## Brand

The selected RYTHM vintage guitar wordmark is stored in `public/rythm-logo-original.png`; the cropped header/footer version is `public/rythm-logo-header.png`. Brand palette: Walnut `#563725`, Cognac `#A66B43`, Amber `#D9A66B`, Cream `#F2E5D5`.
