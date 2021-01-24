function debugBoostPlayer(){
	for (skillName in gameData.taskData) 
		if(gameData.taskData[skillName] instanceof Skill){
			gameData.taskData[skillName].maxLevel+=200
		}
	gameData.rebirthOneCount = Math.max(1, gameData.rebirthOneCount)
}

function debugSpawnHenchman(){
	gameData.henchmanCount=1;
	gameData.henchman = newHenchman()
	console.log("Debug spawned henchman")
}

function debugSpawnVillain(){
	gameData.currentVillain = RandomInt(0,gameData.villains.length-1)
}

function debugResetCurrentVillain(){
	if(gameData.currentVillain <0)
		gameData.currentVillain = RandomInt(0,gameData.villains.length-1)
	
	gameData.villains[gameData.currentVillain]=newVillain(1)
	
}

function autoFightVillain(){
	if(document.getElementById("autoFightVillain").checked)
		fightVillain()
}

function autoFightHenchman(){ 
	if(document.getElementById("autoFightHenchman").checked)
		fightHenchman()
}

function fightVillain(){
	if(gameData.currentVillain>=0)
		if(fight(gameData.villains[gameData.currentVillain])){

			if(document.getElementById("killVillain").checked) gameData.villainWin = "kill"
			if(document.getElementById("looseVillain").checked) gameData.villainWin = "loose"
			if(document.getElementById("imprisonVillain").checked) gameData.villainWin = "imprison"
			
			gameData.statistics.villainsThisRebirth+=1
			for( let sp in gameData.villains[gameData.currentVillain].superpowers) {
				//console.log(sp, sp in gameData.superpowers)
				gameData.superpowers[sp].AbsorbPower()
				//console.log(gameData.superpowers[sp])
				//if(sp in gameData.superpowers)
				//	gameData.superpowers[sp].level +=1
				//else{
				//	gameData.superpowers[sp] = AbsorbPower(gameData.villains[gameData.currentVillain].superpowers[sp])
				//this can probably only be done once as part of load	
				superPowerMultipliers(sp)
				//}
			}

			if(gameData.villainWin == "loose")
				{
					//easier to write one equal than two. But then I came to write this stupid comment!
				}
				else
				{
					//kill or imprison - spawn new villain
					gameData.villains[gameData.currentVillain] = newVillain(gameData.villains[gameData.currentVillain].tier)
				}
				if(gameData.villainWin == "kill")
					gameData.alignment -= 1
				if(gameData.villainWin == "imprison")
					gameData.alignment += 1
				gameData.currentVillain = -1	
			}
			else
				gameData.alive=false

}

function newHenchman(){
	var sourceVillain = gameData.villains[RandomInt(0,gameData.villains.length-1)]
	var henchman = {
			taskData: {},
			stats:{}
		}
	henchman.stats.Name = {"name":"Name", "value":"Random Henchman #1"}
	henchman.stats["Henchman find"] = ""
	henchman.stats["Villain find"]  = ""
	henchman.superpowers = []
	createData(henchman.taskData, skillBaseData)
	for(skill in henchman.taskData) {
		henchman.taskData[skill].level = Math.max(1,Math.floor(sourceVillain.taskData[skill].level *(Math.random()*(0.6-0.2)+0.2)))
	}
	calcStats(henchman)
	return henchman
}

function fightHenchman(){
	while(gameData.henchmanCount>0 )
	{
		var result = fight(gameData.henchman)
		if (result>0){
			var combatXP =0;
			statCategories["Base stats"].forEach(function(stat){combatXP+=gameData.henchman.stats[stat].value})
			gameData.taskData["Combat Experience"].increaseXp(combatXP*
				gameData.taskData["Combat Experience"].getMaxLevelMultiplier()/
				applySpeed(1))
			gameData.henchmanCount -= 1
		}
		
	}
	if(result <0)
		gameData.alive=false
}


function TrainVillainSkills(villain){
	var XP = villain.XPperDay/Object.keys(villain.taskData).length
	for(skill in villain.taskData) {
		villain.taskData[skill].increaseXp(XP)
	}
}

function newVillain(tier){
	var villainNumber = RandomInt(0,Villains[tier].length-1)
	var sourceVillain = Villains[tier][villainNumber]
	
	var villain = {
		name : sourceVillain.name,
        taskData: {},
        XPperDay: 100**tier*sourceVillain.XPBonus,
		stats:{},
		tier:tier,
		description: sourceVillain.backstory,
		superpowers: {}
	}

//	villain.superpowers = GetSuperPowers(tier,100**tier)
	villain.stats["Henchman find"] = ""
	villain.stats["Villain find"]  = ""

	for(power in sourceVillain.powers)
		villain.superpowers[ sourceVillain.powers[power]] = CreateSuperPower(sourceVillain.powers[power],100**tier)  
	
	villain.stats.Name =  {"name":"Name", "value":sourceVillain.name}
	//gameData.stats.Name =  {"name":"Name", "value": "The Woodchuck"}
	createData(villain.taskData, skillBaseData)

	XPperSkill = villain.XPperDay*(gameData.days - 18*365-1) / Object.keys(villain.taskData).length
    for(skill in villain.taskData) {
        villain.taskData[skill].xp = XPperSkill
        villain.taskData[skill].increaseXp()
    }
    return villain
}

function fight(enemy){
	playerHP = gameData.stats["Hit points"].value
	enemyHP = enemy.stats["Hit points"].value
	tickspeed = 20
	playerDelay = 1000/gameData.stats["Attack speed"].value
	enemyDelay = 1000/enemy.stats["Attack speed"].value
	playerReady = 0
	enemyReady = 0
	while (Math.min(playerHP,enemyHP)>0)
	{
		playerReady += tickspeed
		enemyReady += tickspeed
		if(enemyReady>=enemyDelay)
		{
			enemyReady -= enemyDelay
			playerHP -= Random(enemy.stats["Min damage"].value, enemy.stats["Max damage"].value)
		}
		if(playerReady>=playerDelay)
		{
			playerReady -= playerDelay
			enemyHP -= Random(gameData.stats["Min damage"].value, gameData.stats["Max damage"].value)
		}
	}
	if(playerHP <0) return false
	return true
}



