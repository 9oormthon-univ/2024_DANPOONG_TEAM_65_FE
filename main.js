document.addEventListener('DOMContentLoaded', () => {
    // 자소서 입력 & 질문받기 버튼 클릭 이벤트
    const questionButton = document.querySelector('.question a');
    if (questionButton) {
        questionButton.addEventListener('click', (event) => {
            event.preventDefault(); // 기본 동작 막기
            window.location.href = './lastque.html'; // lastque.html로 이동
        });
    }

    // 저장된 질문 버튼 클릭 이벤트
    const saveButton = document.querySelector('.save a');
    if (saveButton) {
        saveButton.addEventListener('click', (event) => {
            event.preventDefault(); // 기본 동작 막기
            window.location.href = './savedque.html'; // savedque.html로 이동
        });
    }
});
