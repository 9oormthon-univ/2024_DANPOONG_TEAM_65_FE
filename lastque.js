document.addEventListener('DOMContentLoaded', () => {
    const resumeList = document.getElementById('resume-list');
    const fileBtn = document.getElementById('file-btn');
    const fileInput = document.getElementById('file-input');
    const questionOutput = document.getElementById('question-output');
    const subjectiveBtn = document.getElementById('subjective-btn');
    const objectiveBtn = document.getElementById('objective-btn');

    // 로컬 저장소에서 자소서 목록 가져오기
    let savedResumes = JSON.parse(localStorage.getItem('savedResumes')) || [];

    // 자소서 목록 표시 함수
    function displayResumes() {
        resumeList.innerHTML = '';
        if (savedResumes.length === 0) {
            resumeList.innerHTML = '<li>저장된 자소서가 없습니다.</li>';
        } else {
            savedResumes.forEach((resume, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = resume.name;
                listItem.addEventListener('click', () => displayQuestions(index));
                resumeList.appendChild(listItem);
            });
        }
    }

    // 질문 목록 표시 함수
    function displayQuestions(index) {
        questionOutput.innerHTML = '';
        const selectedResume = savedResumes[index];
        if (!selectedResume.questions.length) {
            questionOutput.textContent = '이 자소서에 저장된 질문이 없습니다.';
        } else {
            selectedResume.questions.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.textContent = question;
                questionOutput.appendChild(questionDiv);
            });
        }
    }

    // 파일 첨부 이벤트
    fileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'txt') {
                // 텍스트 파일 처리
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    processResume(file.name, content);
                };
                reader.readAsText(file);
            } else if (fileExtension === 'pdf') {
                // PDF 파일 처리
                handlePDF(file);
            } else if (fileExtension === 'docx') {
                // 워드 파일 처리
                handleDocx(file);
            } else {
                alert('지원하지 않는 파일 형식입니다!');
            }
        }
    });

    // PDF 파일 처리
    function handlePDF(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const typedArray = new Uint8Array(e.target.result);
            pdfjsLib.getDocument(typedArray).promise.then((pdf) => {
                let text = '';
                const totalPages = pdf.numPages;
                let countPromises = []; // 모든 페이지 처리
                for (let i = 1; i <= totalPages; i++) {
                    countPromises.push(
                        pdf.getPage(i).then((page) => {
                            return page.getTextContent().then((textContent) => {
                                textContent.items.forEach((item) => {
                                    text += item.str + ' ';
                                });
                            });
                        })
                    );
                }
                Promise.all(countPromises).then(() => {
                    processResume(file.name, text); // 텍스트 처리
                });
            });
        };
        reader.readAsArrayBuffer(file);
    }

    // 워드 파일 처리
    function handleDocx(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then((result) => {
                    processResume(file.name, result.value); // 텍스트 처리
                })
                .catch((err) => {
                    alert('워드 파일 처리 중 오류가 발생했습니다!');
                });
        };
        reader.readAsArrayBuffer(file);
    }

    // 자소서 데이터 처리 함수
    function processResume(fileName, content) {
        const questions = generateQuestionsFromContent(content);
        const resume = {
            name: fileName,
            content: content,
            questions: questions,
        };
        savedResumes.push(resume);
        localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
        displayResumes();
    }

    // 질문 생성 함수
    function generateQuestionsFromContent(content) {
        const questions = [];
        const sentences = content.split('.'); // 문장 단위로 나누기
        sentences.forEach((sentence) => {
            if (sentence.includes('경험')) {
                questions.push(`다음 경험에 대해 설명해주세요: ${sentence.trim()}`);
            } else if (sentence.includes('성공')) {
                questions.push(`성공 사례에 대해 이야기해주세요: ${sentence.trim()}`);
            }
        });
        return questions.length ? questions : ['이 자소서에서 질문을 생성할 수 없습니다.'];
    }

    // 주관식 질문 생성
    subjectiveBtn.addEventListener('click', () => {
        const index = prompt('질문을 생성할 자소서 번호를 입력하세요 (0부터 시작):');
        if (savedResumes[index]) {
            savedResumes[index].questions.push('새로운 주관식 질문');
            localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
            displayQuestions(index);
        }
    });

    // 객관식 질문 생성
    objectiveBtn.addEventListener('click', () => {
        const index = prompt('질문을 생성할 자소서 번호를 입력하세요 (0부터 시작):');
        if (savedResumes[index]) {
            savedResumes[index].questions.push('새로운 객관식 질문');
            localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
            displayQuestions(index);
        }
    });

    // 초기 데이터 로드
    displayResumes();
});
