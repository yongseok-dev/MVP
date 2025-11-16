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
