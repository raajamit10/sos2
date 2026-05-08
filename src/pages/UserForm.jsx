import { useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/UserForm.css";

function UserForm() {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    guardian_phone: "",
    address: "",
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("No user found");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          name: form.name,
          phone: form.phone,
          guardian_phone: form.guardian_phone,
          address: form.address,
        });

      if (error) {
        console.log(error);
        alert(error.message);
        setLoading(false);
        return;
      }

      alert("Profile Saved 🚀");

      window.location.href = "/dashboard";

    } catch (err) {

      console.log(err);
      alert("Something went wrong");

    }

    setLoading(false);
  };

  return (
    <div className="login-container">

      <form
        className="login-box"
        onSubmit={handleSubmit}
      >

        <h2>🧍 Complete Profile</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="guardian_phone"
          placeholder="Guardian Phone Number"
          value={form.guardian_phone}
          onChange={handleChange}
          required
        />

        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <button type="submit">

          {loading
            ? "Saving..."
            : "Continue"}

        </button>

      </form>

    </div>
  );
}

export default UserForm;