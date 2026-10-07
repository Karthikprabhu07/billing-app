const fs = require('fs');
['src/part2.js', 'src/part3.js'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    content = content.replace(/\\<\/script>/g, '</script>');
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed syntax escapes');
