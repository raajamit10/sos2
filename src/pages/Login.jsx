import { supabase } from "../services/supabase";
import "../styles/login.css";

function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      console.log(error);
      alert("Google Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🚨 Safe Signal</h2>
        <p>Emergency SOS Protection System</p>

        <button className="google-btn" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;