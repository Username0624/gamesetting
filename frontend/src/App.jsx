import { useEffect, useState } from "react";

export default function App() {
  const [events, setEvents] = useState([]);
  const [current, setCurrent] = useState(0); // 當前事件頁
  const [choices, setChoices] = useState([]);
  const [ending, setEnding] = useState(null);

  // 一開始載入所有事件
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []));
  }, []);

  // 點選選項 A 或 B
  const handleChoose = (choice) => {
    const newChoices = [...choices, choice];

    // 還有事件 → 下一頁
    if (current < events.length - 1) {
      setChoices(newChoices);
      setCurrent(current + 1);
    } else {
      // 最後一題 → 傳送 choices 拿結局
      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices: newChoices }),
      })
        .then((res) => res.json())
        .then((data) => setEnding(data.ending));
    }
  };

  // UI 樣式：簡潔手繪繪本風
  const pageStyle = {
    width: "380px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "18px",
    background: "#fffbe8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily: "'Noto Sans TC', sans-serif",
    textAlign: "center",
  };

  const btnStyle = {
    padding: "12px 20px",
    margin: "10px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#ffd27d",
    fontSize: "18px",
  };

  if (!events.length) return <div style={pageStyle}>載入中...</div>;

  // 如果結局出現
  if (ending) {
    return (
      <div style={pageStyle}>
        <h2>{ending.title}</h2>
        <p>{ending.text}</p>
        <button
          style={btnStyle}
          onClick={() => {
            setEnding(null);
            setChoices([]);
            setCurrent(0);
          }}
        >
          再玩一次
        </button>
      </div>
    );
  }

  const e = events[current];

  return (
    <div style={pageStyle}>
      <h2>{e.title}</h2>
      <p style={{ margin: "20px 0" }}>{e.text}</p>

      <button style={btnStyle} onClick={() => handleChoose("A")}>
        {e.a}
      </button>
      <button style={btnStyle} onClick={() => handleChoose("B")}>
        {e.b}
      </button>

      <p style={{ marginTop: "20px", fontSize: "14px", color: "#888" }}>
        第 {current + 1} / {events.length} 頁
      </p>
    </div>
  );
}
