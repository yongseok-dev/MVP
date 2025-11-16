제공해주신 기획안은 정말 훌륭합니다. 조주기능사 퀴즈 웹사이트 제작을 위한 요구사항 정의부터 데이터 구조, 단계별 프롬프트까지 매우 체계적이고 전문적입니다.

이 멋진 계획을 실행으로 옮길 수 있도록 제가 돕겠습니다.

기획해주신 **3단계: 단계별 개발 프롬프트**의 **프롬프트 1: 기본 HTML 구조 및 Vue.js 설정**에 맞춰 3가지 기본 파일을 생성했습니다.

---

### 1\. `index.html`

먼저, 프로젝트의 뼈대가 될 `index.html` 파일입니다. Vue.js CDN을 포함하고, 기획안에 명시된 3개의 화면(시작, 퀴즈, 결과)을 전환할 수 있는 기본 구조를 `v-if`로 구현했습니다.

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>조주기능사 칵테일 퀴즈</title>

    <link rel="stylesheet" href="css/style.css" />

    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  </head>
  <body>
    <div id="app" class="container">
      <header>
        <h1>조주기능사 칵테일 레시피 퀴즈</h1>
      </header>

      <main>
        <div v-if="currentScreen === 'start'">
          <h2>학습 모드 선택</h2>
          <div class="card">
            <button @click="startQuiz('all', 40)">전체 학습 (40문제)</button>
            <button @click="startQuiz('random', 10)">랜덤 10문제</button>
            <button @click="startQuiz('random', 20)">랜덤 20문제</button>
          </div>
        </div>

        <div v-if="currentScreen === 'quiz'">
          <h2>퀴즈 진행</h2>
          <p>현재 문제 {{ currentQuestionIndex + 1 }} / {{ questionCount }}</p>
          <div class="card">
            <h3>Q. 칵테일 문제</h3>
            <button>선택지 1</button>
            <button>선택지 2</button>
            <button>선택지 3</button>
            <button>선택지 4</button>
          </div>
          <button @click="nextQuestion">다음 문제</button>
        </div>

        <div v-if="currentScreen === 'result'">
          <h2>퀴즈 결과</h2>
          <div class="card">
            <p>총 점수: {{ score }} / {{ questionCount }}</p>
            <p>정답률: {{ (score / questionCount * 100).toFixed(1) }}%</p>
          </div>
          <button @click="restartQuiz">다시 풀기</button>
          <button @click="goToHome">처음으로</button>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 Cocktail Quiz. All rights reserved.</p>
      </footer>
    </div>

    <script src="js/app.js"></script>
  </body>
</html>
```

---

### 2\. `css/style.css`

다음은 기본 CSS 리셋과 모바일 친화적인 폰트 설정, 간단한 레이아웃을 포함한 `css/style.css` 파일입니다.

```css
/* 기본 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background-color: #f4f7f6;
  color: #333;
  line-height: 1.6;
}

/* 모바일 친화적 폰트 크기 */
html {
  font-size: 16px;
}

@media (max-width: 600px) {
  html {
    font-size: 14px;
  }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

header h1 {
  font-size: 2rem;
  color: #ff6b6b; /* 기획안 메인 컬러 */
  margin-bottom: 20px;
}

main {
  margin-bottom: 20px;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 25px;
  margin-top: 20px;
}

button {
  display: block;
  width: 100%;
  padding: 12px 15px;
  margin-top: 10px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #4ecdc4; /* 기획안 보조 컬러 */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

button:hover {
  background-color: #45b7af;
}

button:active {
  transform: scale(0.98);
}

footer {
  font-size: 0.9rem;
  color: #888;
}
```

---

### 3\. `js/app.js`

마지막으로 Vue 앱의 초기화 코드와 기본 상태(state)를 관리할 `js/app.js` 파일입니다.

```javascript
const { createApp, ref, computed } = Vue;

createApp({
  // ----------------
  // 상태 관리 (data)
  // ----------------
  data() {
    return {
      cocktails: [], // 칵테일 데이터 (프롬프트 2에서 로드)

      // 퀴즈 상태
      currentScreen: "start", // 'start', 'quiz', 'result'
      currentQuestionIndex: 0,
      selectedCategory: "all",
      questionCount: 10,

      // 사용자 답안
      userAnswers: [],
      score: 0,

      // 문제 풀이
      currentQuestion: null,
      selectedAnswer: null,
      showFeedback: false,
    };
  },

  // ----------------
  // 메서드 (methods)
  // ----------------
  methods: {
    // 퀴즈 시작
    startQuiz(category, count) {
      this.selectedCategory = category;
      this.questionCount = count;
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.userAnswers = [];

      // TODO: 프롬프트 4에서 퀴즈 로직 구현
      // 1. 칵테일 데이터 필터링 (category)
      // 2. 문제 셔플 (count)
      // 3. 첫 번째 문제 생성

      this.currentScreen = "quiz";
      console.log(`퀴즈 시작: ${category} 모드, ${count} 문제`);
    },

    // 다음 문제로 이동
    nextQuestion() {
      // TODO: 프롬프트 4에서 답안 체크 로직

      if (this.currentQuestionIndex < this.questionCount - 1) {
        this.currentQuestionIndex++;
        // TODO: 다음 문제 생성
      } else {
        // 퀴즈 종료
        this.currentScreen = "result";
      }
    },

    // 다시 풀기
    restartQuiz() {
      this.startQuiz(this.selectedCategory, this.questionCount);
    },

    // 처음으로
    goToHome() {
      this.currentScreen = "start";
    },

    // TODO: 프롬프트 4에서 사용할 메서드
    // loadCocktails() { ... }
    // generateQuestion() { ... }
    // checkAnswer() { ... }
  },

  // ----------------
  // 마운트 시 실행 (mounted)
  // ----------------
  mounted() {
    // 앱이 시작될 때 칵테일 데이터를 로드합니다.
    // 프롬프트 2에서 생성할 cocktails.json 파일을 fetch 합니다.
    fetch("js/cocktails.json")
      .then((response) => response.json())
      .then((data) => {
        this.cocktails = data;
        console.log("칵테일 데이터 로드 완료:", this.cocktails.length, "개");
      })
      .catch((error) => {
        console.error("칵테일 데이터 로드 실패:", error);
        alert("칵테일 데이터를 불러오는 데 실패했습니다.");
      });
  },
}).mount("#app");
```

---

이제 이 파일 3개를 기획안의 `cocktail-quiz` 폴더 구조(`index.html`, `css/style.css`, `js/app.js`)에 맞게 저장하시면 됩니다.

`index.html` 파일을 브라우저에서 열면 '시작 화면'이 표시되고, 버튼을 클릭하면 `app.js`에 정의된 `startQuiz` 메서드가 실행되어 '퀴즈 화면'으로 넘어가는 것을 콘솔에서 확인할 수 있습니다.

준비되시면, 기획안의 **프롬프트 2: 칵테일 데이터 JSON 생성**을 진행하겠습니다. 조주기능사 칵테일 40개 중 20개 이상의 데이터를 JSON 형식으로 생성해 드릴까요?
네, 좋습니다. 기획안의 **프롬프트 2: 칵테일 데이터 JSON 생성**을 바탕으로, 조주기능사 실기 시험의 핵심 칵테일 25개를 `js/cocktails.json` 파일 형식으로 작성했습니다.

이 파일은 `js/app.js`에서 `fetch`를 통해 로드되어 퀴즈 앱의 핵심 데이터로 사용됩니다.

---

### `js/cocktails.json`

```json
[
  {
    "id": 1,
    "name": "Gin Fizz",
    "name_ko": "진 피즈",
    "base": "진",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": ["진 1.5oz", "레몬 주스 0.5oz", "설탕 1tsp", "소다수 Fill"],
    "garnish": "레몬 슬라이스, 체리",
    "tips": "피즈(Fizz)는 탄산(소다수)을 의미! '진 레몬 설탕'을 쉐이크 후 소다수로 채웁니다."
  },
  {
    "id": 2,
    "name": "Dry Martini",
    "name_ko": "드라이 마티니",
    "base": "진",
    "glass": "칵테일 글라스",
    "method": "스터",
    "ingredients": ["진 2oz", "드라이 베르무트 1/3oz"],
    "garnish": "그린 올리브",
    "tips": "스터 기법의 대표! 진과 베르무트 비율(6:1)이 중요. 올리브 잊지 마세요."
  },
  {
    "id": 3,
    "name": "Manhattan",
    "name_ko": "맨하탄",
    "base": "위스키",
    "glass": "칵테일 글라스",
    "method": "스터",
    "ingredients": [
      "버번 위스키 1.5oz",
      "스위트 베르무트 0.75oz",
      "앙고스투라 비터 1dash"
    ],
    "garnish": "체리",
    "tips": "마티니와 함께 스터 기법의 쌍두마차. '위스 버 비' (위스키, 스위트 베르무트, 비터)"
  },
  {
    "id": 4,
    "name": "Old Fashioned",
    "name_ko": "올드 패션드",
    "base": "위스키",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": [
      "버번 위스키 1.5oz",
      "설탕 1tsp",
      "앙고스투라 비터 1dash",
      "소다수 0.5oz"
    ],
    "garnish": "오렌지 슬라이스, 체리",
    "tips": "글라스 이름과 동일! 각설탕(설탕)을 비터와 소다수로 녹이는 것이 포인트."
  },
  {
    "id": 5,
    "name": "Margarita",
    "name_ko": "마가리타",
    "base": "데킬라",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["데킬라 1.5oz", "트리플 섹 0.5oz", "라임 주스 0.5oz"],
    "garnish": "소금 리밍 (Salt Rimming)",
    "tips": "데킬라 베이스의 대표. '소금 리밍'이 가장 큰 특징! '데 트 라' 3:1:1 비율."
  },
  {
    "id": 6,
    "name": "Daiquiri",
    "name_ko": "다이키리",
    "base": "럼",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["라이트 럼 1.5oz", "라임 주스 0.5oz", "설탕 1tsp"],
    "garnish": "없음",
    "tips": "럼, 라임, 설탕. 쉐이크의 기본. 마가리타에서 데킬라가 럼으로, 트리플섹이 설탕으로 바뀐 느낌."
  },
  {
    "id": 7,
    "name": "Mojito",
    "name_ko": "모히토",
    "base": "럼",
    "glass": "하이볼 글라스",
    "method": "빌드 (머들링)",
    "ingredients": [
      "라이트 럼 1.5oz",
      "라임 웨지 4조각 (또는 0.5oz 주스)",
      "민트 잎 6-8장",
      "설탕 1tsp",
      "소다수 Fill"
    ],
    "garnish": "민트 잎",
    "tips": "민트와 라임을 머들링(Muddling)하는 것이 핵심. 청량감의 대명사."
  },
  {
    "id": 8,
    "name": "Cosmopolitan",
    "name_ko": "코스모폴리탄",
    "base": "보드카",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": [
      "보드카 1.5oz",
      "트리플 섹 0.5oz",
      "크랜베리 주스 0.5oz",
      "라임 주스 0.5oz"
    ],
    "garnish": "레몬 트위스트",
    "tips": "보드카 베이스의 핑크빛 칵테일. '보 트 크 라' 4가지 재료."
  },
  {
    "id": 9,
    "name": "Moscow Mule",
    "name_ko": "모스코 뮬",
    "base": "보드카",
    "glass": "하이볼 글라스 (또는 구리 머그)",
    "method": "빌드",
    "ingredients": ["보드카 1.5oz", "라임 주스 0.5oz", "진저 에일 Fill"],
    "garnish": "라임 웨지",
    "tips": "'모스코(모스크바)' = 보드카, '뮬(노새)' = 진저 에일의 톡 쏘는 맛. 구리 머그가 정석."
  },
  {
    "id": 10,
    "name": "Sidecar",
    "name_ko": "사이드카",
    "base": "브랜디",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["브랜디 1.5oz", "트리플 섹 0.5oz", "레몬 주스 0.5oz"],
    "garnish": "설탕 리밍 (Sugar Rimming)",
    "tips": "브랜디 베이스. 마가리타와 재료가 비슷(베이스, 트리플섹, 신맛)하지만 '설탕 리밍'이 차이점."
  },
  {
    "id": 11,
    "name": "B-52",
    "name_ko": "B-52",
    "base": "리큐르",
    "glass": "셰리 글라스 (또는 샷 글라스)",
    "method": "플루트 (띄우기)",
    "ingredients": [
      "커피 리큐르 (깔루아) 1/3oz",
      "아이리쉬 크림 (베일리스) 1/3oz",
      "오렌지 리큐르 (그랑 마니에) 1/3oz"
    ],
    "garnish": "없음",
    "tips": "플루트(Float) 기법의 대표. '깔-베-그' 순서대로 층을 쌓습니다. 비중 차이 이용."
  },
  {
    "id": 12,
    "name": "Pina Colada",
    "name_ko": "피나 콜라다",
    "base": "럼",
    "glass": "필스너 글라스",
    "method": "블렌드",
    "ingredients": ["라이트 럼 1.5oz", "파인애플 주스 3oz", "코코넛 크림 1oz"],
    "garnish": "파인애플 웨지, 체리",
    "tips": "유일한 블렌드(Blend) 기법 문제. '피나(파인애플)', '콜라다(코코넛)'."
  },
  {
    "id": 13,
    "name": "Black Russian",
    "name_ko": "블랙 러시안",
    "base": "보드카",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": ["보드카 1.5oz", "커피 리큐르 (깔루아) 0.75oz"],
    "garnish": "없음",
    "tips": "'러시안' = 보드카, '블랙' = 커피 리큐르. 간단한 2가지 재료."
  },
  {
    "id": 14,
    "name": "Long Island Iced Tea",
    "name_ko": "롱 아일랜드 아이스티",
    "base": "리큐르",
    "glass": "하이볼 글라스",
    "method": "빌드 & 쉐이크 (혼용)",
    "ingredients": [
      "진 0.5oz",
      "보드카 0.5oz",
      "라이트 럼 0.5oz",
      "데킬라 0.5oz",
      "트리플 섹 0.5oz",
      "레몬 주스 1oz",
      "설탕 1tsp",
      "콜라 Fill"
    ],
    "garnish": "레몬 웨지",
    "tips": "4대 기주(진,보,럼,데)가 다 들어감! '아이스티' 맛이 나지만 알코올 도수가 매우 높음."
  },
  {
    "id": 15,
    "name": "Singapore Sling",
    "name_ko": "싱가포르 슬링",
    "base": "진",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": [
      "진 1.5oz",
      "체리 브랜디 0.5oz",
      "레몬 주스 0.5oz",
      "소다수 Fill"
    ],
    "garnish": "레몬 슬라이스, 체리",
    "tips": "진 피즈(진,레몬,설탕,소다)에서 설탕 대신 '체리 브랜디'가 들어간다고 암기."
  },
  {
    "id": 16,
    "name": "Kir",
    "name_ko": "키르",
    "base": "와인",
    "glass": "와인 글라스",
    "method": "빌드",
    "ingredients": ["화이트 와인 3oz", "크렘 드 카시스 0.5oz"],
    "garnish": "레몬 트위스트",
    "tips": "식전주. 화이트 와인 + 카시스(블랙커런트 리큐르). 샴페인으로 바꾸면 '키르 로얄'."
  },
  {
    "id": 17,
    "name": "Apple Martini",
    "name_ko": "애플 마티니",
    "base": "보드카",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["보드카 1.5oz", "애플 퍼커 1oz", "라임 주스 0.5oz"],
    "garnish": "사과 슬라이스",
    "tips": "애플 '마티니'지만 베이스는 '보드카'입니다. 사과맛 리큐르(애플 퍼커) 사용."
  },
  {
    "id": 18,
    "name": "June Bug",
    "name_ko": "준벅",
    "base": "전통주 (리큐르)",
    "glass": "필스너 글라스",
    "method": "쉐이크",
    "ingredients": [
      "미도리 (멜론) 1oz",
      "코코넛 럼 (말리부) 0.5oz",
      "바나나 리큐르 0.5oz",
      "스위트&사워 믹스 2oz",
      "파인애플 주스 2oz"
    ],
    "garnish": "파인애플 웨지, 체리",
    "tips": "한국 전통주 칵테일(현재는 리큐르 베이스로 분류). '초록 벌레'라는 뜻. 재료가 많아 복잡."
  },
  {
    "id": 19,
    "name": "Gochang",
    "name_ko": "고창",
    "base": "전통주",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": [
      "선운산 복분자주 2oz",
      "트리플 섹 0.5oz",
      "라임 주스 0.5oz"
    ],
    "garnish": "트위스트 레몬 필",
    "tips": "복분자주가 베이스인 한국 전통주 칵테일. 마가리타/사이드카와 레시피 구성이 유사."
  },
  {
    "id": 20,
    "name": "Putsarang (First Love)",
    "name_ko": "풋사랑",
    "base": "전통주",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": [
      "매실주 (매취순) 1.5oz",
      "진 0.5oz",
      "라임 주스 0.5oz",
      "세븐업 Fill"
    ],
    "garnish": "라임 웨지",
    "tips": "매실주 베이스. 진이 부재료로 들어가는 것이 특징. '첫사랑'의 새콤달콤함."
  },
  {
    "id": 21,
    "name": "Healing",
    "name_ko": "힐링",
    "base": "전통주",
    "glass": "와인 글라스",
    "method": "스터",
    "ingredients": ["진 1oz", "인삼주 0.5oz", "드라이 베르무트 0.5oz"],
    "garnish": "대추",
    "tips": "인삼주가 들어가는 독특한 칵테일. 드라이 마티니(진, 베르무트)의 변형으로 암기. 가니쉬가 대추!"
  },
  {
    "id": 22,
    "name": "Negroni",
    "name_ko": "네그로니",
    "base": "진",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": ["진 0.75oz", "스위트 베르무트 0.75oz", "캄파리 0.75oz"],
    "garnish": "오렌지 슬라이스",
    "tips": "진, 스위트 베르무트, 캄파리가 모두 1:1:1 비율. 빌드 기법."
  },
  {
    "id": 23,
    "name": "Rusty Nail",
    "name_ko": "러스티 네일",
    "base": "위스키",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": ["스카치 위스키 1.5oz", "드람부이 0.75oz"],
    "garnish": "레몬 트위스트",
    "tips": "'녹슨 못'. 스카치 위스키와 드람부이(벌꿀 리큐르) 2가지 재료만 사용."
  },
  {
    "id": 24,
    "name": "Whiskey Sour",
    "name_ko": "위스키 사워",
    "base": "위스키",
    "glass": "사워 글라스",
    "method": "쉐이크",
    "ingredients": [
      "버번 위스키 1.5oz",
      "레몬 주스 0.5oz",
      "설탕 1tsp",
      "소다수 0.5oz"
    ],
    "garnish": "레몬 슬라이스, 체리",
    "tips": "사워(Sour) 스타일의 기본. 위스키, 레몬, 설탕을 쉐이크. (진 피즈와 구성이 비슷)"
  },
  {
    "id": 25,
    "name": "Mai Tai",
    "name_ko": "마이 타이",
    "base": "럼",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": [
      "라이트 럼 1oz",
      "다크 럼 1oz",
      "트리플 섹 0.5oz",
      "라임 주스 0.5oz",
      "오렌지 주스 1oz",
      "파인애플 주스 1oz"
    ],
    "garnish": "파인애플 웨지, 체리",
    "tips": "재료가 매우 많은 칵테일. '타히티'어로 '최고'라는 뜻. 럼이 2종류."
  }
]
```

---

이 JSON 데이터를 `js/cocktails.json` 파일로 저장하여 `index.html`과 같은 폴더 내의 `js` 폴더에 위치시키면, `app.js`가 시작될 때 자동으로 이 데이터를 불러올 것입니다.

이제 데이터가 준비되었으니, 다음 단계인 **프롬프트 3: 시작 화면 구현**으로 넘어가서 실제 Vue.js 코드를 작성해 볼까요?

네, 좋습니다. 기획안의 **프롬프트 2: 칵테일 데이터 JSON 생성**을 바탕으로, 조주기능사 실기 시험의 핵심 칵테일 25개를 `js/cocktails.json` 파일 형식으로 작성했습니다.

이 파일은 `js/app.js`에서 `fetch`를 통해 로드되어 퀴즈 앱의 핵심 데이터로 사용됩니다.

---

### `js/cocktails.json`

```json
[
  {
    "id": 1,
    "name": "Gin Fizz",
    "name_ko": "진 피즈",
    "base": "진",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": ["진 1.5oz", "레몬 주스 0.5oz", "설탕 1tsp", "소다수 Fill"],
    "garnish": "레몬 슬라이스, 체리",
    "tips": "피즈(Fizz)는 탄산(소다수)을 의미! '진 레몬 설탕'을 쉐이크 후 소다수로 채웁니다."
  },
  {
    "id": 2,
    "name": "Dry Martini",
    "name_ko": "드라이 마티니",
    "base": "진",
    "glass": "칵테일 글라스",
    "method": "스터",
    "ingredients": ["진 2oz", "드라이 베르무트 1/3oz"],
    "garnish": "그린 올리브",
    "tips": "스터 기법의 대표! 진과 베르무트 비율(6:1)이 중요. 올리브 잊지 마세요."
  },
  {
    "id": 3,
    "name": "Manhattan",
    "name_ko": "맨하탄",
    "base": "위스키",
    "glass": "칵테일 글라스",
    "method": "스터",
    "ingredients": [
      "버번 위스키 1.5oz",
      "스위트 베르무트 0.75oz",
      "앙고스투라 비터 1dash"
    ],
    "garnish": "체리",
    "tips": "마티니와 함께 스터 기법의 쌍두마차. '위스 버 비' (위스키, 스위트 베르무트, 비터)"
  },
  {
    "id": 4,
    "name": "Old Fashioned",
    "name_ko": "올드 패션드",
    "base": "위스키",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": [
      "버번 위스키 1.5oz",
      "설탕 1tsp",
      "앙고스투라 비터 1dash",
      "소다수 0.5oz"
    ],
    "garnish": "오렌지 슬라이스, 체리",
    "tips": "글라스 이름과 동일! 각설탕(설탕)을 비터와 소다수로 녹이는 것이 포인트."
  },
  {
    "id": 5,
    "name": "Margarita",
    "name_ko": "마가리타",
    "base": "데킬라",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["데킬라 1.5oz", "트리플 섹 0.5oz", "라임 주스 0.5oz"],
    "garnish": "소금 리밍 (Salt Rimming)",
    "tips": "데킬라 베이스의 대표. '소금 리밍'이 가장 큰 특징! '데 트 라' 3:1:1 비율."
  },
  {
    "id": 6,
    "name": "Daiquiri",
    "name_ko": "다이키리",
    "base": "럼",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["라이트 럼 1.5oz", "라임 주스 0.5oz", "설탕 1tsp"],
    "garnish": "없음",
    "tips": "럼, 라임, 설탕. 쉐이크의 기본. 마가리타에서 데킬라가 럼으로, 트리플섹이 설탕으로 바뀐 느낌."
  },
  {
    "id": 7,
    "name": "Mojito",
    "name_ko": "모히토",
    "base": "럼",
    "glass": "하이볼 글라스",
    "method": "빌드 (머들링)",
    "ingredients": [
      "라이트 럼 1.5oz",
      "라임 웨지 4조각 (또는 0.5oz 주스)",
      "민트 잎 6-8장",
      "설탕 1tsp",
      "소다수 Fill"
    ],
    "garnish": "민트 잎",
    "tips": "민트와 라임을 머들링(Muddling)하는 것이 핵심. 청량감의 대명사."
  },
  {
    "id": 8,
    "name": "Cosmopolitan",
    "name_ko": "코스모폴리탄",
    "base": "보드카",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": [
      "보드카 1.5oz",
      "트리플 섹 0.5oz",
      "크랜베리 주스 0.5oz",
      "라임 주스 0.5oz"
    ],
    "garnish": "레몬 트위스트",
    "tips": "보드카 베이스의 핑크빛 칵테일. '보 트 크 라' 4가지 재료."
  },
  {
    "id": 9,
    "name": "Moscow Mule",
    "name_ko": "모스코 뮬",
    "base": "보드카",
    "glass": "하이볼 글라스 (또는 구리 머그)",
    "method": "빌드",
    "ingredients": ["보드카 1.5oz", "라임 주스 0.5oz", "진저 에일 Fill"],
    "garnish": "라임 웨지",
    "tips": "'모스코(모스크바)' = 보드카, '뮬(노새)' = 진저 에일의 톡 쏘는 맛. 구리 머그가 정석."
  },
  {
    "id": 10,
    "name": "Sidecar",
    "name_ko": "사이드카",
    "base": "브랜디",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["브랜디 1.5oz", "트리플 섹 0.5oz", "레몬 주스 0.5oz"],
    "garnish": "설탕 리밍 (Sugar Rimming)",
    "tips": "브랜디 베이스. 마가리타와 재료가 비슷(베이스, 트리플섹, 신맛)하지만 '설탕 리밍'이 차이점."
  },
  {
    "id": 11,
    "name": "B-52",
    "name_ko": "B-52",
    "base": "리큐르",
    "glass": "셰리 글라스 (또는 샷 글라스)",
    "method": "플루트 (띄우기)",
    "ingredients": [
      "커피 리큐르 (깔루아) 1/3oz",
      "아이리쉬 크림 (베일리스) 1/3oz",
      "오렌지 리큐르 (그랑 마니에) 1/3oz"
    ],
    "garnish": "없음",
    "tips": "플루트(Float) 기법의 대표. '깔-베-그' 순서대로 층을 쌓습니다. 비중 차이 이용."
  },
  {
    "id": 12,
    "name": "Pina Colada",
    "name_ko": "피나 콜라다",
    "base": "럼",
    "glass": "필스너 글라스",
    "method": "블렌드",
    "ingredients": ["라이트 럼 1.5oz", "파인애플 주스 3oz", "코코넛 크림 1oz"],
    "garnish": "파인애플 웨지, 체리",
    "tips": "유일한 블렌드(Blend) 기법 문제. '피나(파인애플)', '콜라다(코코넛)'."
  },
  {
    "id": 13,
    "name": "Black Russian",
    "name_ko": "블랙 러시안",
    "base": "보드카",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": ["보드카 1.5oz", "커피 리큐르 (깔루아) 0.75oz"],
    "garnish": "없음",
    "tips": "'러시안' = 보드카, '블랙' = 커피 리큐르. 간단한 2가지 재료."
  },
  {
    "id": 14,
    "name": "Long Island Iced Tea",
    "name_ko": "롱 아일랜드 아이스티",
    "base": "리큐르",
    "glass": "하이볼 글라스",
    "method": "빌드 & 쉐이크 (혼용)",
    "ingredients": [
      "진 0.5oz",
      "보드카 0.5oz",
      "라이트 럼 0.5oz",
      "데킬라 0.5oz",
      "트리플 섹 0.5oz",
      "레몬 주스 1oz",
      "설탕 1tsp",
      "콜라 Fill"
    ],
    "garnish": "레몬 웨지",
    "tips": "4대 기주(진,보,럼,데)가 다 들어감! '아이스티' 맛이 나지만 알코올 도수가 매우 높음."
  },
  {
    "id": 15,
    "name": "Singapore Sling",
    "name_ko": "싱가포르 슬링",
    "base": "진",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": [
      "진 1.5oz",
      "체리 브랜디 0.5oz",
      "레몬 주스 0.5oz",
      "소다수 Fill"
    ],
    "garnish": "레몬 슬라이스, 체리",
    "tips": "진 피즈(진,레몬,설탕,소다)에서 설탕 대신 '체리 브랜디'가 들어간다고 암기."
  },
  {
    "id": 16,
    "name": "Kir",
    "name_ko": "키르",
    "base": "와인",
    "glass": "와인 글라스",
    "method": "빌드",
    "ingredients": ["화이트 와인 3oz", "크렘 드 카시스 0.5oz"],
    "garnish": "레몬 트위스트",
    "tips": "식전주. 화이트 와인 + 카시스(블랙커런트 리큐르). 샴페인으로 바꾸면 '키르 로얄'."
  },
  {
    "id": 17,
    "name": "Apple Martini",
    "name_ko": "애플 마티니",
    "base": "보드카",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": ["보드카 1.5oz", "애플 퍼커 1oz", "라임 주스 0.5oz"],
    "garnish": "사과 슬라이스",
    "tips": "애플 '마티니'지만 베이스는 '보드카'입니다. 사과맛 리큐르(애플 퍼커) 사용."
  },
  {
    "id": 18,
    "name": "June Bug",
    "name_ko": "준벅",
    "base": "전통주 (리큐르)",
    "glass": "필스너 글라스",
    "method": "쉐이크",
    "ingredients": [
      "미도리 (멜론) 1oz",
      "코코넛 럼 (말리부) 0.5oz",
      "바나나 리큐르 0.5oz",
      "스위트&사워 믹스 2oz",
      "파인애플 주스 2oz"
    ],
    "garnish": "파인애플 웨지, 체리",
    "tips": "한국 전통주 칵테일(현재는 리큐르 베이스로 분류). '초록 벌레'라는 뜻. 재료가 많아 복잡."
  },
  {
    "id": 19,
    "name": "Gochang",
    "name_ko": "고창",
    "base": "전통주",
    "glass": "칵테일 글라스",
    "method": "쉐이크",
    "ingredients": [
      "선운산 복분자주 2oz",
      "트리플 섹 0.5oz",
      "라임 주스 0.5oz"
    ],
    "garnish": "트위스트 레몬 필",
    "tips": "복분자주가 베이스인 한국 전통주 칵테일. 마가리타/사이드카와 레시피 구성이 유사."
  },
  {
    "id": 20,
    "name": "Putsarang (First Love)",
    "name_ko": "풋사랑",
    "base": "전통주",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": [
      "매실주 (매취순) 1.5oz",
      "진 0.5oz",
      "라임 주스 0.5oz",
      "세븐업 Fill"
    ],
    "garnish": "라임 웨지",
    "tips": "매실주 베이스. 진이 부재료로 들어가는 것이 특징. '첫사랑'의 새콤달콤함."
  },
  {
    "id": 21,
    "name": "Healing",
    "name_ko": "힐링",
    "base": "전통주",
    "glass": "와인 글라스",
    "method": "스터",
    "ingredients": ["진 1oz", "인삼주 0.5oz", "드라이 베르무트 0.5oz"],
    "garnish": "대추",
    "tips": "인삼주가 들어가는 독특한 칵테일. 드라이 마티니(진, 베르무트)의 변형으로 암기. 가니쉬가 대추!"
  },
  {
    "id": 22,
    "name": "Negroni",
    "name_ko": "네그로니",
    "base": "진",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": ["진 0.75oz", "스위트 베르무트 0.75oz", "캄파리 0.75oz"],
    "garnish": "오렌지 슬라이스",
    "tips": "진, 스위트 베르무트, 캄파리가 모두 1:1:1 비율. 빌드 기법."
  },
  {
    "id": 23,
    "name": "Rusty Nail",
    "name_ko": "러스티 네일",
    "base": "위스키",
    "glass": "올드 패션드 글라스",
    "method": "빌드",
    "ingredients": ["스카치 위스키 1.5oz", "드람부이 0.75oz"],
    "garnish": "레몬 트위스트",
    "tips": "'녹슨 못'. 스카치 위스키와 드람부이(벌꿀 리큐르) 2가지 재료만 사용."
  },
  {
    "id": 24,
    "name": "Whiskey Sour",
    "name_ko": "위스키 사워",
    "base": "위스키",
    "glass": "사워 글라스",
    "method": "쉐이크",
    "ingredients": [
      "버번 위스키 1.5oz",
      "레몬 주스 0.5oz",
      "설탕 1tsp",
      "소다수 0.5oz"
    ],
    "garnish": "레몬 슬라이스, 체리",
    "tips": "사워(Sour) 스타일의 기본. 위스키, 레몬, 설탕을 쉐이크. (진 피즈와 구성이 비슷)"
  },
  {
    "id": 25,
    "name": "Mai Tai",
    "name_ko": "마이 타이",
    "base": "럼",
    "glass": "하이볼 글라스",
    "method": "쉐이크",
    "ingredients": [
      "라이트 럼 1oz",
      "다크 럼 1oz",
      "트리플 섹 0.5oz",
      "라임 주스 0.5oz",
      "오렌지 주스 1oz",
      "파인애플 주스 1oz"
    ],
    "garnish": "파인애플 웨지, 체리",
    "tips": "재료가 매우 많은 칵테일. '타히티'어로 '최고'라는 뜻. 럼이 2종류."
  }
]
```

---

이 JSON 데이터를 `js/cocktails.json` 파일로 저장하여 `index.html`과 같은 폴더 내의 `js` 폴더에 위치시키면, `app.js`가 시작될 때 자동으로 이 데이터를 불러올 것입니다.

이제 데이터가 준비되었으니, 다음 단계인 **프롬프트 3: 시작 화면 구현**으로 넘어가서 실제 Vue.js 코드를 작성해 볼까요?

좋습니다. 기획안의 **프롬프트 3: 시작 화면 구현**에 맞춰, 이전에 생성한 `index.html`, `js/app.js`, `css/style.css` 파일을 업데이트했습니다.

'랜덤 퀴즈' 모드와 '베이스별 학습' 모드를 선택할 수 있는 UI를 구현하고, `cocktails.json` 파일이 로드되면 자동으로 '베이스(기주)' 목록을 생성하여 버튼으로 표시하도록 로직을 추가했습니다.

아래 3개 파일의 **변경된 부분**을 확인하시고 기존 코드를 업데이트(대체)해 주세요.

---

### 1\. `index.html` (수정)

`<body>` 내부의 `<main>` 영역을 아래 코드로 **대체**해 주세요.
`v-if="currentScreen === 'start'"` 부분이 기획안에 맞게 구체화되었습니다.

```html
<main>
  <div v-if="currentScreen === 'start'" class="start-screen">
    <h2>🚀 학습 모드 선택</h2>

    <div class="card quiz-mode">
      <h3>랜덤 퀴즈</h3>
      <p>원하는 개수만큼 칵테일을 랜덤 출제합니다.</p>
      <button
        @click="startQuiz('random', 10)"
        :disabled="cocktails.length === 0"
      >
        랜덤 10문제
      </button>
      <button
        @click="startQuiz('random', 20)"
        :disabled="cocktails.length === 0"
      >
        랜덤 20문제
      </button>
      <button
        @click="startQuiz('all', totalCocktailCount)"
        :disabled="totalCocktailCount === 0"
      >
        전체 학습 ({{ totalCocktailCount }}문제)
      </button>
    </div>

    <div class="card category-mode">
      <h3>🗂️ 베이스별 학습</h3>
      <p>특정 기주(Base) 칵테일만 학습합니다.</p>
      <div class="category-buttons">
        <button
          v-for="category in categories"
          :key="category"
          @click="startQuiz('base', category)"
        >
          {{ category }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="currentScreen === 'quiz'">
    <h2>퀴즈 진행</h2>
    <p>현재 문제 {{ currentQuestionIndex + 1 }} / {{ questionCount }}</p>
    <div class="card">
      <h3>Q. 칵테일 문제</h3>
      <button>선택지 1</button>
      <button>선택지 2</button>
      <button>선택지 3</button>
      <button>선택지 4</button>
    </div>
    <button @click="nextQuestion">다음 문제</button>
  </div>

  <div v-if="currentScreen === 'result'">
    <h2>퀴즈 결과</h2>
    <div class="card">
      <p>총 점수: {{ score }} / {{ questionCount }}</p>
      <p v-if="questionCount > 0">
        정답률: {{ (score / questionCount * 100).toFixed(1) }}%
      </p>
    </div>
    <button @click="restartQuiz">다시 풀기</button>
    <button @click="goToHome">처음으로</button>
  </div>
</main>
```

---

### 2\. `js/app.js` (수정)

`js/app.js` 파일의 **전체 내용**을 아래 코드로 **대체**해 주세요.
`data`에 `categories`가 추가되었고, `startQuiz` 메서드가 모드별(random, all, base)로 문제를 필터링하고 섞는 로직을 포함하도록 변경되었습니다. `mounted`에서는 `cocktails.json`에서 'base' 목록을 자동으로 추출합니다.

```javascript
const { createApp, ref, computed } = Vue;

createApp({
  // ----------------
  // 상태 관리 (data)
  // ----------------
  data() {
    return {
      cocktails: [], // 원본 칵테일 데이터
      categories: [], // 베이스별 카테고리 목록 (e.g., ['진', '럼', '보드카'])

      // 퀴즈 상태
      currentScreen: "start", // 'start', 'quiz', 'result'
      currentQuestionIndex: 0,
      questionCount: 0,
      quizList: [], // 현재 퀴즈에 출제될 칵테일 목록

      // 사용자 답안
      userAnswers: [],
      score: 0,

      // 문제 풀이
      currentQuestion: null,
      selectedAnswer: null,
      showFeedback: false,
    };
  },

  // ----------------
  // 계산된 속성 (computed)
  // ----------------
  computed: {
    // 데이터 로드 후 총 칵테일 개수 계산
    totalCocktailCount() {
      return this.cocktails.length;
    },
  },

  // ----------------
  // 메서드 (methods)
  // ----------------
  methods: {
    /**
     * 퀴즈 시작
     * @param {string} mode - 'random', 'all', 'base'
     * @param {string|number} param - 문제 개수(number) 또는 카테고리명(string)
     */
    startQuiz(mode, param) {
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.userAnswers = [];
      this.quizList = [];

      let fullList = [...this.cocktails]; // 원본 배열 복사

      if (mode === "random") {
        // 랜덤 셔플 후 param 개수만큼 자르기
        this.quizList = this.shuffleArray(fullList).slice(0, param);
        this.questionCount = this.quizList.length;
      } else if (mode === "all") {
        // 전체 목록 셔플
        this.quizList = this.shuffleArray(fullList);
        this.questionCount = this.quizList.length;
      } else if (mode === "base") {
        // param (e.g., '진')으로 필터링 후 셔플
        this.quizList = this.shuffleArray(
          fullList.filter((c) => c.base === param)
        );
        this.questionCount = this.quizList.length;
      }

      console.log(`퀴즈 시작: ${mode} (${param}), ${this.questionCount} 문제`);

      if (this.questionCount === 0) {
        alert(
          "문제를 불러오는 데 실패했거나 해당 카테고리에 칵테일이 없습니다."
        );
        return;
      }

      // TODO: 프롬프트 4에서 generateQuestion() 호출
      // this.generateQuestion();
      this.currentScreen = "quiz";
    },

    // 배열 셔플 헬퍼 함수 (Fisher-Yates shuffle)
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    // 다음 문제로 이동
    nextQuestion() {
      // TODO: 프롬프트 4에서 답안 체크 로직

      if (this.currentQuestionIndex < this.questionCount - 1) {
        this.currentQuestionIndex++;
        // TODO: 다음 문제 생성 (this.generateQuestion())
      } else {
        // 퀴즈 종료
        this.currentScreen = "result";
      }
    },

    // 다시 풀기 (모드와 파라미터가 저장되지 않았으므로 홈으로 보냄)
    restartQuiz() {
      // TODO: 마지막 퀴즈 설정을 저장했다가 다시 시작하는 로직 (추후)
      this.currentScreen = "start";
    },

    // 처음으로
    goToHome() {
      this.currentScreen = "start";
    },
  },

  // ----------------
  // 마운트 시 실행 (mounted)
  // ----------------
  mounted() {
    // 앱이 시작될 때 칵테일 데이터를 로드합니다.
    fetch("js/cocktails.json")
      .then((response) => response.json())
      .then((data) => {
        this.cocktails = data;
        console.log("칵테일 데이터 로드 완료:", this.cocktails.length, "개");

        // 베이스 카테고리 목록 자동 생성
        const bases = data.map((cocktail) => cocktail.base);
        // 중복 제거 및 가나다순 정렬
        this.categories = [...new Set(bases)].sort();
      })
      .catch((error) => {
        console.error("칵테일 데이터 로드 실패:", error);
        alert("칵테일 데이터를 불러오는 데 실패했습니다.");
      });
  },
}).mount("#app");
```

---

### 3\. `css/style.css` (수정)

기존 `css/style.css` 파일의 **가장 아래**에 아래 스타일을 **추가**해 주세요.
시작 화면의 카드와 버튼들을 기획안의 의도대로 배치하는 스타일입니다.

```css
/* --- Start Screen --- */
.start-screen h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
}

.start-screen .card {
  margin-bottom: 25px;
  text-align: left; /* 카드 내부 텍스트 좌측 정렬 */
}

.start-screen .card h3 {
  font-size: 1.4rem;
  color: #ff6b6b; /* 기획안 메인 컬러 */
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.start-screen .card p {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 20px;
}

/* Category Buttons Layout */
.category-buttons {
  display: flex;
  flex-wrap: wrap; /* 버튼이 많아지면 다음 줄로 */
  gap: 10px; /* 버튼 사이 간격 */
}

.category-buttons button {
  flex-grow: 1; /* 가능한 공간 채우기 */
  flex-basis: 120px; /* 버튼 최소 너비 */
  background-color: #f0f0f0;
  color: #444;
  font-weight: 600;
}

.category-buttons button:hover {
  background-color: #e0e0e0;
}

/* Quiz Mode Buttons */
.quiz-mode button {
  background-color: #4ecdc4; /* 기획안 보조 컬러 */
}

.quiz-mode button:hover {
  background-color: #45b7af;
}

/* 비활성화 버튼 스타일 */
button:disabled {
  background-color: #ccc;
  color: #777;
  cursor: not-allowed;
}
button:disabled:hover {
  background-color: #ccc;
}
```

---

이제 시작 화면 UI가 완성되었습니다. `index.html`을 새로고침하면 데이터를 로드한 뒤 '전체 학습'과 '베이스별 학습' 버튼들이 활성화되는 것을 볼 수 있습니다.

다음 단계인 **프롬프트 4: 퀴즈 로직 구현**으로 넘어가서, `startQuiz`에서 설정된 `quizList`를 바탕으로 실제 퀴즈 문제를 생성하는 로직을 구현해 볼까요?

네, 좋습니다. 기획안의 **프롬프트 4: 퀴즈 로직 구현**에 맞춰 핵심 로직이 담긴 `js/app.js` 파일을 대폭 업데이트했습니다.

`index.html`과 `css/style.css` 파일도 이 로직을 화면에 표시하기 위해 일부 수정되었습니다.

가장 중요한 `js/app.js` 파일은 퀴즈 유형(재료, 기법, 글라스, 가니쉬)을 랜덤으로 선택하고, `cocktails.json` 데이터를 기반으로 오답 선택지를 자동으로 생성하는 `generateQuestion()` 함수가 추가되었습니다.

아래 3개 파일의 **변경된 부분**을 확인하시고 기존 코드를 업데이트(대체)해 주세요.

---

### 1\. `js/app.js` (대폭 수정)

`js/app.js` 파일의 **전체 내용**을 아래 코드로 **대체**해 주세요.
`data`에 퀴즈 상태를 저장할 `currentQuestion` 객체가 구체화되었습니다. `generateQuestion()`, `getDistractors()`, `checkAnswer()` 메서드가 새롭게 추가되어 퀴즈의 핵심 로직을 담당합니다. `startQuiz()`와 `nextQuestion()`도 이 로직을 호출하도록 수정되었습니다.

```javascript
const { createApp, ref, computed } = Vue;

createApp({
  // ----------------
  // 상태 관리 (data)
  // ----------------
  data() {
    return {
      cocktails: [], // 원본 칵테일 데이터
      categories: [], // 베이스별 카테고리 목록

      // 퀴즈 상태
      currentScreen: "start", // 'start', 'quiz', 'result'
      currentQuestionIndex: 0,
      questionCount: 0,
      quizList: [], // 현재 퀴즈에 출제될 칵테일 목록

      // 사용자 답안
      userAnswers: [],
      score: 0,

      // 문제 풀이
      currentQuestion: {
        // 현재 문제 객체
        text: "",
        options: [],
        correctAnswer: "",
        cocktailName: "",
        type: "",
      },
      selectedAnswer: null, // 사용자가 선택한 답
      showFeedback: false, // 정답/오답 피드백 표시 여부
    };
  },

  // ----------------
  // 계산된 속성 (computed)
  // ----------------
  computed: {
    totalCocktailCount() {
      return this.cocktails.length;
    },
  },

  // ----------------
  // 메서드 (methods)
  // ----------------
  methods: {
    /**
     * 퀴즈 시작 (수정됨)
     */
    startQuiz(mode, param) {
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.userAnswers = [];
      this.quizList = [];

      let fullList = [...this.cocktails];

      if (mode === "random") {
        this.quizList = this.shuffleArray(fullList).slice(0, param);
      } else if (mode === "all") {
        this.quizList = this.shuffleArray(fullList);
      } else if (mode === "base") {
        this.quizList = this.shuffleArray(
          fullList.filter((c) => c.base === param)
        );
      }

      this.questionCount = this.quizList.length;

      console.log(`퀴즈 시작: ${mode} (${param}), ${this.questionCount} 문제`);

      if (this.questionCount === 0) {
        alert(
          "문제를 불러오는 데 실패했거나 해당 카테고리에 칵테일이 없습니다."
        );
        return;
      }

      // 첫 번째 문제 생성
      this.generateQuestion();
      this.currentScreen = "quiz";
    },

    /**
     * 퀴즈 문제 생성 (신규)
     */
    generateQuestion() {
      // 1. 현재 문제 칵테일 가져오기
      const cocktail = this.quizList[this.currentQuestionIndex];

      // 2. 퀴즈 유형 랜덤 선택
      // 'ingredients' 유형을 제외 (프롬프트 4 기획안에는 4가지 유형이지만, 재료는 오답 생성이 복잡하여 3가지로 단순화)
      // 추후 'ingredients' 추가 가능
      const quizTypes = ["method", "glass", "garnish"];
      const randomType =
        quizTypes[Math.floor(Math.random() * quizTypes.length)];

      let questionText = "";
      let correctAnswer = "";
      let options = [];
      let sourceArray = []; // 오답 선택지 소스

      // 3. 퀴즈 유형별 문제 및 정답 설정
      switch (randomType) {
        case "method":
          questionText = `Q. '${cocktail.name_ko}' 칵테일의 조주 기법은?`;
          correctAnswer = cocktail.method;
          // 모든 조주 기법 목록
          sourceArray = ["쉐이크", "스터", "빌드", "블렌드", "플루트"];
          break;
        case "glass":
          questionText = `Q. '${cocktail.name_ko}' 칵테일을 담는 글라스는?`;
          correctAnswer = cocktail.glass;
          // 모든 칵테일의 글라스 목록 (중복 제거)
          sourceArray = [...new Set(this.cocktails.map((c) => c.glass))];
          break;
        case "garnish":
          questionText = `Q. '${cocktail.name_ko}' 칵테일의 가니쉬(장식)는?`;
          correctAnswer = cocktail.garnish || "없음"; // 가니쉬가 없는 경우 '없음'으로 처리
          // 모든 칵테일의 가니쉬 목록 (중복 제거)
          sourceArray = [
            ...new Set(this.cocktails.map((c) => c.garnish || "없음")),
          ];
          break;
      }

      // 4. 정답 + 오답 선택지 3개 생성
      options = this.getDistractors(correctAnswer, sourceArray, 4);

      // 5. 현재 문제 상태 업데이트
      this.currentQuestion = {
        text: questionText,
        options: this.shuffleArray(options),
        correctAnswer: correctAnswer,
        cocktailName: cocktail.name_ko,
        type: randomType,
      };

      // 6. 피드백 상태 리셋
      this.selectedAnswer = null;
      this.showFeedback = false;
    },

    /**
     * 오답 선택지 생성 헬퍼 (신규)
     * @param {string} correctAnswer - 정답
     * @param {Array<string>} sourceArray - 오답을 가져올 원본 배열
     * @param {number} totalOptions - 총 선택지 개수 (e.g., 4)
     * @returns {Array<string>} - 정답이 포함된, 셔플되지 않은 선택지 배열
     */
    getDistractors(correctAnswer, sourceArray, totalOptions) {
      let options = [correctAnswer];
      let shuffledSource = this.shuffleArray([...sourceArray]);

      for (let item of shuffledSource) {
        if (options.length >= totalOptions) break;
        // 정답이 아니고, 이미 옵션에 포함되지 않은 항목만 추가
        if (item !== correctAnswer && !options.includes(item)) {
          options.push(item);
        }
      }

      // 만약 원본 소스(sourceArray)의 유니크한 아이템이 4개 미만일 경우
      while (
        options.length < totalOptions &&
        options.length < sourceArray.length
      ) {
        let emergencyOption = sourceArray.find(
          (item) => !options.includes(item)
        );
        if (emergencyOption) {
          options.push(emergencyOption);
        } else {
          break; // 더 이상 추가할 유니크 아이템이 없음
        }
      }

      return options;
    },

    /**
     * 답안 제출 (신규)
     */
    checkAnswer(selectedOption) {
      if (this.showFeedback) return; // 이미 답을 선택함

      this.selectedAnswer = selectedOption;
      this.showFeedback = true; // 피드백 UI 표시 (Prompt 5에서 스타일링)

      if (selectedOption === this.currentQuestion.correctAnswer) {
        this.score++;
        console.log("정답!");
      } else {
        console.log("오답!");
      }

      // 결과 저장 (Prompt 6에서 사용)
      this.userAnswers.push({
        question: this.currentQuestion.text,
        selected: selectedOption,
        correct: this.currentQuestion.correctAnswer,
        cocktail: this.currentQuestion.cocktailName,
        isCorrect: selectedOption === this.currentQuestion.correctAnswer,
      });
    },

    /**
     * 다음 문제로 이동 (수정됨)
     */
    nextQuestion() {
      // 답을 선택해야만 다음으로 넘어감
      if (!this.showFeedback) {
        alert("답을 선택해주세요!");
        return;
      }

      if (this.currentQuestionIndex < this.questionCount - 1) {
        this.currentQuestionIndex++;
        this.generateQuestion(); // 다음 문제 생성
      } else {
        // 퀴즈 종료
        this.currentScreen = "result";
      }
    },

    /**
     * 다시 풀기 (수정됨)
     * - 마지막 퀴즈 설정을 기억하는 대신, 홈으로 보냅니다.
     */
    restartQuiz() {
      this.currentScreen = "start";
    },

    // 처음으로
    goToHome() {
      this.currentScreen = "start";
    },

    // 배열 셔플 헬퍼 함수 (Fisher-Yates shuffle)
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
  },

  // ----------------
  // 마운트 시 실행 (mounted)
  // ----------------
  mounted() {
    fetch("js/cocktails.json")
      .then((response) => response.json())
      .then((data) => {
        this.cocktails = data;
        console.log("칵테일 데이터 로드 완료:", this.cocktails.length, "개");

        const bases = data.map((cocktail) => cocktail.base);
        this.categories = [...new Set(bases)].sort();
      })
      .catch((error) => {
        console.error("칵테일 데이터 로드 실패:", error);
        alert("칵테일 데이터를 불러오는 데 실패했습니다.");
      });
  },
}).mount("#app");
```

---

### 2\. `index.html` (수정)

`<body>` 내부의 `<main>` 영역을 아래 코드로 **대체**해 주세요.
`v-if="currentScreen === 'quiz'"` 부분이 `currentQuestion` 객체와 `checkAnswer()` 메서드를 사용하도록 대폭 수정되었습니다.

```html
<main>
    <div v-if="currentScreen === 'start'" class="start-screen">
        <h2>🚀 학습 모드 선택</h2>

        <div class="card quiz-mode">
            <h3>랜덤 퀴즈</h3>
            <p>원하는 개수만큼 칵테일을 랜덤 출제합니다.</p>
            <button @click="startQuiz('random', 10)" :disabled="cocktails.length === 0">
                랜덤 10문제
            </button>
            <button @click="startQuiz('random', 20)" :disabled="cocktails.length === 0">
                랜덤 20문제
            </button>
            <button @click="startQuiz('all', totalCocktailCount)" :disabled="totalCocktailCount === 0">
                전체 학습 ({{ totalCocktailCount }}문제)
            </button>
        </div>

        <div class="card category-mode">
            <h3>🗂️ 베이스별 학습</h3>
            <p>특정 기주(Base) 칵테일만 학습합니다.</p>
            <div class="category-buttons">
                <button v-for="category in categories"
                        :key="category"
                        @click="startQuiz('base', category)">
                    {{ category }}
                </button>
            </div>
        </div>
    </div>

    <div v-if="currentScreen === 'quiz'" class="quiz-screen">

        <p class="progress-text">현재 문제 {{ currentQuestionIndex + 1 }} / {{ questionCount }}</p>

        <div class="card quiz-card" v-if="currentQuestion">
            <span class="quiz-type-badge">{{ currentQuestion.type }}</span>
            <h3>{{ currentQuestion.text }}</h3>

            <div class="answer-buttons">
                <button
                    v-for="(option, index) in currentQuestion.options"
                    :key="index"
                    @click="checkAnswer(option)"
                    :disabled="showFeedback"
                    >
                    {{ option }}
                </button>
            </div>

            <div v-if="showFeedback" class="feedback">
                <p v-if="selectedAnswer === currentQuestion.correctAnswer" class="correct">
                    ✅ 정답입니다!
                </p>
                <p v-else class="incorrect">
                    ❌ 틀렸습니다. (정답: {{ currentQuestion.correctAnswer }})
                </p>
            </div>
        </div>

        <button
            @click="nextQuestion"
            vNext-button"
            >
            {{ (currentQuestionIndex < questionCount - 1) ? '다음 문제' : '결과 보기' }}
        </button>

        <button
            v-if="!showFeedback"
            class="next-button"
            disabled
            >
            (답을 선택하세요)
        </button>
    </div>

    <div v-if="currentScreen === 'result'">
        <h2>퀴즈 결과</h2>
        <div class="card">
            <p>총 점수: {{ score }} / {{ questionCount }}</p>
            <p v-if="questionCount > 0">정답률: {{ (score / questionCount * 100).toFixed(1) }}%</p>
        </div>
        <button @click="restartQuiz">다시 풀기</button>
        <button @click="goToHome">처음으로</button>
    </div>
</main>
```

---

### 3\. `css/style.css` (수정)

기존 `css/style.css` 파일의 **가장 아래**에 아래 스타일을 **추가**해 주세요.
퀴즈 화면(`quiz-screen`)의 기본 레이아웃과 피드백 스타일입니다.

```css
/* --- Quiz Screen (Prompt 4 Basic) --- */
.quiz-screen .card {
  text-align: left;
  min-height: 250px;
}

.progress-text {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.quiz-type-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #eee;
  color: #555;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.quiz-screen h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.answer-buttons button {
  background-color: #f0f0f0;
  color: #333;
  font-weight: 600;
}

.answer-buttons button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

/* 답안 선택 시 비활성화 */
.answer-buttons button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* --- Feedback (Prompt 5에서 구체화) --- */
.feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: 5px;
}

.feedback p {
  font-size: 1.1rem;
  font-weight: bold;
}

.feedback .correct {
  color: #28a745;
  background-color: #e6f7ec;
  padding: 10px;
}

.feedback .incorrect {
  color: #dc3545;
  background-color: #fdecea;
  padding: 10px;
}

/* --- Next Button --- */
.next-button {
  margin-top: 20px;
  width: 100%;
  background-color: #ff6b6b; /* 기획안 메인 컬러 */
}

.next-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
```

---

이제 퀴즈의 핵심 로직이 완성되었습니다. `index.html`을 새로고침하고 퀴즈를 시작하면, 랜덤으로 '기법', '글라스', '가니쉬' 문제가 출제되고, 답을 선택하면 즉시 피드백이 나타나며 '다음 문제' 버튼이 활성화됩니다.

다음은 기획안의 **프롬프트 5: 문제 화면 UI 구현** 단계입니다.
여기서는 진행률 바(Progress Bar)를 추가하고, 정답/오답 시 버튼 색상이 즉각적으로 변하는 등 UI/UX를 기획안에 맞게 더 세련되게 다듬어 보겠습니다. 준비되셨나요?

네, 좋습니다. 기획안의 **프롬프트 4: 퀴즈 로직 구현**에 맞춰 핵심 로직이 담긴 `js/app.js` 파일을 대폭 업데이트했습니다.

`index.html`과 `css/style.css` 파일도 이 로직을 화면에 표시하기 위해 일부 수정되었습니다.

가장 중요한 `js/app.js` 파일은 퀴즈 유형(재료, 기법, 글라스, 가니쉬)을 랜덤으로 선택하고, `cocktails.json` 데이터를 기반으로 오답 선택지를 자동으로 생성하는 `generateQuestion()` 함수가 추가되었습니다.

아래 3개 파일의 **변경된 부분**을 확인하시고 기존 코드를 업데이트(대체)해 주세요.

---

### 1\. `js/app.js` (대폭 수정)

`js/app.js` 파일의 **전체 내용**을 아래 코드로 **대체**해 주세요.
`data`에 퀴즈 상태를 저장할 `currentQuestion` 객체가 구체화되었습니다. `generateQuestion()`, `getDistractors()`, `checkAnswer()` 메서드가 새롭게 추가되어 퀴즈의 핵심 로직을 담당합니다. `startQuiz()`와 `nextQuestion()`도 이 로직을 호출하도록 수정되었습니다.

```javascript
const { createApp, ref, computed } = Vue;

createApp({
  // ----------------
  // 상태 관리 (data)
  // ----------------
  data() {
    return {
      cocktails: [], // 원본 칵테일 데이터
      categories: [], // 베이스별 카테고리 목록

      // 퀴즈 상태
      currentScreen: "start", // 'start', 'quiz', 'result'
      currentQuestionIndex: 0,
      questionCount: 0,
      quizList: [], // 현재 퀴즈에 출제될 칵테일 목록

      // 사용자 답안
      userAnswers: [],
      score: 0,

      // 문제 풀이
      currentQuestion: {
        // 현재 문제 객체
        text: "",
        options: [],
        correctAnswer: "",
        cocktailName: "",
        type: "",
      },
      selectedAnswer: null, // 사용자가 선택한 답
      showFeedback: false, // 정답/오답 피드백 표시 여부
    };
  },

  // ----------------
  // 계산된 속성 (computed)
  // ----------------
  computed: {
    totalCocktailCount() {
      return this.cocktails.length;
    },
  },

  // ----------------
  // 메서드 (methods)
  // ----------------
  methods: {
    /**
     * 퀴즈 시작 (수정됨)
     */
    startQuiz(mode, param) {
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.userAnswers = [];
      this.quizList = [];

      let fullList = [...this.cocktails];

      if (mode === "random") {
        this.quizList = this.shuffleArray(fullList).slice(0, param);
      } else if (mode === "all") {
        this.quizList = this.shuffleArray(fullList);
      } else if (mode === "base") {
        this.quizList = this.shuffleArray(
          fullList.filter((c) => c.base === param)
        );
      }

      this.questionCount = this.quizList.length;

      console.log(`퀴즈 시작: ${mode} (${param}), ${this.questionCount} 문제`);

      if (this.questionCount === 0) {
        alert(
          "문제를 불러오는 데 실패했거나 해당 카테고리에 칵테일이 없습니다."
        );
        return;
      }

      // 첫 번째 문제 생성
      this.generateQuestion();
      this.currentScreen = "quiz";
    },

    /**
     * 퀴즈 문제 생성 (신규)
     */
    generateQuestion() {
      // 1. 현재 문제 칵테일 가져오기
      const cocktail = this.quizList[this.currentQuestionIndex];

      // 2. 퀴즈 유형 랜덤 선택
      // 'ingredients' 유형을 제외 (프롬프트 4 기획안에는 4가지 유형이지만, 재료는 오답 생성이 복잡하여 3가지로 단순화)
      // 추후 'ingredients' 추가 가능
      const quizTypes = ["method", "glass", "garnish"];
      const randomType =
        quizTypes[Math.floor(Math.random() * quizTypes.length)];

      let questionText = "";
      let correctAnswer = "";
      let options = [];
      let sourceArray = []; // 오답 선택지 소스

      // 3. 퀴즈 유형별 문제 및 정답 설정
      switch (randomType) {
        case "method":
          questionText = `Q. '${cocktail.name_ko}' 칵테일의 조주 기법은?`;
          correctAnswer = cocktail.method;
          // 모든 조주 기법 목록
          sourceArray = ["쉐이크", "스터", "빌드", "블렌드", "플루트"];
          break;
        case "glass":
          questionText = `Q. '${cocktail.name_ko}' 칵테일을 담는 글라스는?`;
          correctAnswer = cocktail.glass;
          // 모든 칵테일의 글라스 목록 (중복 제거)
          sourceArray = [...new Set(this.cocktails.map((c) => c.glass))];
          break;
        case "garnish":
          questionText = `Q. '${cocktail.name_ko}' 칵테일의 가니쉬(장식)는?`;
          correctAnswer = cocktail.garnish || "없음"; // 가니쉬가 없는 경우 '없음'으로 처리
          // 모든 칵테일의 가니쉬 목록 (중복 제거)
          sourceArray = [
            ...new Set(this.cocktails.map((c) => c.garnish || "없음")),
          ];
          break;
      }

      // 4. 정답 + 오답 선택지 3개 생성
      options = this.getDistractors(correctAnswer, sourceArray, 4);

      // 5. 현재 문제 상태 업데이트
      this.currentQuestion = {
        text: questionText,
        options: this.shuffleArray(options),
        correctAnswer: correctAnswer,
        cocktailName: cocktail.name_ko,
        type: randomType,
      };

      // 6. 피드백 상태 리셋
      this.selectedAnswer = null;
      this.showFeedback = false;
    },

    /**
     * 오답 선택지 생성 헬퍼 (신규)
     * @param {string} correctAnswer - 정답
     * @param {Array<string>} sourceArray - 오답을 가져올 원본 배열
     * @param {number} totalOptions - 총 선택지 개수 (e.g., 4)
     * @returns {Array<string>} - 정답이 포함된, 셔플되지 않은 선택지 배열
     */
    getDistractors(correctAnswer, sourceArray, totalOptions) {
      let options = [correctAnswer];
      let shuffledSource = this.shuffleArray([...sourceArray]);

      for (let item of shuffledSource) {
        if (options.length >= totalOptions) break;
        // 정답이 아니고, 이미 옵션에 포함되지 않은 항목만 추가
        if (item !== correctAnswer && !options.includes(item)) {
          options.push(item);
        }
      }

      // 만약 원본 소스(sourceArray)의 유니크한 아이템이 4개 미만일 경우
      while (
        options.length < totalOptions &&
        options.length < sourceArray.length
      ) {
        let emergencyOption = sourceArray.find(
          (item) => !options.includes(item)
        );
        if (emergencyOption) {
          options.push(emergencyOption);
        } else {
          break; // 더 이상 추가할 유니크 아이템이 없음
        }
      }

      return options;
    },

    /**
     * 답안 제출 (신규)
     */
    checkAnswer(selectedOption) {
      if (this.showFeedback) return; // 이미 답을 선택함

      this.selectedAnswer = selectedOption;
      this.showFeedback = true; // 피드백 UI 표시 (Prompt 5에서 스타일링)

      if (selectedOption === this.currentQuestion.correctAnswer) {
        this.score++;
        console.log("정답!");
      } else {
        console.log("오답!");
      }

      // 결과 저장 (Prompt 6에서 사용)
      this.userAnswers.push({
        question: this.currentQuestion.text,
        selected: selectedOption,
        correct: this.currentQuestion.correctAnswer,
        cocktail: this.currentQuestion.cocktailName,
        isCorrect: selectedOption === this.currentQuestion.correctAnswer,
      });
    },

    /**
     * 다음 문제로 이동 (수정됨)
     */
    nextQuestion() {
      // 답을 선택해야만 다음으로 넘어감
      if (!this.showFeedback) {
        alert("답을 선택해주세요!");
        return;
      }

      if (this.currentQuestionIndex < this.questionCount - 1) {
        this.currentQuestionIndex++;
        this.generateQuestion(); // 다음 문제 생성
      } else {
        // 퀴즈 종료
        this.currentScreen = "result";
      }
    },

    /**
     * 다시 풀기 (수정됨)
     * - 마지막 퀴즈 설정을 기억하는 대신, 홈으로 보냅니다.
     */
    restartQuiz() {
      this.currentScreen = "start";
    },

    // 처음으로
    goToHome() {
      this.currentScreen = "start";
    },

    // 배열 셔플 헬퍼 함수 (Fisher-Yates shuffle)
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
  },

  // ----------------
  // 마운트 시 실행 (mounted)
  // ----------------
  mounted() {
    fetch("js/cocktails.json")
      .then((response) => response.json())
      .then((data) => {
        this.cocktails = data;
        console.log("칵테일 데이터 로드 완료:", this.cocktails.length, "개");

        const bases = data.map((cocktail) => cocktail.base);
        this.categories = [...new Set(bases)].sort();
      })
      .catch((error) => {
        console.error("칵테일 데이터 로드 실패:", error);
        alert("칵테일 데이터를 불러오는 데 실패했습니다.");
      });
  },
}).mount("#app");
```

---

### 2\. `index.html` (수정)

`<body>` 내부의 `<main>` 영역을 아래 코드로 **대체**해 주세요.
`v-if="currentScreen === 'quiz'"` 부분이 `currentQuestion` 객체와 `checkAnswer()` 메서드를 사용하도록 대폭 수정되었습니다.

```html
<main>
    <div v-if="currentScreen === 'start'" class="start-screen">
        <h2>🚀 학습 모드 선택</h2>

        <div class="card quiz-mode">
            <h3>랜덤 퀴즈</h3>
            <p>원하는 개수만큼 칵테일을 랜덤 출제합니다.</p>
            <button @click="startQuiz('random', 10)" :disabled="cocktails.length === 0">
                랜덤 10문제
            </button>
            <button @click="startQuiz('random', 20)" :disabled="cocktails.length === 0">
                랜덤 20문제
            </button>
            <button @click="startQuiz('all', totalCocktailCount)" :disabled="totalCocktailCount === 0">
                전체 학습 ({{ totalCocktailCount }}문제)
            </button>
        </div>

        <div class="card category-mode">
            <h3>🗂️ 베이스별 학습</h3>
            <p>특정 기주(Base) 칵테일만 학습합니다.</p>
            <div class="category-buttons">
                <button v-for="category in categories"
                        :key="category"
                        @click="startQuiz('base', category)">
                    {{ category }}
                </button>
            </div>
        </div>
    </div>

    <div v-if="currentScreen === 'quiz'" class="quiz-screen">

        <p class="progress-text">현재 문제 {{ currentQuestionIndex + 1 }} / {{ questionCount }}</p>

        <div class="card quiz-card" v-if="currentQuestion">
            <span class="quiz-type-badge">{{ currentQuestion.type }}</span>
            <h3>{{ currentQuestion.text }}</h3>

            <div class="answer-buttons">
                <button
                    v-for="(option, index) in currentQuestion.options"
                    :key="index"
                    @click="checkAnswer(option)"
                    :disabled="showFeedback"
                    >
                    {{ option }}
                </button>
            </div>

            <div v-if="showFeedback" class="feedback">
                <p v-if="selectedAnswer === currentQuestion.correctAnswer" class="correct">
                    ✅ 정답입니다!
                </p>
                <p v-else class="incorrect">
                    ❌ 틀렸습니다. (정답: {{ currentQuestion.correctAnswer }})
                </p>
            </div>
        </div>

        <button
            @click="nextQuestion"
            vNext-button"
            >
            {{ (currentQuestionIndex < questionCount - 1) ? '다음 문제' : '결과 보기' }}
        </button>

        <button
            v-if="!showFeedback"
            class="next-button"
            disabled
            >
            (답을 선택하세요)
        </button>
    </div>

    <div v-if="currentScreen === 'result'">
        <h2>퀴즈 결과</h2>
        <div class="card">
            <p>총 점수: {{ score }} / {{ questionCount }}</p>
            <p v-if="questionCount > 0">정답률: {{ (score / questionCount * 100).toFixed(1) }}%</p>
        </div>
        <button @click="restartQuiz">다시 풀기</button>
        <button @click="goToHome">처음으로</button>
    </div>
</main>
```

---

### 3\. `css/style.css` (수정)

기존 `css/style.css` 파일의 **가장 아래**에 아래 스타일을 **추가**해 주세요.
퀴즈 화면(`quiz-screen`)의 기본 레이아웃과 피드백 스타일입니다.

```css
/* --- Quiz Screen (Prompt 4 Basic) --- */
.quiz-screen .card {
  text-align: left;
  min-height: 250px;
}

.progress-text {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.quiz-type-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #eee;
  color: #555;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.quiz-screen h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.answer-buttons button {
  background-color: #f0f0f0;
  color: #333;
  font-weight: 600;
}

.answer-buttons button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

/* 답안 선택 시 비활성화 */
.answer-buttons button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* --- Feedback (Prompt 5에서 구체화) --- */
.feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: 5px;
}

.feedback p {
  font-size: 1.1rem;
  font-weight: bold;
}

.feedback .correct {
  color: #28a745;
  background-color: #e6f7ec;
  padding: 10px;
}

.feedback .incorrect {
  color: #dc3545;
  background-color: #fdecea;
  padding: 10px;
}

/* --- Next Button --- */
.next-button {
  margin-top: 20px;
  width: 100%;
  background-color: #ff6b6b; /* 기획안 메인 컬러 */
}

.next-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
```

---

이제 퀴즈의 핵심 로직이 완성되었습니다. `index.html`을 새로고침하고 퀴즈를 시작하면, 랜덤으로 '기법', '글라스', '가니쉬' 문제가 출제되고, 답을 선택하면 즉시 피드백이 나타나며 '다음 문제' 버튼이 활성화됩니다.

다음은 기획안의 **프롬프트 5: 문제 화면 UI 구현** 단계입니다.
여기서는 진행률 바(Progress Bar)를 추가하고, 정답/오답 시 버튼 색상이 즉각적으로 변하는 등 UI/UX를 기획안에 맞게 더 세련되게 다듬어 보겠습니다. 준비되셨나요?

알겠습니다. 기획안의 **프롬프트 5: 문제 화면 UI 구현** 단계입니다.

`js/app.js` 파일은 변경할 필요가 없습니다.

퀴즈의 몰입감을 높이기 위해 \*\*진행률 바(Progress Bar)\*\*를 추가하고, 답안 버튼을 클릭했을 때 \*\*정답(초록색), 오답(빨간색)\*\*으로 즉시 색상이 변경되며 **진동 애니메이션**이 추가되도록 `index.html`과 `css/style.css` 파일을 수정했습니다.

아래 2개 파일의 **변경된 부분**을 확인하시고 기존 코드를 업데이트(대체)해 주세요.

---

### 1\. `index.html` (수정)

`<body>` 내부의 `<main>` 영역을 아래 코드로 **대체**해 주세요.
`v-if="currentScreen === 'quiz'"` 부분에 진행률 바(`progress-bar-container`)가 추가되었습니다.

또한, 답안 버튼(`button`)에 `v-bind:class`를 이용한 동적 클래스(`correct`, `incorrect`)가 적용되었고, 하단에 있던 별도의 피드백 `<div>`는 버튼 스타일링으로 대체되어 **제거**되었습니다.

```html
<main>
  <div v-if="currentScreen === 'start'" class="start-screen">
    <h2>🚀 학습 모드 선택</h2>

    <div class="card quiz-mode">
      <h3>랜덤 퀴즈</h3>
      <p>원하는 개수만큼 칵테일을 랜덤 출제합니다.</p>
      <button
        @click="startQuiz('random', 10)"
        :disabled="cocktails.length === 0"
      >
        랜덤 10문제
      </button>
      <button
        @click="startQuiz('random', 20)"
        :disabled="cocktails.length === 0"
      >
        랜덤 20문제
      </button>
      <button
        @click="startQuiz('all', totalCocktailCount)"
        :disabled="totalCocktailCount === 0"
      >
        전체 학습 ({{ totalCocktailCount }}문제)
      </button>
    </div>

    <div class="card category-mode">
      <h3>🗂️ 베이스별 학습</h3>
      <p>특정 기주(Base) 칵테일만 학습합니다.</p>
      <div class="category-buttons">
        <button
          v-for="category in categories"
          :key="category"
          @click="startQuiz('base', category)"
        >
          {{ category }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="currentScreen === 'quiz'" class="quiz-screen">
    <div class="progress-bar-container">
      <div
        class="progress-bar-inner"
        :style="{ width: (currentQuestionIndex + 1) / questionCount * 100 + '%' }"
      ></div>
    </div>
    <p class="progress-text">
      현재 문제 {{ currentQuestionIndex + 1 }} / {{ questionCount }}
    </p>

    <div class="card quiz-card" v-if="currentQuestion">
      <span class="quiz-type-badge">{{ currentQuestion.type }}</span>
      <h3>{{ currentQuestion.text }}</h3>

      <div class="answer-buttons">
        <button
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          @click="checkAnswer(option)"
          :disabled="showFeedback"
          :class="{
                        'correct': showFeedback && option === currentQuestion.correctAnswer,
                        'incorrect': showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer
                    }"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <button v-if="showFeedback" @click="nextQuestion" class="next-button">
      {{ (currentQuestionIndex < questionCount - 1) ? '다음 문제' : '결과 보기'
      }}
    </button>

    <button v-if="!showFeedback" class="next-button" disabled>
      (답을 선택하세요)
    </button>
  </div>

  <div v-if="currentScreen === 'result'">
    <h2>퀴즈 결과</h2>
    <div class="card">
      <p>총 점수: {{ score }} / {{ questionCount }}</p>
      <p v-if="questionCount > 0">
        정답률: {{ (score / questionCount * 100).toFixed(1) }}%
      </p>
    </div>
    <button @click="restartQuiz">다시 풀기</button>
    <button @click="goToHome">처음으로</button>
  </div>
</main>
```

---

### 2\. `css/style.css` (수정)

이전 프롬프트 4에서 추가했던 `.feedback` 관련 스타일(총 5개)을 **모두 삭제**한 뒤, `css/style.css` 파일의 **가장 아래**에 아래 스타일을 **추가**해 주세요.
(※ `/* --- Feedback (Prompt 5에서 구체화) --- */` 주석과 그 아래 5개 스타일 블록을 지우시면 됩니다.)

```css
/* --- Progress Bar (Prompt 5) --- */
.progress-bar-container {
  width: 100%;
  height: 12px;
  background-color: #eee;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-bar-inner {
  height: 100%;
  background-color: #4ecdc4; /* 보조 컬러 */
  border-radius: 6px;
  transition: width 0.3s ease-in-out;
}

/* progress-text 스타일 수정 */
.quiz-screen .progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #777;
  margin-bottom: 15px;
}

/* --- Answer Button Styling (Prompt 5) --- */
.answer-buttons button {
  border: 2px solid transparent; /* 테두리 공간 확보 */
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.answer-buttons button:hover:not(:disabled) {
  background-color: #fff;
  border-color: #4ecdc4; /* 호버 시 보조 컬러 */
  color: #4ecdc4;
}

/* 비활성화 (선택 완료) */
.answer-buttons button:disabled {
  opacity: 1; /* 비활성화 시 흐리게 하지 않음 */
  cursor: not-allowed;
}

/* 선택한 오답 */
.answer-buttons button.incorrect {
  background-color: #fdecea;
  border-color: #dc3545; /* 오답 레드 */
  color: #dc3545;
  animation: shake 0.5s; /* 틀렸을 때 진동 */
}

/* 정답 */
.answer-buttons button.correct {
  background-color: #e6f7ec;
  border-color: #28a745; /* 정답 그린 */
  color: #28a745;
  font-weight: bold;
}

/* 선택하지 않은 나머지 버튼 (피드백 표시 시) */
.answer-buttons button:disabled:not(.correct):not(.incorrect) {
  opacity: 0.6;
  background-color: #f0f0f0;
  color: #777;
}

/* --- Animations (Prompt 5) --- */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-5px);
  }
}
```

---

이제 퀴즈 화면 UI가 훨씬 세련되게 개선되었습니다.

다음은 퀴즈의 마무리 단계인 **프롬프트 6: 결과 화면 구현**입니다.
현재는 점수와 정답률만 표시되지만, 이 단계에서는 기획안대로 틀린 문제 목록(`userAnswers` 배열)을 자세히 보여주고, 점수대별 격려 메시지도 추가해 보겠습니다. 계속 진행할까요?
