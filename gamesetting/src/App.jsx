import React, { useState } from "react";

/*
  劇情雛形 React App
  - 文字冒險風（A 類）
  - 特性：
    * mod 標記（我受夠了的思想）由開關控制
    * 書店標籤 (奈老師有沒有來)
    * 右下兩個正方形為人物圖（可點開查看說明）
    * 左下道具欄可展開/關閉
    * 中下圓形「下一步」按鈕：必須先選選項才會跳場景
    * 左邊回退按鈕：有剩餘次數（預設 3），每次回退 -1，0 隱藏並把下一步置中
    * 可重新開始（Reset）
    * 初始道具：我受夠了 (數量1，不會消失)
    * 事件與分支依你提供的文本簡化與實作
*/

function App() {
  // ---------- 全域狀態 ----------
  // 場景堆疊（用於回退）
  const [history, setHistory] = useState(["letMeThink"]); // 起始事件 key
  const currentSceneKey = history[history.length - 1];

  // 選中的下一個場景（按選項後會設定，必須按 Next 才跳）
  const [pendingNext, setPendingNext] = useState(null);

  // 回退剩餘次數（每局可用三次，Reset 時會重設）
  const [backCount, setBackCount] = useState(3);

  // 道具欄開關
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // 道具：物件 map -> { qty, desc, persistent (bool) }
  const [items, setItems] = useState({
    "我受夠了": {
      qty: 1,
      desc: "狗蘇丹勞資要你不得豪似（初始道具，不會消失）",
      persistent: true
    }
    // 後續可加入 "書中的字條"
  });

  // 人物資訊（右下兩格）
  const characters = {
    naito: {
      name: "奈費勒",
      img: "/char1.png", // 請把你自己的 png 放到 public/char1.png
      desc:
        "奈費勒：冷峻、語帶嘲諷，但腦子很靈活。數值（示意）：熱情 +2、模糊的情感 +1"
    },
    protagonist: {
      name: "你",
      img: "/char2.png", // public/char2.png
      desc: "主角：對奈費勒既厭惡又好奇，故事推動者。"
    }
  };

  // 人物資訊 Modal 開關與目標人物 key
  const [charModal, setCharModal] = useState({ open: false, key: null });

  // mod 標誌（"我受夠了的思想"）作為是否啟用本 mod 的標記
  const [modEnabled, setModEnabled] = useState(false);
  const [modThought, setModThought] = useState(false); // 當觸發「尋思我受夠了思潮」時設 true

  // 書店是否有奈老師（標籤）
  const [naitoAtBookstore, setNaitoAtBookstore] = useState(true);

  // 用來記錄在「為什麼不問問反對三呢？」階段選了哪本書（用以決定字條說明）
  const [chosenBook, setChosenBook] = useState(null);

  // ---------- 場景資料 ----------
  // 每個 scene: { title, text, choices: [{ text, next, action? }], auto? }
  // 注意：按選項只是 setPendingNext，不會直接跳，必須按 Next
  const scenes = {
    // 起點：讓俺尋思（你在書店看見奈）
    letMeThink: {
      title: "讓俺尋思",
      text:
        "你在垂釣者書店偶然看見了奈費勒，但他似乎沒注意到你。雖然這傢伙那張嘴很討人厭，但你不得不承認，他的腦子一直都比你好。或許我可以做點什麼?",
      choices: [
        {
          text: "我受夠了!",
          next: "whyNotAsk",
          // 若選這個，直接跳到「為什麼不問問反對三呢？」（符合你的規格）
          action: () => {
            // 此路徑也可觸發 modThought 之類的效果，但我們把實際觸發放在 Next 時執行
          }
        },
        {
          text: "誰鳥他啊!",
          next: "enemyEncounter"
        }
      ]
    },

    // 冤家路窄（看到奈在翻書）
    enemyEncounter: {
      title: "冤家路窄",
      text:
        "你在垂釣者書店偶然看見了奈費勒。那時,他正低頭翻閱著一本古書。你還沒決定好是該對他冷嘲熱諷還是視而不見,他就率先發現了你,接著就像看到了什麽臟東西似的,皺著眉拂袖而去,留下了那本剛剛被翻開的書。你瞥見封面上的標題，叫做《虛偽的自由》……………………",
      choices: [
        {
          text: "這是什麽",
          next: "meeting",
          action: () => {
            // 會在 Next 時給予 道具 "書中的字條"（描述依情境）
            // 在 this path（冤家路窄） => 描述: 上面寫著一處頗為偏僻的可疑地址……
            setItems(prev => ({
              ...prev,
              "書中的字條": {
                qty: 1,
                desc: "上面寫著一處頗為偏僻的可疑地址……（來源：冤家路窄）",
                persistent: true
              }
            }));
          }
        },
        {
          text: "狗都不看",
          next: "end_coward"
        }
      ]
    },

    // 為什麼不問問反對三呢？
    whyNotAsk: {
      title: "為什麼不問問反對三呢？",
      text:
        "你真的受夠這個狗蘇丹的狗屎遊戲了，但你可憐的智力，並不夠支撐你想出解決的方法。不過沒關係，你有外掛。你的外掛大概是瘋了，竟然問你：為什麼不問問那個永遠能反駁你的政敵呢？你百般糾結的寫了張希望私下見面聊聊的紙條，並打算在政敵困惑的目光中把它夾在書裡避免公開交流。",
      choices: [
        {
          text: "如何取悅你的愛人",
          next: "whyNotAsk_after",
          action: () => {
            setChosenBook("如何取悅你的愛人");
          }
        },
        {
          text: "虛偽的自由",
          next: "whyNotAsk_after",
          action: () => {
            setChosenBook("虛偽的自由");
          }
        },
        {
          text: "宿敵與摯友",
          next: "whyNotAsk_after",
          action: () => {
            setChosenBook("宿敵與摯友");
          }
        }
      ]
    },

    // 選完書之後的統一下一事件（回信 / 接下來會進入 密會）
    whyNotAsk_after: {
      title: "回信",
      text:
        "你把字條夾進了書裡，心裡忐忑地等待……（無論你選哪本書，下一步都是前往密會）",
      choices: [
        {
          text: "繼續（前往密會）",
          next: "meeting",
          action: () => {
            // 根據 chosenBook 設定 道具"書中的字條" 的描述
            if (chosenBook) {
              let desc = "";
              if (chosenBook === "如何取悅你的愛人") {
                desc =
                  "上面寫著一處頗為偏僻的地址，底下還有一句：我只給你一天的時間";
              } else if (chosenBook === "虛偽的自由") {
                desc =
                  "上面寫著一處頗為偏僻的可疑地址……（來自 虛偽的自由）";
              } else if (chosenBook === "宿敵與摯友") {
                desc =
                  "上面寫著一處頗為偏僻的可疑地址……角落還有幾個小字：愛來不來";
              }
              setItems(prev => ({
                ...prev,
                "書中的字條": {
                  qty: 1,
                  desc,
                  persistent: true
                }
              }));
            }
          }
        }
      ]
    },

    // 密會
    meeting: {
      title: "密會",
      text:
        "這處宅邸遠離鬧市、遠離人群,清淨得像是荒廢了一般。奈費勒坐在屋簷和樹蔭下安靜地看書,身邊沒有任何僕人或者侍從。幽暗的樹蔭下,正適合發生些為白日所不容的事。",
      choices: [
        {
          text: "謝謝 正愁沒人消卡",
          next: "end_enemyline",
          action: () => {
            // 可以根據道具與數值決定文本差異，這裡簡化
          }
        },
        {
          text: "我是來談正事的",
          next: "end_talk"
        },
        {
          text: "雖然是來談正事的但是除此之外……（若選書是《如何取悅你的愛人》且時機正確，進入走腎）",
          next: "end_erotic",
          // 僅當選擇的書是 '如何取悅你的愛人' 時，此選項文本會有效果（程式上不強制）
        }
      ]
    },

    // 各種結局（簡化）
    end_coward: {
      title: "結局：膽小鬼",
      text: "你逃出了書店，但永遠不知道寶箱裡藏著什麼……（遊戲結束）",
      choices: [
        { text: "重新開始", next: "letMeThink", action: () => resetGame() }
      ]
    },
    end_hero: {
      title: "結局：龍之勇者",
      text: "（示例結局）你成為了傳說中的英雄！（遊戲結束）",
      choices: [{ text: "重新開始", next: "letMeThink", action: () => resetGame() }]
    },
    end_enemyline: {
      title: "結局：大敵線",
      text:
        "他疲憊地闔上雙眼,不再與你的欲望對視。然後那一刹那,你隱隱地抓住了什麼——那是某種冀望。從今以後，你們只會是敵人。（遊戲結束）",
      choices: [{ text: "重新開始", next: "letMeThink", action: () => resetGame() }]
    },
    end_talk: {
      title: "談正事",
      text: "你們談了某些政治與策略性的事情，但平淡無奇。遊戲結束。",
      choices: [{ text: "重新開始", next: "letMeThink", action: () => resetGame() }]
    },
    end_erotic: {
      title: "走腎線（示例）",
      text: "（此處略去具體描寫）結果走進了與欲望有關的分支。（遊戲結束）",
      choices: [{ text: "重新開始", next: "letMeThink", action: () => resetGame() }]
    }
  };

  // ---------- 工具函式 ----------
  function pushScene(nextKey) {
    setHistory(prev => [...prev, nextKey]);
    setPendingNext(null);
  }

  function goBack() {
    if (history.length <= 1) return;
    if (backCount <= 0) return;

    // 每次回退 -1，並移除最後一個場景，pendingNext 清空
    setHistory(prev => prev.slice(0, -1));
    setBackCount(c => c - 1);
    setPendingNext(null);
  }

  function resetGame() {
    setHistory(["letMeThink"]);
    setPendingNext(null);
    setBackCount(3);
    setInventoryOpen(false);
    setItems({
      "我受夠了": {
        qty: 1,
        desc: "狗蘇丹勞資要你不得豪似（初始道具，不會消失）",
        persistent: true
      }
    });
    setChosenBook(null);
    setModThought(false);
    // 不重置 modEnabled 與 naitoAtBookstore（視需求）
  }

  // 當按下 Next 時呼叫：這裡會執行選項的 action（若有），然後 pushScene
  function confirmNext() {
    if (!pendingNext) return;
    const nextKey = pendingNext.key;
    // 執行 action（若有）
    if (pendingNext.action) {
      try {
        pendingNext.action();
      } catch (e) {
        console.error("action error:", e);
      }
    }
    // 特殊情況：如果在書店且奈老師在且 modEnabled，按下某個特定選項可以觸發尋思（示例）
    // 但更一致的是：我們在 letMeThink 場景讓 "我受夠了!" 跳 to whyNotAsk（已處理）
    pushScene(nextKey);
  }

  // 取得目前場景物件
  const currentScene = scenes[currentSceneKey];

  // 點選某個選項（只是設 pendingNext）
  function chooseOption(choice) {
    setPendingNext({
      key: choice.next,
      text: choice.text,
      action: choice.action
    });
  }

  // 展示道具（從 items 物件組成 list）
  function renderInventoryList() {
    return Object.entries(items).map(([key, val]) => (
      <div key={key} style={{ marginBottom: 8 }}>
        <strong>{key}</strong> ×{val.qty}
        <div style={{ fontSize: 12, color: "#222" }}>{val.desc}</div>
      </div>
    ));
  }

  // UI 小工具：若在書店位置且奈老師有來，顯示特殊按鈕（"尋思我受夠了思潮"）
  // 這裡我們把「書店情境」對應到 letMeThink 與 enemyEncounter（簡化）
  const isAtBookstore =
    currentSceneKey === "letMeThink" || currentSceneKey === "enemyEncounter";

  // 若奈老師到書店且 modEnabled，可以顯示額外行為按鈕
  function triggerModThought() {
    setModThought(true);
    // 將道具 "我受夠了" 設為已被「尋思」過 (示例：在說明加入)
    setItems(prev => ({
      ...prev,
      "我受夠了": {
        ...prev["我受夠了"],
        desc: prev["我受夠了"].desc + "（已觸發：尋思）"
      }
    }));
  }

  // ---------- JSX ----------
  return (
    <div style={styles.app}>
      {/* Header: 遊戲標題 */}
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>政敵就是妻子啊_事件選項展示</h1>
      </header>

      {/* 主要遊戲區 */}
      <main style={styles.main}>
        {/* 左側：可以顯示場景標籤 / 說明（這裡空著或放小說明） */}
        <aside style={styles.leftColumn}>
          <div style={styles.metaBox}>
            <div>
              <strong>場景：</strong> {currentScene.title}
            </div>
            <div style={{ marginTop: 6 }}>
              <label>
                <input
                  type="checkbox"
                  checked={modEnabled}
                  onChange={e => setModEnabled(e.target.checked)}
                />{" "}
                啟用：我受夠了的思想（mod）
              </label>
            </div>
            <div style={{ marginTop: 6 }}>
              <label>
                <input
                  type="checkbox"
                  checked={naitoAtBookstore}
                  onChange={e => setNaitoAtBookstore(e.target.checked)}
                />{" "}
                書店：奈老師有沒有來
              </label>
            </div>

            <div style={{ marginTop: 8 }}>
              <button onClick={() => setInventoryOpen(o => !o)}>
                {inventoryOpen ? "關閉道具欄" : "開啟道具欄"}
              </button>
            </div>

            {/* Inventory */}
            {inventoryOpen && (
              <div style={{ marginTop: 10 }}>{renderInventoryList()}</div>
            )}
          </div>
        </aside>

        {/* 中間：劇情文字與選項 */}
        <section style={styles.centerColumn}>
          <div style={styles.sceneBox}>
            <h2 style={{ marginTop: 0 }}>{currentScene.title}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{currentScene.text}</p>

            {/* 如果在書店且奈老師在且 modEnabled，顯示「尋思我受夠了思潮」按鈕 */}
            {isAtBookstore && naitoAtBookstore && modEnabled && (
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => {
                    triggerModThought();
                    // 同時自動把 pendingNext 設為 a small notice? 我們選不自動跳，仍需按 Next
                  }}
                >
                  尋思我受夠了思潮（mod）
                </button>
                {modThought && (
                  <div style={{ marginTop: 6, fontSize: 13, color: "#333" }}>
                    你心裡湧起一陣「我受夠了」的念頭……
                  </div>
                )}
              </div>
            )}

            {/* 選項清單（點選只會選定待跳轉） */}
            <div style={{ marginTop: 12 }}>
              {currentScene.choices.map((c, i) => {
                const selected = pendingNext && pendingNext.key === c.next;
                return (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() => {
                        // 執行 choice.action 但不要直接 push 場景（保留在 Next 執行）
                        if (c.action) {
                          // 注意：有些 action 在建立時就直接 setState（例如 we used setItems），
                          // 這裡為了防止早於 Next 就改變場景，我仍允許 action 先做 state 更新（像是取得道具）
                          c.action();
                        }
                        chooseOption(c);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: selected ? "2px solid #333" : "1px solid #999",
                        background: selected ? "#ddd" : "#fff",
                        cursor: "pointer",
                        minWidth: 220,
                        textAlign: "left"
                      }}
                    >
                      {c.text}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 右側：人物方塊（右下區域在整體布局裡靠下） */}
        <aside style={styles.rightColumn}>
          <div style={styles.charBox}>
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>人物</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              {/* 兩個正方形（可放 PNG），點開顯示人物說明 */}
              {Object.entries(characters).map(([key, char]) => (
                <div key={key} style={{ textAlign: "center" }}>
                  <div
                    onClick={() => setCharModal({ open: true, key })}
                    title={char.name}
                    style={{
                      width: 72,
                      height: 72,
                      border: "1px solid #888",
                      borderRadius: 6,
                      overflow: "hidden",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f8f8f8"
                    }}
                  >
                    {/* 如果沒有圖檔，可顯示名稱字首 */}
                    <img
                      src={char.img}
                      alt={char.name}
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                      onError={e => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div style={{ fontSize: 10 }}>{char.name}</div>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{char.name}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* 底部控制列（回退 / 下一步 / 重新開始） */}
      <footer style={styles.footer}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* 回退按鈕（放在下一步的左邊） */}
          {backCount > 0 && (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={goBack}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                回退
              </button>
              <div style={{ fontSize: 12 }}>剩餘次數：{backCount}</div>
            </div>
          )}

          {/* 下一步按鈕：圓形 */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button
              onClick={confirmNext}
              disabled={!pendingNext}
              title={pendingNext ? "按下下一步進入：" + pendingNext.text : "先選擇一個選項"}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "none",
                fontSize: 16,
                cursor: pendingNext ? "pointer" : "not-allowed",
                background: pendingNext ? "#6a9cf8" : "#ccc",
                color: "white"
              }}
            >
              ▶
            </button>
          </div>

          {/* Reset */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => {
                resetGame();
              }}
            >
              重新開始
            </button>
          </div>
        </div>
      </footer>

      {/* 右下：人物資訊 Modal */}
      {charModal.open && (
        <div style={styles.modalBackdrop} onClick={() => setCharModal({ open: false, key: null })}>
          <div
            style={styles.modal}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <h3>{characters[charModal.key].name}</h3>
            <p>{characters[charModal.key].desc}</p>
            <button onClick={() => setCharModal({ open: false, key: null })}>關閉</button>
          </div>
        </div>
      )}

      {/* 小版權 / 說明 */}
      <div style={{ padding: 8, fontSize: 12, textAlign: "center", color: "#666" }}>
        文字冒險雛形 — 你可以修改 scenes 內容、加入圖檔與更多道具。若要我把其轉成可下載的 zip 或加上圖片、進一步注釋教學也可以直接告訴我。
      </div>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "Noto Sans, Arial, sans-serif",
    minHeight: "100vh",
    background: "#f0f4fb",
    color: "#111",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    padding: "12px 20px",
    borderBottom: "1px solid #e0e6f0",
    background: "#ffffff"
  },
  main: {
    display: "grid",
    gridTemplateColumns: "220px 1fr 240px",
    gap: 16,
    padding: 16,
    flex: 1
  },
  leftColumn: {
    // left sidebar
  },
  centerColumn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  rightColumn: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start"
  },
  metaBox: {
    background: "#fff",
    padding: 12,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
  },
  sceneBox: {
    width: "100%",
    maxWidth: 760,
    background: "#fff",
    padding: 18,
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(20,30,70,0.06)"
  },
  charBox: {
    width: "100%",
    background: "#fff",
    padding: 12,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
  },
  footer: {
    padding: 12,
    borderTop: "1px solid #e6ecf8",
    background: "#fff",
    position: "sticky",
    bottom: 0
  },
  modalBackdrop: {
    position: "fixed",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    background: "#fff",
    padding: 18,
    borderRadius: 8,
    maxWidth: 520
  }
};

export default App;
