// @ts-check
var gameData = {
	rebirthOneCount :0,
	taskData: {},
		currentJob: null,
		currentSkill: null,
	stats:{
	},
	player : {
		
		currentProperty: null,
		currentMisc: null,
	},
	money : 0,
    days: 18*365,
    paused: true,
    henchmanCount:0,
    alive: true,
    deathCount: 0,
	energy: 1,
	heroname: "The Wombat",
    requirements: {},
    currentVillain: 0,
    villains: [],
    combatXP: 0
}

const autoPromoteElement = document.getElementById("autoPromote")
const autoLearnElement = document.getElementById("autoLearn")

const baseGameSpeed = 4
const updateSpeed = 20
var debugSpeed = 1
if(window.location.href.includes("file:///C:")){
	console.log("Debug on")
	debugSpeed = 1
	document.getElementById("debug").style.display=""

	document.getElementById("debugSlider").oninput = function() {
		debugSpeed = Math.pow(2, this.value / 12)
		document.getElementById("debugSpeedDisplay").textContent = debugSpeed.toFixed(1)
		}
	}
else
{
	debugSpeed = 1
	document.getElementById("debug").style.display = "none"
}
const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

//	"Template": {name: "", maxXp: 50, income: 0, Bonus: "", effect:0.01, description: ""},

const jobBaseData = {
	
	"Beggar": {name: "Beggar", maxXp: 50, income: 0, effect:0.01, description: "Income"},
	
	"Beach bum": {name: "Beach bum", maxXp: 200, income: 0, effect:0.01, description: "Income"},

	"Trust fund kid": {name: "Trust fund kid", maxXp: 500, income: 0,  effect:0.01, description: "Income"},
	
    "Journalist": {name: "Journalist", maxXp: 100, income: 5, Bonus: "The pay is crap, but your freedom of movement allows you to find crime easily. 1% bonus per level to finding crime", effect:0.01, description: "CrimeFind"},
	
    "Editor": {name: "Editor", maxXp: 200, income: 9, Bonus: "Better pay, maybe you can move into a tent now? Now you have a team of journalists that can find crime! 1% bonus per level to finding crime.", effect:0.01, description: "CrimeFind"},
	
    "Newspaper magnate": {name: "Newspaper magnate", maxXp: 800, income: 20, Bonus: "The pay is surprisingly low for a magnate. But then again, with the internet newspapers are not as profitable as it used to be. Your connections does make finding villains easier - 1%/level", effect:0.01, description: "VillainFind"},

	"Hacker": {name: "Hacker", maxXp: 2000, income: 0, Bonus: "Nobody will pay you to hack for good, and you are good right? Knowing criminals' status updates gives you another 1% bonus to finding crime", effect:0.01, description: "CrimeFind"},
	
	"Internet controller": {name: "Internet controller", maxXp: 50000, income: 1000, Bonus: "Level up your hacking skills and control the entire internet. Now you get paid to provide DNS addresses to everyone, but you also know everything about everyone. Provides special bonus to crime find of 1% multiplied by the sum of media levels minus the sum of other jobs levels ", effect:0.01, description: ""},
    

    "Trainee": {name: "Trainee", maxXp: 100, income: 10, Bonus: "Pay is bad, but at least your job requires you to go to crime. Ha! Are you naive? Police are so badly bribed you do not get anywhere near crime! At least you get weapons training - 1% bonus per level", effect:0.01, description: "Weapons"},

    "Officer": {name: "Officer", maxXp: 300, income: 10, Bonus: "Pay is bad, but at least your job requires you to go to crime. Ha! Are you naive? Police are so badly bribed you do not get anywhere near crime! At least you get weapons training - 1% bonus per level", effect:0.01, description: "Weapons"},

    "Detective": {name: "Detective", maxXp: 500, income: 20, Bonus: "Detectives at least get paid to pretend to investigate crime! Prosecution rate is none-existent, but at least you get a 1% bonus per level to finding crime", effect:0.01, description: "CrimeFind"},
	
    "SWAT": {name: "SWAT", maxXp: 1000, income: 40, Bonus: "Guns, guns, guns! 1% bonus per level to weapons", effect:0.01, description: "Weapons"},
	
    "Captain": {name: "Captain", maxXp: 2000, income: 100, Bonus: "A police captain, making a difference in a corrupt police force? Ha! You just get paid better", effect:0.0, description: "Weapons"},
	
	"Instructor": {name: "Instructor", maxXp: 5000, income: 200, Bonus: "Teaching the new police how to handle weapons, provides another 1% bonus per level to weapons", effect:0.01, description: "Weapons"},
	
	"Commissioner": {name: "Commissioner", maxXp: 500000, income: 1000, Bonus: "Provides a special bonus to weapons of 1% multiplied by the sum of police levels minus the sum of other jobs levels", effect:0.01, description: ""},

	"Soccer coach": {name: "Soccer coach", maxXp: 100, income: 0, Bonus: "Not your typical superhero job, but it provides a 1% bonus per level to endurance. Coaching a kids soccer team, you have to compete with dads who are willing to do this for free so you do not get paid", effect:0.01, description: "Endurance"},

	"Personal trainer": {name: "Personal trainer", maxXp: 200, income: 15, Bonus: "Helping the gym dudes with their roids - sorry, I mean form - gives you a 1% bonus per level to strength!", effect:0.01, description: "Strength"},
	
	"Martial arts instructor": {name: "Martial arts instructor", maxXp: 5000, income: 100, Bonus: "1% per level to combat XP - beating people up for fun really pays off!", effect:0.01, description: "CombatXP"},
	
	"Crossfit champion" : {name: "Crossfit champion", maxXp: 50000, income: 1000, Bonus: "Provides a special bonus to physical stats of 1% multiplied by the sum of fitness levels minus the sum of other jobs levels", effect:0.01, description: ""}
	
}

const skillBaseData = {
    "Concentration": {name: "Concentration", maxXp: 100, effect: 0.01, description: "Skill XP"},
    "Reading": {name: "Reading", maxXp: 100, effect: 1, description: "Intelligence"},
    "Writing": {name: "Writing", maxXp: 100, effect: 0.01, description: "Media XP"},
    "Meditation": {name: "Meditation", maxXp: 100, effect: 0.01, description: "Energy"},
    "Reading Sherlock Holmes": {name: "Reading Sherlock Holmes", maxXp: 100, effect: 0.01, description: "Crime find"},
	

    "Fitness plan": {name: "Fitness plan", maxXp: 100, effect: 0.01, description: "Physical Skill XP"},

    "Jogging": {name: "Jogging", maxXp: 100, effect: 1, description: "Endurance"},
    "Running": {name: "Running", maxXp: 100, effect: 1, description: "Endurance"},
    
	"Speed punches": {name: "Speed punches", maxXp: 100, effect: 1, description: "Speed"},
	"Sprinting": {name: "Sprinting", maxXp: 100, effect: 1, description: "Speed"},

	"Push-ups": {name: "Push-ups", maxXp: 100, effect: 1, description: "Strength"},
    "Pull-ups": {name: "Pull-ups", maxXp: 100, effect: 1, description: "Strength"},
    
    "Combat Experience": {name: "Combat Experience", maxXp: 100, effect: 0.01, description: "Combat"},
	
}
const skillCategories = {
	"Mental": ["Concentration", "Reading", "Writing", "Meditation", "Reading Sherlock Holmes"],
	
	"Physical": ["Fitness plan", "Jogging","Running", "Speed punches", "Sprinting", "Push-ups", "Pull-ups"],
	"Combat": ["Combat Experience"],
}


/*
const skillCategories = {
    "Brain": ["Concentration", "Productivity", "Bargaining", "Meditation"],
    "Brawn": ["Strength", "Battle tactics", "Muscle memory"],
    "Magic": ["Dark influence", "Evil control", "Demon training", "Blood meditation", "Time warping"]
}*/

const permanentUnlocks = ["Scheduling", "Shop", "Automation"]

const jobCategories = {
    "Unemployed": ["Beggar","Beach bum", "Trust fund kid"],
    "Media": ["Journalist", "Editor", "Newspaper magnate", "Hacker", "Internet controller"],
    "Police" : ["Trainee", "Officer", "Detective", "SWAT", "Captain", "Instructor", "Commissioner"],
    "Fitness" : ["Soccer coach", "Personal trainer", "Martial arts instructor", "Crossfit champion"],
	"Academic": []
}

const formatAsPercentage = ["Henchman find","Villain find"]

const statCategories = {
	"Base stats": ["Intelligence", "Endurance", ,"Strength", "Speed","Dexterity"],
	"Combat stats": ["Henchman find","Villain find","Hit points","Min damage","Max damage","Attack speed"]

}

const itemCategories = {
    "Properties": ["Homeless", "Tent", "Wooden hut", "Cottage", "House", "Large house", "Small palace", "Grand palace"],
    "Misc": ["Book", "Dumbbells", "Personal squire", "Steel longsword", "Butler", "Sapphire charm", "Study desk", "Library"]
}


const headerRowColors = {
    "Unemployed": "#55a630",
    "Media": "#e63946",
    "Police": "#C71585",
    "Fitness": "#4a4e69",
    "Academic": "#875F9A",

    "Mental": "#55a630",
    "Physical": "#e63946",
    "Speed": "#C71585",
    "Strength": "#4a4e69",
	
    "Something": "#ff704d",
    "Dark magic": "#73000f",
    "Properties": "#219ebc",
    "Misc": "#b56576",
}



const tooltips = {
    "Beggar": "Begging for money from friends, family and strangers really prepares you for salary negotiations. Provides a 1% bonus per level to income",
	"Beach bum": "Hehe. Bum. Not having a job really frees up your day to go fight crime, but in a nicer location. Provides a 1% bonus per level to income, due to the coolness factor you will take everywhere.",
	"Trust fund kid": "Socialising with rich kids provides connections that gives a 1% bonus per level to income",
	
	"Journalist": "The pay is crap, but better than being unemployed. Your freedom of movement allows you to find crime easily. 1% bonus per level to finding crime",
	
    "Homeless": "Sleep on the uncomfortable, filthy streets while almost freezing to death every night. It cannot get any worse than this.",
    "Tent": "A thin sheet of tattered cloth held up by a couple of feeble, wooden sticks. Horrible living conditions but at least you have a roof over your head.",
    "Wooden hut": "Shabby logs and dirty hay glued together with horse manure. Much more sturdy than a tent, however, the stench isn't very pleasant.",
    "Cottage": "Structured with a timber frame and a thatched roof. Provides decent living conditions for a fair price.",
    "House": "A building formed from stone bricks and sturdy timber, which contains a few rooms. Although quite expensive, it is a comfortable abode.",
    "Large house": "Much larger than a regular house, which boasts even more rooms and multiple floors. The building is quite spacious but comes with a hefty price tag.",
    "Small palace": "A very rich and meticulously built structure rimmed with fine metals such as silver. Extremely high expenses to maintain for a lavish lifestyle.",
    "Grand palace": "A grand residence completely composed of gold and silver. Provides the utmost luxurious and comfortable living conditions possible for a ludicrous price.",

    "Book": "A place to write down all your thoughts and discoveries, allowing you to learn alot more quickly.",
    "Dumbbells": "Heavy tools used in strenuous exercise to toughen up and accumulate strength even faster than before. ",
    "Personal squire": "Assists you in completing day to day activities, giving you more time to be productive at work.",
    "Steel longsword": "A fine blade used to slay enemies even quicker in combat and therefore gain more experience.",
    "Butler": "Keeps your household clean at all times and also prepares three delicious meals per day, leaving you in a happier, stress-free mood.",
    "Sapphire charm": "Embedded with a rare sapphire, this charm activates more mana channels within your body, providing a much easier time learning magic.",
    "Study desk": "A dedicated area which provides many fine stationary and equipment designed for furthering your progress in research.",
    "Library": "Stores a collection of books, each containing vast amounts of information from basic life skills to complex magic spells.",
	
	"Endurance": "You get 10 hitpoints per endurance (before multipliers). Endurance also provides a ln(endurance) boost to physical skill experience"
}
