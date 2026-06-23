# Production Deployment Guide: MERN Stack (EMS)

This guide walks you through deploying the **Employee Management System (EMS)** to production using **MongoDB Atlas** (database), **Render** (backend server), and **Vercel** (frontend application).

---

## 📂 Prerequisites
1. A GitHub account with the project repository pushed.
2. A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
3. A free [Render](https://render.com/) account.
4. A free [Vercel](https://vercel.com/) account.

---

## 1. Set Up MongoDB Atlas (Database)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project, then click **Build a Cluster** (choose the Shared free tier).
3. Under **Security Quickstart**:
   * Create a database user (e.g., username `ems-user`, write down the secure password).
   * In **IP Access List**, add IP address `0.0.0.0/0` (allows connection from Render).
4. Navigate to **Database**, click **Connect**, select **Drivers**, and copy the connection string.
   * *Example string:* `mongodb+srv://ems-user:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   * Replace `<password>` with your database user password and specify the database name (e.g. `employee_management` before the `?`).

---

## 2. Deploy Backend API Server on Render

1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   * **Name**: `ems-backend`
   * **Region**: Choose closest to your users.
   * **Branch**: `main`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Expand the **Advanced** section and add the following **Environment Variables**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `10000` | Port for Render backend (Render sets this automatically) |
| `MONGO_URI` | `your_mongodb_atlas_connection_string` | From Step 1 |
| `JWT_SECRET` | `a_long_secure_random_string` | Private key for signing tokens |
| `JWT_EXPIRE` | `30d` | Expiration limit of JWT tokens |

6. Click **Create Web Service**. Wait for the build and deployment process to complete.
7. Once deployed, copy your Render Web Service URL (e.g. `https://ems-backend.onrender.com`).

---

## 3. Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the Project configuration:
   * **Framework Preset**: `Vite` (Vercel automatically detects this).
   * **Root Directory**: Click Edit, select the `frontend` directory, and click Continue.
5. In **Build and Development Settings**, verify:
   * Build Command: `npm run build`
   * Output Directory: `dist`
6. Expand **Environment Variables** and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://ems-backend.onrender.com/api` | **Your Render Backend URL** + `/api` |

7. Click **Deploy**. Vercel will build and launch your application.
8. Once finished, Vercel will provide your live deployment URL (e.g. `https://ems-frontend.vercel.app`).

---

## ⚙️ CORS & Production Adjustments (Optional)

1. **CORS Configuration**: By default, the backend CORS setup (`backend/server.js`) uses `origin: '*'` which allows requests from any domain. If you want to secure this in production, you can update `backend/server.js` to read allowed origins from environment variables.
2. **Socket.io Connection**: In [Layout.jsx](file:///d:/Working%20Projects%20/Employee_Managment/frontend/src/components/Layout.jsx), the Socket.io client initializes using:
   `const socket = io('http://localhost:5050');`
   If you wish to utilize live notifications in production, you should update the backend server host URL dynamically using environment variables or fallback values.
