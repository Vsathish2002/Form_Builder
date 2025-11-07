import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import UserDashboard from '../pages/Dashboard/UserDashboard';
import CreateForm from '../pages/Forms/CreateForm';
import EditForm from '../pages/Forms/EditForm';
import FormDetails from '../pages/Forms/FormDetails';
import FormResponses from '../pages/Forms/FormResponses';
import PublicForm from '../pages/Forms/PublicForm';
import MyForms from '../pages/Forms/MyForms'; // <-- Import MyForms
import ProfilePage from '../pages/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/create" element={<CreateForm />} />
      <Route path="/edit/:id" element={<EditForm />} />
      <Route path="/forms/:id" element={<FormDetails />} />
      <Route path="/forms/:id/responses" element={<FormResponses />} />
      <Route path="/public/:slug" element={<PublicForm />} />
      <Route path="/my-forms" element={<MyForms />} /> {/* <-- Add this route */}
      <Route path="/profile" element={<ProfilePage />} />

    </Routes>
  );
}
