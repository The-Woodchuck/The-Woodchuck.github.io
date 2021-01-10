

function GetSuperPowers(number, level){
    const superpowers = [
        new SuperPower("Super strength","Strength",level),
        new SuperPower("Super intelligence","Intelligence",level)
    ]
    var result = {}
    for(i=1;i<=number;i++){
        var newPower=superpowers[RandomInt(0,superpowers.length-1)]
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
