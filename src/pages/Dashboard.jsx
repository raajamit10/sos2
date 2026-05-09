import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/Dashboard.css";
import SOSButton from "../components/SOSButton";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setProfile(data);
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="dashboard">
      <div className="topbar">
        <h1>🚨 SOS Dashboard</h1>

        <div className="profile-section">
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            👤 Profile
          </button>

          {showProfile && profile && (
            <div className="profile-card">
              <h3>{profile.name}</h3>
              <p>📞 {profile.phone}</p>
              <p>🛡 {profile.guardian_phone}</p>
              <p>🏠 {profile.address}</p>

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sos-center">
        <SOSButton />
      </div>

      <div className="user-panel">
        <h2>🛡 Emergency Protection Active</h2>
        <p>
          Press SOS to send live location + audio alert to emergency contacts.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;