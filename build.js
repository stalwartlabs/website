const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const srcDir = path.join(__dirname, 'html');
const distDir = path.join(__dirname, 'static');

// Ensure the dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// chokidar "**/*.ejs" -c "node ./build.js"
// python3 -m http.server

// Function to compile an EJS file to HTML
function compileFile(file) {
    const filePath = path.join(srcDir, file);
    let outputFilePath;

    if (file === 'index.ejs') {
        outputFilePath = path.join(distDir, 'index.html');
    } else {
        const fileNameWithoutExt = path.basename(file, '.ejs');
        const outputDir = path.join(distDir, fileNameWithoutExt);

        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        outputFilePath = path.join(outputDir, 'index.html');
    }

    ejs.renderFile(filePath, {}, (err, str) => {
        if (err) {
            console.error(`Error compiling ${filePath}:`, err);
            return;
        }
        fs.writeFileSync(outputFilePath, str);
        console.log(`Compiled ${file} to ${outputFilePath}`);
    });
}

// Read all .ejs files from the src directory and compile them
fs.readdirSync(srcDir).forEach(file => {
    // Obtain the file name
    const fileName = path.basename(file);

    if (path.extname(file) === '.ejs' && !fileName.startsWith('include-')) {
        compileFile(file);
    }
});
