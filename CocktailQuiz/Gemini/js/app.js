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
