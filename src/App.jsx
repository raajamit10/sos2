import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserForm from "./pages/UserForm";

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile(data);
    };

    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        color: "#fff"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            session
              ? profile
                ? <Navigate to="/dashboard" />
                : <Navigate to="/profile" />
              : <Login />
          }
        />

        <Route
          path="/profile"
          element={
            session
              ? profile
                ? <Navigate to="/dashboard" />
                : <UserForm />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/dashboard"
          element={
            session
              ? profile
                ? <Dashboard />
                : <Navigate to="/profile" />
              : <Navigate to="/" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;