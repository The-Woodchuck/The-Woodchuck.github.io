function getCategoryFromEntityName(categoryType, entityName) {
    for (categoryName in categoryType) {
        var category = categoryType[categoryName]
        if (category.includes(entityName)) {
            return category
        }
    }
}

function getNextEntity(data, categoryType, entityName) {
    var category = getCategoryFromEntityName(categoryType, entityName)
    var nextIndex = category.indexOf(entityName) + 1
    if (nextIndex > category.length - 1) return null
    var nextEntityName = category[nextIndex]
    var nextEntity = data[nextEntityName]
    return nextEntity
}

function autoPromote() {
	const autoPromoteElement = document.getElementById("autoPromote")
    if (!autoPromoteElement.checked) return
    var nextEntity = getNextEntity(gameData.taskData, jobCategories, gameData.currentJob.name)
    if (nextEntity == null) return
    var requirement = gameData.requirements[nextEntity.name]
    if (requirement.isCompleted()) gameData.currentJob = nextEntity
}



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
	//decay energy after 50 years
	var Energy = Math.min(1,50/(gameData.days/365))
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
	var interest = gameData.money* gameData.taskData.Investing.getEffect()/365
	if(gameData.money < 10000)
	if (interest>0) console.log(gameData.money, interest, gameData.taskData.Investing.level,  gameData.taskData.Investing.getEffect())
	return gameData.currentJob.getIncome() + interest
}

function getExpenses()
{
	return 0
}

function getBindedPowerEffect(powerName, target= gameData) {
    var power = target.superpowers[powerName]
    return power.getEffect.bind(power)
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
//getArrayofPowers("Strength",gameData.villains[0])[0].getEfffect()

function getArrayofPowers(type, target=gameData){
	var result = []
	for( let sp in target.superpowers) {
	//	console.log(target.superpowers[sp].target)
		if(target.superpowers[sp].target ==type){
			result.push(target.superpowers[sp])
		}
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
	for( let sp in target.superpowers) {
	
	}
	return result
}

function getKeyOfBestValueFromDict(dict, lowest = true) {
    var values = []
    for (key in dict) {
        var value = dict[key]
        values.push(value)
    }
	if(lowest)
		values.sort(function(a, b){return a - b})
	else
		values.sort(function(a, b){return  b - a})

    for (key in dict) {
        var value = dict[key]
        if (value == values[0]) {
            return key
        }
    }
}

function getSkillWithHighestLevelsPerDay() {
	var xpDict = {}
    for (skillName in gameData.taskData) {
		if(!(skillCategories["Combat"].includes(skillName))){
			var skill = gameData.taskData[skillName]
			var requirement = gameData.requirements[skillName]
			if (skill instanceof Skill && requirement.isCompleted()) {
				xpDict[skill.name] =  skill.getXpGain()/skill.getMaxXp() 
			}
		}	
    }

	var skillName = getKeyOfBestValueFromDict(xpDict, false)
	return gameData.taskData[skillName]
}

function getSkillWithLowestMaxXp() {
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

    var skillName = getKeyOfBestValueFromDict(xpDict)
	var skillWithLowestMaxXp = gameData.taskData[skillName]
	return skillWithLowestMaxXp
}


function autoLearn() {
	//autoLearnLowestLevel
	if(document.getElementById("autoLearnLowestLevel").checked){
		var targetSkill = getSkillWithLowestMaxXp()
		gameData.autoLearnTarget="level"
	}
	else{
		var targetSkill = getSkillWithHighestLevelsPerDay()
		gameData.autoLearnTarget="levelsPerDay"
	}

    if (!autoLearnElement.checked || !targetSkill) return
    gameData.currentSkill = targetSkill
}

function calculatedStat(target, name, value){
	target.stats[name]= {"name":name, "value": value}
}

function calcStats(target){
	var superPowerConCat = []
	for (i in target.superpowers)
		if(target.superpowers[i].level>0)
			superPowerConCat.push(i+" "+target.superpowers[i].level)
	target.stats["Superpowers"] = {"name":"Superpowers", "value": 
	superPowerConCat.join("\n, ")}
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
		var PowerBonus = 1
		getArrayofPowers(stat, target).forEach(function (item, index){  
			PowerBonus*= item.getEffect()
		})
		target.stats[stat].value *= multi* PowerBonus
		
//		target.stats[stat+" power"]=PowerBonus
	})
	var crimeFindBonus = 	1
	getArrayofTaskEffects("CrimeFind").forEach(function (item, index){  
		crimeFindBonus*= item()
	})

	var weaponBonus=1;
	getArrayofTaskEffects("Weapons").forEach(function (item, index){  
		weaponBonus*= item()
	})

	//console.log(crimeFindBonus)
	calculatedStat(target, "Henchman find", Math.log10(target.stats["Intelligence"].value)*
									Math.log10(1+target.stats["Speed"].value) * 0.03 *crimeFindBonus)
	
	calculatedStat(target, "Villain find", Math.log10(target.stats["Intelligence"].value)*
				  Math.log10(1+target.stats["Speed"].value) * 0.0003 * crimeFindBonus)

	
	combatMult = gameData.taskData["Combat Experience"].getEffect()
	calculatedStat(target, "Hit points", target.stats["Endurance"].value*10 * combatMult)
	calculatedStat(target, "Min damage", Math.sqrt(target.stats["Dexterity"].value) * combatMult*weaponBonus)
	calculatedStat(target, "Max damage", target.stats["Strength"].value * combatMult*weaponBonus)
	calculatedStat(target, "Attack speed",  Math.max(1, Math.min(50,Math.log10(target.stats["Speed"].value * combatMult))))

}

function superPowerMultipliers(thisPower){
	//superpowersthat boosts income
//			for(sp in gameData.superpowers)
	//console.log(thisPower)
	for (taskName in gameData.taskData) {
		var task = gameData.taskData[taskName]
		if(gameData.superpowers[thisPower].target=="Income")
			if (task instanceof Job)
				//task.incomeMultipliers.push(gameData.superpowers[thisPower].getEffect)
				task.incomeMultipliers.push(getBindedPowerEffect(thisPower))
				//getBindedPowerEffect
}
}
//superPowerMultipliers("Rich")

function addMultipliers() {
	if(Object.keys(gameData.superpowers).length>0)
		for(sp in gameData.superpowers)
			superPowerMultipliers(sp)

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getEnergy)

        if (task instanceof Job) {
			//own level income multiplier
			task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
			//other jobs that boosts income
			for( otherjob in jobBaseData) 
				if(jobBaseData[otherjob].description =="Income"){	
					 task.incomeMultipliers.push(getBindedTaskEffect(otherjob))
				}

			//Media has an XP boost skill
			if(jobCategories["Media"].includes(task.name))
				getArrayofTaskEffects("Media XP").forEach(function (item, index){  
					task.xpMultipliers.push(item)})				
				
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
	gameData.villains=[newVillain(1)]
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

    for (var powerName in gameData.superpowers) {
		var power = gameData.superpowers[powerName]
		power.maxLevel = Math.max(power.maxLevel, power.level)
        //if (power.level > task.maxLevel) task.maxLevel = task.level
        power.level = 0
        power.xp = 0
    }

	for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.completed && permanentUnlocks.includes(key)) continue
        requirement.completed = false
	}
	document.getElementById("autoFightHenchman").checked = false
	document.getElementById("autoFightVillain").checked = false

	if(document.getElementById("autoPauseOnRebirth").checked)
		gameData.paused = true

}

function isAlive() {
	var deathText = document.getElementById("deathText")
	
    if (!gameData.alive) {
        deathText.classList.remove("hidden")
    }
    else {
        deathText.classList.add("hidden")
    }
    return gameData.alive
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
	autoFightHenchman()
	autoFightVillain()
	autoLearn()
	autoPromote()
	
	if(!gameData.paused){
		TrainVillainSkills(gameData.villains[0])
		calcStats(gameData.villains[0])
		if(	gameData.henchmanCount == 0){
			var hf = applySpeed(gameData.stats["Henchman find"].value)
			while(Math.random() < hf)
			{
				gameData.henchmanCount +=1
				hf-=1
			}
			if(gameData.henchmanCount>0)
				gameData.henchman = newHenchman()
		}
		if(	gameData.currentVillain < 0){
			if(Math.random() < applySpeed(gameData.stats["Villain find"].value)){
				gameData.currentVillain = RandomInt(0,gameData.villains.length-1)
			}
		}
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
setCustomEffects()

loadGame()

if(gameData.villains.length == 0){		
	gameData.villains=[villain=newVillain(1)]
	gameData.currentVillain = -1 
}
loadSuperPowers()

gameData.autoLearnTarget== "level"?document.getElementById("autoLearnLowestLevel").checked=true:document.getElementById("autoLearnLevelsPerDay").checked=true


function setRequirements(){
	gameData.requirements = {
		"Beggar": new TaskRequirement([getTaskElement("Beggar")], []),
		"Beach bum": new TaskRequirement([getTaskElement("Beach bum")], [{money: 10_000},{task: "Beggar", requirement: 10}]),
		"Trust fund kid": new TaskRequirement([getTaskElement("Trust fund kid")], [{money: 1_000_000},{task: "Beach bum", requirement: 10}]),
		
		"Journalist": new TaskRequirement([getTaskElement("Journalist")], [{task: "Writing", requirement: 10}]),
		"Editor": new TaskRequirement([getTaskElement("Editor")],  [{task: "Journalist", requirement: 10}]),
		"Newspaper magnate": new TaskRequirement([getTaskElement("Newspaper magnate")],  [{task: "Editor", requirement: 10}]),
		"Hacker": new TaskRequirement([getTaskElement("Hacker")],  [{task: "Newspaper magnate", requirement: 10}]),
		"Internet controller": new TaskRequirement([getTaskElement("Internet controller")],  [{task: "Hacker", requirement: 10}]),
		
		"Trainee": new TaskRequirement([getTaskElement("Trainee")], [{stat: "Strength", requirement: 10}]),
		"Officer": new TaskRequirement([getTaskElement("Officer")], [{task: "Trainee", requirement: 10}]),
		"Detective": new TaskRequirement([getTaskElement("Detective")], [{task: "Officer", requirement: 10}]),	
		"SWAT": new TaskRequirement([getTaskElement("SWAT")], [{task: "Detective", requirement: 10}]),	
		"Captain": new TaskRequirement([getTaskElement("Captain")], [{task: "SWAT", requirement: 10}]),	
		"Instructor": new TaskRequirement([getTaskElement("Instructor")], [{task: "Captain", requirement: 10}]),	
		"Commissioner": new TaskRequirement([getTaskElement("Commissioner")], [{task: "Instructor", requirement: 10}]),
		
		"Soccer coach": new TaskRequirement([getTaskElement("Soccer coach")], [{stat: "Endurance", requirement: 10}]),
		"Professional curler": new TaskRequirement([getTaskElement("Professional curler")], [{task: "Soccer coach", requirement: 10}]),
		"Personal trainer": new TaskRequirement([getTaskElement("Personal trainer")], [{task: "Professional curler", requirement: 10}]),
		"Martial arts instructor": new TaskRequirement([getTaskElement("Martial arts instructor")], [{task: "Personal trainer", requirement: 10}]),
		"Crossfit champion": new TaskRequirement([getTaskElement("Crossfit champion")], [{task: "Martial arts instructor", requirement: 10}]),

		"Massage therapist": new TaskRequirement([getTaskElement("Massage therapist")], [{alignment:"", requirement: 10}]),
		"Nursing assistant": new TaskRequirement([getTaskElement("Nursing assistant")], [{task: "Massage therapist", requirement: 10},{alignment:"", requirement: 10}]),
		"Nurse": new TaskRequirement([getTaskElement("Nurse")], [{task: "Nursing assistant", requirement: 10},{alignment:"", requirement: 10}]),
		
		"Dentist": new TaskRequirement([getTaskElement("Dentist")], [{task: "Nurse", requirement: 10},{alignment:"", requirement: 10}]),
		"Doctor": new TaskRequirement([getTaskElement("Doctor")], [{task: "Dentist", requirement: 10},{alignment:"", requirement: 10}]),
		

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
		
		"Juggling": new TaskRequirement([getTaskElement("Juggling")], [{task: "Fitness plan", requirement: 10}]),
		"Combat Experience": new TaskRequirement([getTaskElement("Combat Experience")], []),

		"Investing": new TaskRequirement([getTaskElement("Investing")], [{power: "Rich", requirement:10}]),
		
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
