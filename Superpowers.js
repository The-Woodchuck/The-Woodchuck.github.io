

function GetSuperPowers(number, level){
    const superpowers = [
        new SuperPower("Super strength","Strength",level),
        new SuperPower("Super intelligence","Intelligence",level),
        new SuperPower("Super endurance","Endurance",level),
        new SuperPower("Rich","Income",level)
    ]
    var result = {}
    for(i=1;i<=number;i++){
//        var newPower=superpowers[RandomInt(0,superpowers.length-1)]
        var newPower=superpowers[3]
       // newPower.level = level
        if (!(newPower.name in result))
            result[newPower.name]=newPower
        else
        result[newPower.name].level+=level
    }
    return result

}

function AbsorbPower(Power){
    return new SuperPower(Power.name,Power.target,1)
}


Villains =[
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
        name: "Little Mike",
        tier: 1,
        XPBonus: 1,
        powers: ["Super strength"],
        backstory:"There is nothing little about Little Mike - except the length of his temper. This monster is incredibly strong and likes to prove it."
    },


]