class Question {
  constructor(settingLabel, question, optionsLabel, optionsValue) {
    this.settingLabel = settingLabel
    this.question = question
    this.optionsLabel = optionsLabel
    this.optionsValue = optionsValue
  }
}

export const questions = {
  question1: new Question(
    'dateFormat',
    "1) ¿What's the date format do you want to use?",
    ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'],
    ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD']
  ),
  question2: new Question(
    'numTableRows',
    '2) Default number of rows in the table (front...behind)?',
    ['1 ... 1', '3 ... 3', '5 ... 5', '8 ... 8'],
    [1, 3, 5, 8]
  ),
}
