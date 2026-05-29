# Authentication & Navigation - Quick Reference

## 🚀 Quick Start

### **1. Run the App:**
```bash
npm run dev
```

### **2. Visit:**
```
http://localhost:3000
```

### **3. Create Account:**
- Click "Get Started Free"
- Fill form → Create Account
- Auto-login → Redirected to /home

---

## 📍 Routes

### **Public:**
- `/` - Landing page
- `/login` - Login
- `/signup` - Signup

### **Protected:**
- `/home` - Main app
- `/dashboard` - Travel board
- `/explore` - Explore
- `/my-trips` - My trips
- `/mood-boards` - Mood boards
- `/saved` - Saved places
- `/profile` - Profile
- `/settings` - Settings

---

## 🔐 Authentication

### **Signup:**
```typescript
const { signup } = useAuthStore();
await signup(name, email, password);
```

### **Login:**
```typescript
const { login } = useAuthStore();
await login(email, password);
```

### **Logout:**
```typescript
const { logout } = useAuthStore();
logout();
```

### **Check Auth:**
```typescript
const { user, isAuthenticated } = useAuthStore();
```

---

## 🛡️ Protect a Route

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

---

## 🎨 Navigation

### **Desktop:**
- Logo + 5 nav links
- Search bar
- Notifications
- User dropdown

### **Mobile:**
- Hamburger menu
- Drawer navigation
- Mobile search

### **Active Link:**
- Automatic highlighting
- Animated indicator

---

## 📁 Key Files

**Auth:**
- `lib/auth.ts` - Auth service
- `store/useAuthStore.ts` - Auth state
- `components/ProtectedRoute.tsx` - Route protection

**Pages:**
- `app/page.tsx` - Landing
- `app/login/page.tsx` - Login
- `app/signup/page.tsx` - Signup
- `app/home/page.tsx` - Main app

**Components:**
- `components/Navbar.tsx` - Navigation

---

## ✅ Features

✅ Login & Signup pages  
✅ Form validation  
✅ Protected routes  
✅ Navigation bar  
✅ User dropdown  
✅ Mobile responsive  
✅ Dark luxury theme  
✅ Smooth animations  
✅ Toast notifications  
✅ Session persistence  

---

## 🧪 Test Flow

1. Visit `/` → See landing page
2. Click "Get Started Free" → Go to `/signup`
3. Create account → Auto-login → Go to `/home`
4. Use navigation → Access protected pages
5. Click avatar → See dropdown
6. Click "Logout" → Go to `/`
7. Try accessing `/home` → Redirect to `/login`
8. Login → Go to `/home`

---

## 🎯 Status

**✅ Complete & Production Ready!**

All authentication and navigation features implemented and tested.
