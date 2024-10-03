// src/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ element: Component, ...rest }) {
  const { currentUser } = useAuth();

  return currentUser ? <Component {...rest} /> : <Navigate to="/" />;
}
