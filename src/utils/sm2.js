/**
 * Lógica del algoritmo SuperMemo 2 (SM-2) Simplificado.
 * 
 * @param {number} quality - Calificación de la respuesta:
 *                           1 = Difícil (reinicia repeticiones, intervalo de 1 día, disminuye facilidad)
 *                           2 = Bien (suma repeticiones, escala el intervalo, mantiene facilidad estable)
 *                           3 = Fácil (suma repeticiones, escala el intervalo con bonus, sube facilidad)
 * @param {number} prevInterval - Intervalo previo en días.
 * @param {number} prevEaseFactor - Factor de facilidad previo (por defecto es 2.5).
 * @param {number} prevRepetitions - Número de repeticiones consecutivas exitosas previas.
 * 
 * @returns {object} Un objeto con los nuevos parámetros de repetición:
 *                   { interval, easeFactor, repetitions, nextReviewDate }
 */
export function calculateSM2(quality, prevInterval, prevEaseFactor = 2.5, prevRepetitions = 0) {
  let interval = 1;
  let easeFactor = prevEaseFactor;
  let repetitions = prevRepetitions;

  // Traducimos los 3 botones a la escala estándar SM-2 (de 0 a 5)
  // 1: Difícil (mapeado a 2 en la escala SM-2: respuesta incorrecta / apenas recordada)
  // 2: Bien    (mapeado a 4 en la escala SM-2: respuesta correcta con vacilación)
  // 3: Fácil   (mapeado a 5 en la escala SM-2: respuesta perfecta sin vacilación)
  let q = 4;
  if (quality === 1) {
    q = 2;
  } else if (quality === 2) {
    q = 4;
  } else if (quality === 3) {
    q = 5;
  }

  // 1. Calcular el nuevo Factor de Facilidad (Ease Factor - EF)
  // Fórmula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // El Factor de Facilidad nunca debe ser menor a 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // 2. Determinar el intervalo de días y el contador de repeticiones
  if (q >= 3) {
    // Si la respuesta fue Bien (4) o Fácil (5)
    if (repetitions === 0) {
      interval = 1; // 1 día
    } else if (repetitions === 1) {
      interval = 4; // 4 días (reducido de 6 para un flujo más activo en MVP)
    } else {
      interval = Math.round(prevInterval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Si la respuesta fue Difícil (2)
    repetitions = 0;
    interval = 1; // Volver a repasar al día siguiente (o pronto)
  }

  // 3. Establecer la fecha de la próxima revisión
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  // Limpiamos las horas para evaluar por días calendarios completos
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    interval,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    repetitions,
    nextReviewDate: nextReviewDate.toISOString()
  };
}
