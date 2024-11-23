document.addEventListener('DOMContentLoaded', () => {
    // 자소서 입력 & 질문받기 버튼 클릭 이벤트
    const questionButton = document.querySelector('.question a');
    
    if (questionButton) {
        questionButton.addEventListener('click', (event) => {
            event.preventDefault(); // 기본 동작 막기 (필요한 경우)
            window.location.href = './lastque.html'; // lastque.html로 이동
        });
    }
});
