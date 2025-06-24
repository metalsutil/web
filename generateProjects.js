const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "proyectos");
const output = [];

function isImage(file) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
}

function getFileNameWithoutExtension(file) {
  return path.parse(file).name;
}

fs.readdirSync(basePath).forEach((category) => {
  const categoryPath = path.join(basePath, category);
  if (fs.statSync(categoryPath).isDirectory()) {
    console.log(`Leyendo categoría: ${category}`);
    const files = fs.readdirSync(categoryPath);
    files.forEach((file) => {
      if (isImage(file) && getFileNameWithoutExtension(file) === "1") {
        output.push({
          url: "#",
          img: `proyectos/${category}/${file}`
        });
      }
    });
  }
});

fs.writeFileSync("projects.json", JSON.stringify(output, null, 2));
console.log(`✅ Archivo projects.json generado correctamente con ${output.length} imágenes nombradas '1'.`);
