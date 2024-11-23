document.addEventListener('DOMContentLoaded', () => {
    const resumeList = document.getElementById('resume-list');
    const fileBtn = document.getElementById('file-btn');
    const selectedResumeName = document.getElementById('selected-resume-name');

    const API_BASE_URL = 'http://13.124.165.183:8080'; // 백엔드 API의 기본 URL

    // 초기 자소서 목록 표시
    loadResumes();

    // 자소서 목록 가져오기
    async function loadResumes() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/selfIntroduce`);
            const resumes = await response.json();
            displayResumes(resumes);
        } catch (error) {
            console.error('Error fetching resumes:', error);
            alert('자소서 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }

    // 자소서 목록 표시
    function displayResumes(resumes) {
        resumeList.innerHTML = '';
        if (resumes.length === 0) {
            resumeList.innerHTML = '<li>저장된 자소서가 없습니다.</li>';
        } else {
            resumes.forEach((resume) => {
                const listItem = document.createElement('li');
                listItem.textContent = resume.name;
                listItem.addEventListener('click', () => {
                    updateSelectedResumeName(resume.name);
                });
                // 삭제 버튼 추가
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '삭제';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 클릭 이벤트 전파 방지
                    deleteResume(resume.id); // 백엔드로 삭제 요청
                });
                listItem.appendChild(deleteBtn);
                resumeList.appendChild(listItem);
            });
        }
    }

    // 선택된 자소서 이름 업데이트
    function updateSelectedResumeName(name) {
        selectedResumeName.textContent = name || '선택된 자소서가 없습니다.';
    }

    // 자소서 삭제
    async function deleteResume(resumeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/selfIntroduce/${resumeId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('자소서가 성공적으로 삭제되었습니다!');
                loadResumes(); // 목록 갱신
            } else {
                alert('자소서를 삭제하는 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('자소서를 삭제하는 중 오류가 발생했습니다.');
        }
    }

    // 파일 업로드 버튼 이벤트
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

    // 파일 처리
    function processFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (fileExtension === 'txt') {
            handleTxt(file);
        } else if (fileExtension === 'pdf') {
            handlePDF(file);
        } else if (fileExtension === 'docx') {
            handleDocx(file);
        } else {
            alert('지원하지 않는 파일 형식입니다! (.txt, .pdf, .docx만 지원)');
        }
    }

    // TXT 파일 처리
    async function handleTxt(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result;
            saveResume(file.name, content);
        };
        reader.readAsText(file);
    }

    // PDF 파일 처리
    async function handlePDF(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target.result);

            pdfjsLib
                .getDocument(typedArray)
                .promise.then(async (pdf) => {
                    let text = '';
                    const countPromises = [];
                    for (let i = 1; i <= pdf.numPages; i++) {
                        countPromises.push(
                            pdf.getPage(i).then((page) =>
                                page.getTextContent().then((textContent) => {
                                    textContent.items.forEach((item) => {
                                        text += item.str + ' ';
                                    });
                                })
                            )
                        );
                    }

                    await Promise.all(countPromises);
                    saveResume(file.name, text);
                })
                .catch((error) => {
                    console.error('PDF 처리 중 오류 발생:', error);
                    alert('PDF 파일 처리 중 오류가 발생했습니다.');
                });
        };
        reader.readAsArrayBuffer(file);
    }

    // DOCX 파일 처리
    async function handleDocx(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;

            mammoth
                .extractRawText({ arrayBuffer })
                .then((result) => {
                    saveResume(file.name, result.value);
                })
                .catch((error) => {
                    console.error('DOCX 처리 중 오류 발생:', error);
                    alert('DOCX 파일 처리 중 오류가 발생했습니다.');
                });
        };
        reader.readAsArrayBuffer(file);
    }

    // 자소서 저장
    async function saveResume(fileName, content) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/selfIntroduce`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: fileName, content }),
            });

            if (response.ok) {
                alert('자소서가 성공적으로 저장되었습니다!');
                loadResumes(); // 목록 갱신
            } else {
                alert('자소서를 저장하는 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            alert('자소서를 저장하는 중 오류가 발생했습니다.');
        }
    }
});
