import { useState, useEffect } from "react";

function Countdown({ initialTime = 5 * 60, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Reset timer whenever resetKey changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [resetKey, initialTime]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: "600",
        color: "white",
        backgroundColor: "#1d4ed8",
        padding: "4px 10px",
        borderRadius: "20px",
        display: "inline-block",
        minWidth: "55px",
        textAlign: "center",
      }}
    >
      {minutes}:{seconds}
    </span>
  );
}

export default Countdown;
