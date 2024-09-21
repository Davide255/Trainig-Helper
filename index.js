class Work {
    constructor(duration, label) {
        this.duration = duration;
        this.label = label;
    }

    into_list() {
        if (this.duration > 0) {
            return [this.duration, this.label];
        } else {
            return [];
        }
    }
}

class Rest {
    constructor(duration, label) {
        this.duration = duration;
        this.alerts = new Array(0);
        this.label = label;
    }

    into_list() {
        if (this.duration > 0) {
            if (this.alerts.length > 0){}
            else {
                return [this.duration, this.label];
            }
        } else {
            return [];
        }
    }
}

class Exercice {
    constructor() {
        this.components = new Array(0);
    }

    add(work) {
        this.components.push(work);
    }

    into_list() {
        const list = new Array(0);

        for (const x of this.components.values()) {
            const v = x.into_list();
            if (v.length > 0) {
                list.push(v);
            }
        }

        return list;
    }
}

class Workout {
    constructor() {
        this.Exercices = new Array(0);
    }

    add(exercice) {
        this.Exercices.push(exercice);
    }

    get(index) {
        return this.Exercices[index];
    }

    into_list() {
        var list = new Array(0);

        for (const x of this.Exercices.values()) {
            list = list.concat(x.into_list());
        }

        return list;
    }
}

function runtime () {
    CURRENT -= 1;
    TOTAL_SECONDS -= 1;
    document.getElementById("main-app-time-left").innerText = 'Time Left: ' + new Date( TOTAL_SECONDS * 1000 ).toISOString().substring(14, 19);
    
    if (CURRENT == 0 && WORKOUT_LISTED.length > 0) {
        const sumary = document.getElementById("main-app-event-area");
        sumary.removeChild(sumary.children[0]);
        CURRENT = WORKOUT_LISTED.pop()[0];
        long_bip.play();
    } else if (CURRENT == 0 && WORKOUT_LISTED == 0) {
        clearInterval(RUNTIME_HANDLER);
        RUNTIME_HANDLER = null;
        long_bip.play();
        long_bip.play();
        long_bip.play();
    } else if (CURRENT == 3 || CURRENT == 2 || CURRENT == 1) {
        short_bip.play();
    }

    document.getElementById("time").innerHTML = CURRENT;
}

function luncher() {
    var app = document.getElementById("main-app");

    WORKOUT_LISTED = WORKOUT.into_list();
    TOTAL_SECONDS = WORKOUT_LISTED.reduce((c, v) => c + v[0], 0);

    document.getElementById("main-app-time-left").innerText = 'Time Left: ' + new Date( TOTAL_SECONDS * 1000 ).toISOString().substring(14, 19);

    var sumary = document.getElementById("main-app-event-area");
    sumary.clearChildren();

    WORKOUT_LISTED.forEach((value, index, array) => {
        var text = document.createElement("h1");
        text.innerText = (index + 1).toString() + ". " + value[1].capitalize() + " - " + value[0] + " seconds";
        sumary.appendChild(text);
    });
    
    var text = document.createElement("h1");
    text.innerText = "Finish!";
    sumary.appendChild(text);

    app.style.display = 'block';

    WORKOUT_LISTED.reverse();

    var f = WORKOUT_LISTED.pop();

    var TIME = document.getElementById("time");
    TIME.innerText = f[0];
    sumary.removeChild(sumary.children[0]);
    CURRENT = f[0];

    RUNTIME_HANDLER = setInterval(runtime, 999);
}

function start_activity() {
    let actions = document.getElementsByClassName('action');
    let [prep, work, rest, cycles, sets, rest_between, cooldown] = actions;

    function n(element) {
        return Number(element.getElementsByTagName("textarea")[0].value);
    }

    function l(element) {
        return element.children[1].children[0].innerText;
    }

    var workout = new Workout();

    var prep_action = new Exercice();
    prep_action.add(new Rest(n(prep), l(prep)))
    workout.add(prep_action);

    for (const set of Array(n(sets)).keys()) {
        var exercice = new Exercice();
        for (const cycle of Array(n(cycles)).keys()) {
            exercice.add(new Work(n(work), l(work)));
            exercice.add(new Rest(n(rest), l(rest)));
        }
        exercice.add(new Rest(n(rest_between), l(rest_between)));
        workout.add(exercice);
    }

    var cooldown_action = new Exercice();
    cooldown_action.add(new Rest(n(cooldown), l(cooldown)))
    workout.add(cooldown_action);

    console.log(workout);

    WORKOUT = workout;
    setTimeout(luncher, 1);
}

function add_counter(element) {
    let ta = element.parentElement.getElementsByTagName("textarea")[0];
    ta.value = Number(ta.value) + 1;
}

function sub_counter(element) {
    let ta = element.parentElement.getElementsByTagName("textarea")[0];
    console.log(ta.min);
    ta.value = Math.max(Number(ta.value) - 1, Number(ta.attributes.min.nodeValue));
}

function pause_activity() {
    clearInterval(RUNTIME_HANDLER);
    RUNTIME_HANDLER = null;
}

function toggle_activity(button) {
    if (RUNTIME_HANDLER == null) {
        resume_activity();
        button.children[0].src = icons['pause'];
    } else {
        pause_activity();
        button.children[0].src = icons['play'];
    }
}

function resume_activity() {
    if (TOTAL_SECONDS != 0) {
        RUNTIME_HANDLER = setInterval(runtime, 999);
    }
}

function cancel_activity() {
    pause_activity();
    WORKOUT = null;
    WORKOUT_LISTED = [];
    document.getElementById("main-app").style.display = "none";
}

let long_bip = new Audio("long_bip.mp3");
let short_bip = new Audio("short_bip.mp3");

var WORKOUT = null;
var CURRENT = 0;
var WORKOUT_LISTED = [];
var TOTAL_SECONDS = 0;
var RUNTIME_HANDLER = null;

const icons = {
    'pause': "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-pause-512.png",
    "play": "https://icons.veryicon.com/png/o/internet--web/web-video-clip/play-332.png"
}

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

if( typeof Element.prototype.clearChildren === 'undefined' ) {
    Object.defineProperty(Element.prototype, 'clearChildren', {
      configurable: true,
      enumerable: false,
      value: function() {
        while(this.firstChild) this.removeChild(this.lastChild);
      }
    });
}