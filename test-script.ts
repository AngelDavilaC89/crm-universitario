import { googleSheets } from './src/lib/google-sheets';

async function main() {
  try {
    const asesores = await googleSheets.getAsesores();
    console.log("Asesores encontrados:", asesores.length);
    console.log("Muestra completa del primero:", JSON.stringify(asesores[0], null, 2));
    
    const u = asesores.find(a => a.correo === "miguel.davila@softtek.com");
    console.log("Búsqueda específica:", JSON.stringify(u, null, 2));
  } catch(e) {
    console.error(e);
  }
}
main();
