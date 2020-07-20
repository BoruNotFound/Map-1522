firebase.auth().onAuthStateChanged((user) =>{
    if(user){
        firebase.firestore().collection('users').doc(user.uid)
        .get()
        .then(ref => {
            var username = ref.data().name;
            
            greet(username);
        });
    }
});

function greet(name) {
    const greetingBox = document.querySelector(".greeting")
    var time = new Date();
    var hour = time.getHours();

    var greeting;

    if (0 <= hour && hour < 6) {
        greeting = "早点休息吧" + name + "，明日事不必今日毕";
    } else if (6 <= hour && hour < 12) {
        greeting = "早上好哇" + name + "，要记得1522永远在一起噢！";
    } else if (12 <= hour && hour < 18) {
        greeting = "下午好呀" + name + "，想好晚饭吃什么了吗";
    } else {
        greeting = "晚上好哦" + name + "，祝你不论在世界的哪个角落，都能找到自己的归属";
    }

    greetingBox.textContent = greeting;
};