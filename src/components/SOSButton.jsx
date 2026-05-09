import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

function SOSButton() {
  const [countdown, setCountdown] = useState(null);
  const [sending, setSending] = useState(false);
  const timeoutRef = useRef(null);

  const startSOS = () => {
    if (countdown !== null || sending) return;
    setCountdown(5);
  };

  const cancelSOS = () => {
    setCountdown(null);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setSending(false);
  };

  const sendSOS = async () => {
    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSending(false);
        setCountdown(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          let stream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch {
            alert("Mic denied");
            setSending(false);
            setCountdown(null);
            return;
          }

          const recorder = new MediaRecorder(stream);
          const chunks = [];

          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.start();

          timeoutRef.current = setTimeout(async () => {
            recorder.stop();

            recorder.onstop = async () => {
              const blob = new Blob(chunks, { type: "audio/webm" });
              const fileName = `${Date.now()}.webm`;

              await supabase.storage
                .from("recordings")
                .upload(fileName, blob);

              const { data } = supabase.storage
                .from("recordings")
                .getPublicUrl(fileName);

              const audio_url = data.publicUrl;

              await supabase.from("sos_alerts").insert([
                {
                  user_id: user.id,
                  name: profile?.name,
                  phone: profile?.phone,
                  guardian_phone: profile?.guardian_phone,
                  address: profile?.address,
                  latitude,
                  longitude,
                  audio_url,
                  status: "active",
                },
              ]);

              alert("🚨 SOS SENT");

              setSending(false);
              setCountdown(null);

              stream.getTracks().forEach(t => t.stop());
            };
          }, 20000);
        }
      );
    } catch (err) {
      console.log(err);
      setSending(false);
      setCountdown(null);
    }
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      sendSOS();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div>
      <button onClick={startSOS} disabled={sending}>
        {sending ? "Sending..." : countdown !== null ? countdown : "SOS"}
      </button>

      {countdown !== null && (
        <button onClick={cancelSOS}>Cancel</button>
      )}
    </div>
  );
}

export default SOSButton;