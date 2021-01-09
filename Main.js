

function getGameSpeed() {
    //var timeWarping = gameData.taskData["Time warping"]
    //var timeWarpingSpeed = gameData.timeWarpingEnabled ? timeWarping.getEffect() : 1
	timeWarpingSpeed = 1
    var gameSpeed = baseGameSpeed * +!gameData.paused * +isAlive() * timeWarpingSpeed * debugSpeed
    return gameSpeed
}



function setPause() {
	gameData.paused = !gameData.paused
}


function applySpeed(value) {
    finalValue = value * getGameSpeed() / updateSpeed
    return finalValue
}

function doCurrentTask(task) {
    task.increaseXp()
//    if (task instanceof Job) {
 //       increaseCoins()
  //  }
}

function applyMultipliers(value, multipliers) {
    var finalMultiplier = 1
    multipliers.forEach(function(multiplierFunction) {
        var multiplier = multiplierFunction()
        finalMultiplier *= multiplier
    })
    var finalValue = (value * finalMultiplier)
    return finalValue
}


function setTask(taskName) {
	if(skillCategories["Combat"].includes(taskName))
		return
    var task = gameData.taskData[taskName]
    task instanceof Job ? gameData.currentJob = task : gameData.currentSkill = task
}

function createData(data, baseData) {
    for (key in baseData) {
        var entity = baseData[key]
        createEntity(data, entity)
    }
}

function createEntity(data, entity) {
    if ("income" in entity) {data[entity.name] = new Job(entity)}
    else if ("maxXp" in entity) {data[entity.name] = new Skill(entity)}
    else {data[entity.name] = new Item(entity)}
    data[entity.name].id = "row " + entity.name
}

function RandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEnergy()
{
	var Energy = 1
	for (taskName in skillBaseData) {
        var task = skillBaseData[taskName]
		//console.log(task.description)
		if(task.description == "Energy"){
			//console.log(task.name)
			Energy*= getBindedTaskEffect(task.name)()
			//console.log(task.name, Energy)
			
		}
	}
	return Energy
}


function getIncome()
{
	return gameData.currentJob.getIncome()
}

function getExpenses()
{
	return 0
}

function getBindedTaskEffect(taskName) {
//	console.log(taskName)
    var task = gameData.taskData[taskName]
    return task.getEffect.bind(task)
}


function getArrayofTaskEffects(type){
	var result = []
	for( let job in jobBaseData) 
		if(jobBaseData[job].description ==type){
			 result.push(getBindedTaskEffect(job))
		}

	for( let skill in skillBaseData) 
		if(skillBaseData[skill].description ==type){
			 result.push(getBindedTaskEffect(skill))
		}

	return result
}
function getArrayofTasks(type, target=gameData){
	var result = []
	for( let task in target.taskData) {
		if(target.taskData[task] instanceof Job)
			if(jobBaseData[task].description ==type){
				result.push(target.taskData[task])
			}
		if(target.taskData[task] instanceof Skill)
			if(skillBaseData[task].description ==type){
				 result.push(target.taskData[task])
			}	
	}
/*	for( let job in jobBaseData) 
		if(jobBaseData[job].description ==type){
			 result.push(target.taskData[job])
		}

	for( let skill in skillBaseData) 
		if(skillBaseData[skill].description ==type){
			 result.push(target.taskData[skill])
		}
*/
	return result
}

function getKeyOfLowestValueFromDict(dict) {
    var values = []
    for (key in dict) {
        var value = dict[key]
        values.push(value)
    }

    values.sort(function(a, b){return a - b})

    for (key in dict) {
        var value = dict[key]
        if (value == values[0]) {
            return key
        }
    }
}

function setSkillWithLowestMaxXp() {
    var xpDict = {}

    for (skillName in gameData.taskData) {
		if(!(skillCategories["Combat"].includes(skillName))){
			var skill = gameData.taskData[skillName]
			var requirement = gameData.requirements[skillName]
			if (skill instanceof Skill && requirement.isCompleted()) {
				xpDict[skill.name] = skill.level //skill.getMaxXp() / skill.getXpGain()
			}
		}	
    }

    var skillName = getKeyOfLowestValueFromDict(xpDict)
    skillWithLowestMaxXp = gameData.taskData[skillName]
}


function autoLearn() {
    if (!autoLearnElement.checked || !skillWithLowestMaxXp) return
    gameData.currentSkill = skillWithLowestMaxXp
}

function calculatedStat(target, name, value){
	target.stats[name]= {"name":name, "value": value}
	
	
}
function calcStats(target){
	statCategories["Base stats"].forEach(function(stat){
		target.stats[stat] = {"name":stat, "value":1}
		var multi = 1
		getArrayofTasks(stat,target).forEach(function(task){
			if(task.baseData.effect<0.5)
				multi *= task.getEffect()
		    else{	
				target.stats[stat].value += task.getEffect()
			}
		})
		target.stats[stat].value *= multi
	})
	crimeFindBonus = 	1
	getArrayofTaskEffects("CrimeFind").forEach(function (item, index){  
		crimeFindBonus*= item()
	})
	//console.log(crimeFindBonus)
	calculatedStat(target, "Henchman find", Math.log10(target.stats["Intelligence"].value)*
									Math.log10(1+target.stats["Speed"].value) * 0.03 *crimeFindBonus)
	
	calculatedStat(target, "Villain find", Math.log10(target.stats["Intelligence"].value)*
				  Math.log10(1+target.stats["Speed"].value) * 0.0003 * crimeFindBonus)

	
	combatMult = gameData.taskData["Combat Experience"].getEffect()
	calculatedStat(target, "Hit points", target.stats["Endurance"].value*10 * combatMult)
	calculatedStat(target, "Min damage", 1 * combatMult)
	calculatedStat(target, "Max damage", target.stats["Strength"].value * combatMult)
	calculatedStat(target, "Attack speed",  Math.max(1, Math.min(50,Math.log10(target.stats["Speed"].value * combatMult))))

}

function addMultipliers() {
    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getEnergy)

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
			for( otherjob in jobBaseData) 
				if(jobBaseData[otherjob].description =="Income"){
					 task.incomeMultipliers.push(getBindedTaskEffect(otherjob))
				}
			if(jobCategories["Media"].includes(task.name))
				getArrayofTaskEffects("Media XP").forEach(function (item, index){  
					task.xpMultipliers.push(item)})				
				
			//console.log(jobBaseData[otherjob])
   //         task.xpMultipliers.push(getBindedTaskEffect("Productivity"))
     //       task.xpMultipliers.push(getBindedItemEffect("Personal squire"))    
        } else if (task instanceof Skill) {
			getArrayofTaskEffects("Skill XP").forEach(function (item, index){  
			task.xpMultipliers.push(item)})
			if(skillCategories["Physical"].includes(task.name))
				getArrayofTaskEffects("Physical Skill XP").forEach(function (item, index){  
					task.xpMultipliers.push(item)})				
					
     //       task.xpMultipliers.push(getBindedTaskEffect("Concentration"))
      //      task.xpMultipliers.push(getBindedItemEffect("Book"))
       //     task.xpMultipliers.push(getBindedItemEffect("Study desk"))
     //       task.xpMultipliers.push(getBindedItemEffect("Library"))
        }

     /*   if (jobCategories["Military"].includes(task.name)) {
            task.incomeMultipliers.push(getBindedTaskEffect("Strength"))
            task.xpMultipliers.push(getBindedTaskEffect("Battle tactics"))
            task.xpMultipliers.push(getBindedItemEffect("Steel longsword"))
        } else if (task.name == "Strength") {
            task.xpMultipliers.push(getBindedTaskEffect("Muscle memory"))
            task.xpMultipliers.push(getBindedItemEffect("Dumbbells"))
        } else if (skillCategories["Magic"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Sapphire charm"))
        } else if (jobCategories["The Arcane Association"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Mana control"))
        } else if (skillCategories["Dark magic"].includes(task.name)) {
            task.xpMultipliers.push(getEvil)
        }
		*/
    }

    for (itemName in gameData.itemData) {
        var item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"))
    }
}


function Random(min, max) {
    return (Math.random() * (max - min)) + min;
}


function rebirthReset() {
    setTab(document.getElementById("jobsTabButton"), "jobs")

    gameData.coins = 0
    gameData.days = 365 * 18
    gameData.alive = true

	gameData.henchmanCount = 0
	gameData.villains=[villain=newVillain(1)]
	gameData.currentVillain = -1 //RandomInt(0,gameData.villains.length-1)


    gameData.currentJob = gameData.taskData["Beggar"]
    gameData.currentSkill = gameData.taskData["Concentration"]
//    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]
        if (task.level > task.maxLevel) task.maxLevel = task.level
        task.level = 0
        task.xp = 0
    }

    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.completed && permanentUnlocks.includes(key)) continue
        requirement.completed = false
	}
	document.getElementById("autoFightHenchman").checked = false
}


function rebirthOne(){
	if(isAlive())
		gameData.rebirthOneCount += 1
	else
		gameData.deathCount +=1
    rebirthReset()
}


function update(){
	//doCurrentTask()
	gameData.days += applySpeed(1)
	gameData.money+=applySpeed(getIncome()-getExpenses())
	doCurrentTask(gameData.currentJob)
	doCurrentTask(gameData.currentSkill)
	calcStats(gameData)
	setSkillWithLowestMaxXp()
	autoFightHenchman()
	autoLearn()
	
	if(gameData.paused == false){
		if(gameData.villains.length == 0){		
			gameData.villains=[villain=newVillain(1)]
			gameData.currentVillain = -1 //RandomInt(0,gameData.villains.length-1)
		}

		TrainVillainSkills(gameData.villains[0])
		calcStats(gameData.villains[0])
		if(	gameData.henchmanCount == 0){
			var hf = gameData.stats["Henchman find"].value
			while(Math.random() < hf)
			{
				gameData.henchmanCount +=1
				hf-=1
			}
			if(gameData.henchmanCount>0)
				gameData.henchman = newHenchman()
		}
		if(	gameData.currentVillain < 0)
			if(Math.random() < gameData.stats["Villain find"].value)
				gameData.currentVillain = RandomInt(0,gameData.villains.length-1)
	}
	updateUI()
}

function loadGame(){
	if(document.getElementById("killVillain").checked) gameData.villainWin = "kill"
	if(document.getElementById("looseVillain").checked) gameData.villainWin = "loose"
	if(document.getElementById("imprisonVillain").checked) gameData.villainWin = "imprison"
	if (gameData.villainWin ==	 ""){
		gameData.villainWin = "loose"
		document.getElementById("looseVillain").checked = true
	}
	
}

createData(gameData.taskData, jobBaseData)
createData(gameData.taskData, skillBaseData)

createAllRows(jobCategories, "jobTable")
createAllRows(skillCategories, "skillTable")
createAllRows(statCategories, "statTable")

loadGame()


function setRequirements(){
	gameData.requirements = {
		"Beggar": new TaskRequirement([getTaskElement("Beggar")], []),
		"Beach bum": new TaskRequirement([getTaskElement("Beach bum")], [{money: 10_000},{task: "Beggar", requirement: 10}]),
		"Trust fund kid": new TaskRequirement([getTaskElement("Trust fund kid")], [{money: 1_000_000},{task: "Beach bum", requirement: 10}]),
		
		"Journalist": new TaskRequirement([getTaskElement("Journalist")], []),
		"Editor": new TaskRequirement([getTaskElement("Editor")],  [{task: "Journalist", requirement: 10}]),
		"Newspaper magnate": new TaskRequirement([getTaskElement("Newspaper magnate")],  [{task: "Editor", requirement: 10}]),
		"Hacker": new TaskRequirement([getTaskElement("Hacker")],  [{task: "Newspaper magnate", requirement: 10}]),
		"Internet controller": new TaskRequirement([getTaskElement("Internet controller")],  [{task: "Hacker", requirement: 10}]),
		
		"Trainee": new TaskRequirement([getTaskElement("Trainee")], []),
		"Officer": new TaskRequirement([getTaskElement("Officer")], [{task: "Trainee", requirement: 10}]),
		"Detective": new TaskRequirement([getTaskElement("Detective")], [{task: "Officer", requirement: 10}]),	
		"SWAT": new TaskRequirement([getTaskElement("SWAT")], [{task: "Detective", requirement: 10}]),	
		"Captain": new TaskRequirement([getTaskElement("Captain")], [{task: "SWAT", requirement: 10}]),	
		"Instructor": new TaskRequirement([getTaskElement("Instructor")], [{task: "Captain", requirement: 10}]),	
		"Commissioner": new TaskRequirement([getTaskElement("Commissioner")], [{task: "Instructor", requirement: 10}]),
		
		"Soccer coach": new TaskRequirement([getTaskElement("Soccer coach")], []),
		"Personal trainer": new TaskRequirement([getTaskElement("Personal trainer")], [{task: "Soccer coach", requirement: 10}]),
		"Martial arts instructor": new TaskRequirement([getTaskElement("Martial arts instructor")], [{task: "Personal trainer", requirement: 10}]),
		"Crossfit champion": new TaskRequirement([getTaskElement("Crossfit champion")], [{task: "Martial arts instructor", requirement: 10}]),
		
		"Concentration": new TaskRequirement([getTaskElement("Concentration")], []),
		"Reading": new TaskRequirement([getTaskElement("Reading")], [{task: "Concentration", requirement: 10}]),
		"Writing": new TaskRequirement([getTaskElement("Writing")], [{task: "Reading", requirement: 10}]),
		"Meditation": new TaskRequirement([getTaskElement("Meditation")], [{task: "Concentration", requirement: 25}]),
		"Reading Sherlock Holmes": new TaskRequirement([getTaskElement("Reading Sherlock Holmes")], [{task: "Reading", requirement: 50}]),
		
		"Fitness plan": new TaskRequirement([getTaskElement("Fitness plan")], []),
		"Jogging": new TaskRequirement([getTaskElement("Jogging")], [{task: "Fitness plan", requirement: 10}]),
		"Running": new TaskRequirement([getTaskElement("Running")], [{task: "Jogging", requirement: 50}]),
		
		"Speed punches": new TaskRequirement([getTaskElement("Speed punches")], [{task: "Fitness plan", requirement: 10}]),
		"Sprinting": new TaskRequirement([getTaskElement("Sprinting")], [{task: "Running", requirement: 50}]),

		"Push-ups": new TaskRequirement([getTaskElement("Push-ups")], [{task: "Fitness plan", requirement: 10}]),
		"Pull-ups": new TaskRequirement([getTaskElement("Pull-ups")], [{task: "Push-ups", requirement: 50}]),
		
		"Combat Experience": new TaskRequirement([getTaskElement("Combat Experience")], []),
		
	}
}
setRequirements()

gameData.currentJob = gameData.taskData["Beggar"]
gameData.currentSkill = gameData.taskData["Concentration"]


function saveGameData() {
    localStorage.setItem("TheWoodChuck", JSON.stringify(gameData))
}
//setInterval(saveGameData, 3000)
window.onunload = function(){saveGameData(); alert("saved")};

/*var savegame = JSON.parse(localStorage.getItem("TheWoodChuck"))
if (savegame !== null) {
  gameData = savegame
  console.log("Loaded from local storage")
}*/

addMultipliers()

setTab(document.getElementById("jobsTabButton"), "jobs")

setInterval(update, 1000 / updateSpeed)
//setInterval(update, 10000)
