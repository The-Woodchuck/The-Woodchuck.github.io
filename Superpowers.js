
class SuperPower{
    constructor(name, target, level=0, maxLevel = 0, description=""){
        this.name = name
        this.level = level
        this.maxLevel = maxLevel
        this.target = target
        this.description = description
        this.xp = 0
    }
    getMaxXp(){
        var maxXp = Math.round(100 * (this.level + 1) * Math.pow(1.01, this.level))
        return maxXp

    }
    AbsorbPower(levels=1){
        this.xp += levels * 100 * (1 + this.maxLevel / 10)
        if (this.xp >= this.getMaxXp()) {
            var excess = this.xp - this.getMaxXp()
            while (excess >= 0) {
                this.level += 1
                excess -= this.getMaxXp()
            }
            this.xp = this.getMaxXp() + excess
      }
    }

    getEffect(){
        return 1 + this.level*0.02
    }

    onAttack(owner, target){
        if(this.name == "HP Steal")
            return
    }
}

const superpowers = {
    "Super strength":       new SuperPower("Super strength","Strength",1),
    "Rage":                 new SuperPower("Rage","rage",1),
    "Super intelligence":   new SuperPower("Super intelligence","Intelligence",1),
    "Super endurance":      new SuperPower("Super endurance","Endurance",1),
    "Rich":                 new SuperPower("Rich","Income",1),
    "Vampiric":             new SuperPower("Vampiric","HP Steal",1)
}

function loadSuperPowers(){
    for(sp in superpowers)
    if(!(sp in gameData.superpowers))
        gameData.superpowers[sp] = CreateSuperPower(sp, 0)

}

function CreateSuperPower(name, level = 1 ){
    var sourcePower = superpowers[name]
    return new SuperPower(sourcePower.name, sourcePower.target, level, 0, sourcePower.description)
}

function GetSuperPowers(number, level){
   var result = {}
   var powernames = Object.keys(superpowers)
   
    for(i=1;i<=number;i++){
        var newPower=superpowers[powernames[RandomInt(0,powernames.length-1)]]
        if (!(newPower.name in result))
            result[newPower.name]=newPower
        else
        result[newPower.name].level+=level
    }
    return result

}

function AbsorbPower(Power){
    return new SuperPower(Power.name,Power.target,1, Power.description)
}


Villains ={
    1:  [
                {
                    name: "Countess Christine Cruz Childers",
                    tier: 1,
                    XPBonus: 2,
                    powers: ["Rich"],
                    backstory:"Being rich is a superpower my dear."
                },
                {
                    name: "Professor Pardeep Posey",
                    tier: 1,
                    XPBonus: 1,
                    powers: ["Super intelligence"],
                    backstory:"After being kicked out by the ethics committee, Professor Posey is no longer constrained by silly things like ethics standing in the way of his research. Like if he wants to mix the DNA of a shark with that of bunnies, to get landsharks that breeds at an uncontrollable rate - he now does it."
                },
                {
                    name: "Little Lou",
                    tier: 1,
                    XPBonus: 1,
                    powers: ["Super strength"],
                    backstory:"The is nothing little about Little Lou. This monster is incredibly strong and likes to prove it."
                },
            ],

    2:  [
                {
                    name: "Big Bob",
                    tier: 2,
                    XPBonus: 1,
                    powers: ["Super strength", "Rage"],
                    backstory: "Little Lou's big brother. Bigger & stronger."
                },
                {
                    name: "Count Dracula",
                    tier: 2,
                    XPBonus: 1,
                    powers: ["Super strength", "Vampire"],
                    backstory: "Little Lou's big brother. Bigger & stronger."
                }
            ]
        }
