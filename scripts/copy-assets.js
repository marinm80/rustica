import fs from 'fs';
import path from 'path';

const srcDir = '/home/marin/snap/antigravity-cli/2/.gemini/antigravity-cli/brain/b47c60cb-c2a4-4f7d-ba6b-f2a65c2080f8';
const destDir = '/home/marin/projects/rustica';

const mappings = [
  // ── Proyecto estático (src/) ──
  { src: 'hero_restaurante_1780698295880.png', dest: 'src/assets/img/hero/hero-restaurante.jpg' },
  { src: 'lomo_saltado_1780698312473.png', dest: 'src/assets/img/menu/cordero.jpg' },
  { src: 'ceviche_clasico_1780698327954.png', dest: 'src/assets/img/menu/risotto.jpg' },
  { src: 'arepa_reina_1780698346107.png', dest: 'src/assets/img/menu/huerto.jpg' },
  { src: 'tres_leches_1780698362200.png', dest: 'src/assets/img/menu/tarta-manzana.jpg' },
  { src: 'mesa_reservada_1780698383365.png', dest: 'src/assets/img/gallery/mesa-reservada.jpg' },
  { src: 'catering_event_1780698403982.png', dest: 'src/assets/img/gallery/catering-event.jpg' },
  
  // Platos a la galería estática
  { src: 'lomo_saltado_1780698312473.png', dest: 'src/assets/img/gallery/plato-01.jpg' },
  { src: 'ceviche_clasico_1780698327954.png', dest: 'src/assets/img/gallery/plato-02.jpg' },
  { src: 'arepa_reina_1780698346107.png', dest: 'src/assets/img/gallery/plato-03.jpg' },
  { src: 'tres_leches_1780698362200.png', dest: 'src/assets/img/gallery/plato-04.jpg' },

  // ── Tema clásico de WordPress (wp-content/themes/rustica-theme/) ──
  { src: 'hero_restaurante_1780698295880.png', dest: 'wp-content/themes/rustica-theme/assets/img/hero/hero-restaurante.jpg' },
  { src: 'lomo_saltado_1780698312473.png', dest: 'wp-content/themes/rustica-theme/assets/img/menu/cordero.jpg' },
  { src: 'ceviche_clasico_1780698327954.png', dest: 'wp-content/themes/rustica-theme/assets/img/menu/risotto.jpg' },
  { src: 'arepa_reina_1780698346107.png', dest: 'wp-content/themes/rustica-theme/assets/img/menu/huerto.jpg' },
  { src: 'tres_leches_1780698362200.png', dest: 'wp-content/themes/rustica-theme/assets/img/menu/tarta-manzana.jpg' },
  { src: 'mesa_reservada_1780698383365.png', dest: 'wp-content/themes/rustica-theme/assets/img/gallery/mesa-reservada.jpg' },
  { src: 'catering_event_1780698403982.png', dest: 'wp-content/themes/rustica-theme/assets/img/gallery/catering-event.jpg' },

  // Platos a la galería del tema
  { src: 'lomo_saltado_1780698312473.png', dest: 'wp-content/themes/rustica-theme/assets/img/gallery/plato-01.jpg' },
  { src: 'ceviche_clasico_1780698327954.png', dest: 'wp-content/themes/rustica-theme/assets/img/gallery/plato-02.jpg' },
  { src: 'arepa_reina_1780698346107.png', dest: 'wp-content/themes/rustica-theme/assets/img/gallery/plato-03.jpg' },
  { src: 'tres_leches_1780698362200.png', dest: 'wp-content/themes/rustica-theme/assets/img/gallery/plato-04.jpg' }
];

console.log('Copiando imágenes generadas por la IA a las carpetas del proyecto...');

for (const mapping of mappings) {
  const fullSrc = path.join(srcDir, mapping.src);
  const fullDest = path.join(destDir, mapping.dest);
  
  try {
    if (fs.existsSync(fullSrc)) {
      const destFolder = path.dirname(fullDest);
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
      
      fs.copyFileSync(fullSrc, fullDest);
      console.log(`✓ Copiado: ${mapping.src} -> ${mapping.dest}`);
    } else {
      console.warn(`⚠ Archivo origen no encontrado: ${fullSrc}`);
    }
  } catch (error) {
    console.error(`✗ Error al copiar ${mapping.src} a ${mapping.dest}:`, error.message);
  }
}

console.log('Proceso de copia finalizado.');
