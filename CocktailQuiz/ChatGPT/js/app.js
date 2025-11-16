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
