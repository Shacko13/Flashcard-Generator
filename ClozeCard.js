// require fs
var fs = require("fs");

// scope safe cloze card constructor function
function ClozeCard(clozeFront, clozeBack) {
    if (this instanceof ClozeCard) {
        this.clozeFront = clozeFront;
        this.clozeBack = clozeBack;
    } else {
        return new ClozeCard(clozeFront, clozeBack);
    }
};

//clozeCard method for getting the cloze flashcard
ClozeCard.prototype.getPartial = function() {
    console.log(`Your formatted ClozeCard is:\n\n   ${partialString}\n`);
}

module.exports = ClozeCard;
