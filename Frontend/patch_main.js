import fs from 'fs';
const file = '/home/star/Desktop/Menu-Digital/Frontend/src/main.jsx';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('data-theme')) {
    content = content.replace(
        "createRoot(document.getElementById('root')).render(",
        "document.documentElement.setAttribute('data-theme', 'light');\n\ncreateRoot(document.getElementById('root')).render("
    );
    fs.writeFileSync(file, content);
}
