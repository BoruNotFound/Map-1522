themeCheck();

(function () {
  var width = 800;
  var height = 550;
  
  var svg = d3.select("#mapChina")
              .append("svg")
              .attr("height", height)
              .attr("width", width)
              .append("g")
              .attr("transform", "translate(0,0)");
  
  /* Read topojson data */
  d3.queue()
    .defer(d3.json, "data/mapdata/china.geo.json")
    .await(ready);

  /* Create projection */
  var projection = d3.geoMercator().translate([-650, 710]).scale(600);

  /* Create geo path using the projection */
  var path = d3.geoPath().projection(projection);

  function ready(error, data) {
    themeCheck();
    /* Convert raw geo data into usable geo data */
    var states = data.features;
    
    /* Add a path to each country. Shapes -> paths */
    svg.selectAll("[type=Feature]")
      .data(states)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d) {return 'id' + d.id;})
      .attr("name", function(d) {
        return d.properties.name;})
      .on('mouseover', function(d) {
        d3.select(this).classed('selected_country', true);
      })
      .on('mouseout', function(d) {
        d3.select(this).classed('selected_country', false);
      })
      .on('click', function(d) {
        searchPeopleWithStateID({
          country: "id41",
          state: d.properties.name});
      });

    var populated = new Array;
    d3.selectAll("path").each((d) => {
      firebase.firestore().collection("users").where("state", "==", d.properties.name).get().then((result) => {
        if (result.docs.length > 0) {
          populated.push(d.id);
        }
      });
    });
    setTimeout(() => {
      populated.forEach(id => {
        d3.select("#id"+id).attr("class", "country populated");
      })
    }, 2000);

    /* Link back to the World map */
    d3.select("#linkback").on('click', function() {
      window.location.href = 'world_map.html'
    })

  }
}) ();

// use Vue instance to display user list and certain user's detailed info
var nameListApp = new Vue({
  el: "#nameListApp",
  data: {
    message: "Searching in this region ...",
    userList: []
  },
  methods: {
    displayUser(uid) {
      displayUserWithUid(uid);
    }
  }
});

var displayUserApp = new Vue({
  el: "#displayUserApp",
  data: {
    name: "",
    location: "",
    bio: ""
  }
});

function searchPeopleWithStateID(data) {
  // firstly clear the current userlist
  nameListApp.userList = [];
  var country = data.country;
  var state = data.state;

  if (country !== "id41" && country !== "id228") {
    return ;
  } else {
    // search in firestore with state name
    const userRef = firebase.firestore().collection("users");
    userRef.where("country", "==", country)
          .where("state", "==", state)
          .get()
          .then(docs => {
            docs.forEach(doc => {
              nameListApp.userList.push(doc.data());
            });

            document.querySelector(".nameList").style.display = "block";
            document.querySelector(".detailed").style.display = "none";

            if (nameListApp.userList.length > 0) {
              nameListApp.message = "有" + nameListApp.userList.length + "位1522的小伙伴在" + state;
            } else {
              nameListApp.message = "1522的小伙伴还没有在" + state + "落脚哦";
            }

          });
    
  }
};

function displayUserWithUid(uid) {
  const userDocRef = firebase.firestore().collection("users").doc(uid);
  document.querySelector(".detailed").style.display = "block";
  userDocRef.get()
            .then(doc => {
              displayUserApp.name = doc.data().name;
              displayUserApp.bio = doc.data().bio;
              if (doc.data().state !== "" && doc.data().state !== "None") {
                displayUserApp.location = doc.data().city + ", " + doc.data().state + ", 中国";
              } else {
                displayUserApp.location = doc.data().city + ", " + doc.data().country_name;
              }
              
              // display user avatar
              var picURL = doc.data().profilePicURL;
              var storageRef = firebase.storage().ref();
              var picRef = storageRef.child(picURL);
              picRef.getDownloadURL().then(function(url) {
                  document.querySelector(".det_avatar").src = url;
              });
              
            })
};

function themeCheck() {
  var theme = localStorage.getItem("theme");
  const root = document.documentElement;
    if (theme == "lightsOff") {
        // Map
        root.style.setProperty("--selected-fill", "#ffa31a");
        root.style.setProperty("--stroke-color", "#ffffff");
        root.style.setProperty("--stroke-w", "0.5");
        root.style.setProperty("--populated", "#472e07");

        // User list
        root.style.setProperty("--userBlockBackground", "#000000");
        root.style.setProperty("--userBlockBorder", "1.5px");

        root.style.setProperty("--userBlockFontColor", "#ffffff");
        root.style.setProperty("--userBlockBorderColor", "#ffa31a");
        root.style.setProperty("--shadowColor", "#000000");
    } else {
        // Lights On
        // Map
        root.style.setProperty("--selected-fill", "#a1bad0");
        root.style.setProperty("--stroke-color", "#3d3d3b");
        root.style.setProperty("--stroke-w", "0.3");
        root.style.setProperty("--populated", "#c6d4df");

        // User list
        root.style.setProperty("--userBlockBackground", "#dff0ff");
        root.style.setProperty("--userBlockBorder", "0");

        root.style.setProperty("--userBlockFontColor", "#000000");
        root.style.setProperty("--userBlockBorderColor", "#2299a1");
        root.style.setProperty("--shadowColor", "#ebebeb");
    }
};