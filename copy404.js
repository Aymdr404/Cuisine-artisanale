// copy404.js
import fs from "fs";
import path from "path";

// Liste des dossiers possibles (Vite / CRA)
const possibleDirs = ["dist", "build"];

// Trouver le dossier existant
const distDir = possibleDirs
  .map((dir) => path.join(process.cwd(), dir))
  .find((dirPath) => fs.existsSync(dirPath));

if (!distDir) {
  console.error("❌ Aucun dossier de build trouvé (dist/ ou build/)");
  process.exit(1);
}

const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");

// Vérifier que index.html existe
if (!fs.existsSync(indexPath)) {
  console.error(`❌ index.html introuvable dans ${distDir}`);
  process.exit(1);
}

// Copier index.html en 404.html
fs.copyFile(indexPath, notFoundPath, (err) => {
  if (err) {
	console.error("❌ Erreur lors de la copie de index.html -> 404.html :", err);
  } else {
	console.log(`✅ 404.html créé avec succès dans ${distDir}`);
  }
});
