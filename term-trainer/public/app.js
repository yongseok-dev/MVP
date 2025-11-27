const { createApp } = Vue;

const apiBase = ""; // 같은 도메인/포트에서 쓰면 빈 문자열로 두면 됩니다.

createApp({
  data() {
    return {
      currentUser: null,
      token: null,
      terms: [],
      loading: false,
      errorMessage: "",
      successMessage: "",

      loginForm: {
        username: "",
        password: "",
      },
      signupForm: {
        username: "",
        password: "",
      },
      newTerm: {
        ko: "",
        en: "",
        definitionKo: "",
        definitionEn: "",
        tagsText: "",
      },
      quiz: {
        mode: "ko-en",
        questions: [],
        currentIndex: 0,
        userAnswer: "",
        result: null,
        totalDue: null,
      },
    };
  },
  methods: {
    setError(msg) {
      this.errorMessage = msg;
      this.successMessage = "";
    },
    setSuccess(msg) {
      this.successMessage = msg;
      this.errorMessage = "";
    },
    saveAuthToStorage() {
      if (this.token && this.currentUser) {
        localStorage.setItem("termTrainerToken", this.token);
        localStorage.setItem(
          "termTrainerUser",
          JSON.stringify(this.currentUser)
        );
      } else {
        localStorage.removeItem("termTrainerToken");
        localStorage.removeItem("termTrainerUser");
      }
    },
    loadAuthFromStorage() {
      const token = localStorage.getItem("termTrainerToken");
      const userStr = localStorage.getItem("termTrainerUser");
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.token = token;
          this.currentUser = user;
        } catch (e) {
          console.error(e);
        }
      }
    },
    apiHeaders() {
      const headers = { "Content-Type": "application/json" };
      if (this.token) {
        headers["Authorization"] = "Bearer " + this.token;
      }
      return headers;
    },
    async signup() {
      this.loading = true;
      this.setError("");
      this.setSuccess("");
      try {
        const res = await fetch(apiBase + "/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.signupForm),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || "회원가입 실패");
        }
        this.setSuccess("회원가입 완료. 이제 로그인해 주세요.");
      } catch (e) {
        this.setError(e.message);
      } finally {
        this.loading = false;
      }
    },
    async login() {
      this.loading = true;
      this.setError("");
      this.setSuccess("");
      try {
        const res = await fetch(apiBase + "/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.loginForm),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || "로그인 실패");
        }
        this.token = data.token;
        this.currentUser = data.user;
        this.saveAuthToStorage();
        this.setSuccess("로그인 성공");
        this.loginForm.password = "";
        await this.loadTerms();
      } catch (e) {
        this.setError(e.message);
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.currentUser = null;
      this.saveAuthToStorage();
      this.terms = [];
      this.setSuccess("로그아웃되었습니다.");
    },
    async loadTerms() {
      if (!this.currentUser || !this.token) {
        this.terms = [];
        return;
      }
      this.loading = true;
      this.setError("");
      try {
        const res = await fetch(apiBase + "/api/terms", {
          method: "GET",
          headers: this.apiHeaders(),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "용어 조회 실패");
        }
        this.terms = data;
      } catch (e) {
        this.setError(e.message);
      } finally {
        this.loading = false;
      }
    },
    async addTerm() {
      if (!this.newTerm.ko || !this.newTerm.en) {
        this.setError("한국어/영어 용어는 필수입니다.");
        return;
      }
      this.loading = true;
      this.setError("");
      this.setSuccess("");
      try {
        const payload = {
          ko: this.newTerm.ko,
          en: this.newTerm.en,
          definitionKo: this.newTerm.definitionKo,
          definitionEn: this.newTerm.definitionEn,
          tags: this.newTerm.tagsText
            ? this.newTerm.tagsText
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        };
        const res = await fetch(apiBase + "/api/terms", {
          method: "POST",
          headers: this.apiHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || "용어 추가 실패");
        }
        this.terms.push(data.term);
        this.newTerm.ko = "";
        this.newTerm.en = "";
        this.newTerm.definitionKo = "";
        this.newTerm.definitionEn = "";
        this.newTerm.tagsText = "";
        this.setSuccess("용어가 추가되었습니다.");
      } catch (e) {
        this.setError(e.message);
      } finally {
        this.loading = false;
      }
    },
    async loadQuiz() {
      if (!this.currentUser || !this.token) {
        this.setError("로그인 후 이용해 주세요.");
        return;
      }
      this.loading = true;
      this.quiz.result = null;
      this.quiz.userAnswer = "";
      this.setError("");
      this.setSuccess("");
      try {
        const url = `${apiBase}/api/quiz?mode=${encodeURIComponent(
          this.quiz.mode
        )}&count=10`;
        const res = await fetch(url, {
          method: "GET",
          headers: this.apiHeaders(),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || "퀴즈 문제 불러오기 실패");
        }
        this.quiz.questions = data.terms || [];
        this.quiz.currentIndex = 0;
        this.quiz.userAnswer = "";
        this.quiz.result = null;
        this.quiz.totalDue = data.totalDue;
        if (this.quiz.questions.length === 0) {
          this.setSuccess("오늘 복습할 문제가 없습니다. 🎉");
        }
      } catch (e) {
        this.setError(e.message);
      } finally {
        this.loading = false;
      }
    },
    async submitAnswer() {
      if (!this.currentQuestion) return;
      if (!this.quiz.userAnswer.trim()) {
        this.setError("답을 입력해 주세요.");
        return;
      }
      this.loading = true;
      this.setError("");
      this.setSuccess("");
      try {
        const payload = {
          termId: this.currentQuestion.id,
          mode: this.quiz.mode,
          userAnswer: this.quiz.userAnswer,
        };
        const res = await fetch(apiBase + "/api/quiz/answer", {
          method: "POST",
          headers: this.apiHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || "정답 제출 실패");
        }
        this.quiz.result = {
          correct: data.correct,
          correctAnswer: data.correctAnswer,
          nextReviewAt: data.stats?.nextReviewAt || null,
          definitionKo: data.definitionKo || "",
          definitionEn: data.definitionEn || "",
        };
      } catch (e) {
        this.setError(e.message);
      } finally {
        this.loading = false;
      }
    },
    nextQuestion() {
      if (this.quiz.currentIndex < this.quiz.questions.length - 1) {
        this.quiz.currentIndex += 1;
        this.quiz.userAnswer = "";
        this.quiz.result = null;
      } else {
        this.setSuccess("퀴즈를 모두 완료했습니다. 👏");
        this.quiz.questions = [];
        this.quiz.userAnswer = "";
        this.quiz.result = null;
      }
    },
  },
  computed: {
    currentQuestion() {
      if (this.quiz.questions.length === 0) return null;
      return this.quiz.questions[this.quiz.currentIndex] || null;
    },
  },

  async mounted() {
    // 새로고침해도 로그인 상태 유지
    this.loadAuthFromStorage();
    if (this.currentUser && this.token) {
      await this.loadTerms();
    }
  },
}).mount("#app");
