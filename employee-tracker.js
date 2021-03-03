const cTable = require("console.table");
const figlet = require("figlet");

const connection = require("./src/connection.js");
const runPrompt = require("./src/runPrompt");

const welcome = () => {
  console.log("Welcome to Employee Tracker\nPlease follow the prompts!");
};

figlet.text(
  "Employee Tracker",
  {
    font: "isometric3",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 200,
    whitespaceBreak: true,
  },
  function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.clear();
    console.log(data);
  }
);

connection.connect((err) => {
  if (err) throw err;
  welcome();
  runPrompt();
});
