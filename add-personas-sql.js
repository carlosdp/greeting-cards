const readline = require('readline');
// get list of newline items from stdin NodeJS

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const interests = [];

rl.on('line', function (line) {
  interests.push(line);
});

rl.once('close', function () {
  console.log(
    interests
      .map(interest => {
        return `insert into personas (label, prompt) values ('${interest}', '${interest.toLowerCase()}');`;
      })
      .join('\n')
  );
});
