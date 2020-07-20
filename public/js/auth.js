const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');
const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
const signOut = document.querySelector('.sign-out');

// toggle auth modals
authSwitchLinks.forEach(link => {
  link.addEventListener('click', () => {
    authModals.forEach(modal => modal.classList.toggle('active'));
  });
});

// register form
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = registerForm.email.value;
  const password = registerForm.password.value;
  const answer = registerForm.verification.value;
  
  if (answer.length > 10) {
    registerForm.querySelector('.error').textContent = '猜也要猜得准一点呀';
    return ;
  }

  if (answer !== '幺伍贰贰的小伙伴') {
    registerForm.querySelector('.error').textContent = '回答错误';
    return ;
  }

  // create user and verify email

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      firebase.auth().currentUser.sendEmailVerification();
      registerForm.reset();
      authModals[1].classList.remove('active');
    })
    .catch(error => {
      registerForm.querySelector('.error').textContent = error.message;
    });
});

// login form
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      loginForm.reset();
    })
    .catch(error => {
      loginForm.querySelector('.error').textContent = error.message;
    });
});

// sign out
signOut.addEventListener('click', () => {
  firebase.auth().signOut()
    .then(() => console.log('user signed out'));
});

// auth listener
firebase.auth().onAuthStateChanged(user => {
  if (user && user.emailVerified) {
    authWrapper.classList.remove('open');
    authModals.forEach(modal => modal.classList.remove('active'));

    // if user login for the first time, open my account page
    firebase.firestore().collection("users").doc(user.uid).get().then(docRef => {
      var loginCount = docRef.data().loginCount;
      if (loginCount === 0) {
        document.querySelector(".myAccountPage").classList.add("open");
        document.querySelector(".myAccountPage .modal").classList.add("active");

        const incrementLoginCount = firebase.functions().httpsCallable("incrementLoginCount");
        incrementLoginCount();
      }
    })
  } else if (! user) {
    authWrapper.classList.add('open');
    authModals[0].classList.add('active');
  } else {
    authWrapper.classList.add('open');
    authModals[0].classList.add('active');
    authModals[0].querySelector(".error").textContent = "请先验证邮箱，验证成功后刷新页面登录";
  }
});

localStorage.setItem("theme", "lightsOn");