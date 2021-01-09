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


//UI
function format(number,decimals="auto") {
    // what tier? (determines SI symbol)
    var tier = Math.log10(number) / 3 | 0;

    // if zero, we don't need a suffix
    if(tier == 0) return number.toFixed(decimals);

    // get suffix and determine scale
    var suffix = units[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(decimals) + suffix;
}/*

gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

Array.prototype.forEach.call(document.getElementsByClassName("maxLevel"), function(item) {
//	gameData.rebirthOneCount > 0 ? item.classList.remove("hidden") : item.classList.add("hidden")
	 item.classList.remove("hidden") 

});
*/
function placeholder(){}

function updateStatRows() {
    for (key in gameData.stats) {
		var stat = gameData.stats[key].value
		if (gameData.currentVillain>=0)
			var villainstat = gameData.villains[gameData.currentVillain].stats[key].value

        var row = document.getElementById("row " + key)
        row.getElementsByClassName("ownlevel")[0].textContent = formatAsPercentage.includes(key) ? format(100*stat,2)+"%":(Number.isInteger(stat)?stat:format(stat,2))
		if(gameData.henchmanCount>0){
			var henchmanstat = gameData.henchman.stats[key].value
			row.getElementsByClassName("henchmanlevel")[0].textContent = formatAsPercentage.includes(key) ? format(100*henchmanstat,2)+"%":(Number.isInteger(henchmanstat)?(henchmanstat):(format(henchmanstat,2)))
		}

		if(["Henchman find","Villain find"].includes(key)){
			if (gameData.currentVillain>=0)
				row.getElementsByClassName("villainlevel")[0].textContent = ""
			row.getElementsByClassName("henchmanlevel")[0].textContent = ""
		}
		else
			if (gameData.currentVillain>=0)
				row.getElementsByClassName("villainlevel")[0].textContent = formatAsPercentage.includes(key) ? format(100*villainstat,2)+"%":(Number.isInteger(villainstat)?villainstat:format(villainstat,2)) 
	}
	
	
	Array.prototype.forEach.call(document.getElementsByClassName("villainlevel"), function(item) {
		gameData.currentVillain>=0 ? item.classList.remove("hidden") : item.classList.add("hidden")
	});
	if(!document.getElementById("autoFightHenchman").checked){
		gameData.henchmanCount>0 ? document.getElementById("fightHenchmanButton").classList.remove("hidden") : document.getElementById("fightHenchmanButton").classList.add("hidden")
		Array.prototype.forEach.call(document.getElementsByClassName("henchmanlevel"), function(item) {
			gameData.henchmanCount>0 ? item.classList.remove("hidden") : item.classList.add("hidden")
		});
		}
	else{
		document.getElementById("fightHenchmanButton").classList.add("hidden")
		Array.prototype.forEach.call(document.getElementsByClassName("henchmanlevel"), function(item) {
			 item.classList.add("hidden")
		});
	

	}
	gameData.currentVillain>=0	? document.getElementById("fightVillainButton").classList.remove("hidden") : document.getElementById("fightVillainButton").classList.add("hidden")

}

function updateTaskRows() {
    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        var row = document.getElementById("row " + task.name)
        row.getElementsByClassName("level")[0].textContent = task.level
        row.getElementsByClassName("xpGain")[0].textContent = format(task.getXpGain())
        row.getElementsByClassName("xpLeft")[0].textContent = format(task.getXpLeft())

        var maxLevel = row.getElementsByClassName("maxLevel")[0]
        maxLevel.textContent = task.maxLevel
        //gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        var progressFill = row.getElementsByClassName("progressFill")[0]
        progressFill.style.width = task.xp / task.getMaxXp() * 100 + "%"
        task == gameData.currentJob || task == gameData.currentSkill ? progressFill.classList.add("current") : progressFill.classList.remove("current")

        var valueElement = row.getElementsByClassName("value")[0]
        valueElement.getElementsByClassName("income")[0].style.display = task instanceof Job
        valueElement.getElementsByClassName("effect")[0].style.display = task instanceof Skill
        if (task instanceof Job) {
			valueElement.getElementsByClassName("income")[0].textContent =	format(task.getIncome(), 2)
            //formatCoins(task.getIncome(), valueElement.getElementsByClassName("income")[0])
        } else {
            valueElement.getElementsByClassName("effect")[0].textContent = task.getEffectDescription()
        }
    }
}

function highlightTab(tabName) {
	if (document.getElementById(tabName).style.display == "none")
		document.getElementById(tabName+"TabButton").classList.add("highlightButton")
}

function setTab(element, selectedTab) {
    var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    tabs.forEach(function(tab) {
        tab.style.display = "none"
    })
    document.getElementById(selectedTab).style.display = "block"

    var tabButtons = document.getElementsByClassName("tabButton")
    for (tabButton of tabButtons) {
        tabButton.classList.remove("activeButton")
    }
    element.classList.add("activeButton")
	element.classList.remove("highlightButton")

}


function changeTab(direction){
	var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
	var tabButtons = Array.prototype.slice.call(document.getElementsByClassName("tabButton"))

	var currentTab = 0
	for (i in tabs) {
		if (!tabs[i].style.display.includes("none"))
	 		currentTab = i*1
	}
	var targetTab = currentTab+direction
	targetTab = Math.max(0,targetTab)
	if( targetTab > (tabs.length-1)) targetTab = 0
	while(tabButtons[targetTab].style.display.includes("none")){
		targetTab = targetTab+direction
		targetTab = Math.max(0,targetTab) 
		if( targetTab > (tabs.length-1)) targetTab = 0
	}
	setTab(document.getElementById(tabs[targetTab].id+"TabButton"), tabs[targetTab].id)
} 

document.onkeydown =  function(e){
	console.log(e.key)
	if(e.key==" ") setPause() 
	if(e.key=="ArrowRight") changeTab(1) 
	if(e.key=="ArrowLeft") changeTab(-1) 
}


function hideEntities() {
	try {

		for (key in gameData.requirements) {
			var requirement = gameData.requirements[key]
			var completed = requirement.isCompleted()
			for (element of requirement.elements) {
				if (completed) {
					//console.log(element)
					element.classList.remove("hidden")
				} else {
					element.classList.add("hidden")
				}
			}
		}
	}
	catch(err) {
		console.log("I got tired of forgetting stuff when adding new jobs, hence the error: ",key)
	}
	
}
function updateUI() {
//	document.getElementById("debug").style.display = "none"
//	document.getElementById("timeWarping").style.display = "none"
//	document.getElementById("moneyDisplay").textContent = "$"+Math.floor(gameData.player.money)
	var jobCompletionPercentage = gameData.currentJob.xp/ gameData.currentJob.getMaxXp()
    document.getElementById("currentJobDisplay").textContent = gameData.currentJob.name	 + " " + gameData.currentJob.level +"." + ((jobCompletionPercentage<0.095)?"0":"") + (jobCompletionPercentage*100).toFixed(0)
	
	var skillCompletionPercentage = gameData.currentSkill.xp/ gameData.currentSkill.getMaxXp()
	document.getElementById("currentSkillDisplay").textContent = gameData.currentSkill.name	 + " " + gameData.currentSkill.level +"." + ((skillCompletionPercentage<0.095)?"0":"") + (skillCompletionPercentage*100).toFixed(0)
	document.getElementById("moneyDisplay").textContent = "$"+format(gameData.money,2)
	document.getElementById("ageDisplay").textContent = Math.floor(gameData.days/365) 
	document.getElementById("dayDisplay").textContent = (gameData.days%365).toFixed(0)
	document.getElementById("incomeDisplay").textContent =  "$"+format(getIncome(),2)
	document.getElementById("expenseDisplay").textContent = "$"+format(getExpenses(),2)		
	document.getElementById("netDisplay").textContent =     "$"+format(getIncome()-getExpenses(),2)		
	document.getElementById("energyDisplay").textContent =     getEnergy().toFixed(1)	
	document.getElementById("pauseButton").textContent = gameData.paused ? "Resume" : "Pause"
	document.getElementById("alignmentDisplay").textContent = gameData.aligment > 0? gameData.aligment + " Good": gameData.aligment + " Evil" 
	if(	gameData.aligment > 0){
		document.getElementById("alignmentDisplay").classList.add("expense")
		document.getElementById("alignmentDisplay").classList.remove("income")
	}
	else{
		document.getElementById("alignmentDisplay").classList.remove("expense")
		document.getElementById("alignmentDisplay").classList.add("income")

	}
	if(	gameData.aligment == 0)
		document.getElementById("alignmentDiv").classList.add("hidden")
	else	
		document.getElementById("alignmentDiv").classList.remove("hidden")
	hideEntities()
	updateTaskRows()
	updateStatRows()

	updateRequiredRows(gameData.taskData, jobCategories)
	updateRequiredRows(gameData.taskData, skillCategories)
//	updateRequiredRows(gameData.taskData, statCategories)

	//element.classList.add("w3-blue-gray")
	if(document.getElementById("rebirthNote1").style.display=="none")
		if(gameData.days>19*365){
			document.getElementById("rebirthNote1").style.display =""
			highlightTab("rebirth")
		}
	if(document.getElementById("rebirthNote2").style.display=="none")
		if((gameData.days>25*365) || !(isAlive())){
			document.getElementById("rebirthNote2").style.display =""
			highlightTab("rebirth")
		}
	//Show/hide the maxLevel column
	Array.prototype.forEach.call(document.getElementsByClassName("maxLevel"), function(item) {
	  gameData.rebirthOneCount > 0 ? item.classList.remove("hidden") : item.classList.add("hidden")
	});		
//	document.getElementById("crimeTabButton").style.display = (gameData.days>19*365) || (gameData.rebirthOneCount>0) ? "":"none"
	document.getElementById("shopTabButton").style.display = (gameData.money>0)  ? "":"none"
		
//	document.getElementById("rebirthNote1").style.display = (gameData.days>19*365 )? "":"none"
//	document.getElementById("rebirthNote2").style.display = (gameData.days>25*365 )? "":"none"
}



function updateRequiredRows(data, categoryType) {
	
    var requiredRows = document.getElementsByClassName("requiredRow")
    for (requiredRow of requiredRows) {
        var nextEntity = null
        var category = categoryType[requiredRow.id] 
        if (category == null) {continue}
        for (i = 0; i < category.length; i++) {
            var entityName = category[i]
            if (i >= category.length - 1) break
            var requirements = gameData.requirements[entityName]
            if (requirements && i == 0) {
                if (!requirements.isCompleted()) {
                    nextEntity = data[entityName]
                    break
                }
            }

            var nextIndex = i + 1
            if (nextIndex >= category.length) {break}
            var nextEntityName = category[nextIndex]
            nextEntityRequirements = gameData.requirements[nextEntityName]

            if (!nextEntityRequirements.isCompleted()) {
                nextEntity = data[nextEntityName]
                break
            }       
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hidden")           
        } else {
            requiredRow.classList.remove("hidden")
            var requirementObject = gameData.requirements[nextEntity.name]
            var requirements = requirementObject.requirements

            var coinElement = requiredRow.getElementsByClassName("coins")[0]
            var levelElement = requiredRow.getElementsByClassName("levels")[0]
            var evilElement = requiredRow.getElementsByClassName("evil")[0]

            coinElement.classList.add("hidden")
            levelElement.classList.add("hidden")
            evilElement.classList.add("hidden")

            var finalText = ""
			var	text=""
			for (requirement of requirements) {
				if("task" in requirement){
					var task = gameData.taskData[requirement.task]
					if (task.level >= requirement.requirement) continue
					var text = " " + requirement.task + " level " + format(task.level) + "/" + format(requirement.requirement) + ","
				}
				if("money" in requirement){
					var text = " $" + format(gameData.money,2) + "/" + format(requirement.money,2) + ","
					
				}
				finalText += text
			}
			finalText = finalText.substring(0, finalText.length - 1)
			levelElement.textContent = finalText
			levelElement.classList.remove("hidden")

        }   
    }
}
//updateRequiredRows(gameData.taskData, jobCategories)

function createAllRows(categoryType, tableId) {
	if(categoryType == itemCategories)
		var templates = {
				headerRow: document.getElementsByClassName("ItemTemplate" )[0],
				row: document.getElementsByClassName("rowItemTemplate" )[0]
			}
	else
		if(categoryType == statCategories)
			var templates = {
				headerRow: document.getElementsByClassName("headerRowStatTemplate")[0],
				row: document.getElementsByClassName("rowStatTemplate")[0]
			}
		else
			var templates = {
				headerRow: document.getElementsByClassName("headerRowTaskTemplate")[0],
				row: document.getElementsByClassName("rowTaskTemplate")[0]
			}
    

    var table = document.getElementById(tableId)

    for (categoryName in categoryType) {
        var headerRow = createHeaderRow(templates, categoryType, categoryName)
        table.appendChild(headerRow)
		/*
		if(categoryType != statCategories){
			var maxLevel = headerRow.getElementsByClassName("maxLevel")[0]
			gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")
        }
			*/
        var category = categoryType[categoryName]
        category.forEach(function(name) {
            var row = createRow(templates, name, categoryName, categoryType)
            table.appendChild(row)       
        })

		if(categoryType != statCategories){
			var requiredRow = createRequiredRow(categoryName)
			table.append(requiredRow)
		}
    }
}
function headerClick(name){
//	console.log(name)
	hidden = !document.getElementById("header "+name).textContent.includes("-")
	if (name in jobCategories)
		jobCategories[name].forEach(function(item,index){
			document.getElementById("row "+item).style.display= hidden ? "" : "none" 
		})
	if (name in skillCategories)
		skillCategories[name].forEach(function(item,index){
			document.getElementById("row "+item).style.display= hidden ? "" : "none" 
		})
	
	document.getElementById(name).style.display = hidden ? "" : "none" 
	document.getElementById("header "+name).children[0].textContent = hidden ? "-"+name : "+"+name 
	
}

function createHeaderRow(templates, categoryType, categoryName) {
    var headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
    headerRow.getElementsByClassName("category")[0].textContent = "-"+categoryName
	
	headerRow.onclick = function(){ headerClick(categoryName)}
	headerRow.id = "header "+categoryName  
    if ((categoryType != itemCategories) && (categoryType != statCategories)) {
        headerRow.getElementsByClassName("valueType")[0].textContent = categoryType == jobCategories ? "Income/day" : "Effect"
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    //headerRow.style.color = "#ffffff"
    headerRow.classList.add(removeSpaces(categoryName))
    headerRow.classList.add("headerRow")
    
    return headerRow
}

function removeSpaces(string) {
    var string = string.replace(/ /g, "")
    return string
}


function createRow(templates, name, categoryName, categoryType) {
    var row = templates.row.content.firstElementChild.cloneNode(true)
    row.getElementsByClassName("name")[0].textContent = name
    row.getElementsByClassName("tooltipText")[0].textContent = tooltips[name]
    row.id = "row " + name
    if ((categoryType != itemCategories) && (categoryType != statCategories)) {
        row.getElementsByClassName("progressBar")[0].onclick = function() {setTask(name)}
    } 
	if (categoryType == itemCategories) 
        row.getElementsByClassName("button")[0].onclick = categoryName == "Properties" ? function() {setProperty(name)} : function() {setMisc(name)}
    

    return row
}

function createRequiredRow(categoryName) {
    var requiredRow = document.getElementsByClassName("requiredRowTemplate")[0].content.firstElementChild.cloneNode(true)
    requiredRow.classList.add("requiredRow")
    requiredRow.classList.add(removeSpaces(categoryName))
    requiredRow.id = categoryName
    return requiredRow

}


// function to set a given theme/color-scheme
function setTheme(themeName) {
	localStorage.setItem('theme', themeName);
	document.documentElement.className = themeName;
}

// function to toggle between light and dark theme
function toggleTheme() {
	if (localStorage.getItem('theme') === 'theme-dark') {
		setTheme('theme-light');
	} else {
		setTheme('theme-dark');
	}
}

// Immediately invoked function to set the theme on initial load
(function () {
	if (localStorage.getItem('theme') === 'theme-light') {
		setTheme('theme-light');
		document.getElementById('slider').checked = true;
	} else {
		setTheme('theme-dark');
	  document.getElementById('slider').checked = false;
	}
})();


