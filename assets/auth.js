// 회원가입 / 로그인 / 로그아웃 / 세션 확인
// Supabase JS 클라이언트(CDN) 필요: https://unpkg.com/@supabase/supabase-js@2

var sbClient = null;

function isConfigured() {
  return SUPABASE_URL.indexOf("__") !== 0 && SUPABASE_ANON_KEY.indexOf("__") !== 0;
}

function getClient() {
  if (!isConfigured()) return null;
  if (!sbClient && window.supabase) {
    // 로그인 화면의 "로그인 상태 유지" 체크를 해제했으면 세션을 localStorage(기본값,
    // 브라우저를 닫아도 유지됨) 대신 sessionStorage(탭을 닫으면 사라짐)에 저장한다.
    // 이 값은 로그인 시점에 한 번 정해지고, 이후 이 브라우저의 모든 페이지가
    // 클라이언트를 처음 만들 때 같은 값을 참조하므로 일관되게 적용된다.
    var opts = {};
    if (window.localStorage && localStorage.getItem("msu_keep_logged_in") === "0") {
      opts.auth = { storage: window.sessionStorage };
    }
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, opts);
  }
  return sbClient;
}

function getSession() {
  var client = getClient();
  if (!client) return Promise.resolve(null);
  return client.auth.getSession().then(function (res) {
    return res.data ? res.data.session : null;
  });
}

function requireLogin(redirectTo) {
  return getSession().then(function (session) {
    if (!session) {
      window.location.href = redirectTo || "login.html";
      return null;
    }
    return session;
  });
}

function initSignupForm() {
  var form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("formMsg");
    var client = getClient();

    if (!client) {
      msg.textContent = "아직 회원가입 기능 준비 중이에요.";
      return;
    }

    var email = document.getElementById("emailInput").value.trim();
    var password = document.getElementById("passwordInput").value;
    var nickname = document.getElementById("nicknameInput").value.trim();
    var realNameInput = document.getElementById("realNameInput");
    var realName = realNameInput ? realNameInput.value.trim() : "";
    var phoneInput = document.getElementById("phoneInput");
    var phone = phoneInput ? phoneInput.value.trim() : "";
    var phoneDigits = phone.replace(/[^0-9]/g, "");

    if (!email || !password || !nickname || (realNameInput && !realName) || (phoneInput && !phone)) {
      msg.textContent = "모든 항목을 입력해주세요.";
      return;
    }
    if (password.length < 6) {
      msg.textContent = "비밀번호는 6자 이상이어야 해요.";
      return;
    }
    if (phoneInput && phoneDigits.length < 9) {
      msg.textContent = "전화번호를 정확히 입력해주세요.";
      return;
    }

    msg.textContent = "가입 처리 중...";

    function doSignUp() {
      client.auth.signUp({
        email: email,
        password: password,
        options: { data: { nickname: nickname, real_name: realName, phone_number: phone } }
      }).then(function (res) {
        if (res.error) {
          msg.textContent = "가입 실패: " + res.error.message;
          return;
        }
        if (res.data && res.data.session) {
          msg.textContent = "가입 완료! 이동 중...";
          window.location.href = "mypage.html";
          return;
        }
        msg.textContent = "가입 완료! 이메일 인증 후 로그인해주세요.";
        form.reset();
      }).catch(function () {
        msg.textContent = "네트워크 오류로 가입하지 못했어요.";
      });
    }

    client.rpc("is_nickname_taken", { p_nickname: nickname }).then(function (res) {
      if (!res.error && res.data === true) {
        msg.textContent = "이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요.";
        return;
      }
      doSignUp();
    }).catch(doSignUp);
  });
}

function initLoginForm() {
  var form = document.getElementById("loginForm");
  if (!form) return;

  var emailInput = document.getElementById("emailInput");
  var rememberCheck = document.getElementById("rememberEmailCheck");
  var keepLoggedInCheck = document.getElementById("keepLoggedInCheck");

  // 이전에 "이메일 저장"을 체크하고 로그인했었다면 이메일을 미리 채워준다.
  var savedEmail = window.localStorage && localStorage.getItem("msu_saved_email");
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheck) rememberCheck.checked = true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("formMsg");

    // getClient()가 이 값을 보고 storage(localStorage vs sessionStorage)를 정하므로,
    // 클라이언트를 처음 만들기(=로그인 시도) 전에 반드시 먼저 저장해둬야 한다.
    if (keepLoggedInCheck && window.localStorage) {
      localStorage.setItem("msu_keep_logged_in", keepLoggedInCheck.checked ? "1" : "0");
    }

    var client = getClient();

    if (!client) {
      msg.textContent = "아직 로그인 기능 준비 중이에요.";
      return;
    }

    var email = emailInput.value.trim();
    var password = document.getElementById("passwordInput").value;

    if (!email || !password) {
      msg.textContent = "이메일과 비밀번호를 입력해주세요.";
      return;
    }

    msg.textContent = "로그인 중...";

    client.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
      if (res.error) {
        msg.textContent = "로그인 실패: " + res.error.message;
        return;
      }
      if (window.localStorage) {
        if (rememberCheck && rememberCheck.checked) {
          localStorage.setItem("msu_saved_email", email);
        } else {
          localStorage.removeItem("msu_saved_email");
        }
      }
      window.location.href = "mypage.html";
    }).catch(function () {
      msg.textContent = "네트워크 오류로 로그인하지 못했어요.";
    });
  });
}

// 아이디(이메일) 찾기: 닉네임 + 실명이 둘 다 일치해야 마스킹된 이메일을 보여준다.
// 실명은 다른 곳에 공개되지 않는 값이라, 닉네임만 알아도 함부로 남의 이메일을
// 알아낼 수 없도록 하는 최소한의 보호장치 역할을 한다.
function initFindEmailForm() {
  var toggleLink = document.getElementById("findEmailLink");
  var section = document.getElementById("findEmailSection");
  var form = document.getElementById("findEmailForm");
  if (!toggleLink || !section || !form) return;

  toggleLink.addEventListener("click", function (e) {
    e.preventDefault();
    section.style.display = section.style.display === "none" ? "block" : "none";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var client = getClient();
    var msg = document.getElementById("findEmailMsg");
    var nickname = document.getElementById("findEmailNickname").value.trim();
    var realName = document.getElementById("findEmailRealName").value.trim();

    if (!client) {
      msg.textContent = "아직 준비 중이에요.";
      return;
    }
    if (!nickname || !realName) {
      msg.textContent = "닉네임과 이름(본명)을 모두 입력해주세요.";
      return;
    }

    msg.textContent = "확인 중...";

    client.rpc("find_masked_email", { p_nickname: nickname, p_real_name: realName }).then(function (res) {
      if (res.error) {
        msg.textContent = "확인 중 오류가 발생했어요.";
        return;
      }
      if (!res.data) {
        msg.textContent = "일치하는 계정을 찾을 수 없어요. 닉네임과 이름을 다시 확인해주세요.";
        return;
      }
      msg.textContent = "가입하신 이메일: " + res.data;
    }).catch(function () {
      msg.textContent = "네트워크 오류가 발생했어요.";
    });
  });
}

function initForgotPasswordForm() {
  var toggleLink = document.getElementById("forgotPasswordLink");
  var section = document.getElementById("forgotPasswordSection");
  var form = document.getElementById("forgotPasswordForm");
  if (!toggleLink || !section || !form) return;

  toggleLink.addEventListener("click", function (e) {
    e.preventDefault();
    var loginEmail = document.getElementById("emailInput");
    var resetEmail = document.getElementById("resetEmailInput");
    if (loginEmail && resetEmail && loginEmail.value.trim()) resetEmail.value = loginEmail.value.trim();
    section.style.display = section.style.display === "none" ? "block" : "none";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var client = getClient();
    var msg = document.getElementById("forgotPasswordMsg");
    var email = document.getElementById("resetEmailInput").value.trim();
    if (!client) {
      msg.textContent = "아직 준비 중이에요.";
      return;
    }
    if (!email) {
      msg.textContent = "이메일을 입력해주세요.";
      return;
    }
    msg.textContent = "전송 중...";
    client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password.html"
    }).then(function (res) {
      if (res.error) {
        msg.textContent = "전송 실패: " + res.error.message;
        return;
      }
      msg.textContent = "재설정 링크를 이메일로 보냈어요. 메일함(스팸함도)을 확인해주세요.";
    }).catch(function () {
      msg.textContent = "네트워크 오류로 전송하지 못했어요.";
    });
  });
}

// 이메일의 재설정 링크를 타고 들어오면 supabase-js가 URL의 recovery 토큰을 읽어 임시 세션을 만들고
// PASSWORD_RECOVERY 이벤트를 발생시킨다. 그 세션이 준비되기 전에 제출하면 실패하므로 기다린다.
function initResetPasswordForm() {
  var form = document.getElementById("resetPasswordForm");
  if (!form) return;
  var client = getClient();
  var msg = document.getElementById("formMsg");
  if (!client) {
    if (msg) msg.textContent = "아직 준비 중이에요.";
    return;
  }

  var ready = false;
  client.auth.onAuthStateChange(function (event) {
    if (event === "PASSWORD_RECOVERY") ready = true;
  });
  client.auth.getSession().then(function (res) {
    if (res.data && res.data.session) ready = true;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var password = document.getElementById("newPasswordInput").value;
    if (!password || password.length < 6) {
      msg.textContent = "비밀번호는 6자 이상이어야 해요.";
      return;
    }
    if (!ready) {
      msg.textContent = "재설정 링크가 만료됐거나 잘못됐어요. 이메일의 링크로 다시 들어와주세요.";
      return;
    }
    msg.textContent = "변경 중...";
    client.auth.updateUser({ password: password }).then(function (res) {
      if (res.error) {
        msg.textContent = "변경 실패: " + res.error.message;
        return;
      }
      msg.textContent = "비밀번호가 변경되었습니다! 이동 중...";
      setTimeout(function () { window.location.href = "mypage.html"; }, 1200);
    }).catch(function () {
      msg.textContent = "네트워크 오류로 변경하지 못했어요.";
    });
  });
}

// 마이페이지: 로그인된 본인이 직접 비밀번호를 바꾼다. 이미 로그인된 세션이 곧 본인 확인이라
// Supabase의 auth.updateUser({ password })는 현재 비밀번호를 다시 묻지 않고도 바로 바꿔준다.
function initChangePasswordForm() {
  var toggleBtn = document.getElementById("changePasswordToggleBtn");
  var section = document.getElementById("changePasswordSection");
  var form = document.getElementById("changePasswordForm");
  if (!toggleBtn || !section || !form) return;

  toggleBtn.addEventListener("click", function () {
    section.style.display = section.style.display === "none" ? "block" : "none";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var client = getClient();
    var msg = document.getElementById("changePasswordMsg");
    var pw = document.getElementById("newPasswordInput").value;
    var pwConfirm = document.getElementById("newPasswordConfirmInput").value;

    if (!client) {
      msg.textContent = "아직 준비 중이에요.";
      return;
    }
    if (pw.length < 6) {
      msg.textContent = "비밀번호는 6자 이상이어야 해요.";
      return;
    }
    if (pw !== pwConfirm) {
      msg.textContent = "두 비밀번호가 서로 달라요.";
      return;
    }

    msg.textContent = "변경 중...";

    client.auth.updateUser({ password: pw }).then(function (res) {
      if (res.error) {
        msg.textContent = "변경 실패: " + res.error.message;
        return;
      }
      msg.textContent = "비밀번호가 변경됐어요!";
      form.reset();
    }).catch(function () {
      msg.textContent = "네트워크 오류가 발생했어요.";
    });
  });
}

function initLogoutButton() {
  var btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var client = getClient();
    if (!client) return;
    client.auth.signOut().then(function () {
      window.location.href = "index.html";
    });
  });
}

function initHeaderAuthState() {
  var loginLink = document.getElementById("navLogin");
  var mypageLink = document.getElementById("navMypage");
  if (!loginLink && !mypageLink) return;

  getSession().then(function (session) {
    if (session) {
      if (loginLink) loginLink.style.display = "none";
      if (mypageLink) mypageLink.style.display = "";
    } else {
      if (loginLink) loginLink.style.display = "";
      if (mypageLink) mypageLink.style.display = "none";
    }
  });
}
