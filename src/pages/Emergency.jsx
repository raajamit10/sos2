function Emergency() {
  return (
    <div className="h-screen bg-red-700 flex flex-col items-center justify-center text-white">

      <h1 className="text-6xl font-bold mb-6 animate-pulse">
        EMERGENCY
      </h1>

      <p className="text-xl mb-8">
        SOS Alert Activated
      </p>

      <div className="w-52 h-52 rounded-full border-8 border-white animate-ping absolute opacity-20"></div>

      <button
        className="
          bg-black
          px-8
          py-4
          rounded-2xl
          text-lg
          font-semibold
          z-10
        "
      >
        Stop Alert
      </button>

    </div>
  );
}

export default Emergency;