import { useEffect, useState } from "react";

export default function App() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // <-- 控制正在看的事件
  const [choices, setChoices] = useState([]);          // <-- A/B 選擇紀錄
  const [ending, setEnding] = useState(null);

  // 初始化讀取事件資料
  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => setEvents(data.events || []));
  }, []);

  // 選擇 A 或 B
  const handleChoice = (choice) => {
    const updated = [...choices, choice];
    setChoices(updated);

    // 事件全部選完 → 送到後端判斷結局
    if (currentIndex === events.length - 1) {
      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices: updated })
      })
        .then(res => res.json())
        .then(data => setEnding(data.ending));
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 如果還沒讀到事件
  if (!events.length) {
    return <div className="loading">載入劇情中...</div>;
  }

  // 如果有結局 → 顯示結局畫面
  if (ending) {
    return (
      <div className="ending-screen">
        <h1>{ending.title}</h1>
        <p>{ending.text}</p>

        <button onClick={() => {
          setEnding(null);
          setChoices([]);
          setCurrentIndex(0);
        }}>
          重新開始
        </button>
      </div>
    );
  }

  // 顯示目前事件
  const e = events[currentIndex];

  return (
    <div className="story-page">

      <div className="story-card">
        <h2>{e.title}</h2>
        <p>{e.text}</p>

        <div className="options">
          <button onClick={() => handleChoice("A")}>{e.a}</button>
          <button onClick={() => handleChoice("B")}>{e.b}</button>
        </div>

        <div className="progress">{currentIndex + 1} / {events.length}</div>
      </div>

    </div>
  );
}
