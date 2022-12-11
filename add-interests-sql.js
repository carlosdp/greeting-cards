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
        const parts = interest.trim().split(' ');
        const emoji = parts[0];
        const name = parts.slice(1).join(' ');

        const label = `${emoji} ${name}`;

        return `insert into interests (label, prompt) values ('${label}', '${name.toLowerCase()}');`;
      })
      .join('\n')
  );
});
