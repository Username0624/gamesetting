# backend/app.py
from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# --- 事件資料（中文）---
EVENTS = [
    {
        "id": 1,
        "title": "事件一：清晨的抉擇",
        "text": "你在清晨醒來，發現桌上有一封信。",
        "a": "打開信件",
        "b": "先去洗臉再看"
    },
    {
        "id": 2,
        "title": "事件二：街角的小店",
        "text": "街角出現一家新開的甜點店。",
        "a": "買一個試試",
        "b": "繼續往前走"
    },
    {
        "id": 3,
        "title": "事件三：陌生的邀請",
        "text": "手機收到一個神秘邀請。",
        "a": "接受邀請",
        "b": "拒絕並保留距離"
    },
    {
        "id": 4,
        "title": "事件四：下雨了",
        "text": "忽然下起小雨。",
        "a": "撐起傘走回家",
        "b": "等雨停再走"
    },
    {
        "id": 5,
        "title": "事件五：最後的決定",
        "text": "有人問你願不願意加入一個計畫。",
        "a": "立即答應",
        "b": "先問清楚再說"
    }
]

# --- 簡單結局判定（與前端相同） ---
def evaluate_ending(choices):
    # choices: list of 'A' or 'B'
    score = sum(1 for c in choices if c == 'A')
    if score <= 2:
        return {"id": "C", "title": "結局C：穩穩的生活", "text": "你選擇保守與穩定，生活平和但少了刺激。"}
    if score == 3:
        return {"id": "B", "title": "結局B：平衡之路", "text": "你的選擇帶來些許驚喜，也保持了安全。"}
    return {"id": "A", "title": "結局A：冒險的終章", "text": "你勇於嘗試，迎來精彩與未知的旅程。"}

# --- API: 取得全部事件（教學用） ---
@app.route("/api/events", methods=["GET"])
def get_events():
    return jsonify({"events": EVENTS})

# --- API: 送出選擇 & 取得結局 ---
@app.route("/api/submit", methods=["POST"])
def submit_choices():
    data = request.get_json() or {}
    choices = data.get("choices")
    if not isinstance(choices, list) or len(choices) != len(EVENTS):
        return jsonify({"error": "請傳入完整的 choices 陣列（長度需為 %d）。" % len(EVENTS)}), 400
    if any(c not in ("A", "B") for c in choices):
        return jsonify({"error": "choices 的每個值只能是 'A' 或 'B'。"}), 400
    ending = evaluate_ending(choices)
    return jsonify({"ending": ending})

# --- Serve frontend static build (index.html + assets) ---
# Root 路由會嘗試回傳 backend/static/index.html（也就是你把 frontend build 放進來的情況）
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    # 如果有 static 下的檔案就回傳，否則顯示簡單 fallback page
    static_dir = app.static_folder
    if path != "" and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(static_dir, "index.html")
    # fallback HTML (開發階段方便測試)
    return """
    <html>
      <head><meta charset="utf-8"><title>互動式劇本教學 - 後端</title></head>
      <body>
        <h2>互動式劇本教學（後端）</h2>
        <p>目前尚未在 <code>/static/index.html</code> 放入前端的 build 檔。請參照 README 把 frontend/build 的內容複製到 backend/static。</p>
        <p>API 範例：</p>
        <ul>
          <li><a href="/api/events">/api/events</a></li>
        </ul>
      </body>
    </html>
    """

if __name__ == "__main__":
    # 本機開發用
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
