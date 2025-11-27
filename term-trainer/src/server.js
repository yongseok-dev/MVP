// src/server.js
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { readJson, writeJson } = require("./db");
const { createUser, loginUser } = require("./auth");

const sessions = new Map(); // ✅ token -> userId 저장

const app = express();
const PORT = 23000;

// JSON body 파싱
app.use(express.json());

// 정적 파일 제공 (나중에 Vue 넣을 public 폴더)
app.use(express.static(path.join(__dirname, "..", "public")));

// Authorization 헤더에서 Bearer 토큰을 읽어 userId 주입
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const [type, token] = authHeader.split(" ");

  if (type === "Bearer" && token && sessions.has(token)) {
    req.userId = sessions.get(token);
  } else {
    req.userId = null;
  }

  next();
}

function isSameDay(iso1, iso2) {
  if (!iso1 || !iso2) return false;
  const d1 = new Date(iso1);
  const d2 = new Date(iso2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
// 🔹 spaced repetition용: 정답/오답에 따라 다음 복습일 설정
function getNextReviewDate(level) {
  const now = new Date();
  // level에 따라 간격 늘리기 (원하면 조정 가능)
  const daysMap = [1, 2, 4, 7, 14, 30]; // level 0~5
  const days = daysMap[Math.min(level, daysMap.length - 1)];
  now.setDate(now.getDate() + days);
  return now.toISOString();
}
// 🔹 term.stats 없거나 오래된 데이터 초기화
function ensureStats(term) {
  if (!term.stats) {
    term.stats = {
      correct: 0,
      wrong: 0,
      level: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
    };
  }
  if (typeof term.stats.level !== "number") {
    term.stats.level = 0;
  }
  return term;
}
// 🔹 오늘 복습해야 할지 여부: nextReviewAt이 지났거나(null이면 신규)
function isDueForReview(term) {
  ensureStats(term);
  if (!term.stats.nextReviewAt) return true; // 아직 스케줄 없으면 바로 복습 대상
  const now = new Date();
  const next = new Date(term.stats.nextReviewAt);
  if (isNaN(next.getTime())) return true;
  return next <= now;
}
// 🔹 정답/오답에 따라 stats 업데이트
function updateTermStats(term, isCorrect) {
  ensureStats(term);

  const now = new Date();
  const nowIso = now.toISOString();

  const alreadyReviewedToday =
    term.stats.lastReviewedAt && isSameDay(term.stats.lastReviewedAt, nowIso);

  // ✅ 정답/오답 카운트는 항상 누적
  if (isCorrect) {
    term.stats.correct += 1;
  } else {
    term.stats.wrong += 1;
  }

  // ✅ "오늘 처음 리뷰하는 경우"에만 level/nextReviewAt 변경
  if (!alreadyReviewedToday) {
    if (isCorrect) {
      term.stats.level = Math.min(term.stats.level + 1, 10);
    } else {
      term.stats.level = Math.max(term.stats.level - 1, 0);
    }
    term.stats.nextReviewAt = getNextReviewDate(term.stats.level);
  }

  // 마지막 리뷰 시각은 항상 갱신
  term.stats.lastReviewedAt = nowIso;
}

app.use(authMiddleware);

// 헬스 체크용 엔드포인트
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is alive" });
});

// 회원가입
app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "username, password는 필수입니다." });
  }

  try {
    const user = await createUser(username, password);
    return res.json({ ok: true, user });
  } catch (err) {
    if (err.code === "USER_EXISTS") {
      return res
        .status(400)
        .json({ ok: false, message: "이미 존재하는 사용자입니다." });
    }
    console.error(err);
    return res.status(500).json({ ok: false, message: "알 수 없는 오류" });
  }
});
// 로그인
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "username, password는 필수입니다." });
  }

  const user = await loginUser(username, password);

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    });
  }

  // 간단한 토큰 발급 (메모리에만 저장)
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, user.id);

  return res.json({
    ok: true,
    token,
    user,
  });
});
// 현재 로그인한 사용자 정보 (토큰 필요)
app.get("/api/auth/me", (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ ok: false, message: "로그인되지 않음" });
  }

  const users = readJson("users.json");
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res
      .status(401)
      .json({ ok: false, message: "사용자를 찾을 수 없음" });
  }

  return res.json({
    ok: true,
    user: { id: user.id, username: user.username, createdAt: user.createdAt },
  });
});

// 용어 목록 조회 (현재는 전체 목록)
app.get("/api/terms", (req, res) => {
  const terms = readJson("terms.json");

  if (!req.userId) {
    // 로그인 안 했으면 일단 전체 다 보여줘도 되고, 빈 배열로 해도 되고
    return res.json(terms);
  }

  // 로그인한 경우: 내 용어만
  const myTerms = terms.filter((t) => t.userId === req.userId);
  res.json(myTerms);
});

// 용어 추가
app.post("/api/terms", (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
  }
  app.get("/api/terms", (req, res) => {
    const terms = readJson("terms.json");

    if (!req.userId) {
      // 로그인 안 했으면 일단 전체 다 보여줘도 되고, 빈 배열로 해도 되고
      return res.json(terms);
    }

    // 로그인한 경우: 내 용어만
    const myTerms = terms.filter((t) => t.userId === req.userId);
    res.json(myTerms);
  });

  const { ko, en, definitionKo, definitionEn, tags } = req.body;

  if (!ko || !en) {
    return res
      .status(400)
      .json({ ok: false, message: "ko, en 은 필수입니다." });
  }

  const terms = readJson("terms.json");

  const newTerm = {
    id: "t_" + (terms.length + 1),
    userId: req.userId,
    ko,
    en,
    definitionKo: definitionKo || "",
    definitionEn: definitionEn || "",
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      correct: 0,
      wrong: 0,
      level: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
    },
  };

  terms.push(newTerm);
  writeJson("terms.json", terms);

  res.json({ ok: true, term: newTerm });
});
// 용어 수정
app.put("/api/terms/:id", (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
  }

  const termId = req.params.id;
  const { ko, en, definitionKo, definitionEn, tags } = req.body;

  if (!ko || !en) {
    return res
      .status(400)
      .json({ ok: false, message: "ko, en 은 필수입니다." });
  }

  const terms = readJson("terms.json");
  const idx = terms.findIndex(
    (t) => t.id === termId && t.userId === req.userId
  );

  if (idx === -1) {
    return res
      .status(404)
      .json({ ok: false, message: "용어를 찾을 수 없습니다." });
  }

  const term = terms[idx];

  term.ko = ko;
  term.en = en;
  term.definitionKo = definitionKo || "";
  term.definitionEn = definitionEn || "";
  term.tags = tags || term.tags || [];
  term.updatedAt = new Date().toISOString();

  terms[idx] = term;
  writeJson("terms.json", terms);

  return res.json({ ok: true, term });
});

// 용어 삭제
app.delete("/api/terms/:id", (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
  }

  const termId = req.params.id;
  const terms = readJson("terms.json");
  const idx = terms.findIndex(
    (t) => t.id === termId && t.userId === req.userId
  );

  if (idx === -1) {
    return res
      .status(404)
      .json({ ok: false, message: "용어를 찾을 수 없습니다." });
  }

  terms.splice(idx, 1);
  writeJson("terms.json", terms);

  return res.json({ ok: true });
});

// 🔹 오늘 복습할 용어 중에서 랜덤으로 몇 개 뽑기
// GET /api/quiz?mode=ko-en&count=10
app.get("/api/quiz", (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
  }

  const mode = req.query.mode === "en-ko" ? "en-ko" : "ko-en";
  const count = parseInt(req.query.count, 10) || 10;

  const allTerms = readJson("terms.json");
  const myTerms = allTerms.filter((t) => t.userId === req.userId);

  const dueTerms = myTerms.filter(isDueForReview);

  // 랜덤 셔플
  dueTerms.sort(() => Math.random() - 0.5);

  const selected = dueTerms.slice(0, count).map((t) => ({
    id: t.id,
    ko: t.ko,
    en: t.en,
    mode,
  }));

  return res.json({
    ok: true,
    mode,
    totalDue: dueTerms.length,
    count: selected.length,
    terms: selected,
  });
});
// 🔹 정답 제출: stats 업데이트 + 다음 복습일 계산
// POST /api/quiz/answer
// body: { termId, mode, userAnswer }
app.post("/api/quiz/answer", (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ ok: false, message: "로그인이 필요합니다." });
  }

  const { termId, mode, userAnswer } = req.body;

  if (!termId || !mode || typeof userAnswer !== "string") {
    return res
      .status(400)
      .json({ ok: false, message: "termId, mode, userAnswer는 필수입니다." });
  }

  const allTerms = readJson("terms.json");
  const idx = allTerms.findIndex(
    (t) => t.id === termId && t.userId === req.userId
  );

  if (idx === -1) {
    return res
      .status(404)
      .json({ ok: false, message: "용어를 찾을 수 없습니다." });
  }

  const term = allTerms[idx];

  const normalizedAnswer = (userAnswer || "").trim().toLowerCase();
  const correctAnswer =
    mode === "en-ko" ? (term.ko || "").trim() : (term.en || "").trim(); // 기본 ko-en

  const normalizedCorrect = correctAnswer.toLowerCase();

  const isCorrect = normalizedAnswer === normalizedCorrect;

  // stats 업데이트
  updateTermStats(term, isCorrect);
  term.updatedAt = new Date().toISOString();

  allTerms[idx] = term;
  writeJson("terms.json", allTerms);

  return res.json({
    ok: true,
    correct: isCorrect,
    correctAnswer: correctAnswer,
    stats: term.stats,
    definitionKo: term.definitionKo || "",
    definitionEn: term.definitionEn || "",
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
