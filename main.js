var inquirer = require('inquirer');
var fs = require('fs');
var BasicCard = require('./BasicCard.js');
var ClozeCard = require('./ClozeCard.js');


//----------global variables----------//
var questionBankArray = []; // will hold the array of generated flashcards if user selects "quiz"
var randomNum = 0;
var n = 0; // will hold the questionBankArray length
var typeofCard = ""; // either cloze or basic
var quizDisplayCount = 0;
var partialString = "";
var textString = "";
var newBasicCard; // variable for storing the new BasicCard object
var newClozeCard; // variable for storing the new ClozeCard object
var validate;
var lazinessCheatCount = 0;

// starting function executed upon program load
// gives the user a list of four choices, and executes functions accordingly
var start = function() {
    inquirer.prompt([{
        name: "card",
        type: "list",
        message: "What would you like to do?\n",
        choices: ["Make a basic flashcard", "Make a cloze flashcard", "Quizme", "I don't want to learn"]
    }]).then(function(answer) {

        switch (answer.card) {
            case "Make a basic flashcard":
                makeBlankCard();
                break;

            case "Make a cloze flashcard":
                makeClozeCard();
                break;

            case "Quizme":
                quizMe();
                break;

            case "I don't want to learn":
                lazy();
                break;

        }
    });
}
start();

// inquirer prompts for making the blank cards
function makeBlankCard() {
    inquirer.prompt([{
            name: "blankquestion",
            type: "input",
            message: "Type a question"

        }, {
            name: "blankanswer",
            type: "input",
            message: "Type in an answer to your question"

        }, {
            name: "confirmation",
            type: "confirm",
            message: "Would you like to add another flashcard?"
        }


    ]).then(function(answer) {
        // gathers user input and creates a new BasicCard object and stores it in newBasicCard

        newBasicCard = BasicCard(answer.blankquestion, answer.blankanswer);

        // uses the JSON.stringify function to format our object and append it to the file
        // semicolon separates each successive object appended
        fs.appendFile("basicbank.txt", ';' + JSON.stringify(newBasicCard), function(err) {

            // If the code experiences any errors it will log the error to the console.
            if (err) {
                return console.log(err);
            }
        });

        // if user wanted to make another basic card, it recursively calls itself
        if (answer.confirmation) {
            makeBlankCard()
        } else {
            return;
        }

    });
}

function makeClozeCard() {
    inquirer.prompt([{
            name: "fulltext",
            type: "input",
            message: "Type in a staetment"

        }, {
            name: "cloze",
            type: "input",
            message: "Type in the cloze"

        }, {
            name: "confirmation",
            type: "confirm",
            message: "Would you like to add another flash card?"
        }


    ]).then(function(answer) {

        newClozeCard = ClozeCard(answer.fulltext, answer.cloze);
        validate = answer.confirmation;
        // uses the JSON.stringify function to format our object and append it to the file
        // semicolon separates each successive object appended
        fs.appendFile("clozebank.txt", ';' + JSON.stringify(newClozeCard), function(err) {

            // If the code experiences any errors during the append process it will log the error to the console.
            if (err) {
                return console.log(err);
            }
        });
        validCloze();
    });
}

// validates whether the user correctly inputed the cloze card
function validCloze() {

    textString = newClozeCard.clozeFront;
    var bool = textString.includes(newClozeCard.clozeBack); // see if the question contains the cloze statement  (returns true or false)
    partialString = textString.replace(newClozeCard.clozeBack, "__________"); // stores formatted flashcard which is used if the getPartial function is called

    // if the user inputs an invalid cloze statement, they are prompted to retry
    if (bool === false) {
        console.log("\n\nERROR!!! Somewhere in your question you must have your cloze word");
        console.log(`Example:  
        	?Type in a statement:      George Washington was the first president of the United States 
        	?Type in the cloze:       George Washington\n 
--------------------------------------------------------------------------------------------\n\nTRY AGAIN!!!!\n `);
        makeClozeCard();
    }

    // if user flashcard is valid and they want to create another one
    if (validate && bool === true) {
        console.log("\nYou successfully created a cloze flashcard!");

        newClozeCard.getPartial(); // displays the users generated clozeCard and recalls the makeClozeCard function
        makeClozeCard();
    }

    // if user flashcard is valid and they do not want to create another one
    if (!validate && bool === true) {
        console.log("\nYou successfully created a cloze flashcard!");
        newClozeCard.getPartial(); // displays the users generated clozeCard 
    }


}

// if the user doesn't want to learn; they will be reprompted anyway unless they select it 3 times
function lazy() {
    if (lazinessCheatCount < 1) {
        console.log("Are you sure? You could probably use some learning.");
        console.log("---------------\n");
        lazinessCheatCount++;
        setTimeout(start, 1000);
    } else {
        console.log("Wow, dude! You want to stay a dummy? Ok, then.  Later, dude!\n");
        return;
    }
}

// if user selects quiz, then they get to choose from which cardset
function quizMe() {
    inquirer.prompt([{
            name: "cardtype",
            type: "list",
            message: "Which cardset would you like to review?",
            choices: ["cloze", "basic"]
        }

    ]).then(function(answer) {

        if (answer.cardtype === "cloze") {
            readBank("clozebank.txt", "cloze");
        } else {
            readBank("basicbank.txt", "basic");
        }

    });
}

// uses filename and flashcard type as parameters to read the correct file 
function readBank(fileName, type) {
    typeofCard = type;
    console.log("type of card is: " + typeofCard);

    // reads and parses the elements of the file and pushes each element into the questionBankArray
    fs.readFile(fileName, "utf8", function(error, data) {

        var split = data.split(";");
        for (var i = 0; i < split.length; i++) {
            var parsed = JSON.parse(split[i]);
            questionBankArray.push(parsed);

        }

        shuffleBank();
    });


}

// shuffles the questionBankArray and initiates the respective function
function shuffleBank() {
    n = questionBankArray.length;
    for (var i = 0; i < n; i++) {
        var randomNum = Math.floor(Math.random() * n);
        var temp = questionBankArray[i];
        questionBankArray[i] = questionBankArray[randomNum];
        questionBankArray[randomNum] = temp;
    }

    quizDisplayCount = questionBankArray.length;
    if (typeofCard === "cloze") {
        displayClozeCard();
    } else {
        displayBlankCard();
    }


}

function displayBlankCard() {

    var element = questionBankArray.pop(); // pops out the last element of the questionBankArray and quizzes the user
    inquirer.prompt([{
            name: "question",
            type: "input",
            message: element.basicFront
        }

    ]).then(function(answer) {

        if (answer.question === element.basicBack) {
            console.log("That's right!");
        } else {
            console.log("\nWRONG!\n");
        }
        quizDisplayCount--;
        // at the end of the quiz the user has the choice to take another quiz
        if (quizDisplayCount === 0) {

            inquirer.prompt([{
                    name: "confirmquiz",
                    type: "confirm",
                    message: "Would you like to quiz yourself again?\n"
                }

            ]).then(function(answer) {
                if (answer.confirmquiz) {
                    quizMe();
                } else {
                    console.log("Thanks for studying!!");
                    return;
                }

            });
        } else {
            displayBlankCard(); // this function will keep getting called until there are no questions left in the array (i.e. all elements have been popped out)
        }
    });
}

// similar logic as the displayBlankCard function
function displayClozeCard() {

    var element = questionBankArray.pop();
    var temp = element.clozeBack;
    textString = element.clozeFront;

    partialString = textString.replace(temp, "__________");

    inquirer.prompt([{
            name: "question",
            type: "input",
            message: partialString + "\n ANSWER: "
        }

    ]).then(function(answer) {

        if (answer.question === temp) {
            console.log("That's right!");
        } else {
            console.log("\nWRONG!\n");
        }
        quizDisplayCount--;

        if (quizDisplayCount === 0) {
            inquirer.prompt([{
                name: "confirmquiz",
                type: "confirm",
                message: "Would you like to quiz yourself again?\n"
            }]).then(function(answer) {
                if (answer.confirmquiz) {
                    quizMe();
                } else {
                    console.log("Thanks for studying!!");
                    return;
                }
            });
        } else {
            displayClozeCard();
        }
    });
}