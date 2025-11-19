import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AdminLayout from "../pages/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import ManageUsers from "../pages/Admin/ManageUsers";
import ManageForms from "../pages/Admin/ManageForms";

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
import NotFound from "../pages/NotFound";

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "admin") return <Navigate to="/user/dashboard" />;

  return children;
}

function UserRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/public/:slug" element={<PublicForm />} />

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
       
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      
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
 
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
