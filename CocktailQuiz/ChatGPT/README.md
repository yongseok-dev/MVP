# 조주기능사 칵테일 퀴즈 — MVP 파일 모음

아래 파일들은 바로 복사해서 로컬에서 실행 가능한 최소 기능의 Vue.js CDN 기반 SPA 샘플입니다. 4개의 파일로 구성되어 있습니다:

- `index.html`
- `css/style.css`
- `js/app.js`
- `js/cocktails.json`

---

## index.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>조주기능사 칵테일 퀴즈</title>
    <link rel="stylesheet" href="css/style.css" />
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  </head>
  <body>
    <div id="app" class="app-container">
      <!-- Start Screen -->
      <section v-if="currentScreen === 'start'" class="start-screen">
        <h1 class="title">조주기능사 칵테일 퀴즈</h1>
        <p class="lead">기주 · 기법 · 글라스 · 가니쉬를 빠르게 암기하세요.</p>

        <div class="modes">
          <button @click="startQuiz('all', 10)">전체 10문제</button>
          <button @click="startQuiz('all', 20)">전체 20문제</button>
          <button @click="startQuiz('all', 40)">전체 40문제</button>
        </div>

        <div class="category-list">
          <h3>카테고리별 학습</h3>
          <div class="cats">
            <button v-for="c in categories" :key="c" @click="startQuiz(c, 20)">
              {{ c }}
            </button>
          </div>
        </div>

        <div class="footer-note">
          <small
            >로컬에서 바로 실행: 이 저장소의 `js/cocktails.json`을
            불러옵니다.</small
          >
        </div>
      </section>

      <!-- Quiz Screen -->
      <section v-if="currentScreen === 'quiz'" class="quiz-screen">
        <div class="top-bar">
          <div>문제 {{ currentQuestionIndex + 1 }} / {{ questionCount }}</div>
          <div class="timer" v-if="showTimer">{{ remainingTimeDisplay }}</div>
        </div>

        <div class="progress">
          <div
            class="progress-bar"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>

        <div class="question-card">
          <div class="q-type">문제 유형: {{ currentQuestion.type_ko }}</div>
          <h2 class="q-text">{{ currentQuestion.text }}</h2>

          <div class="choices">
            <button
              v-for="(ch, idx) in currentQuestion.choices"
              :key="idx"
              :class="choiceClass(idx)"
              @click="selectAnswer(idx)"
            >
              <div class="choice-label">
                {{ String.fromCharCode(65 + idx) }}
              </div>
              <div class="choice-text">{{ ch }}</div>
            </button>
          </div>

          <div class="feedback" v-if="showFeedback">
            <div v-if="isCorrect">정답입니다! ✓</div>
            <div v-else>틀렸습니다. 정답: {{ currentQuestion.answerText }}</div>
          </div>

          <div class="controls">
            <button :disabled="!answered" @click="nextQuestion">
              다음 문제
            </button>
            <button class="small" @click="quitToStart">처음으로</button>
          </div>
        </div>
      </section>

      <!-- Result Screen -->
      <section v-if="currentScreen === 'result'" class="result-screen">
        <h2>결과</h2>
        <p>당신의 점수: {{ score }} / {{ questionCount }}</p>
        <p>정답률: {{ Math.round((score/questionCount)*100) }}%</p>

        <div class="result-list">
          <div
            v-for="(r, idx) in results"
            :key="idx"
            class="result-row"
            :class="{ wrong: !r.correct }"
          >
            <div class="r-no">{{ idx + 1 }}.</div>
            <div class="r-q">{{ r.text }}</div>
            <div class="r-your">당신: {{ r.your }}</div>
            <div class="r-ans">정답: {{ r.answer }}</div>
          </div>
        </div>

        <div class="result-actions">
          <button @click="startQuiz(currentCategory, questionCount)">
            같은 설정으로 다시 풀기
          </button>
          <button @click="quitToStart">처음으로</button>
        </div>
      </section>
    </div>

    <script type="module" src="js/app.js"></script>
  </body>
</html>
```

---

## css/style.css

```css
:root {
  --primary: #ff6b6b;
  --accent: #4ecdc4;
  --bg: #f7f7f7;
  --card: #ffffff;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, "Helvetica Neue", Arial;
  background: var(--bg);
  color: #222;
}
.app-container {
  max-width: 900px;
  margin: 24px auto;
  padding: 16px;
}
.title {
  margin: 8px 0;
  font-size: 28px;
  color: var(--primary);
}
.lead {
  margin: 0 0 16px;
}
.start-screen .modes button,
.cats button {
  margin: 6px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 0;
  background: var(--primary);
  color: #fff;
  font-weight: 600;
  min-width: 140px;
}
.category-list {
  margin-top: 18px;
}
.cats button {
  background: var(--accent);
}
.quiz-screen .top-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.progress {
  height: 8px;
  background: #e6e6e6;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--primary));
}
.question-card {
  background: var(--card);
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.q-type {
  font-size: 13px;
  color: #666;
}
.q-text {
  margin: 8px 0 16px;
}
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.choices button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fafafa;
  cursor: pointer;
  min-height: 56px;
}
.choice-label {
  font-weight: 700;
}
.choices button.selected {
  outline: 3px solid rgba(79, 201, 180, 0.18);
}
.choices button.correct {
  background: #e6ffef;
  border-color: #bff1d6;
}
.choices button.wrong {
  background: #ffecec;
  border-color: #ffc7c7;
}
.feedback {
  margin-top: 12px;
  font-weight: 700;
}
.controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.controls button {
  padding: 10px 14px;
  border-radius: 10px;
  border: 0;
  background: var(--primary);
  color: #fff;
}
.controls button.small {
  background: #888;
}
.result-list {
  margin-top: 16px;
}
.result-row {
  display: grid;
  grid-template-columns: 30px 1fr 140px 140px;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: #fff;
  margin-bottom: 6px;
}
.result-row.wrong {
  opacity: 0.9;
}
@media (max-width: 600px) {
  .choices {
    grid-template-columns: 1fr;
  }
  .result-row {
    grid-template-columns: 24px 1fr;
  }
}
```

---

## js/cocktails.json

(샘플: 24개 항목 — 필요하면 40개 전체로 확장하세요)

```json
[
  {
    "id": 1,
    "name": "Margarita",
    "name_ko": "마가리타",
    "base": "데킬라",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["데킬라 45ml", "트리플 섹 15ml", "라임주스 15ml"],
    "garnish": "소금 리밍",
    "tips": "테두리 소금"
  },
  {
    "id": 2,
    "name": "Daiquiri",
    "name_ko": "다이키리",
    "base": "럼",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["화이트 럼 45ml", "라임주스 25ml", "설탕시럽 15ml"],
    "garnish": "라임 슬라이스",
    "tips": "신맛 강조"
  },
  {
    "id": 3,
    "name": "Mojito",
    "name_ko": "모히토",
    "base": "럼",
    "glass": "하이볼",
    "method": "빌드",
    "ingredients": ["화이트 럼 45ml", "라임 1/2", "설탕 2스푼", "민트", "소다"],
    "garnish": "민트 스프링",
    "tips": "민트 으깨기"
  },
  {
    "id": 4,
    "name": "Cosmopolitan",
    "name_ko": "코스모폴리탄",
    "base": "보드카",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": [
      "보드카 40ml",
      "트리플 섹 15ml",
      "크랜베리 주스 30ml",
      "라임주스 10ml"
    ],
    "garnish": "오렌지 필"
  },
  {
    "id": 5,
    "name": "Martini",
    "name_ko": "마티니",
    "base": "진",
    "glass": "칵테일 글라스",
    "method": "스터",
    "ingredients": ["진 60ml", "드라이 베르무트 10ml"],
    "garnish": "올리브 또는 레몬 필",
    "tips": "차갑게"
  },
  {
    "id": 6,
    "name": "Old Fashioned",
    "name_ko": "올드패션드",
    "base": "위스키",
    "glass": "올드패션드 글라스",
    "method": "스터",
    "ingredients": [
      "버번 위스키 60ml",
      "설탕 1티스푼",
      "앵거스투라 비터스 2대시"
    ],
    "garnish": "오렌지 필",
    "tips": "저어주기"
  },
  {
    "id": 7,
    "name": "Manhattan",
    "name_ko": "맨해튼",
    "base": "위스키",
    "glass": "칵테일 글라스",
    "method": "스터",
    "ingredients": [
      "라이 위스키 50ml",
      "스윗 베르무트 20ml",
      "앵거스투라 비터스 2대시"
    ],
    "garnish": "체리"
  },
  {
    "id": 8,
    "name": "Whiskey Sour",
    "name_ko": "위스키 사워",
    "base": "위스키",
    "glass": "올드패션드 글라스",
    "method": "쉐이크",
    "ingredients": [
      "버번 45ml",
      "레몬주스 30ml",
      "설탕시럽 15ml",
      "계란흰자(선택)"
    ],
    "garnish": "체리"
  },
  {
    "id": 9,
    "name": "Negroni",
    "name_ko": "네그로니",
    "base": "진",
    "glass": "올드패션드 글라스",
    "method": "빌드",
    "ingredients": ["진 30ml", "카미파리 30ml", "스윗 베르무트 30ml"],
    "garnish": "오렌지 필"
  },
  {
    "id": 10,
    "name": "Moscow Mule",
    "name_ko": "모스크바 뮬",
    "base": "보드카",
    "glass": "하이볼",
    "method": "빌드",
    "ingredients": ["보드카 45ml", "라임 주스 15ml", "진저비어"],
    "garnish": "라임 웨지"
  },
  {
    "id": 11,
    "name": "Margarita Frozen",
    "name_ko": "프라운 마가리타",
    "base": "데킬라",
    "glass": "플루트/칵테일 글라스",
    "method": "블렌드",
    "ingredients": ["데킬라 45ml", "트리플 섹 15ml", "라임주스 15ml", "얼음"],
    "garnish": "라임"
  },
  {
    "id": 12,
    "name": "Gimlet",
    "name_ko": "김렛",
    "base": "진",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["진 60ml", "라임주스 15ml", "설탕시럽 7ml"],
    "garnish": "라임"
  },
  {
    "id": 13,
    "name": "Long Island Iced Tea",
    "name_ko": "롱아일랜드 아이스티",
    "base": "혼합",
    "glass": "하이볼",
    "method": "빌드",
    "ingredients": [
      "보드카 15ml",
      "럼 15ml",
      "데킬라 15ml",
      "진 15ml",
      "트리플 섹 15ml",
      "콜라"
    ],
    "garnish": "레몬"
  },
  {
    "id": 14,
    "name": "Pina Colada",
    "name_ko": "피냐 콜라다",
    "base": "럼",
    "glass": "하이볼",
    "method": "블렌드",
    "ingredients": [
      "화이트 럼 45ml",
      "코코넛 크림 60ml",
      "파인애플 주스 90ml",
      "얼음"
    ],
    "garnish": "파인애플"
  },
  {
    "id": 15,
    "name": "Bloody Mary",
    "name_ko": "블러디 메리",
    "base": "보드카",
    "glass": "하이볼",
    "method": "빌드",
    "ingredients": [
      "보드카 45ml",
      "토마토 주스",
      "레몬주스",
      "우스터 소스",
      "타바스코"
    ],
    "garnish": "셀러리"
  },
  {
    "id": 16,
    "name": "Sidecar",
    "name_ko": "사이드카",
    "base": "브랜디",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["브랜디 50ml", "트리플 섹 20ml", "레몬주스 20ml"],
    "garnish": "오렌지 필"
  },
  {
    "id": 17,
    "name": "Aperol Spritz",
    "name_ko": "아페롤 스프리츠",
    "base": "와인",
    "glass": "와인 글라스",
    "method": "빌드",
    "ingredients": ["아페롤 60ml", "프로세코", "소다"],
    "garnish": "오렌지"
  },
  {
    "id": 18,
    "name": "Screwdriver",
    "name_ko": "스크류드라이버",
    "base": "보드카",
    "glass": "하이볼",
    "method": "빌드",
    "ingredients": ["보드카 50ml", "오렌지 주스"],
    "garnish": "오렌지"
  },
  {
    "id": 19,
    "name": "Campari & Soda",
    "name_ko": "캄파리 소다",
    "base": "리큐르",
    "glass": "하이볼",
    "method": "빌드",
    "ingredients": ["캄파리", "소다"],
    "garnish": "레몬"
  },
  {
    "id": 20,
    "name": "Tom Collins",
    "name_ko": "톰 콜린스",
    "base": "진",
    "glass": "하이볼",
    "method": "쉐이크",
    "ingredients": ["진 45ml", "레몬주스 30ml", "설탕시럽 15ml", "소다"],
    "garnish": "레몬"
  },
  {
    "id": 21,
    "name": "Korean Soju Cocktail",
    "name_ko": "소주 칵테일",
    "base": "전통주",
    "glass": "하이볼",
    "method": "빌드",
    "ingredients": ["소주", "과일주스"],
    "garnish": "과일"
  },
  {
    "id": 22,
    "name": "Junbug",
    "name_ko": "준벅",
    "base": "리큐르",
    "glass": "하이볼",
    "method": "블렌드",
    "ingredients": ["멜론 리큐르", "바나나 리큐르", "파인애플 주스", "얼음"],
    "garnish": "파인애플"
  },
  {
    "id": 23,
    "name": "Appletini",
    "name_ko": "애플티니",
    "base": "보드카",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["보드카 50ml", "사과 리큐르 30ml", "레몬주스 10ml"],
    "garnish": "애플 슬라이스"
  },
  {
    "id": 24,
    "name": "French 75",
    "name_ko": "프렌치 75",
    "base": "진",
    "glass": "플루트",
    "method": "쉐이크",
    "ingredients": ["진 30ml", "레몬주스 15ml", "설탕시럽 10ml", "샴페인"],
    "garnish": "레몬 필"
  }
]
```

---

## js/app.js

(간단한 핵심 로직: 데이터 로드, 문제 생성, 정답체크, 결과 표시)

```javascript
import cocktails from "./cocktails.json" assert { type: "json" };

const { createApp } = Vue;

createApp({
  data() {
    return {
      cocktails: cocktails,
      currentScreen: "start",
      categories: [
        "진",
        "위스키",
        "럼",
        "보드카",
        "데킬라",
        "브랜디",
        "리큐르",
        "와인",
        "전통주",
      ],

      // quiz state
      currentCategory: "all",
      questionCount: 10,
      pool: [],
      questions: [],
      currentQuestionIndex: 0,
      currentQuestion: null,
      selectedIndex: null,
      showFeedback: false,
      answered: false,
      score: 0,
      results: [],

      // timer (optional)
      showTimer: false,
      remainingTime: 0,
    };
  },
  computed: {
    progressPercent() {
      return (this.currentQuestionIndex / this.questionCount) * 100;
    },
    remainingTimeDisplay() {
      const s = this.remainingTime % 60;
      const m = Math.floor(this.remainingTime / 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    },
  },
  methods: {
    startQuiz(category, count) {
      this.currentCategory = category;
      this.questionCount = count;
      // build pool
      if (category === "all") this.pool = [...this.cocktails];
      else this.pool = this.cocktails.filter((c) => c.base === category);
      // shuffle
      this.pool = this.shuffle(this.pool);
      // generate simple questions
      this.questions = [];
      const n = Math.min(this.pool.length, count);
      for (let i = 0; i < n; i++) {
        const c = this.pool[i];
        const type = this.pickType();
        const q = this.makeQuestion(c, type);
        this.questions.push(q);
      }
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.results = [];
      this.currentScreen = "quiz";
      this.setCurrentQuestion();
    },
    pickType() {
      const types = ["ingredients", "method", "glass", "garnish"];
      return types[Math.floor(Math.random() * types.length)];
    },
    makeQuestion(cocktail, type) {
      const q = { id: cocktail.id, type: type };
      if (type === "ingredients") {
        q.type_ko = "재료";
        q.text = `${cocktail.name_ko} 의 주재료는?`;
        q.answer = cocktail.ingredients[0];
      } else if (type === "method") {
        q.type_ko = "기법";
        q.text = `${cocktail.name_ko} 의 조주 기법은?`;
        q.answer = cocktail.method;
      } else if (type === "glass") {
        q.type_ko = "글라스";
        q.text = `${cocktail.name_ko} 에 사용하는 글라스는?`;
        q.answer = cocktail.glass;
      } else {
        q.type_ko = "가니쉬";
        q.text = `${cocktail.name_ko} 의 장식은?`;
        q.answer = cocktail.garnish || "없음";
      }
      // choices: include correct + 3 random
      const pool = this.cocktails
        .map((x) => {
          if (type === "ingredients")
            return x.ingredients ? x.ingredients[0] : "";
          if (type === "method") return x.method;
          if (type === "glass") return x.glass;
          return x.garnish || "없음";
        })
        .filter(Boolean);
      const choices = this.sampleUnique(pool, 3);
      choices.push(q.answer);
      q.choices = this.shuffle(choices);
      q.answerIndex = q.choices.indexOf(q.answer);
      q.answerText = q.answer;
      return q;
    },
    setCurrentQuestion() {
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.selectedIndex = null;
      this.showFeedback = false;
      this.answered = false;
    },
    selectAnswer(idx) {
      if (this.answered) return;
      this.selectedIndex = idx;
      this.answered = true;
      this.showFeedback = true;
      const q = this.currentQuestion;
      const correct = idx === q.answerIndex;
      if (correct) this.score++;
      this.results.push({
        text: q.text,
        your: q.choices[idx],
        answer: q.answerText,
        correct,
      });
    },
    nextQuestion() {
      if (!this.answered) return alert("답안을 선택하세요");
      if (this.currentQuestionIndex + 1 >= this.questions.length) {
        this.currentScreen = "result";
      } else {
        this.currentQuestionIndex++;
        this.setCurrentQuestion();
      }
    },
    quitToStart() {
      this.currentScreen = "start";
    },
    choiceClass(idx) {
      if (!this.answered) return { "": true };
      const q = this.currentQuestion;
      return {
        selected: this.selectedIndex === idx && !this.showFeedback,
        correct: idx === q.answerIndex,
        wrong: this.selectedIndex === idx && idx !== q.answerIndex,
      };
    },

    // util
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    sampleUnique(pool, n) {
      const s = this.shuffle(pool);
      return s.slice(0, n);
    },
  },
}).mount("#app");
```

---

### 사용법

1. 위 파일들을 같은 폴더 구조로 저장하세요 (`index.html`, `css/style.css`, `js/app.js`, `js/cocktails.json`).
2. 로컬에서 파일을 열어 동작을 확인하세요. (브라우저 보안 정책으로 인해 `import ... from './cocktails.json'`가 로컬 파일에서 막힐 수 있습니다. 그 경우 `app.js` 맨 위에 `fetch('./js/cocktails.json').then(r=>r.json()).then(data=>{ /* init with data */ })` 방식으로 바꿔주세요.)
3. 기능 확장(플래시카드, 로컬스토리지, 타이머 등)은 추가 요청해주시면 다음 단계 프롬프트와 코드를 바로 만들어 드립니다.

---

원하시면 지금 이 파일들을 캔버스에서 코드 편집용으로 분리해 드리거나(각 파일을 별도 코드 문서로), 전체 40개 레시피로 `cocktails.json`을 확장해 드릴게요. 어떤 걸 먼저 도와드릴까요?

완료했어 — 기본 MVP 파일( `index.html`, `css/style.css`, `js/app.js`, `js/cocktails.json` )의 초안 문서를 캔버스에 만들어 뒀어. 🔧✨

무엇을 도와줄까? (선택해줘)

1. `cocktails.json`을 **40개 전체 레시피**로 확장해서 채워줘.
2. 로컬 파일에서 JSON `import` 문제가 생길 수 있으니 **fetch 방식으로 바꾸어준 버전**으로 수정해줘.
3. 플래시카드 모드 / 7분 모의고사(타이머) / 오답노트 / 로컬스토리지 연동 **중 하나**를 바로 구현해줘.
4. 지금 만든 코드 파일을 **각각 별도의 캔버스 문서**(파일별 편집 가능)로 분리해줘.
5. 기타(디자인 변경, PWA 변환, 배포 가이드 등) — 원하는 항목 적어줘.

원하면 바로 (지금) 원하는 작업을 진행해서 코드/파일을 추가·수정해줄게.
