const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

function fixHtmlPaths() {
  const htmlFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.html'));
  
  htmlFiles.forEach(file => {
    const filePath = path.join(outDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Заменяем абсолютные пути на относительные
    content = content.replace(/href="\/_next\//g, 'href="./_next/');
    content = content.replace(/src="\/_next\//g, 'src="./_next/');
    content = content.replace(/href="\/static\//g, 'href="./static/');
    content = content.replace(/src="\/static\//g, 'src="./static/');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed paths in ${file}`);
  });
}

function fixCssPaths() {
  const cssDir = path.join(outDir, '_next', 'static', 'css');
  if (!fs.existsSync(cssDir)) return;
  
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  
  cssFiles.forEach(file => {
    const filePath = path.join(cssDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/url\(\//g, 'url(./');
    content = content.replace(/url\("\/\//g, 'url("./');
    content = content.replace(/url\('\/\//g, 'url(\'./');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed CSS paths in ${file}`);
  });
}

// Запуск
fixHtmlPaths();
fixCssPaths();
console.log('🎉 All paths fixed for GitHub Pages!');
