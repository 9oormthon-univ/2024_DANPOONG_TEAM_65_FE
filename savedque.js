document.addEventListener('DOMContentLoaded', () => {
    const resumeListElement = document.getElementById('resume-list');
    const questionListElement = document.getElementById('question-list');
    const resumeNameElement = document.getElementById('resume-name');

    const LOCAL_STORAGE_KEY = 'resumes';
    const SAVED_QUESTIONS_KEY = 'savedQuestions';

    const resumes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    const savedQuestions = JSON.parse(localStorage.getItem(SAVED_QUESTIONS_KEY)) || {};

    function loadResumes() {
        resumeListElement.innerHTML = '';
        resumes.forEach((resume, index) => {
            const li = document.createElement('li');
            li.textContent = resume.name;
            li.addEventListener('click', () => loadSavedQuestions(index, resume.name));
            resumeListElement.appendChild(li);
        });
    }

    function loadSavedQuestions(resumeId, resumeName) {
        resumeNameElement.textContent = resumeName;
        questionListElement.innerHTML = '';

        const questions = savedQuestions[resumeId] || [];
        if (questions.length === 0) {
            questionListElement.innerHTML = '<tr><td colspan="3">저장된 질문이 없습니다.</td></tr>';
        } else {
            questions.forEach((question, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${question.title}</td>
                    <td>${new Date(question.id).toLocaleDateString()}</td>
                `;
                questionListElement.appendChild(row);
            });
        }
    }

    loadResumes();
});
