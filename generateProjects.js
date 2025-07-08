const fs = require("fs");
const path = require("path");

const imgBase = path.join(__dirname, "proyectos");
const htmlBase = __dirname;
const output = [];

function isImage(file) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
}

function getFileNameWithoutExtension(file) {
  return path.parse(file).name;
}

fs.readdirSync(imgBase).forEach((folder) => {
  const folderPath = path.join(imgBase, folder);
  if (fs.statSync(folderPath).isDirectory()) {
    const files = fs.readdirSync(folderPath);
    const htmlFileName = `${folder}.html`;
    const htmlPath = path.join(htmlBase, htmlFileName);
    const htmlExists = fs.existsSync(htmlPath);

    files.forEach((file) => {
      if (
        isImage(file) &&
        getFileNameWithoutExtension(file) === "1"
      ) {
        output.push({
          url: htmlExists ? htmlFileName : "#",
          img: `proyectos/${folder}/${file}`
        });
      }
    });
  }
});

fs.writeFileSync("projects.json", JSON.stringify(output, null, 2));
console.log(`✅ Archivo projects.json generado con ${output.length} imágenes '1.*'.`);
