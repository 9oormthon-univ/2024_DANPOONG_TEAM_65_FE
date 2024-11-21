export const kakaoLogin = () => {
  Kakao.Auth.login({
    success: function (authObj) {
      console.log('로그인 성공:', authObj);

      // 사용자 정보 가져오기
      Kakao.API.request({
        url: '/v2/user/me',
        success: function (response) {
          console.log('사용자 정보:', response);
          alert(`안녕하세요, ${response.kakao_account.profile.nickname}님!`);
        },
        fail: function (error) {
          console.error('사용자 정보 요청 실패:', error);
          alert('사용자 정보를 가져오지 못했습니다. 다시 시도해주세요.');
        },
      });
    },
    fail: function (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    },
    redirectUri: 'http://localhost:8000/login/callback'
  });
}
