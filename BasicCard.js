// require fs
var fs = require("fs");


// scope safe basic card constructor function
function BasicCard(basicFront, basicBack) {
    if (this instanceof BasicCard) {
        this.basicFront = basicFront;
        this.basicBack = basicBack;
    } else {
        return new BasicCard(basicFront, basicBack);
    }
};

module.exports = BasicCard;
