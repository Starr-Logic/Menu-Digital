# Admin Authentication Setup - Complete Implementation Guide

## ✅ What Was Implemented

A complete admin authentication system has been added to your application with role-based access control:

### **Backend Changes**

#### 1. **Admin Model** [models/Admin.js](models/Admin.js)
- Sequelize model with automatic password hashing using `bcrypt`
- Instance method `comparePassword()` for password validation
- Hooks that hash passwords before `create` and `update` operations

#### 2. **Authentication Routes** [routes/auth.js](routes/auth.js)
- `POST /api/auth/register` - Register new admin (with validation)
- `POST /api/auth/login` - Admin login (returns JWT token)
- `GET /api/auth/verify` - Verify token validity
- `verifyToken` middleware - Protects routes requiring authentication

#### 3. **Database Model Sync** [models/index.js](models/index.js)
- Admin model imported and exported
- Automatically syncs with database on startup

#### 4. **Server Setup** [server.js](server.js)
- Auth routes registered at `/api/auth`

#### 5. **Environment Configuration** [.env](.env)
- Added `JWT_SECRET` for token signing (change in production!)

### **Frontend Changes**

#### 1. **Admin Login Component** [src/components/AdminLogin.jsx](src/components/AdminLogin.jsx)
- Beautiful login form with error handling
- Stores token and user info in `localStorage`
- Calls `onLoginSuccess` callback after login

#### 2. **Authentication State** [src/App.jsx](src/App.jsx)
- `isAdminLoggedIn` - Boolean tracking login status
- `adminToken` - JWT token from backend
- `adminUser` - Admin username/ID
- Auto-restores session from localStorage on app load

#### 3. **Protected Routes** [src/App.jsx](src/App.jsx)
- Kitchen Dashboard (`/kitchen`) - Requires login
- Add Product (`/add-product`) - Requires login
- QR Generator (`/qr-generator`) - Requires login
- Shows login form if admin tries to access protected tabs

#### 4. **Navigation Updates** [src/components/Navbar.jsx](src/components/Navbar.jsx)
- Admin tabs (Kitchen, QR, Add Product) only visible when logged in
- Shows admin username when logged in
- Logout button in navbar

---

## 🚀 How to Use

### **Default Test Credentials**
```
Username: admin
Password: admin
```

### **To Register a New Admin**

**Option A: API Request**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "newadmin", "password": "newpassword"}'
```

**Option B: Frontend**
- Modify the backend to allow registration or make a POST request from the browser console

### **Admin Login Flow**

1. **User clicks "Kitchen Deck"** → Redirects to `/kitchen`
2. **Not logged in?** → Shows `AdminLogin` component
3. **User enters credentials** → Sends to `POST /api/auth/login`
4. **Backend validates & returns JWT token**
5. **Frontend stores token in localStorage**
6. **Admin gains access to:**
   - Kitchen Dashboard (view/update orders)
   - Add/Edit Products
   - QR Code Generator
   - All other admin features

### **Logout**
- Click the **logout button** (LogOut icon) in navbar when logged in
- Clears token and redirects to customer view

---

## 📝 Files Modified/Created

### **New Files**
| File | Purpose |
|------|---------|
| `models/Admin.js` | Admin database model with bcrypt |
| `routes/auth.js` | Authentication endpoints |
| `src/components/AdminLogin.jsx` | Login UI component |

### **Modified Files**
| File | Changes |
|------|---------|
| `models/index.js` | Imported Admin model and exported it |
| `server.js` | Added auth routes import |
| `.env` | Added JWT_SECRET |
| `src/App.jsx` | Added auth state, login handlers, route protection |
| `src/components/Navbar.jsx` | Conditional admin tabs, logout button |

---

## 🔒 Security Features

✅ **Password Hashing** - Uses bcrypt with salt rounds (10)
✅ **JWT Tokens** - Expire after 7 days
✅ **Token Storage** - Stored in localStorage (consider httpOnly cookies for production)
✅ **Route Protection** - Admin routes require valid token
✅ **Customer View** - Non-authenticated users see product menu only

---

## 🔧 Testing the System

### **1. Start the app**
```bash
npm run dev
```

### **2. Test Customer View (No Login Required)**
- ✅ Browse menu
- ✅ Add to cart
- ✅ Place order
- ✅ ❌ Can't access Kitchen/Add Product/QR tabs

### **3. Test Admin Login**
- Click "Kitchen Deck" tab
- See AdminLogin form
- Enter: `admin` / `admin`
- Click "Sign In"
- ✅ Should redirect to Kitchen Dashboard
- ✅ All admin tabs now visible
- ✅ Admin username shows in navbar

### **4. Test Protected Routes**
- Try accessing `/add-product` or `/qr-generator` while logged in
- ✅ Should work
- Logout
- ✅ Clicking these tabs should show login form

---

## 🐛 Backend Implementation Details

### **Login Endpoint Response**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

### **JWT Token Payload**
```json
{
  "id": 1,
  "username": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### **Using Token in Protected Routes**
```javascript
// Send token in Authorization header
fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})
```

---

## 📦 Dependencies Installed

```json
{
  "bcrypt": "^6.0.0",     // Password hashing
  "jsonwebtoken": "^9.x"  // JWT token generation/verification
}
```

---

## ⚙️ Environment Variables

Update `.env` for production:
```env
JWT_SECRET=your-very-secure-secret-key-here-min-32-chars
JWT_EXPIRY=7d
```

---

## 🚨 Production Checklist

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Move from `localStorage` to httpOnly cookies
- [ ] Add HTTPS/SSL
- [ ] Implement password strength validation
- [ ] Add rate limiting on login endpoint
- [ ] Add email verification for admin registration
- [ ] Set up admin role hierarchy (superadmin, manager, staff)
- [ ] Add audit logs for admin actions
- [ ] Consider adding 2FA (Two-Factor Authentication)

---

## 🆘 Troubleshooting

### **"Cannot find package 'bcrypt'"**
```bash
npm install bcrypt jsonwebtoken
```

### **Login returns 401 Unauthorized**
- Verify credentials in database
- Check JWT_SECRET in .env matches server

### **Token expires and user gets logged out**
- JWT expires after 7 days (configurable in auth.js)
- Clear localStorage and login again

### **CORS errors on login**
- Ensure backend running on same port (5000)
- Check CORS settings in server.js

---

## 📚 Next Steps

1. **Test the implementation** with default credentials (admin/admin)
2. **Create additional admins** via API or registration endpoint
3. **Customize admin roles** (e.g., kitchen staff vs manager)
4. **Add more protected endpoints** using `verifyToken` middleware
5. **Deploy to production** with security updates

---

## 💡 Example: Protecting a Custom Route

```javascript
// In routes/orders.js or any API route
import { verifyToken } from './auth.js';

router.patch('/orders/:id/status', verifyToken, async (req, res) => {
  // Only admins can update order status
  const { newStatus } = req.body;
  // ... update logic
});
```

---

Generated: 2026-06-28
App: BiteQR - Menu Digital
Version: With Admin Auth System
