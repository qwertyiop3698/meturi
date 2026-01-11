let selectedKeywords = []; // 선택한 키워드들을 담을 바구니

// 다음 질문으로 넘어가는 함수
function nextStep(currentId, nextId, keyword) {
    selectedKeywords.push(keyword); // 키워드 저장
    
    document.getElementById(currentId).classList.remove('active');
    document.getElementById(nextId).classList.add('active');
}

// 설문 종료 후 검색 실행
function finishSurvey(finalKeyword) {
    selectedKeywords.push(finalKeyword);
    
    // 설문 레이어 숨기기
    document.getElementById('survey-layer').style.display = 'none';
    
    // 선택된 키워드 조합 (예: "매운 혼밥 고기")
    const finalSearchTerm = selectedKeywords.join(' ');
    
    // 검색창에 자동으로 입력하고 검색 실행!
    document.getElementById('keyword').value = finalSearchTerm;
    searchPlaces(); 
    
    alert(`사장님의 상태에 딱 맞는 '${finalSearchTerm}' 맛집을 찾아드릴게요! 🚀`);
}
function nextStep(currentId, nextId, keyword) {
    selectedKeywords.push(keyword);
    
    const currentCard = document.getElementById(currentId);
    const nextCard = document.getElementById(nextId);

    // 1. 현재 카드를 위로 넘기는 애니메이션 실행
    currentCard.classList.add('flip-out');

    // 2. 애니메이션이 끝날 때쯤 다음 카드 보여주기
    setTimeout(() => {
        currentCard.style.display = 'none';
        currentCard.classList.remove('active', 'flip-out');
        
        nextCard.classList.add('active', 'flip-in');
    }, 600); // 0.6초 뒤 실행 (애니메이션 속도와 맞춤)
}

function finishSurvey(finalKeyword) {
    selectedKeywords.push(finalKeyword);
    const currentCard = document.querySelector('.survey-card.active');
    
    currentCard.classList.add('flip-out');

    setTimeout(() => {
        document.getElementById('survey-layer').style.display = 'none';
        
        const finalSearchTerm = selectedKeywords.join(' ');
        document.getElementById('keyword').value = finalSearchTerm;
        
        // 사장님! 여기 searchPlaces() 함수가 실행되면서 지도로 넘어갑니다.
        searchPlaces(); 
    }, 600);
}