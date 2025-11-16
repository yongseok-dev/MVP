// 조주기능사 칵테일 레시피 퀴즈 - Vue.js 애플리케이션
const { createApp } = Vue;

// 칵테일 데이터
const cocktailsData = [
    {"id":1,"name":"Gimlet","name_ko":"짐릿","base":"진","glass":"칵테일 글라스","method":"쉐이크","ingredients":["드라이 진 1.5oz","라임주스 0.5oz","설탕 1tea"],"garnish":"라임 필","tips":"짐은 라임(Gimlet과 Lime)"},
    {"id":2,"name":"Dry Martini","name_ko":"드라이 마티니","base":"진","glass":"칵테일 글라스","method":"스터","ingredients":["드라이 진 2oz","드라이 베르무트 0.5oz","앙고스투라 비터 1dash"],"garnish":"그린 올리브","tips":"마티니는 스터(stirred) 기본"},
    {"id":3,"name":"Singapore Sling","name_ko":"싱가포르 슬링","base":"진","glass":"콜린스 글라스","method":"쉐이크+빌드","ingredients":["드라이 진 1oz","체리 리큐르 0.5oz","베네딕틴 0.5oz","라임주스 0.5oz","앙고스투라 비터 1dash","소다수 적량"],"garnish":"오렌지 슬라이스+체리","tips":"싱가포르의 국민 칵테일"},
    {"id":4,"name":"Negroni","name_ko":"네그로니","base":"진","glass":"올드 패션드 글라스","method":"빌드","ingredients":["드라이 진 1oz","캄파리 1oz","스윗 베르무트 1oz"],"garnish":"오렌지 필","tips":"1:1:1 비율의 정확성 중요"},
    {"id":5,"name":"Tom Collins","name_ko":"톰 콜린스","base":"진","glass":"콜린스 글라스","method":"쉐이크+빌드","ingredients":["드라이 진 1.5oz","레몬주스 0.75oz","설탕 1tea","소다수 적량"],"garnish":"레몬 슬라이스+체리","tips":"사워 계열의 클래식"},
    {"id":6,"name":"Gin Fizz","name_ko":"진 피즈","base":"진","glass":"콜린스 글라스","method":"쉐이크+빌드","ingredients":["드라이 진 1.5oz","레몬주스 0.75oz","설탕 1tea","소다수 적량","달걀 흰자 1개"],"garnish":"레몬 슬라이스","tips":"Fizz는 에그 화이트 포함"},
    {"id":7,"name":"Manhattan","name_ko":"맨하탄","base":"위스키","glass":"칵테일 글라스","method":"스터","ingredients":["버번 위스키 1.5oz","스윗 베르무트 0.75oz","앙고스투라 비터 1dash"],"garnish":"마라스킹 체리","tips":"맨하탄은 Manhattan - 보드카 X, 위스키 O"},
    {"id":8,"name":"Old Fashioned","name_ko":"올드 패션드","base":"위스키","glass":"올드 패션드 글라스","method":"빌드","ingredients":["버번 위스키 1.5oz","설탕 1각설탕","앙고스투라 비터 2dash","소다수 1dash"],"garnish":"오렌지 필+체리","tips":"고전의 고전, 가장 간단한 칵테일"},
    {"id":9,"name":"Rusty Nail","name_ko":"러스티 네일","base":"위스키","glass":"올드 패션드 글라스","method":"빌드","ingredients":["스카치 위스키 1.5oz","드람부이 0.75oz"],"garnish":"레몬 필","tips":"스카치+드람부이의 완벽 조화"},
    {"id":10,"name":"Whiskey Sour","name_ko":"위스키 사워","base":"위스키","glass":"사워 글라스","method":"쉐이크","ingredients":["버번 위스키 1.5oz","레몬주스 0.75oz","설탕 0.5oz"],"garnish":"레몬 슬라이스+체리","tips":"사워 스타일의 클래식"},
    {"id":11,"name":"Irish Coffee","name_ko":"아이리시 커피","base":"위스키","glass":"아이리시 커피 글라스","method":"빌드","ingredients":["아이리시 위스키 1oz","핫 커피 4oz","설탕 1tea","생크림 적량"],"garnish":"생크림","tips":"온음료, 데미타스 아래 감(Demitasse)에서 시작"},
    {"id":12,"name":"Brandy Alexander","name_ko":"브랜디 알렉산더","base":"브랜디","glass":"칵테일 글라스","method":"쉐이크","ingredients":["브랜디 0.75oz","크렘 드 카카오 브라운 0.75oz","생크림 0.75oz"],"garnish":"넛맥 가루","tips":"알렉산더 계열의 원조"},
    {"id":13,"name":"Sidecar","name_ko":"사이드카","base":"브랜디","glass":"칵테일 글라스","method":"쉐이크","ingredients":["브랜디 1oz","트리플 섹 1oz","레몬주스 0.5oz"],"garnish":"없음","tips":"1:1:0.5 비율 정확성"},
    {"id":14,"name":"Honeymoon","name_ko":"허니문","base":"브랜디","glass":"칵테일 글라스","method":"쉐이크","ingredients":["애플 브랜디 1oz","베네딕틴 0.5oz","트리플 섹 0.25oz","레몬주스 0.5oz"],"garnish":"없음","tips":"브랜디와 리큐르의 조화"},
    {"id":15,"name":"Daiquiri","name_ko":"다이키리","base":"럼","glass":"칵테일 글라스","method":"쉐이크","ingredients":["라이트 럼 1.75oz","라임주스 0.75oz","심플 시럽 0.5oz"],"garnish":"없음","tips":"럼의 대표, 가장 간단하고 완벽"},
    {"id":16,"name":"Bacardi","name_ko":"바카디","base":"럼","glass":"칵테일 글라스","method":"쉐이크","ingredients":["바카디 럼 1.75oz","라임주스 0.75oz","그레나딘 시럽 1tea"],"garnish":"없음","tips":"다이키리에 그레나딘 추가"},
    {"id":17,"name":"Cuba Libre","name_ko":"쿠바 리브레","base":"럼","glass":"하이볼 글라스","method":"빌드","ingredients":["라이트 럼 1.5oz","라임주스 0.5oz","콜라 적량"],"garnish":"라임 웨지","tips":"럼+콜라=쿠바 리브레"},
    {"id":18,"name":"Mai Tai","name_ko":"마이 타이","base":"럼","glass":"올드 패션드 글라스","method":"쉐이크","ingredients":["라이트 럼 1oz","다크 럼 1oz","오렌주 큐라소 0.5oz","라임주스 0.75oz","심플 시럽 0.25oz","앙고스투라 비터 1dash"],"garnish":"파인애플 웨지+민트","tips":"마이타이는 Mai Tai (최고=maximum)"},
    {"id":19,"name":"Pina Colada","name_ko":"피나 콜라다","base":"럼","glass":"필스너 글라스","method":"블렌드","ingredients":["라이트 럼 1.5oz","코코넛 크림 1.5oz","파인애플 주스 3oz"],"garnish":"파인애플 웨지+체리","tips":"블렌드, 파인애플+코코넛의 조화"},
    {"id":20,"name":"Blue Hawaiian","name_ko":"블루 하와이안","base":"럼","glass":"필스너 글라스","method":"블렌드","ingredients":["라이트 럼 1oz","블루 큐라소 1oz","파인애플 주스 2oz","코코넛 크림 1oz"],"garnish":"파인애플 웨지+체리","tips":"하와이안 스타일, 블루 색상"},
    {"id":21,"name":"Cosmopolitan","name_ko":"코스모폴리탄","base":"보드카","glass":"칵테일 글라스","method":"쉐이크","ingredients":["보드카 1oz","트리플 섹 0.5oz","크랜베리 주스 1.5oz","라임주스 0.5oz"],"garnish":"라임 필","tips":"섹스와더씨티의 칵테일"},
    {"id":22,"name":"Moscow Mule","name_ko":"모스코 뮬","base":"보드카","glass":"하이볼 글라스(구리잔)","method":"빌드","ingredients":["보드카 1.5oz","진저 비어 적량","라임주스 0.5oz"],"garnish":"라임 슬라이스","tips":"구리 잔(Moscow Mule cup) 사용"},
    {"id":23,"name":"Sea Breeze","name_ko":"씨 브리즈","base":"보드카","glass":"하이볼 글라스","method":"빌드","ingredients":["보드카 1.5oz","크랜베리 주스 3oz","자몽 주스 1.5oz"],"garnish":"라임 웨지","tips":"바다 바람의 상큼함"},
    {"id":24,"name":"Black Russian","name_ko":"블랙 러시안","base":"보드카","glass":"올드 패션드 글라스","method":"빌드","ingredients":["보드카 1.5oz","커피 리큐르 0.75oz"],"garnish":"없음","tips":"블랙=커피 리큐르"},
    {"id":25,"name":"Long Island Iced Tea","name_ko":"롱 아일랜드 아이스티","base":"보드카","glass":"콜린스 글라스","method":"빌드","ingredients":["보드카 0.5oz","진 0.5oz","럼 0.5oz","데킬라 0.5oz","트리플 섹 0.5oz","레몬주스 0.75oz","심플 시럽 0.5oz","콜라 1oz"],"garnish":"레몬 웨지","tips":"5가지 주류 포함, 최강 칵테일"},
    {"id":26,"name":"Margarita","name_ko":"마가리타","base":"데킬라","glass":"칵테일 글라스","method":"쉐이크","ingredients":["데킬라 1.5oz","트리플 섹 1oz","라임주스 0.5oz"],"garnish":"소금 리밍","tips":"데킬라 대표, 글라스 소금 무조건"},
    {"id":27,"name":"Tequila Sunrise","name_ko":"데킬라 선라이즈","base":"데킬라","glass":"하이볼 글라스","method":"빌드","ingredients":["데킬라 1.5oz","오렌지 주스 적량","그레나딘 시럽 0.5oz"],"garnish":"오렌지 슬라이스+체리","tips":"일출의 색상, 그레나딘 가라앉음"},
    {"id":28,"name":"Grasshopper","name_ko":"그래스호퍼","base":"리큐르","glass":"칵테일 글라스","method":"쉐이크","ingredients":["크렘 드 민트 그린 0.5oz","크렘 드 카카오 화이트 0.5oz","생크림 0.5oz"],"garnish":"없음","tips":"초콜릿+민트+크림=그래스호퍼"},
    {"id":29,"name":"B-52","name_ko":"B-52","base":"리큐르","glass":"샷 글라스(리큐르 글라스)","method":"플루트","ingredients":["커피 리큐르 0.33oz","베일리스 0.33oz","그랑 마르니에 0.33oz"],"garnish":"없음","tips":"플루트 칵테일, 층이 분리됨"},
    {"id":30,"name":"Pousse Cafe","name_ko":"푸스 카페","base":"리큐르","glass":"리큐르 글라스","method":"플루트","ingredients":["그레나딘 시럽 1/3oz","크렘 드 민트 그린 1/3oz","브랜디 1/3oz"],"garnish":"없음","tips":"비중 다른 리큐르로 층 만들기"},
    {"id":31,"name":"Golden Cadillac","name_ko":"골든 캐딜락","base":"리큐르","glass":"칵테일 글라스","method":"쉐이크","ingredients":["갈리아노 0.75oz","크렘 드 카카오 화이트 0.75oz","생크림 0.75oz"],"garnish":"없음","tips":"금색의 우아함"},
    {"id":32,"name":"Kir","name_ko":"키르","base":"와인","glass":"화이트 와인 글라스","method":"빌드","ingredients":["화이트 와인 3oz","크렘 드 카시스 0.5oz"],"garnish":"레몬 필","tips":"와인+크림 드 카시스, 프랑스식"},
    {"id":33,"name":"Jun Buck","name_ko":"준벅","base":"한국 전통주","glass":"콜린스 글라스","method":"쉐이크+빌드","ingredients":["복분자주 1oz","멜론 리큐르 0.5oz","럼 0.5oz","파인애플 주스 1.5oz","크랜베리 주스 1oz"],"garnish":"파인애플 웨지+체리","tips":"한국식 응원 칵테일"},
    {"id":34,"name":"Puppy Love","name_ko":"풋사랑","base":"한국 전통주","glass":"칵테일 글라스","method":"쉐이크","ingredients":["복분자주 1oz","사과 리큐르 1oz","라임주스 0.5oz"],"garnish":"사과 슬라이스","tips":"사랑스러운 핑크색"},
    {"id":35,"name":"Gochang","name_ko":"고창","base":"한국 전통주","glass":"칵테일 글라스","method":"쉐이크","ingredients":["복분자주 1.5oz","라즈베리 시럽 0.5oz","라임주스 0.5oz"],"garnish":"라즈베리","tips":"고장의 맛"},
    {"id":36,"name":"Healing","name_ko":"힐링","base":"한국 전통주","glass":"콜린스 글라스","method":"빌드","ingredients":["매실주 1.5oz","진저 에일 2oz","레몬주스 0.5oz"],"garnish":"레몬 슬라이스","tips":"매실주의 건강함"},
    {"id":37,"name":"Virgin Mojito","name_ko":"버진 모히토","base":"무알콜","glass":"콜린스 글라스","method":"뮬드+빌드","ingredients":["민트 잎 10개","라임 반개","설탕 2tea","소다수 적량"],"garnish":"민트 스프리그","tips":"모히토의 무알콜 버전"},
    {"id":38,"name":"Shirley Temple","name_ko":"셜리 템플","base":"무알콜","glass":"칵테일 글라스","method":"빌드","ingredients":["그레나딘 시럽 0.5oz","오렌지 주스 2oz","소다수 1oz"],"garnish":"오렌지 슬라이스+체리","tips":"아이들을 위한 칵테일"},
    {"id":39,"name":"Virgin Fruit Punch","name_ko":"버진 프루트 펀치","base":"무알콜","glass":"필스너 글라스","method":"빌드","ingredients":["오렌지 주스 1oz","파인애플 주스 1oz","레몬주스 0.5oz","자몽 주스 1oz","크랜베리 주스 1oz"],"garnish":"파인애플 웨지+체리","tips":"상큼한 과일 칵테일"},
    {"id":40,"name":"Fresh Lemon Squash","name_ko":"프레시 레몬 스쿼시","base":"무알콜","glass":"콜린스 글라스","method":"빌드","ingredients":["레몬주스 1oz","심플 시럽 0.5oz","소다수 2oz"],"garnish":"레몬 슬라이스","tips":"진정한 상큼함"}
];

// Vue 앱 생성
const app = createApp({
    data() {
        return {
            cocktails: cocktailsData,
            currentScreen: 'start', // 'start', 'quiz', 'flashcard', 'result'
            
            // 퀴즈 상태
            currentQuestionIndex: 0,
            quizQuestions: [],
            selectedAnswer: null,
            showFeedback: false,
            isCorrect: false,
            currentQuestion: null,
            score: 0,
            
            // 선택 상태
            showCategorySelection: false,
            selectedCategory: 'all',
            questionCount: 10,
            
            // 결과 저장
            userAnswers: [],
            showOnlyWrong: false,
            
            // 플래시카드
            currentFlashcardIndex: 0,
            isFlipped: false,
            filteredCocktails: [],
            
            // 통계
            stats: {
                totalAttempts: 0,
                totalScore: 0,
                averageScore: 0,
                maxScore: 0
            },
            
            // 오답노트
            wrongAnswers: [],
            wrongAnswersDetail: []
        }
    },
    
    computed: {
        progressPercentage() {
            return ((this.currentQuestionIndex + 1) / this.quizQuestions.length) * 100;
        },
        
        scorePercentage() {
            return (this.score / this.quizQuestions.length) * 100;
        },
        
        categories() {
            const unique = [...new Set(this.cocktails.map(c => c.base))].sort();
            return unique;
        },
        
        currentFlashcard() {
            return this.filteredCocktails[this.currentFlashcardIndex] || {};
        },
        
        displayedResults() {
            if (this.showOnlyWrong) {
                return this.wrongAnswersDetail;
            }
            return this.userAnswers;
        },
        
        performanceByBase() {
            const performance = {};
            this.categories.forEach(base => {
                performance[base] = { correct: 0, total: 0 };
            });
            
            this.userAnswers.forEach(answer => {
                const cocktail = this.cocktails.find(c => c.id === answer.cocktailId);
                if (cocktail) {
                    performance[cocktail.base].total++;
                    if (answer.isCorrect) {
                        performance[cocktail.base].correct++;
                    }
                }
            });
            
            return performance;
        }
    },
    
    methods: {
        // 퀴즈 시작
        startQuiz(category, count) {
            this.selectedCategory = category;
            this.questionCount = count;
            
            // 칵테일 필터링
            let filtered = this.cocktails;
            if (category !== 'all') {
                filtered = this.cocktails.filter(c => c.base === category);
            }
            
            // 랜덤 선택
            let selected = [];
            const availableCount = Math.min(count, filtered.length);
            for (let i = 0; i < availableCount; i++) {
                const randomIdx = Math.floor(Math.random() * filtered.length);
                selected.push(filtered[randomIdx]);
                filtered.splice(randomIdx, 1);
            }
            
            // 문제 생성
            this.generateQuestions(selected);
            
            // 화면 전환
            this.currentScreen = 'quiz';
            this.currentQuestionIndex = 0;
            this.selectedAnswer = null;
            this.showFeedback = false;
            this.score = 0;
            this.userAnswers = [];
        },
        
        // 문제 생성
        generateQuestions(cocktails) {
            this.quizQuestions = [];
            
            cocktails.forEach(cocktail => {
                const questionTypes = [
                    this.createIngredientsQuestion,
                    this.createMethodQuestion,
                    this.createGlassQuestion,
                    this.createGarnishQuestion,
                    this.createNameQuestion
                ];
                
                // 랜덤하게 1-2개의 문제 타입 선택
                const numQuestions = Math.random() > 0.5 ? 1 : 2;
                for (let i = 0; i < numQuestions; i++) {
                    const questionFn = questionTypes[Math.floor(Math.random() * questionTypes.length)];
                    const question = questionFn(cocktail);
                    if (question) {
                        this.quizQuestions.push(question);
                    }
                }
            });
            
            // 문제 개수 제한
            this.quizQuestions = this.quizQuestions.slice(0, this.questionCount);
            
            // 첫 문제 표시
            this.showQuestion();
        },
        
        // 재료 문제
        createIngredientsQuestion(cocktail) {
            const mainIngredient = cocktail.ingredients[0];
            const allCocktails = this.cocktails;
            
            // 오답 선택
            let wrongOptions = [];
            for (let i = 0; i < 3; i++) {
                const random = allCocktails[Math.floor(Math.random() * allCocktails.length)];
                if (!wrongOptions.includes(random.ingredients[0]) && random.ingredients[0] !== mainIngredient) {
                    wrongOptions.push(random.ingredients[0]);
                }
            }
            
            const options = [mainIngredient, ...wrongOptions].sort(() => Math.random() - 0.5);
            
            return {
                type: '🥃 재료 맞추기',
                question: `'${cocktail.name_ko}'의 주재료는?`,
                options: options,
                correctIndex: options.indexOf(mainIngredient),
                cocktailId: cocktail.id
            };
        },
        
        // 기법 문제
        createMethodQuestion(cocktail) {
            const methods = [...new Set(this.cocktails.map(c => c.method))];
            const correctMethod = cocktail.method;
            const wrongMethods = methods.filter(m => m !== correctMethod).slice(0, 3);
            
            const options = [correctMethod, ...wrongMethods].sort(() => Math.random() - 0.5);
            
            return {
                type: '🎯 조주 기법',
                question: `'${cocktail.name_ko}'의 조주 기법은?`,
                options: options,
                correctIndex: options.indexOf(correctMethod),
                cocktailId: cocktail.id
            };
        },
        
        // 글라스 문제
        createGlassQuestion(cocktail) {
            const glasses = [...new Set(this.cocktails.map(c => c.glass))];
            const correctGlass = cocktail.glass;
            const wrongGlasses = glasses.filter(g => g !== correctGlass).slice(0, 3);
            
            const options = [correctGlass, ...wrongGlasses].sort(() => Math.random() - 0.5);
            
            return {
                type: '🥃 글라스 선택',
                question: `'${cocktail.name_ko}'를 담는 글라스는?`,
                options: options,
                correctIndex: options.indexOf(correctGlass),
                cocktailId: cocktail.id
            };
        },
        
        // 가니쉬 문제
        createGarnishQuestion(cocktail) {
            if (!cocktail.garnish || cocktail.garnish === '없음') return null;
            
            const garnishes = this.cocktails
                .filter(c => c.garnish && c.garnish !== '없음')
                .map(c => c.garnish);
            
            const correctGarnish = cocktail.garnish;
            const wrongGarnishes = garnishes.filter(g => g !== correctGarnish).slice(0, 3);
            
            if (wrongGarnishes.length < 3) return null;
            
            const options = [correctGarnish, ...wrongGarnishes].sort(() => Math.random() - 0.5);
            
            return {
                type: '🍋 가니쉬',
                question: `'${cocktail.name_ko}'의 가니쉬는?`,
                options: options,
                correctIndex: options.indexOf(correctGarnish),
                cocktailId: cocktail.id
            };
        },
        
        // 칵테일 이름 문제
        createNameQuestion(cocktail) {
            const names = [...new Set(this.cocktails.map(c => c.name_ko))];
            const correctName = cocktail.name_ko;
            const wrongNames = names.filter(n => n !== correctName).slice(0, 3);
            
            const baseInfo = `기주: ${cocktail.base}, 기법: ${cocktail.method}, 글라스: ${cocktail.glass}`;
            const options = [correctName, ...wrongNames].sort(() => Math.random() - 0.5);
            
            return {
                type: '🍹 칵테일 이름',
                question: `${baseInfo}인 칵테일은?`,
                options: options,
                correctIndex: options.indexOf(correctName),
                cocktailId: cocktail.id
            };
        },
        
        // 문제 표시
        showQuestion() {
            this.currentQuestion = this.quizQuestions[this.currentQuestionIndex];
            this.selectedAnswer = null;
            this.showFeedback = false;
        },
        
        // 답안 선택
        selectAnswer(index) {
            this.selectedAnswer = index;
            this.isCorrect = index === this.currentQuestion.correctIndex;
            this.showFeedback = true;
            
            if (this.isCorrect) {
                this.score++;
            }
            
            // 사용자 답안 저장
            this.userAnswers.push({
                question: this.currentQuestion.question,
                userAnswer: this.currentQuestion.options[index],
                correctAnswer: this.currentQuestion.options[this.currentQuestion.correctIndex],
                isCorrect: this.isCorrect,
                cocktailId: this.currentQuestion.cocktailId
            });
            
            // 틀렸을 경우 오답노트에 추가
            if (!this.isCorrect && !this.wrongAnswers.includes(this.currentQuestion.cocktailId)) {
                this.wrongAnswers.push(this.currentQuestion.cocktailId);
                this.wrongAnswersDetail.push({
                    question: this.currentQuestion.question,
                    userAnswer: this.currentQuestion.options[index],
                    correctAnswer: this.currentQuestion.options[this.currentQuestion.correctIndex],
                    isCorrect: false,
                    cocktailId: this.currentQuestion.cocktailId
                });
            }
        },
        
        // 다음 문제
        nextQuestion() {
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex >= this.quizQuestions.length) {
                this.finishQuiz();
            } else {
                this.showQuestion();
            }
        },
        
        // 퀴즈 완료
        finishQuiz() {
            // 통계 업데이트
            this.stats.totalAttempts++;
            this.stats.totalScore += this.score;
            this.stats.averageScore = this.stats.totalScore / this.stats.totalAttempts;
            if (this.score / this.quizQuestions.length > this.stats.maxScore) {
                this.stats.maxScore = this.score / this.quizQuestions.length;
            }
            
            // 로컬스토리지에 저장
            this.saveStats();
            
            // 결과 화면으로
            this.currentScreen = 'result';
        },
        
        // 플래시카드 시작
        startFlashcard() {
            this.currentFlashcardIndex = 0;
            this.isFlipped = false;
            this.filteredCocktails = [...this.cocktails].sort(() => Math.random() - 0.5);
            this.currentScreen = 'flashcard';
        },
        
        // 카테고리별 플래시카드
        selectCategory(category) {
            this.filteredCocktails = this.cocktails.filter(c => c.base === category)
                .sort(() => Math.random() - 0.5);
            this.showCategorySelection = false;
            this.currentFlashcardIndex = 0;
            this.isFlipped = false;
            this.currentScreen = 'flashcard';
        },
        
        // 플래시카드 플립
        toggleFlip() {
            this.isFlipped = !this.isFlipped;
        },
        
        // 이전 카드
        prevFlashcard() {
            this.currentFlashcardIndex--;
            if (this.currentFlashcardIndex < 0) {
                this.currentFlashcardIndex = this.filteredCocktails.length - 1;
            }
            this.isFlipped = false;
        },
        
        // 다음 카드
        nextFlashcard() {
            this.currentFlashcardIndex++;
            if (this.currentFlashcardIndex >= this.filteredCocktails.length) {
                this.currentFlashcardIndex = 0;
            }
            this.isFlipped = false;
        },
        
        // 난이도 평가
        rateFlashcard(rating) {
            if (rating === 'easy') {
                // 다음 카드로
                this.nextFlashcard();
            } else {
                // 하드는 나중에 다시 보기 위해 배열 끝에 추가
                const current = this.filteredCocktails[this.currentFlashcardIndex];
                this.filteredCocktails.push(current);
                this.nextFlashcard();
            }
        },
        
        // 플래시카드 종료
        exitFlashcard() {
            this.currentScreen = 'start';
        },
        
        // 오답노트에서 퀴즈 시작
        startQuizFromWrong() {
            const wrongCocktails = this.cocktails.filter(c => this.wrongAnswers.includes(c.id));
            if (wrongCocktails.length === 0) return;
            
            this.generateQuestions(wrongCocktails);
            this.currentScreen = 'quiz';
            this.currentQuestionIndex = 0;
            this.selectedAnswer = null;
            this.showFeedback = false;
            this.score = 0;
            this.userAnswers = [];
            this.wrongAnswersDetail = [];
        },
        
        // 다시 풀기
        retakeQuiz() {
            this.wrongAnswersDetail = [];
            this.startQuiz(this.selectedCategory, this.questionCount);
        },
        
        // 처음으로
        goHome() {
            this.currentScreen = 'start';
        },
        
        // 통계 초기화
        resetStats() {
            if (confirm('정말 통계를 초기화하시겠습니까?')) {
                this.stats = {
                    totalAttempts: 0,
                    totalScore: 0,
                    averageScore: 0,
                    maxScore: 0
                };
                this.wrongAnswers = [];
                this.wrongAnswersDetail = [];
                this.saveStats();
            }
        },
        
        // 통계 저장
        saveStats() {
            localStorage.setItem('cocktailQuizStats', JSON.stringify({
                stats: this.stats,
                wrongAnswers: this.wrongAnswers
            }));
        },
        
        // 통계 불러오기
        loadStats() {
            const saved = localStorage.getItem('cocktailQuizStats');
            if (saved) {
                const data = JSON.parse(saved);
                this.stats = data.stats;
                this.wrongAnswers = data.wrongAnswers;
            }
        }
    },
    
    mounted() {
        // 앱 시작 시 통계 불러오기
        this.loadStats();
    }
});

// 앱 마운트
app.mount('#app');
