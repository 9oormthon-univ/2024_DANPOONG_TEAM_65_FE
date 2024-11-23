// 인가 코드 가져오기
const code = new URL(window.location.href).searchParams.get("code");

if (code) {
    // POST 요청을 보내기 위한 함수 정의
    const sendCodeToServer = async (authorizationCode) => {
    try {
        const response = await fetch('http://13.124.165.183:8080/api/user/kakao/login?code='+code, {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        // body: JSON.stringify({
        //   "code": code,
        // }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        // 토큰을 로컬 스토리지에 저장
        if (token) {
          localStorage.setItem('authToken', token);
          console.log('토큰이 저장되었습니다:', token);

          window.location.href="./main.html";
        }
      } else {
        console.error('서버에서 오류가 발생했습니다.', response.status);
      }
    } catch (error) {
      console.error('요청을 보내는 도중 오류가 발생했습니다:', error);
    }
  };

  // 함수 호출
  sendCodeToServer(code);
}
