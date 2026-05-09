import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

function SOSButton() {
  const [countdown, setCountdown] = useState(null);
  const [sending, setSending] = useState(false);

  const timeoutRef = useRef(null);

  // START COUNTDOWN
  const startSOS = () => {
    if (countdown !== null || sending) return;
    setCountdown(5);
  };

  // SEND SOS
  const sendSOS = async () => {
    setSending(true);

    try {
      // GET USER
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User not logged in");
        setSending(false);
        setCountdown(null);
        return;
      }

      // GET PROFILE
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.log(profileError);
        alert("Failed to fetch profile");
        setSending(false);
        setCountdown(null);
        return;
      }

      // CHECK GEOLOCATION
      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        setSending(false);
        setCountdown(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // MICROPHONE ACCESS
          let stream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
          } catch (err) {
            console.log(err);
            alert("Microphone permission denied");
            setSending(false);
            setCountdown(null);
            return;
          }

          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.start();

          // RECORD FOR 20 SECONDS
          timeoutRef.current = setTimeout(async () => {
            mediaRecorder.stop();

            mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, {
                type: "audio/webm",
              });

              const fileName = `${Date.now()}.webm`;

              // UPLOAD AUDIO
              const { error: uploadError } = await supabase.storage
                .from("recordings")
                .upload(fileName, audioBlob);

              if (uploadError) {
                console.log(uploadError);
                alert("Audio upload failed");
                setSending(false);
                return;
              }

              // GET PUBLIC URL (FIXED)
              const { data } = supabase.storage
                .from("recordings")
                .getPublicUrl(fileName);

              const publicUrl = data.publicUrl;

              // SAVE SOS ALERT
              const { error } = await supabase.from("sos_alerts").insert([
                {
                  user_id: user.id,
                  name: profile.name,
                  phone: profile.phone,
                  guardian_phone: profile.guardian_phone,
                  address: profile.address,
                  latitude,
                  longitude,
                  audio_url: publicUrl,
                  status: "active",
                },
              ]);

              if (error) {
                console.log(error);
                alert("Failed to send SOS");
                setSending(false);
                return;
              }

              alert("🚨 SOS Sent Successfully");

              setCountdown(null);
              setSending(false);

              // STOP MIC
              stream.getTracks().forEach((track) => track.stop());
            };
          }, 20000);
        },
        (error) => {
          console.log(error);
          alert("Location access denied");
          setSending(false);
          setCountdown(null);
        }
      );
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
      setSending(false);
      setCountdown(null);
    }
  };

  // COUNTDOWN EFFECT
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      sendSOS();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // CANCEL SOS
  const cancelSOS = () => {
    setCountdown(null);

    // clear recording timer if running
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setSending(false);
  };

  return (
    <div className="sos-wrapper">
      <button
        className="sos-button"
        onClick={startSOS}
        disabled={sending}
      >
        {sending
          ? "Recording..."
          : countdown !== null
          ? countdown
          : "SOS"}
      </button>

      {countdown !== null && (
        <button className="cancel-btn" onClick={cancelSOS}>
          Cancel
        </button>
      )}
    </div>
  );
}

export default SOSButton;