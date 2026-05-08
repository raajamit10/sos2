import { supabase } from "./supabase";

export async function signInWithGoogle() {

  console.log("Starting Google Auth");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173/dashboard",
    },
  });

  console.log(data);

  if (error) {
    console.log(error.message);
  }
}