// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
// import Login from '../pages/Login';
// import Register from '../pages/Register';
// import ForgotPassword from '../pages/ForgotPassword';
// import AdminDashboard from '../pages/Dashboard/AdminDashboard';
// import UserDashboard from '../pages/Dashboard/UserDashboard';
// import CreateForm from '../pages/Forms/CreateForm';
// import EditForm from '../pages/Forms/EditForm';
// import FormDetails from '../pages/Forms/FormDetails';
// import FormResponses from '../pages/Forms/FormResponses';
// import PublicForm from '../pages/Forms/PublicForm';
// import MyForms from '../pages/Forms/MyForms'; // <-- Import MyForms
// import ProfilePage from '../pages/ProfilePage';

// export default function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/admin/dashboard" element={<AdminDashboard />} />
//       <Route path="/user/dashboard" element={<UserDashboard />} />
//       <Route path="/create" element={<CreateForm />} />
//       <Route path="/edit/:id" element={<EditForm />} />
//       <Route path="/forms/:id" element={<FormDetails />} />
//       <Route path="/forms/:id/responses" element={<FormResponses />} />
//       <Route path="/public/:slug" element={<PublicForm />} />
//       <Route path="/my-forms" element={<MyForms />} /> {/* <-- Add this route */}
//       <Route path="/profile" element={<ProfilePage />} />

//     </Routes>
//   );
// }

// ✅ src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🧑‍💼 Admin Pages
import AdminLayout from "../pages/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import ManageUsers from "../pages/Admin/ManageUsers";
import ManageForms from "../pages/Admin/ManageForms";

// 👤 User Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import UserDashboard from "../pages/Dashboard/UserDashboard";
import CreateForm from "../pages/Forms/CreateForm";
import EditForm from "../pages/Forms/EditForm";
import FormDetails from "../pages/Forms/FormDetails";
import FormResponses from "../pages/Forms/FormResponses";
import PublicForm from "../pages/Forms/PublicForm";
import MyForms from "../pages/Forms/MyForms";
import ProfilePage from "../pages/ProfilePage";

/* ✅ 1️⃣ Admin-only protection */
function AdminRoute({ children }) {
  const { user } = useAuth();

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" />;

  // Not admin → redirect to user dashboard
  if (user.role !== "admin") return <Navigate to="/user/dashboard" />;

  return children;
}

/* ✅ 2️⃣ User-only protection */
function UserRoute({ children }) {
  const { user } = useAuth();

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" />;

  // Admin trying to access user routes → redirect to admin
  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;

  return children;
}

/* ✅ 3️⃣ Main Routing */
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/public/:slug" element={<PublicForm />} />

      {/* 👑 Admin Routes (Protected + Nested under Layout) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="forms" element={<ManageForms />} />
        {/* Default: redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      {/* 👤 User Routes (Protected) */}
      <Route
        path="/user/dashboard"
        element={
          <UserRoute>
            <UserDashboard />
          </UserRoute>
        }
      />
      <Route
        path="/create"
        element={
          <UserRoute>
            <CreateForm />
          </UserRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <UserRoute>
            <EditForm />
          </UserRoute>
        }
      />
      <Route
        path="/forms/:id"
        element={
          <UserRoute>
            <FormDetails />
          </UserRoute>
        }
      />
      <Route
        path="/forms/:id/responses"
        element={
          <UserRoute>
            <FormResponses />
          </UserRoute>
        }
      />
      <Route
        path="/my-forms"
        element={
          <UserRoute>
            <MyForms />
          </UserRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <UserRoute>
            <ProfilePage />
          </UserRoute>
        }
      />

      {/* 🧭 Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
