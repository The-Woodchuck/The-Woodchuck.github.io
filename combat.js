function debugBoostPlayer(){
	for (skillName in gameData.taskData) 
		if(gameData.taskData[skillName] instanceof Skill){
			gameData.taskData[skillName].maxLevel+=50
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
			
			if(gameData.villainWin == "loose")
			{}
			else
			{
				gameData.villains[gameData.currentVillain] = newVillain(gameData.villains[gameData.currentVillain].tier)
			}
			if(gameData.villainWin == "kill")
				gameData.aligment -= 1
				if(gameData.villainWin == "imprison")
				gameData.aligment += 1
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
	createData(henchman.taskData, skillBaseData)
	for(skill in henchman.taskData) {
		henchman.taskData[skill].level = Math.max(1,Math.floor(sourceVillain.taskData[skill].level *(Math.random()*(0.6-0.2)+0.2)))
	}
	calcStats(henchman)
	return henchman
}

function fightHenchman(){
	if(fight(gameData.henchman))
	{
		var combatXP =0;
		statCategories["Base stats"].forEach(function(stat){combatXP+=gameData.henchman.stats[stat].value})
		//console.log(CombatXP)
		gameData.taskData["Combat Experience"].increaseXp(combatXP/applySpeed(1))
		
		gameData.henchmanCount = 0
		
	}
	else
		gameData.alive=false
}


function TrainVillainSkills(villain){
	var XP = villain.XPperDay/Object.keys(villain.taskData).length
	for(skill in villain.taskData) {
		villain.taskData[skill].increaseXp(XP)
	}
}

function newVillain(tier){
    var villain = {
        taskData: {},
        XPperDay: tier*100,
		stats:{},
		tier:tier
    }
    //createData(villain.taskData, jobBaseData)
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



