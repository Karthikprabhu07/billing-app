const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\devil\\.gemini\\antigravity\\brain\\2f0f4859-c943-45c6-9cb8-d0ed4f18aca6\\.system_generated\\logs\\overview.txt', 'utf8');

const regex = /<USER_REQUEST>\n([\s\S]*?)\n<\/USER_REQUEST>/g;
let match;
let finalMatch = null;
while ((match = regex.exec(content)) !== null) {
  finalMatch = match[1];
}

if (finalMatch) {
  fs.writeFileSync('src/App.jsx', finalMatch, 'utf8');
  console.log('Successfully wrote to App.jsx');
} else {
  console.log('Could not extract payload');
}
