window.onload = () => {
  const intro = document.querySelector(".intro")
  const loginPage = document.querySelector(".loginPage")
  const REST_API_KEY = '32465bf1aa11577f83752c92aa01a8fd'
  const redirect_Uri = 'http://127.0.0.1:5500/loginsuccess.html'
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${redirect_Uri}&response_type=code`

  setTimeout(() => {
    intro.style.opacity = "1"

    setTimeout(() => {
      intro.style.opacity = "0"
      intro.style.visibility = "hidden"

      loginPage.style.opacity = "1"
      loginPage.style.visibility = "visible"
    }, 2500)
  }, 1000)
}

export const kakaoLogin = () => {
  
  const REST_API_KEY = '32465bf1aa11577f83752c92aa01a8fd'
  const redirect_Uri = 'http://127.0.0.1:5500/loginsuccess.html'
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${redirect_Uri}&response_type=code`
  window.location.href=kakaoURL;
}
