const myAccountButton = document.querySelector(".my-account");
const myAccountWrapper = document.querySelector(".myAccountPage");
const myAccountPage = document.querySelector(".myAccountPage .modal");
const body = document.querySelector("body");
const accountForm = document.querySelector(".myAccountPage .editForm");

/* Pop out My Account Page */
myAccountButton.addEventListener('click', () => {
    myAccountWrapper.classList.add("open");
    myAccountPage.classList.add("active");
    setDefaultValues();
});

/* My Account Page -- Button behaviors */
const saveButton = document.querySelector(".saveButton");
const cancelButton = document.querySelector(".cancelButton");

saveButton.addEventListener('click', (e) => {
    // Save current account info
    e.preventDefault();
    accountForm.querySelector('.message').textContent = "保存中...";
    const updateUserRecord = firebase.functions().httpsCallable("updateUserRecord");
    var s = accountForm.country;
    updateUserRecord({
        name: accountForm.name.value,
        bio: accountForm.bio.value,
        country: accountForm.country.value,
        country_name: s.options[s.selectedIndex].text,
        state: accountForm.state.value,
        city: accountForm.city.value,
    })
    .then(() => {
        accountForm.querySelector('.message').textContent = "保存成功！";
    })
    .catch(error => {
        accountForm.querySelector('.message').textContent = error.message;
    });
});

cancelButton.addEventListener('click', (e) => {
    // Pop out a window to confirm cancel all changes and go back to main page
    e.preventDefault();

    // Close My Account Page
    myAccountWrapper.classList.remove("open");
    myAccountPage.classList.remove("active");

    // Clear message
    accountForm.querySelector('.message').textContent = "";
});

/* My Account Page -- Location Lists */
const country_select = document.querySelector("#acc_country");
const state_select = document.querySelector("#acc_state");
const city_select = document.querySelector("#acc_city");

// Country list -- consistent with d3 map objects
d3.queue()
    .defer(d3.json, "data/mapdata/world.topojson")
    .await(add_country_selections);

function add_country_selections(error, data) {
    /* Convert raw geo data into usable geo data */
    var countries = topojson.feature(data, data.objects.countries).features;
    countries.forEach(country => {
        country_name = country.properties.name;
        country_id = 'id' + country.id;
        country_select.append(new Option(name=country_name, value=country_id));
    });
};

// State/ Province list -- depend on choice of country
// Clear previous state options when the selection on countries changes
function clear_state_options() {
    // keep the null option only
    var n = state_select.length;
    if (n > 1) {
        for (var i = n-1; i > 0; i--) {
            state_select.remove(i);
        }
    }
};

// Given country paramter (currently either US or China), add state options
function add_state_options(country) {
    // add state options on the selection of country
    var filepath;
    var states;

    if (country === "China") {
        filepath = "data/mapdata/china.geo.json";
    } else if (country === "US") {
        filepath = "data/mapdata/us.topojson";
    }

    d3.queue()
      .defer(d3.json, filepath)
      .await(add_options);
  
    function add_options(error, data) {
        if (country === "China") {
            states = data.features;
        } else if (country === "US") {
            states = topojson.feature(data, data.objects.us_states).features;
        }
      
        states.forEach(state => {
            state_name = state.properties.name;
            state_id = state_name;
            state_select.append(new Option(name=state_name, value=state_id));
      })
    };
};

// Change state options with change on countries
country_select.addEventListener("change", () => {
    if (country_select.value === "id41") {
        // Select country as China
        clear_state_options();
        add_state_options("China");

    } else if (country_select.value === "id228") {
        // Select United States
        clear_state_options();
        add_state_options("US");
    } else {
        // Select other countries
        clear_state_options();
    }
});

/* My Account Page -- Dafault values with the authenticated user */
function setDefaultValues() {
    // Get user doc
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('users').doc(user.uid)
        .get()
        .then(ref => {
            var userDoc = ref.data();
            
            // set default values for account form
            accountForm.name.defaultValue = userDoc.name;
            accountForm.bio.defaultValue = userDoc.bio;
            accountForm.city.defaultValue = userDoc.city;

            // find country
            var country_id = userDoc.country.split("d").pop();
            accountForm.country.selectedIndex = parseInt(country_id, 10) + 1;

            // find state
            if (country_id === "41" || country_id === "228") {
                if (country_id === "41") {
                    add_state_options("China");
                } else {
                    add_state_options("US");
                }
                setTimeout(() => {
                    for (var i = 0; i < accountForm.state.length; i++) {
                        if (accountForm.state.options[i].value === userDoc.state) {
                            accountForm.state.selectedIndex = i;
                            break;
                        }
                    }
                }, 1000);
                
            } else {
                accountForm.state.selectedIndex = 0;
            }
        });

};

/* Profile picture */
// Display profile pic in my account page
const profileWindow = myAccountPage.querySelector("#profile_pic");
function showProfileimage() {
    const user = firebase.auth().currentUser;

    firebase.firestore().collection("users").doc(user.uid).get().then(doc => {

        var picURL = doc.data().profilePicURL;
        var storageRef = firebase.storage().ref();
        var picRef = storageRef.child(picURL);
        picRef.getDownloadURL().then(function(url) {
            document.querySelector('img').src = url;
        });
    });
    
};

firebase.auth().onAuthStateChanged((user) =>{
    if(user){
        showProfileimage();
    }
});


// Update Profile picture
const updateProfileButton = document.querySelector("#update_profile");
const newProfileWindow = document.querySelector(".new_profile");
const message = newProfileWindow.querySelector(".message");

updateProfileButton.addEventListener("click", () => {
    myAccountPage.classList.remove("active");
    newProfileWindow.classList.add("open");
});

newProfileWindow.querySelector("#close_new_profile").addEventListener("click", () => {
    newProfileWindow.classList.remove("open");
    myAccountPage.classList.add("active");
    message.textContent = "";
});

newProfileWindow.querySelector("#save_new_profile").addEventListener("click", () => {
    
    var newPic = newProfileWindow.querySelector("#new_profile_pic").files[0];
    var extension = newPic.type.split("/").pop();
    const user = firebase.auth().currentUser;
    const message = newProfileWindow.querySelector(".message");
    
    // Create references
    var storageRef = firebase.storage().ref();
    var url = "profile_pictures/" + user.uid + "." + extension;
    var profilePicRef = storageRef.child(url);

    firebase.firestore().collection("users").doc(user.uid).get()
        .then(doc => {
            var oldURL = doc.data().profilePicURL;
            if (oldURL !== "profile_pictures/default_profile.png") {
                // if the user has changed avatar already, delete the old one first
                profilePicRef.delete().then(() => {
                    // then, put new avatar but no need to update user doc
                    profilePicRef.put(newPic)
                        .then(() => {
                            message.textContent = "更新成功，请刷新页面加载新头像";
                        })
                        .catch(error => {
                            message.textContent = error.message;
                        });
                })
            } else {
                // otherwise, create the new URL for the new avatar
                profilePicRef.put(newPic)
                    .then(() => {
                        const updateProfileURL = firebase.functions().httpsCallable("updateProfileURL");
                        // put new avatar and update user doc
                        updateProfileURL({
                            profileURL: url
                        }).then(() => {
                            message.textContent = "更新成功，请刷新页面加载新头像";
                        })
                        .catch(error => {
                            message.textContent = error.message;
                        });
                    })
                    .catch(error => {
                        message.textContent = error.message;
                    });
            }
        })
     
});