import Papa from 'papaparse';

/**
 * Parsea un archivo CSV en filas crudas (array de arrays).
 * @param {File} file - El archivo a parsear.
 * @returns {Promise<string[][]>}
 */
export function parseCSVToRawRows(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('El archivo CSV está vacío o no es válido.'));
          return;
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Mapea las filas crudas a objetos de tarjeta según las columnas seleccionadas.
 * @param {string[][]} rows - Las filas obtenidas del CSV.
 * @param {object} config - Configuración del mapeo.
 * @param {number} config.frontColIndex - Índice de la columna para la pregunta (frente).
 * @param {number} config.backColIndex - Índice de la columna para la respuesta (reverso).
 * @param {boolean} config.hasHeaders - Si la primera fila son cabeceras.
 * @returns {Array<{front: string, back: string}>}
 */
export function mapRowsToCards(rows, { frontColIndex, backColIndex, hasHeaders }) {
  const dataRows = hasHeaders ? rows.slice(1) : rows;
  const cards = [];

  for (const row of dataRows) {
    const front = row[frontColIndex]?.trim();
    const back = row[backColIndex]?.trim();

    // Validación: Ignorar filas vacías o aquellas que no contengan datos en ambas columnas
    if (front && back) {
      cards.push({
        front,
        back
      });
    }
  }

  return cards;
}
