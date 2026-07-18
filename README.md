# 🏠 Real Estate Listing Platform — API

A full-stack real estate platform where users can list properties, browse/search listings, send inquiries, request property-viewing appointments, and save favourites to a wishlist.

---

## 🧰 Tech Stack

**Backend**
- **Node.js + Express** — REST API server
- **MongoDB + Mongoose** — database & ODM
- **JWT (jsonwebtoken)** — authentication
- **bcrypt** — password hashing
- **Multer** — in-memory multipart/form-data handling for image uploads
- **Cloudinary** — image hosting/storage (listing images & user avatars)
- **validator** — email validation

**Frontend**
- **React** — UI
- **Redux** — global user state management
- **localStorage** — persisting the JWT auth token client-side

---

## ✨ Features

- User registration, login, logout, profile update (with avatar upload), and account deletion
- JWT-based authentication middleware protecting private routes
- Property listings: create, update, delete, browse, and view single listings
- Multi-image upload for listings (up to 10 images) with Cloudinary storage, and cleanup of removed images on update/delete
- Search, filtering, and pagination on listings via a reusable `ApiFeatures` query builder
- "Featured" listings endpoint (public, paginated)
- "My Listings" endpoint for a logged-in owner
- Wishlist / Favourites — mark, unmark, and view saved listings
- Inquiries — buyers can message listing owners; owners can view received inquiries; senders can edit/delete their own inquiries
- Appointments — buyers can request a property viewing; owners can confirm/reject; confirming one appointment auto-rejects other pending requests for the same listing & time slot; owners can mark completed appointments after the scheduled time has passed
- Centralized async error handling (`catchAsyncError`) and a global error-handling middleware with custom handling for Mongoose `CastError` and duplicate-key (`11000`) errors

---

## 📁 Project Structure (relevant modules)

```
controllers/
  ├── appointment.controller.js
  ├── inquiry.controller.js
  ├── listing.controller.js
  ├── user.controller.js
  └── wishlist.controller.js
models/
  ├── appointment.model.js
  ├── inquiry.model.js
  ├── listing.model.js
  ├── user.model.js
  └── wishlist.model.js
routes/
  ├── appointment.route.js
  ├── inquiry.route.js
  ├── listing.route.js
  ├── user.route.js
  └── wishlist.route.js
middlewares/
  ├── auth.js
  ├── error.js
  └── multer.js
```

---

## 🗄️ Data Models

### `User` (`user.model.js`)
| Field | Type | Notes |
|---|---|---|
| firstName | String | required |
| lastName | String | |
| email | String | required, unique, validated |
| password | String | required, min 8 chars, hashed via a `pre('save')` bcrypt hook |
| avatar | `{ url, public_id }` | Cloudinary image reference |
| resetPasswordToken / resetPasswordExpire | String / Date | for password reset flow |

Instance methods: `comparePassword(entered)` (bcrypt compare), `getJWT()` (signs a JWT with the user id).

### `Listing` (`listing.model.js`)
| Field | Type | Notes |
|---|---|---|
| name, description, address | String | required |
| regularPrice, discountedPrice | Number | required |
| bedrooms, bathrooms | Number | required |
| furnished, parking | Boolean | required |
| type | String | enum `sell` / `rent` |
| offer | Boolean | default `false` |
| imageUrls | `[{ url, public_id }]` | Cloudinary references |
| owner | ObjectId → `User` | required |

### `Appointment` (`appointment.model.js`)
| Field | Type | Notes |
|---|---|---|
| buyer | ObjectId → `User` | requester |
| owner | ObjectId → `User` | listing owner |
| listing | ObjectId → `Listing` | |
| proposedDateTime | Date | required |
| status | String | enum `pending` / `confirmed` / `rejected` / `completed`, default `pending` |

### `Inquiry` (`inquiry.model.js`)
| Field | Type | Notes |
|---|---|---|
| sender | ObjectId → `User` | |
| reciever | ObjectId → `User` | listing owner |
| listing | ObjectId → `Listing` | |
| message | String | required |

### `Wishlist` (`wishlist.model.js`)
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → `User` | |
| listing | ObjectId → `Listing` | |

All models use Mongoose `{ timestamps: true }` for `createdAt`/`updatedAt`.

---

## 🎮 Controllers & Endpoints

> Auth: routes marked 🔒 require a valid `Bearer` JWT (via `verifyUser` middleware).

### User (`user.controller.js` / `user.route.js`)
| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/register` | `signin` | Create a new user account and return a JWT |
| POST | `/login` | `login` | Authenticate with email/password, return a JWT |
| PUT | `/update` 🔒 | `updateUser` | Update name/email and optionally replace avatar (uploads to Cloudinary, deletes old one) |
| DELETE | `/delete` 🔒 | `deleteUser` | Delete the logged-in user's account |
| POST | `/logout` 🔒 | `logoutUser` | Logout (client should clear the stored token) |

### Listing (`listing.controller.js` / `listing.route.js`)
| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/create` 🔒 | `createListing` | Create a listing; requires at least one uploaded image; auto-sets `discountedPrice = regularPrice` if no offer |
| GET | `/my-listings` 🔒 | `getMyListings` | Listings owned by the logged-in user |
| GET | `/featured` | `getFeaturedListings` | Public, paginated listings (no filters) |
| GET | `/:id` | `getSingleListing` | Fetch a single listing |
| PATCH | `/:id` 🔒 | `updateListing` | Update a listing (owner-only); merges kept + newly uploaded images, deletes removed ones from Cloudinary |
| DELETE | `/:id` 🔒 | `deleteListing` | Delete a listing (owner-only); removes all its images from Cloudinary |
| GET | `/` | `getAllListings` | Public, searchable/filterable/paginated listing feed (`ApiFeatures`) |

### Appointment (`appointment.controller.js` / `appointment.route.js`)
| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/create` 🔒 | `createAppointment` | Buyer requests a viewing; blocks booking on your own listing |
| GET | `/sentAppointments` 🔒 | `getMyBookedAppointments` | Appointments the logged-in user booked as a buyer |
| GET | `/recievedAppointments` 🔒 | `getRequestedAppointments` | Appointments received as a listing owner |
| PATCH | `/:id` 🔒 | `updateAppointmentRequest` | Update the proposed date/time |
| DELETE | `/:id` | `cancelAppointment` | Cancel/delete an appointment |
| PATCH | `/complete/:id` 🔒 | `updateAppointmentComplete` | Owner marks a confirmed appointment complete (only after the scheduled time) |
| PATCH | `/statusUpdate/:id` 🔒 | `updateAppointmentStatus` | Owner confirms/rejects a pending appointment; confirming one auto-rejects other pending requests for the same listing & time slot |

### Inquiry (`inquiry.controller.js` / `inquiry.route.js`)
| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/create` 🔒 | `createInquiry` | Send a message to a listing owner; blocks messaging your own listing |
| GET | `/sentInquiries` 🔒 | `getMySentInquiries` | Inquiries sent by the logged-in user |
| GET | `/listing/:id` 🔒 | `getListingInquiries` | All inquiries on a given listing |
| GET | `/recievedInquiries` 🔒 | `getRecievedInquiries` | Inquiries received by the logged-in user |
| GET | `/:id` 🔒 | `getInquiry` | Fetch a single inquiry |
| PATCH | `/:id` 🔒 | `updateInquiry` | Edit an inquiry's message |
| DELETE | `/:id` | `deleteInquiry` | Delete an inquiry |

### Wishlist (`wishlist.controller.js` / `wishlist.route.js`)
| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/mark` 🔒 | `markFavourite` | Add a listing to the user's wishlist (prevents duplicates) |
| GET | `/:id` 🔒 | `getSingleFavourite` | Fetch a single wishlist entry (populated with listing) |
| DELETE | `/:id` 🔒 | `demarkFavourite` | Remove a favourite (owner-only) |
| GET | `/` 🔒 | `getMyFavourites` | All of the logged-in user's favourites |

---

## 🛡️ Middlewares

- **`auth.js` — `verifyUser`**: Reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches the corresponding `User` document to `req.user`. Returns `401` if missing/malformed.
- **`error.js`**: Global Express error handler. Normalizes Mongoose `CastError` (invalid ObjectId) to a `400`, and duplicate-key errors (`code 11000`) to a friendly `400` message; responds with a consistent `{ sucess: false, error }` shape.
- **`multer.js`**: In-memory storage (`multer.memoryStorage()`) with an image-only file filter and a 5 MB limit.
  - `uploadSingle` — single file, field name `avatar` (used for user profile updates)
  - `uploadMultiple` — up to 10 files, field name `images` (used for listings)

---

## 🔐 Authentication Flow

1. User registers/logs in → server issues a JWT (`getJWT` / `sendToken`).
2. **Frontend** stores this token in `localStorage` and keeps the current user profile in **Redux** state.
3. Every subsequent request to a protected route sends `Authorization: Bearer <token>`; the `verifyUser` middleware validates it and loads `req.user`.
4. On logout, the frontend clears the token from `localStorage` and resets the Redux user slice.

---

## ⚙️ Environment Variables

```
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
MONGO_URI=your_mongodb_connection_string
```

# install dependencies
npm install

# run in development
npm run dev
```
