class SuperPower{
    constructor(name, target, level=0){
        this.name = name
        this.level = level
        this.target = target
    }
    getEffect(){
        return 1 + this.level*0.02

    }
}

class Task {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.level = 0
        this.maxLevel = 0 
        this.xp = 0

        this.xpMultipliers = [
        ]
    }

    getMaxXp() {
        var maxXp = Math.round(this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level))
        return maxXp
    }

    getXpLeft() {
        return Math.round(this.getMaxXp() - this.xp)
    }

    getMaxLevelMultiplier() {
        var maxLevelMultiplier = 1 + this.maxLevel / 10
        return maxLevelMultiplier
    }

    getXpGain() {
        return applyMultipliers(10, this.xpMultipliers)
    }


    increaseXp(XPGain) {
		if (XPGain === undefined)
			this.xp += applySpeed(this.getXpGain())
		else
			this.xp += applySpeed(XPGain)
        if (this.xp >= this.getMaxXp()) {
            var excess = this.xp - this.getMaxXp()
            while (excess >= 0) {
                this.level += 1
                excess -= this.getMaxXp()
            }
            this.xp = this.getMaxXp() + excess
        }
    }
}

class Job extends Task {
    constructor(baseData) {
        super(baseData)   
        this.incomeMultipliers = [
        ]
    }

    getEffect() {
        if(this.baseData.description == "Good")
            return 0 + this.baseData.effect * this.level
        var effect = 1 + this.baseData.effect * this.level
        return effect
    }

    getLevelMultiplier() {
        var levelMultiplier = 1 + Math.log10(this.level + 1)
        return levelMultiplier
    }
    
    getIncome() {
        return applyMultipliers(this.baseData.income, this.incomeMultipliers) 
    }
}

class Skill extends Task {
    constructor(baseData) {
        super(baseData)
    }

    getEffect() {

		if(this.baseData.effect<0.5)
			var effect = 1 + this.baseData.effect * this.level
		else
			var effect = 0 + this.baseData.effect * this.level
        return effect
    }

    getEffectDescription() {
        var description = this.baseData.description
		if(this.baseData.effect<0.5)
			var text = "x" + String(this.getEffect().toFixed(2)) + " " + description
		else
			var text = "+" + String(this.getEffect().toFixed(2)) + " " + description
        return text
    }
}

class Item {
    constructor(baseData) {  
        this.baseData = baseData
        this.name = baseData.name
        this.expenseMultipliers = [
         
        ]
    }

    getEffect() {
        if (gameData.currentProperty != this && !gameData.currentMisc.includes(this)) return 1
        var effect = this.baseData.effect
        return effect
    }

    getEffectDescription() {
        var description = this.baseData.description
        if (itemCategories["Properties"].includes(this.name)) description = "Happiness"
        var text = "x" + this.baseData.effect.toFixed(1) + " " + description
        return text
    }

    getExpense() {
        return applyMultipliers(this.baseData.expense, this.expenseMultipliers)
    }
}

class Requirement {
    constructor(elements, requirements) {
        this.elements = elements
        this.requirements = requirements
        this.completed = false
    }

    isCompleted() {
        if (this.completed) {return true}
        for (var requirement of this.requirements) {
            if (!this.getCondition(requirement)) {
                return false
            }
        }
        this.completed = true
        return true
    }
}


class TaskRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "task"
    }

    getCondition(requirement) {
		if("task" in requirement)
			return gameData.taskData[requirement.task].level >= requirement.requirement
		//if("stat" in requirement)
		if("money" in requirement)
			return gameData.money >= requirement.money
        if("stat" in requirement)
			return gameData.stats[requirement.stat].value >= requirement.requirement
        if("alignment" in requirement && requirement.requirement >0)
            return gameData.alignment >= requirement.requirement

        if("alignment" in requirement && requirement.requirement <0)
            return gameData.alignment <= requirement.requirement
        return false
			
    }
}

class MoneyRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "money"
    }

    getCondition(requirement) {
        return gameData.money >= requirement.requirement
    }
}
//delete MoneyAndTaskRequirement
class MoneyAndTaskRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "money_and_Tasks"
    }

    getCondition(requirement) {
		if ("money_requirement" in requirement)
			return gameData.money >= requirement.money_requirement
		if ("task" in requirement)
			return gameData.taskData[requirement.task].level >= requirement.requirement
		
    }
}
//new MoneyAndTaskRequirement([getTaskElement("Beach bum")], [{requirement: 10}]) 


class AgeRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "age"
    }

    getCondition(requirement) {
        return daysToYears(gameData.days) >= requirement.requirement
    }
}

class EvilRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "evil"
    }

    getCondition(requirement) {
        return gameData.evil >= requirement.requirement
    }    
}

function getTaskElement(taskName) {
    var task = gameData.taskData[taskName]
    var element = document.getElementById(task.id)
    return element
}

function getItemElement(itemName) {
    var item = gameData.itemData[itemName]
    var element = document.getElementById(item.id)
    return element
}

function getElementsByClass(className) {
    var elements = document.getElementsByClassName(removeSpaces(className))
    return elements
}

