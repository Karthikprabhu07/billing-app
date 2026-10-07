const fs = require('fs');
const p1 = fs.readFileSync('src/part1.js', 'utf8');
const p2 = fs.readFileSync('src/part2.js', 'utf8');
const p3 = fs.readFileSync('src/part3.js', 'utf8');

const finalCode = p1 + '\n' + p2 + '\n' + p3 + '\n';
fs.writeFileSync('src/App.jsx', finalCode);
console.log('App.jsx merged successfully without duplicate exports!');
