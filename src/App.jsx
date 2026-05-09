import { useEffect, useState } from "react";
console.log("TEST UPDATE");
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserForm from "./pages/UserForm";

function App() {

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // AUTH SESSION
  useEffect(() => {

    supabase.auth.getSession().then(
      ({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      }
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();

  }, []);

  // FETCH PROFILE
  useEffect(() => {

    const fetchProfile = async () => {

      if (!session?.user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        setProfile(null);
        return;
      }

      setProfile(data);
    };

    fetchProfile();

  }, [session]);

  // LOADING SCREEN
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
          color: "#fff",
          fontSize: "22px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={
            session ? (
              profile ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/profile" />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            session ? (
              profile ? (
                <Navigate to="/dashboard" />
              ) : (
                <UserForm />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            session ? (
              profile ? (
                <Dashboard />
              ) : (
                <Navigate to="/profile" />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;