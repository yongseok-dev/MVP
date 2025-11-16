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

    // 점수 백분율 계산
    scorePercentage() {
      if (this.questionCount === 0) return 0;
      return ((this.score / this.questionCount) * 100).toFixed(0); // 정수형으로 반올림
    },

    // 틀린 문제 목록 필터링
    incorrectAnswers() {
      return this.userAnswers.filter((a) => !a.isCorrect);
    },

    // 점수대별 격려 메시지 생성
    encouragementMessage() {
      const percentage = parseFloat(this.scorePercentage);
      if (percentage >= 90) {
        return {
          text: "🎉 합격권! 칵테일 마스터십니다! 이대로 쭉!",
          color: "success",
        };
      } else if (percentage >= 70) {
        return {
          text: "👍 우수! 조금만 다듬으면 완벽합니다. 다음엔 만점!",
          color: "info",
        };
      } else if (percentage >= 50) {
        return {
          text: "💪 분발! 핵심 칵테일 재료/기법을 집중적으로 외워보세요.",
          color: "warning",
        };
      } else {
        return {
          text: "🔥 재도전! 기본기가 부족해요. 베이스별 학습이 필요합니다.",
          color: "danger",
        };
      }
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
