import { useState } from "react";

export default function App() {
  const [step, setStep] = useState(0);

  const steps = [
    "歡迎來到互動式劇本教學 Demo！",
    "這裡可以展示二選一事件。",
    "每個事件都會有兩個按鈕讓你選擇！",
    "你可以依照你的教學內容加入故事。",
    "最後會導向不同結局喔～"
  ];

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "40px",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1>互動式劇本教學</h1>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "20px",
          minHeight: "120px",
        }}
      >
        {steps[step]}
      </div>

      <div style={{ marginTop: "30px" }}>
        <button
          style={btn}
          onClick={() => {
            if (step < steps.length - 1) setStep(step + 1);
          }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}

const btn = {
  fontSize: "18px",
  padding: "12px 20px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#ff9eb5",
  color: "white",
  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
};
