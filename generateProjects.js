const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "proyectos"); // Carpeta donde tienes tus carpetas de imágenes
const output = [];

function isImage(file) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(file); // extensiones válidas
}

fs.readdirSync(basePath).forEach((category) => {
  const categoryPath = path.join(basePath, category);
  if (fs.statSync(categoryPath).isDirectory()) {
    console.log(`Leyendo categoría: ${category}`);
    const files = fs.readdirSync(categoryPath);
    files.forEach((file) => {
      if (isImage(file)) {
        const relativePath = `proyectos/${category}/${file}`;
        output.push({
          url: "#",
          img: relativePath
        });
      }
    });
  }
});

const jsonPath = path.join(__dirname, "projects.json");

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
console.log(`✅ Archivo projects.json generado correctamente con ${output.length} imágenes.`);
