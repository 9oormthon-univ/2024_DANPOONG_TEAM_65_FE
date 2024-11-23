document.addEventListener('DOMContentLoaded', () => {
    const resumeList = document.getElementById('resume-list');
    const fileBtn = document.getElementById('file-btn');
    const selectedResumeName = document.getElementById('selected-resume-name');
    const subjectiveBtn = document.getElementById('subjective-btn');
    const objectiveBtn = document.getElementById('objective-btn');
    const currentQuestionsContainer = document.getElementById('current-questions');
    const previousQuestionsContainer = document.getElementById('previous-questions');
    const prevQuestionsPagination = document.getElementById('prev-questions-pagination');
    const currentQuestionsPagination = document.getElementById('current-questions-pagination');

    const LOCAL_STORAGE_KEY_RESUMES = 'resumes';
    const LOCAL_STORAGE_KEY_QUESTIONS = 'questions';
    const SAVED_QUESTIONS_KEY = 'savedQuestions';

    let resumes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RESUMES)) || [];
    let questions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_QUESTIONS)) || {};
    let savedQuestions = JSON.parse(localStorage.getItem(SAVED_QUESTIONS_KEY)) || {};
    let currentResumeId = null;
    let currentQuestions = [];

    let previousPage = 1;
    let currentPage = 1;

    const ITEMS_PER_PAGE_PREVIOUS = 5;
    const ITEMS_PER_PAGE_CURRENT = 10;

    // 초기 자소서 목록 표시
    displayResumes();

    function displayResumes() {
        resumeList.innerHTML = '';
        if (resumes.length === 0) {
            resumeList.innerHTML = '<li>저장된 자소서가 없습니다.</li>';
        } else {
            resumes.forEach((resume, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = resume.name;
                listItem.addEventListener('click', () => {
                    switchResume(index);
                });
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '삭제';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteResume(index);
                });
                listItem.appendChild(deleteBtn);
                resumeList.appendChild(listItem);
            });
        }
    }

    function switchResume(index) {
        moveCurrentQuestionsToPrevious();

        currentResumeId = index;
        selectedResumeName.textContent = resumes[index].name;

        loadPreviousQuestions(previousPage);
        loadCurrentQuestions(currentPage);
    }

    function moveCurrentQuestionsToPrevious() {
        if (currentResumeId === null || currentQuestions.length === 0) return;

        if (!questions[currentResumeId]) {
            questions[currentResumeId] = [];
        }
        questions[currentResumeId].push(...currentQuestions);
        currentQuestions = [];
        saveQuestionsToLocalStorage();
        currentQuestionsContainer.innerHTML = '';
    }

    function deleteResume(index) {
        resumes.splice(index, 1);
        delete questions[index];
        saveResumesToLocalStorage();
        saveQuestionsToLocalStorage();
        alert('자소서가 삭제되었습니다.');
        displayResumes();
    }

    fileBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf, .docx, .txt';
        input.style.display = 'none';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                processFile(file);
            }
        });

        document.body.appendChild(input);
        input.click();
        input.remove();
    });

    function processFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (fileExtension === 'txt') {
            handleTxt(file);
        } else if (fileExtension === 'pdf') {
            handlePDF(file);
        } else if (fileExtension === 'docx') {
            handleDocx(file);
        } else {
            alert('지원하지 않는 파일 형식입니다!');
        }
    }

    function handleTxt(file) {
        const reader = new FileReader();
        reader.onload = () => {
            saveResume(file.name, reader.result);
        };
        reader.readAsText(file);
    }

    async function handlePDF(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target.result);

            pdfjsLib.getDocument(typedArray).promise.then(async (pdf) => {
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    textContent.items.forEach((item) => {
                        text += item.str + ' ';
                    });
                }
                saveResume(file.name, text);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    async function handleDocx(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;

            mammoth.extractRawText({ arrayBuffer }).then((result) => {
                saveResume(file.name, result.value);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function saveResume(fileName, content) {
        resumes.push({ name: fileName, content });
        saveResumesToLocalStorage();
        alert('자소서가 저장되었습니다.');
        displayResumes();
    }

    subjectiveBtn.addEventListener('click', () => {
        generateQuestion('주관식 질문');
    });

    objectiveBtn.addEventListener('click', () => {
        generateQuestion('객관식 질문');
    });

    function generateQuestion(title) {
        if (currentResumeId === null) {
            alert('먼저 자소서를 선택해주세요.');
            return;
        }

        const newQuestion = {
            id: Date.now(),
            title: `${title} ${Math.floor(Math.random() * 100)}`,
        };
        currentQuestions.push(newQuestion);
        loadCurrentQuestions(currentPage);
    }

    function loadPreviousQuestions(page) {
        previousQuestionsContainer.innerHTML = '';
        const allQuestions = questions[currentResumeId] || [];
        const start = (page - 1) * ITEMS_PER_PAGE_PREVIOUS;
        const paginatedQuestions = allQuestions.slice(start, start + ITEMS_PER_PAGE_PREVIOUS);

        paginatedQuestions.forEach((question) => {
            const questionDiv = createQuestionElement(question, true);
            previousQuestionsContainer.appendChild(questionDiv);
        });

        updatePagination(prevQuestionsPagination, page, Math.ceil(allQuestions.length / ITEMS_PER_PAGE_PREVIOUS));
    }

    function loadCurrentQuestions(page) {
        currentQuestionsContainer.innerHTML = '';
        const start = (page - 1) * ITEMS_PER_PAGE_CURRENT;
        const paginatedQuestions = currentQuestions.slice(start, start + ITEMS_PER_PAGE_CURRENT);

        paginatedQuestions.forEach((question) => {
            const questionDiv = createQuestionElement(question, false);
            currentQuestionsContainer.appendChild(questionDiv);
        });

        updatePagination(currentQuestionsPagination, page, Math.ceil(currentQuestions.length / ITEMS_PER_PAGE_CURRENT));
    }

    function createQuestionElement(question, isSaved) {
        const questionDiv = document.createElement('div');
        questionDiv.textContent = question.title;

        if (!isSaved) {
            const saveBtn = document.createElement('button');
            saveBtn.textContent = '저장';
            saveBtn.addEventListener('click', () => saveQuestion(question));
            questionDiv.appendChild(saveBtn);
        }

        return questionDiv;
    }

    function saveQuestion(question) {
        if (!savedQuestions[currentResumeId]) {
            savedQuestions[currentResumeId] = [];
        }
        savedQuestions[currentResumeId].push(question);
        localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(savedQuestions));
        alert('질문이 저장되었습니다.');
    }

    function updatePagination(container, page, totalPages) {
        container.innerHTML = '';
    
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '이전';
        prevBtn.disabled = page <= 1;
        prevBtn.addEventListener('click', () => {
            if (container === prevQuestionsPagination) {
                previousPage--; // 이전 페이지로 이동
                loadPreviousQuestions(previousPage); // 이전 질문 페이지 로드
            } else {
                currentPage--; // 이전 페이지로 이동
                loadCurrentQuestions(currentPage); // 현재 질문 페이지 로드
            }
        });
    
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '다음';
        nextBtn.disabled = page >= totalPages;
        nextBtn.addEventListener('click', () => {
            if (container === prevQuestionsPagination) {
                previousPage++; // 다음 페이지로 이동
                loadPreviousQuestions(previousPage); // 다음 질문 페이지 로드
            } else {
                currentPage++; // 다음 페이지로 이동
                loadCurrentQuestions(currentPage); // 다음 질문 페이지 로드
            }
        });
    
        // 페이지 번호 표시
        const pageIndicator = document.createElement('span');
        pageIndicator.textContent = ` ${page} / ${totalPages} `;
    
        // 버튼과 페이지 표시를 컨테이너에 추가
        container.appendChild(prevBtn);
        container.appendChild(pageIndicator);
        container.appendChild(nextBtn);
    }
    

    function saveResumesToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY_RESUMES, JSON.stringify(resumes));
    }

    function saveQuestionsToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
    }

    displayResumes();
});
