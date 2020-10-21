const surveyAnswers = data

console.log(surveyAnswers[0].beroepMoeder)

let kolomNaam = "schoenmaat"
let lijstAntwoorden = getAnswersForQuestion(surveyAnswers, kolomNaam)

function getAnswersForQuestion(answers, question) {

    if (answers.length < 1) {
        console.error("Your array has no items in it :(")
        return
    }

    return answers.map(answer => answer[question])

    // let answersForQuestion = []
    // for (answer of answers){
    //     answersForQuestion.push(answer[question])
    // }
    // return answersForQuestion
}

console.log(lijstAntwoorden)