// ====================================
// Vue 3 Composition API를 사용한 칵테일 퀴즈 앱
// ====================================

const { createApp, ref, reactive, computed, watch, onMounted } = Vue;

// ====================================
// 상수
// ====================================
const SCREENS = {
  LOADING: "loading",
  HOME: "home",
  STUDY: "study",
  QUIZ: "quiz",
  RESULT: "result",
};

const QUIZ_MODES = {
  ALL: "all",
  RANDOM_10: "random10",
  RANDOM_20: "random20",
};

const QUESTION_TYPES = {
  INGREDIENTS: "ingredients",
  GLASS: "glass",
  METHOD: "method",
  BASE: "base",
  GARNISH: "garnish",
};

// ====================================
// 메인 앱 컴포넌트
// ====================================
const app = createApp({
  template: `
<div class="app-container">
  <div class="header">
    <h1>🍹 조주기능사 칵테일 레시피 퀴즈</h1>
    <p class="subtitle">40가지 칵테일을 완벽하게 정복하세요!</p>
  </div>

  <div class="container" v-if="currentScreen === SCREENS.LOADING">
    <LoadingScreen :loading-message="loadingMessage" />
  </div>

  <div class="container" v-else-if="errorMessage">
    <ErrorScreen :error="errorMessage" @retry="retryLoadData" />
  </div>

  <div class="container" v-else-if="currentScreen === SCREENS.HOME">
    <HomeScreen
      :cocktails="cocktails"
      :stats="stats"
      @start-quiz="startQuiz"
      @start-study="startStudy"
    />
  </div>

  <div v-else-if="currentScreen === SCREENS.STUDY">
    <FlashcardStudy
      :cocktails="cocktails"
      :study-mode="studyMode"
      :cocktail-info="cocktailInfo"
      @back-home="exitStudy"
    />
  </div>

  <div class="quiz-screen" v-else-if="currentScreen === SCREENS.QUIZ">
    <QuizScreen
      :current-question="currentQuestion"
      :question-index="currentQuestionIndex"
      :total-questions="quizQuestions.length"
      :answered="answered"
      :selected-answer="selectedAnswer"
      :feedback="feedback"
      :cocktail-info="cocktailInfo"
      @answer="submitAnswer"
      @next="nextQuestion"
      @skip="skipQuestion"
      @exit="exitQuiz"
    />
  </div>

  <div class="result-screen" v-else-if="currentScreen === SCREENS.RESULT">
    <ResultScreen
      :score="score"
      :total="quizQuestions.length"
      :results="quizResults"
      :stats="stats"
      @back-home="backToHome"
    />
  </div>
</div>
  `,

  setup() {
    // ====================================
    // 상태 관리
    // ====================================
    const currentScreen = ref(SCREENS.LOADING);
    const loadingMessage = ref("데이터를 불러오는 중...");
    const errorMessage = ref("");
    const cocktails = ref([]);
    const cocktailInfo = ref([]);
    const studyMode = ref("");

    const currentQuestionIndex = ref(0);
    const answered = ref(false);
    const selectedAnswer = ref(null);
    const feedback = ref("");
    const quizQuestions = ref([]);
    const quizResults = ref([]);
    const score = ref(0);
    const selectedAnswers = ref({});

    // 통계
    const stats = reactive({
      totalAttempts: localStorage.getItem("totalAttempts")
        ? parseInt(localStorage.getItem("totalAttempts"))
        : 0,
      correctAnswers: localStorage.getItem("correctAnswers")
        ? parseInt(localStorage.getItem("correctAnswers"))
        : 0,
      accuracy: 0,
      wrongAnswers: JSON.parse(localStorage.getItem("wrongAnswers") || "[]"),
    });

    // ====================================
    // 계산된 속성
    // ====================================
    const currentQuestion = computed(() => {
      return quizQuestions.value[currentQuestionIndex.value] || null;
    });

    // ====================================
    // 라이프사이클
    // ====================================
    onMounted(() => {
      loadCocktailData();
      loadCocktailInfoData();
    });

    // ====================================
    // 정확도 계산
    // ====================================
    watch(
      () => stats.totalAttempts,
      () => {
        if (stats.totalAttempts > 0) {
          stats.accuracy = Math.round(
            (stats.correctAnswers / stats.totalAttempts) * 100
          );
        }
      },
      { deep: true }
    );

    // ====================================
    // JSON 데이터 로드
    // ====================================
    const loadCocktailData = async () => {
      try {
        loadingMessage.value = "칵테일 데이터를 불러오는 중...";

        // cocktails.json 파일 경로
        const response = await fetch("js/data/cocktails.json");

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }

        const data = await response.json();
        cocktails.value = data.data;
        // currentScreen.value = SCREENS.HOME;

        console.log(`✓ ${cocktails.value.length}개의 칵테일 데이터 로드 완료`);
      } catch (error) {
        console.error("데이터 로드 오류:", error);
        errorMessage.value = `데이터 로드 실패: ${error.message}\n파일 경로를 확인해주세요.`;
      }
    };
    const loadCocktailInfoData = async () => {
      try {
        loadingMessage.value = "칵테일 추가 데이터를 불러오는 중...";

        // info.json 파일 경로
        const response = await fetch("js/data/info.json");

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }

        const data = await response.json();
        cocktailInfo.value = data.data;
        currentScreen.value = SCREENS.HOME;

        console.log(`✓ ${cocktailInfo.value.length}개의 정보 데이터 로드 완료`);
      } catch (error) {
        console.error("데이터 로드 오류:", error);
        errorMessage.value = `데이터 로드 실패: ${error.message}\n파일 경로를 확인해주세요.`;
        currentScreen.value = SCREENS.HOME;
      }
    };

    // ====================================
    // 데이터 재로드
    // ====================================
    const retryLoadData = () => {
      errorMessage.value = "";
      currentScreen.value = SCREENS.LOADING;
      loadCocktailData();
      loadCocktailInfoData();
    };

    // ====================================
    // 학습 모드 함수
    // ====================================
    const startStudy = (mode) => {
      studyMode.value = mode;
      currentScreen.value = SCREENS.STUDY;
    };

    const exitStudy = () => {
      currentScreen.value = SCREENS.HOME;
    };

    // ====================================
    // 퀴즈 시작
    // ====================================
    const startQuiz = (mode) => {
      try {
        quizQuestions.value = generateQuestions(mode);
        currentQuestionIndex.value = 0;
        answered.value = false;
        selectedAnswer.value = null;
        feedback.value = "";
        quizResults.value = [];
        score.value = 0;
        selectedAnswers.value = {};
        currentScreen.value = SCREENS.QUIZ;
      } catch (error) {
        console.error("퀴즈 시작 오류:", error);
        errorMessage.value = `퀴즈 시작 실패: ${error.message}`;
      }
    };

    // ====================================
    // 문제 생성
    // ====================================
    const generateQuestions = (mode) => {
      let cocktailList = [...cocktails.value];

      if (mode === QUIZ_MODES.RANDOM_10) {
        cocktailList = shuffleArray(cocktailList).slice(0, 10);
      } else if (mode === QUIZ_MODES.RANDOM_20) {
        cocktailList = shuffleArray(cocktailList).slice(0, 20);
      }

      const questions = [];

      cocktailList.forEach((cocktail) => {
        // 1. 재료 맞추기
        questions.push(generateIngredientsQuestion(cocktail));

        // 2. 글라스 맞추기
        questions.push(generateGlassQuestion(cocktail));

        // 3. 조주법 맞추기
        questions.push(generateMethodQuestion(cocktail));

        // 4. 기주 맞추기
        questions.push(generateBaseQuestion(cocktail));

        // 5. 가니쉬 맞추기
        questions.push(generateGarnishQuestion(cocktail));
      });

      return shuffleArray(questions);
    };

    // ====================================
    // 문제 생성 함수들
    // ====================================
    const generateIngredientsQuestion = (cocktail) => {
      const correct = cocktail.ingredients.map((i) => i.name_ko).join(", ");
      const wrongOptions = cocktails.value
        .filter((c) => c.id !== cocktail.id)
        .slice(0, 3)
        .map((c) => c.ingredients.map((i) => i.name_ko).join(", "));

      return {
        id: `${cocktail.id}-ingredients`,
        type: QUESTION_TYPES.INGREDIENTS,
        cocktail: cocktail,
        question: `${cocktail.name_ko}(${cocktail.name})의 주요 재료는?`,
        options: shuffleArray([correct, ...wrongOptions]).map((opt, idx) => ({
          text: opt,
          isCorrect: opt === correct,
          index: idx,
        })),
        correct: correct,
      };
    };

    const generateGlassQuestion = (cocktail) => {
      const correct = cocktail.glass_ko;
      const wrongOptions = cocktails.value
        .filter((c) => c.id !== cocktail.id && c.glass_ko !== cocktail.glass_ko)
        .slice(0, 3)
        .map((c) => c.glass_ko);

      return {
        id: `${cocktail.id}-glass`,
        type: QUESTION_TYPES.GLASS,
        cocktail: cocktail,
        question: `${cocktail.name_ko}(${cocktail.name})을(를) 담는 글라스는?`,
        options: shuffleArray([correct, ...wrongOptions]).map((opt, idx) => ({
          text: opt,
          isCorrect: opt === correct,
          index: idx,
        })),
        correct: correct,
      };
    };

    const generateMethodQuestion = (cocktail) => {
      const correct = cocktail.method_ko;
      const wrongOptions = cocktails.value
        .filter(
          (c) => c.id !== cocktail.id && c.method_ko !== cocktail.method_ko
        )
        .slice(0, 3)
        .map((c) => c.method_ko);

      return {
        id: `${cocktail.id}-method`,
        type: QUESTION_TYPES.METHOD,
        cocktail: cocktail,
        question: `${cocktail.name_ko}(${cocktail.name})의 조주법은?`,
        options: shuffleArray([correct, ...wrongOptions]).map((opt, idx) => ({
          text: opt,
          isCorrect: opt === correct,
          index: idx,
        })),
        correct: correct,
      };
    };

    const generateBaseQuestion = (cocktail) => {
      const correct = cocktail.base_ko;
      const wrongOptions = cocktails.value
        .filter((c) => c.id !== cocktail.id && c.base_ko !== cocktail.base_ko)
        .slice(0, 3)
        .map((c) => c.base_ko);

      return {
        id: `${cocktail.id}-base`,
        type: QUESTION_TYPES.BASE,
        cocktail: cocktail,
        question: `${cocktail.name_ko}(${cocktail.name})의 기주는?`,
        options: shuffleArray([correct, ...wrongOptions]).map((opt, idx) => ({
          text: opt,
          isCorrect: opt === correct,
          index: idx,
        })),
        correct: correct,
      };
    };

    const generateGarnishQuestion = (cocktail) => {
      const correct = cocktail.garnish_ko;
      const wrongOptions = cocktails.value
        .filter(
          (c) => c.id !== cocktail.id && c.garnish_ko !== cocktail.garnish_ko
        )
        .slice(0, 3)
        .map((c) => c.garnish_ko);

      return {
        id: `${cocktail.id}-garnish`,
        type: QUESTION_TYPES.GARNISH,
        cocktail: cocktail,
        question: `${cocktail.name_ko}(${cocktail.name})의 가니쉬는?`,
        options: shuffleArray([correct, ...wrongOptions]).map((opt, idx) => ({
          text: opt,
          isCorrect: opt === correct,
          index: idx,
        })),
        correct: correct,
      };
    };

    // ====================================
    // 답변 처리
    // ====================================
    const submitAnswer = (optionIndex) => {
      if (answered.value) return;

      const question = currentQuestion.value;
      const selectedOption = question.options[optionIndex];
      selectedAnswer.value = optionIndex;
      selectedAnswers.value[currentQuestionIndex.value] = optionIndex;
      answered.value = true;

      const isCorrect = selectedOption.isCorrect;

      if (isCorrect) {
        feedback.value = "정답입니다! ✓";
        score.value++;
        stats.correctAnswers++;
      } else {
        feedback.value = `틀렸습니다. 정답: ${question.correct}`;
        stats.wrongAnswers.push({
          question: question.question,
          yourAnswer: selectedOption.text,
          correct: question.correct,
        });
      }

      stats.totalAttempts++;
      updateStats();
    };

    // ====================================
    // 다음 문제
    // ====================================
    const nextQuestion = () => {
      if (currentQuestionIndex.value < quizQuestions.value.length - 1) {
        currentQuestionIndex.value++;
        answered.value = false;
        selectedAnswer.value = null;
        feedback.value = "";
      } else {
        endQuiz();
      }
    };

    // ====================================
    // 문제 건너뛰기
    // ====================================
    const skipQuestion = () => {
      stats.totalAttempts++;
      updateStats();
      nextQuestion();
    };

    // ====================================
    // 퀴즈 종료
    // ====================================
    const endQuiz = () => {
      quizResults.value = quizQuestions.value.map((q, idx) => ({
        number: idx + 1,
        question: q.question,
        isCorrect: q.options.some(
          (opt, i) => opt.isCorrect && i === selectedAnswers.value[idx]
        ),
        yourAnswer:
          selectedAnswers.value[idx] !== undefined
            ? quizQuestions.value[idx].options[selectedAnswers.value[idx]].text
            : "건너뜀",
        correct: q.correct,
      }));
      currentScreen.value = SCREENS.RESULT;
    };

    // ====================================
    // 퀴즈 나가기
    // ====================================
    const exitQuiz = () => {
      if (confirm("정말로 나가시겠습니까? 진행 상황이 저장되지 않습니다.")) {
        currentScreen.value = SCREENS.HOME;
      }
    };

    // ====================================
    // 홈으로 돌아가기
    // ====================================
    const backToHome = () => {
      currentScreen.value = SCREENS.HOME;
    };

    // ====================================
    // 통계 업데이트
    // ====================================
    const updateStats = () => {
      localStorage.setItem("totalAttempts", stats.totalAttempts);
      localStorage.setItem("correctAnswers", stats.correctAnswers);
      localStorage.setItem("wrongAnswers", JSON.stringify(stats.wrongAnswers));
    };

    // ====================================
    // 유틸리티 함수
    // ====================================
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    return {
      currentScreen,
      loadingMessage,
      errorMessage,
      cocktails,
      cocktailInfo,
      studyMode,
      quizMode: ref("all"),
      quizQuestions,
      currentQuestionIndex,
      currentQuestion,
      answered,
      selectedAnswer,
      feedback,
      quizResults,
      score,
      stats,
      SCREENS,
      QUIZ_MODES,
      startQuiz,
      startStudy,
      exitStudy,
      submitAnswer,
      nextQuestion,
      skipQuestion,
      exitQuiz,
      backToHome,
      retryLoadData,
    };
  },
});

// ====================================
// LoadingScreen 컴포넌트
// ====================================
app.component("LoadingScreen", {
  props: ["loadingMessage"],
  template: `
<div class="screen text-center">
  <div style="padding: 60px 30px">
    <div
      style="
        font-size: 3rem;
        margin-bottom: 20px;
        animation: spin 1s linear infinite;
      "
    >
      ⏳
    </div>
    <h2
      style="font-size: 1.5rem; color: var(--dark-color); margin-bottom: 20px"
    >
      {{ loadingMessage }}
    </h2>
    <p style="color: #999; font-size: 1rem">잠시만 기다려주세요...</p>
  </div>
</div>
`,
});

// ====================================
// ErrorScreen 컴포넌트
// ====================================
app.component("ErrorScreen", {
  props: ["error"],
  emits: ["retry"],
  template: `
<div class="screen text-center">
  <div style="padding: 60px 30px">
    <div style="font-size: 3rem; margin-bottom: 20px">❌</div>
    <h2
      style="font-size: 1.5rem; color: var(--dark-color); margin-bottom: 20px"
    >
      오류 발생
    </h2>
    <p
      style="
        color: #999;
        font-size: 0.95rem;
        margin-bottom: 30px;
        white-space: pre-wrap;
      "
    >
      {{ error }}
    </p>
    <button class="btn btn-primary" @click="$emit('retry')">다시 시도</button>
  </div>
</div>
`,
});

// ====================================
// HomeScreen 컴포넌트
// ====================================
app.component("HomeScreen", {
  props: ["cocktails", "stats"],
  emits: ["start-quiz", "start-study"],
  template: `
<div class="screen">
  <!-- 학습 통계 -->
  <div class="stats">
    <h3>📊 학습 현황</h3>
    <div class="stat-info">
      <div class="stat-item">
        <span class="stat-label">총 풀이 문제</span>
        <span class="stat-value">{{ stats.totalAttempts }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">정답 개수</span>
        <span class="stat-value">{{ stats.correctAnswers }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">정답률</span>
        <span class="stat-value">{{ stats.accuracy }}%</span>
      </div>
    </div>
  </div>

  <!-- 학습 선택 -->
  <div class="study-selector">
    <h2>📚 칵테일 알아보기</h2>
    <p style="text-align: center; color: #999; margin-bottom: 20px">
      카드 형태로 칵테일 정보를 학습하세요!
    </p>
    <div class="mode-grid">
      <div class="mode-card" @click="$emit('start-study', 'base')">
        <div class="mode-icon">🥃</div>
        <h3>베이스별 학습</h3>
        <p>기주별로 정리된 칵테일</p>
      </div>
      <div class="mode-card" @click="$emit('start-study', 'glass')">
        <div class="mode-icon">🍸</div>
        <h3>글라스별 학습</h3>
        <p>글라스 종류별 칵테일</p>
      </div>
      <div class="mode-card" @click="$emit('start-study', 'method')">
        <div class="mode-icon">🔄</div>
        <h3>조주기법별 학습</h3>
        <p>조주법별 칵테일</p>
      </div>
    </div>
  </div>

  <!-- 퀴즈 모드 선택 -->
  <div class="mode-selector">
    <h2>📝 퀴즈 모드</h2>
    <div class="mode-grid">
      <div class="mode-card" @click="$emit('start-quiz', 'all')">
        <div class="mode-icon">📖</div>
        <h3>전체 학습</h3>
        <p>{{ cocktails.length * 5 }}개 문제</p>
      </div>
      <div class="mode-card" @click="$emit('start-quiz', 'random10')">
        <div class="mode-icon">🎲</div>
        <h3>랜덤 10문제</h3>
        <p>빠른 복습</p>
      </div>
      <div class="mode-card" @click="$emit('start-quiz', 'random20')">
        <div class="mode-icon">🎰</div>
        <h3>랜덤 20문제</h3>
        <p>집중 모드</p>
      </div>
    </div>
  </div>

  <!-- 주류 검색 섹션
  <div class="liquor-search-section">
    <h3>🛍️ 재료 검색 (DailyShot)</h3>
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="검색할 주류명을 입력하세요"
        @keyup.enter="searchLiquor"
      />
      <button class="btn-search" @click="searchLiquor">검색</button>
    </div>
    <div v-if="!searchQuery" class="search-suggestions">
      <button
        v-for="drink in suggestedDrinks"
        :key="drink"
        class="suggestion-btn"
        @click="quickSearch(drink)"
      >
        {{ drink }}
      </button>
    </div>
  </div> -->

  <!-- 친구 초대 섹션 -->
  <div class="invite-section">
    <h3>👥 친구와 함께 학습하세요!</h3>
    <div class="invite-buttons">
      <button class="btn-invite" @click="shareLinkCopy">
        <span class="invite-icon">🔗</span>
        <span>링크 복사</span>
      </button>
      <!-- <button class="btn-invite kakao" @click="shareKakao">
        <span class="invite-icon">💬</span>
        <span>카카오톡</span>
      </button>
      <button class="btn-invite email" @click="shareEmail">
        <span class="invite-icon">📧</span>
        <span>메일 공유</span>
      </button> -->
    </div>
    <div class="success-message" v-if="shareMessage">{{ shareMessage }}</div>
  </div>
</div>        
`,

  data() {
    return {
      shareMessage: "",
      searchQuery: "",
      suggestedDrinks: [
        "진(jin)",
        "럼(rum)",
        "위스키(whiskey)",
        "보드카(vodka)",
        "데킬라(tequila)",
        "브랜디(brandy)",
        "리큐르(riqueur)",
        "와인(wine)",
        "전통주(traditional)",
      ],
    };
  },

  methods: {
    shareLinkCopy() {
      const text =
        "🍹 조주기능사 칵테일 레시피 퀴즈에 초대합니다!\n" +
        window.location.href;
      navigator.clipboard.writeText(text).then(() => {
        this.shareMessage = "링크가 복사되었습니다!";
        setTimeout(() => {
          this.shareMessage = "";
        }, 2000);
      });
    },

    shareKakao() {
      alert("카카오톡 공유는 카카오 SDK 설정 후 사용 가능합니다.");
    },

    shareEmail() {
      const subject = "🍹 조주기능사 칵테일 레시피 퀴즈 초대";
      const body = `조주기능사 칵테일 레시피 퀴즈 앱을 소개합니다.\n\n링크: ${window.location.href}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    },

    searchLiquor() {
      if (!this.searchQuery.trim()) {
        alert("검색어를 입력해주세요.");
        return;
      }
      const searchUrl = `https://dailyshot.co/m/search/result?q=${encodeURIComponent(
        this.searchQuery
      )}`;
      window.open(searchUrl, "_blank");
    },

    quickSearch(drink) {
      this.searchQuery = drink;
      this.searchLiquor();
    },
  },
});

// ====================================
// FlashcardStudy 컴포넌트
// ====================================
app.component("FlashcardStudy", {
  props: ["cocktails", "studyMode", "cocktailInfo"],
  emits: ["back-home"],
  template: `
<div class="flashcard-study">
  <!-- 헤더 -->
  <div class="study-header">
    <button class="btn btn-secondary btn-small" @click="$emit('back-home')">
      ← 돌아가기
    </button>
    <h2>{{ getModeTitle() }}</h2>
    <div class="study-counter">
      {{ currentIndex + 1 }} / {{ currentGroupCocktails.length }}
    </div>
  </div>

  <!-- 그룹 선택 -->
  <div class="group-selector">
    <button
      v-for="(group, key) in groupedCocktails"
      :key="key"
      class="group-btn"
      :class="{ active: currentGroup === key }"
      @click="selectGroup(key)"
    >
      {{ key }} ({{ group.length }})
    </button>
  </div>

  <!-- 카드 -->
  <div class="flashcard-container">
    <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
      <!-- 앞면 -->
      <div class="flashcard-front">
        <div class="card-title">{{ currentCocktail.name_ko }}</div>
        <div class="card-subtitle">{{ currentCocktail.name }}</div>
        <div class="card-hint">카드를 클릭하여 뒤집기</div>
      </div>

      <!-- 뒷면 -->
      <div class="flashcard-back">
        <div class="card-details">
          <div class="detail-row">
            <span class="label">기주:</span>
            <span class="value"
              >{{ currentCocktail.base_ko }} ({{ currentCocktail.base }})</span
            >
          </div>
          <div class="detail-row">
            <span class="label">글라스:</span>
            <span class="value">{{ currentCocktail.glass_ko }}</span>
          </div>
          <div class="detail-row">
            <span class="label">조주법:</span>
            <span class="value">{{ currentCocktail.method_ko }}</span>
          </div>
        </div>

        <div class="ingredients-section">
          <h4>재료</h4>
          <ul>
            <li v-for="ing in currentCocktail.ingredients" :key="ing.name">
              {{ ing.name_ko }} {{ ing.amount }}{{ ing.unit }}
            </li>
            <li>
              <span class="label">가니쉬: </span>
              <span class="value">{{ currentCocktail.garnish_ko }}</span>
            </li>
          </ul>
        </div>

        <div class="tips-section">
          <p>{{ currentCocktail.tips }}</p>
        </div>
      </div>
    </div>
  </div>
  <!-- 네비게이션 -->
  <div class="card-navigation">
    <button
      class="btn btn-secondary"
      @click="previousCard"
      :disabled="currentIndex === 0"
    >
      ← 이전
    </button>
    <button
      class="btn btn-primary"
      @click="nextCard"
      :disabled="currentIndex === currentGroupCocktails.length - 1"
    >
      다음 →
    </button>
  </div>

  <!-- 쿠팡 파트너스 배너 -->
  <div class="coupang-section" v-if="currentCoupang">
    <div class="coupang-banner">
      <iframe
        :src="getCoupangWidgetUrl()"
        width="100%"
        height="300"
        frameborder="0"
        scrolling="no"
      ></iframe>
      <p style="font-size: 0.8rem; color: #999; margin-top: 10px">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
        제공받습니다.
      </p>
    </div>
  </div>

  <!-- DailyShot 검색 -->
  <div class="dailyshot-section" v-if="currentSearch">
    <h3>🔍 재료 구매처 찾기</h3>
    <div class="search-tabs">
      <button
        v-for="(item, idx) in currentSearch.search"
        :key="idx"
        class="tab-btn"
        :class="{ active: selectedSearchTab === idx }"
        @click="selectedSearchTab = idx"
      >
        {{ item.name }}
      </button>
    </div>
    <div class="dailyshot-iframe">
      <iframe
        :src="getDailyShotUrl()"
        width="100%"
        height="600"
        frameborder="0"
      ></iframe>
    </div>
  </div>

  <!-- 유튜브 영상 -->
  <div class="video-section" v-if="currentVideo">
    <h3>📹 참고 영상</h3>
    <div class="video-grid">
      <ul
        v-for="(video, idx) in currentVideo.video"
        :key="idx"
        class="video-item"
      >
        {{ video.name }} (
        <a v-if="video.url" :href="video.url" target="_blank" class=""
          >Shorts 보기</a
        >
        <span v-if="video.url&&video['url-l']"> | </span>
        <a v-if="video['url-l']" :href="video['url-l']" target="_blank" class=""
          >전체 영상</a
        >
        )
      </ul>
    </div>
  </div>
</div>
`,

  data() {
    return {
      currentGroup: "",
      currentIndex: 0,
      isFlipped: false,
      selectedSearchTab: 0,
    };
  },

  computed: {
    groupedCocktails() {
      const groups = {};
      this.cocktails.forEach((cocktail) => {
        let key = "";
        if (this.studyMode === "base") {
          key = cocktail.base_ko;
        } else if (this.studyMode === "glass") {
          key = cocktail.glass_ko;
        } else if (this.studyMode === "method") {
          key = cocktail.method_ko;
        }

        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(cocktail);
      });
      return groups;
    },

    currentGroupCocktails() {
      return this.groupedCocktails[this.currentGroup] || [];
    },

    currentCocktail() {
      return this.currentGroupCocktails[this.currentIndex] || {};
    },

    currentVideo() {
      if (!this.cocktailInfo) return null;
      return this.cocktailInfo.find(
        (v) => v.name === this.currentCocktail.name
      );
    },

    currentCoupang() {
      if (!this.cocktailInfo) return false;
      return this.cocktailInfo.find((v) => v.name === this.currentCocktail.name)
        ?.widgets;
    },

    currentSearch() {
      if (!this.cocktailInfo) return false;
      return this.cocktailInfo.find((v) => v.name === this.currentCocktail.name)
        ?.search;
    },
  },

  mounted() {
    // 첫 번째 그룹 선택
    const firstGroup = Object.keys(this.groupedCocktails)[0];
    if (firstGroup) {
      this.currentGroup = firstGroup;
    }
  },

  methods: {
    getModeTitle() {
      const titles = {
        base: "기주별 칵테일 학습",
        glass: "글라스별 칵테일 학습",
        method: "조주기법별 칵테일 학습",
      };
      return titles[this.studyMode] || "칵테일 학습";
    },

    selectGroup(group) {
      this.currentGroup = group;
      this.currentIndex = 0;
      this.isFlipped = false;
    },

    flipCard() {
      this.isFlipped = !this.isFlipped;
    },

    nextCard() {
      if (this.currentIndex < this.currentGroupCocktails.length - 1) {
        this.currentIndex++;
        this.isFlipped = false;
        this.selectedSearchTab = 0;
      }
    },

    previousCard() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.isFlipped = false;
        this.selectedSearchTab = 0;
      }
    },

    getCoupangWidgetUrl() {
      if (!this.currentCoupang) return "";
      const { id, trackingCode } = this.currentCoupang;
      return `https://ads-partners.coupang.com/widgets.html?id=${id}&template=carousel&trackingCode=${trackingCode}&subId=&width=680&height=140`;
    },

    getDailyShotUrl() {
      if (!this?.currentSearch) return "";
      const item = this.currentSearch[this.selectedSearchTab];
      if (!item) return "";
      return `https://dailyshot.co/m/search/result?q=${encodeURIComponent(
        item.brand
      )}`;
    },
  },
});

// ====================================
// QuizScreen 컴포넌트
// ====================================
app.component("QuizScreen", {
  props: [
    "currentQuestion",
    "questionIndex",
    "totalQuestions",
    "answered",
    "selectedAnswer",
    "feedback",
    "cocktailInfo",
  ],
  emits: ["answer", "next", "skip", "exit"],
  template: `
<div v-if="currentQuestion" class="screen">
  <div class="quiz-header">
    <span class="question-counter"
      >문제 {{ questionIndex + 1 }} / {{ totalQuestions }}</span
    >
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: ((questionIndex + 1) / totalQuestions * 100) + '%' }"
      ></div>
    </div>
  </div>

  <div class="question-card">
    <span class="question-type"
      >{{ getQuestionTypeLabel(currentQuestion.type) }}</span
    >
    <div class="question-text">{{ currentQuestion.question }}</div>

    <div class="options">
      <button
        v-for="(option, index) in currentQuestion.options"
        :key="index"
        class="option-btn"
        :class="{
                            'selected': selectedAnswer === index && !answered,
                            'correct': answered && option.isCorrect,
                            'incorrect': answered && selectedAnswer === index && !option.isCorrect
                        }"
        @click="!answered && $emit('answer', index)"
        :disabled="answered"
      >
        {{ option.text }}
      </button>
    </div>

    <div
      v-if="feedback"
      :class="['feedback', feedback.includes('정답') ? 'correct' : 'incorrect']"
    >
      {{ feedback }}
    </div>

    <div class="action-buttons">
      <button
        v-if="!answered"
        class="btn btn-secondary btn-small"
        @click="$emit('skip')"
      >
        건너뛰기
      </button>
      <button
        v-if="answered"
        class="btn btn-primary btn-small"
        @click="$emit('next')"
      >
        {{ questionIndex + 1 === totalQuestions ? '결과 보기' : '다음 문제' }}
      </button>
      <button class="btn btn-secondary btn-small" @click="$emit('exit')">
        나가기
      </button>
    </div>
  </div>
  <div style="text-align: center" v-if="feedback">
    <iframe
      :src="getVideoUrl()"
      frameborder="0"
      allow="encrypted-media"
      allowfullscreen
    >
    </iframe>
  </div>
</div>
`,
  computed: {
    currentVideo() {
      if (!this.cocktailInfo) return null;
      console.log(this.cocktailInfo);

      return this.cocktailInfo.find(
        (v) => v.name === this.currentCocktail.name
      );
    },
  },
  methods: {
    getVideoUrl() {
      console.log(this.currentQuestion.cocktail, this.cocktailInfo);
      return (
        "https://www.youtube.com/embed/" +
        this.cocktailInfo
          .find((v) => v.name === this.currentQuestion.cocktail.name)
          ?.video.find((e) => e.name === "이기적 영진닷컴")
          ["url-l"].split("=")[1] +
        "?autoplay=1&controls=0&rel=0&showinfo=0"
      );
    },
    getQuestionTypeLabel(type) {
      const labels = {
        ingredients: "재료 맞추기",
        glass: "글라스 맞추기",
        method: "조주법 맞추기",
        base: "기주 맞추기",
        garnish: "가니쉬 맞추기",
      };
      return labels[type] || type;
    },
  },
});

// ====================================
// ResultScreen 컴포넌트
// ====================================
app.component("ResultScreen", {
  props: ["score", "total", "results", "stats"],
  emits: ["back-home"],
  template: `
<div class="screen">
  <div class="result-header">
    <h2>학습 완료!</h2>
  </div>

  <div class="score-box">
    <div class="score-number">{{ score }} / {{ total }}</div>
    <div class="score-text">총 {{ total }}개 문제</div>
    <div class="score-detail">
      정답률: {{ Math.round((score / total) * 100) }}%
    </div>
  </div>

  <div class="stats mt-20">
    <h3>📊 전체 통계</h3>
    <div class="stat-info">
      <div class="stat-item">
        <span class="stat-label">누적 풀이</span>
        <span class="stat-value">{{ stats.totalAttempts }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">누적 정답</span>
        <span class="stat-value">{{ stats.correctAnswers }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">전체 정답률</span>
        <span class="stat-value">{{ stats.accuracy }}%</span>
      </div>
    </div>
  </div>

  <div class="result-list">
    <h3>📋 상세 결과</h3>
    <div
      v-for="(result, index) in results"
      :key="index"
      :class="['result-item', result.isCorrect ? 'correct' : 'incorrect']"
    >
      <div class="result-number">{{ result.number }}</div>
      <div class="result-content">
        <div class="result-question">{{ result.question }}</div>
        <div class="result-answer">당신의 답: {{ result.yourAnswer }}</div>
        <div v-if="!result.isCorrect" class="result-correct-answer">
          정답: {{ result.correct }}
        </div>
      </div>
      <div class="result-icon">{{ result.isCorrect ? '✓' : '✗' }}</div>
    </div>
  </div>

  <div class="action-buttons mt-20">
    <button class="btn btn-primary btn-wide" @click="$emit('back-home')">
      홈으로 돌아가기
    </button>
  </div>
</div>
`,
});

// 앱 마운트
app.mount("#app");
