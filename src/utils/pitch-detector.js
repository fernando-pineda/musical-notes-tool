/**
 * Implementación optimizada del algoritmo YIN para detección de tono
 * Basado en "YIN, a fundamental frequency estimator for speech and music"
 * por Alain de Cheveigné y Hideki Kawahara
 */
class PitchDetector {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate;
    this.threshold = 0.15; // Umbral para determinar confianza en la detección
    this.bufferSize = 2048; // Tamaño del buffer para calcular
    this.probabilityThreshold = 0.9; // Probabilidad mínima para aceptar un tono
  }

  /**
   * Detecta el tono fundamental de un buffer de audio
   * @param {Float32Array} buffer - Buffer de audio
   * @returns {number} - Frecuencia detectada en Hz, o -1 si no se detecta
   */
  getPitch(buffer) {
    // Paso 1: Calcular la función de diferencia
    const yinBuffer = new Float32Array(this.bufferSize / 2);

    // Calcular la función de diferencia usando autocorrelación normalizada
    this.difference(buffer, yinBuffer);

    // Paso 2: Normalización cumulativa
    this.cumulativeMeanNormalizedDifference(yinBuffer);

    // Paso 3: Buscar el primer mínimo local bajo el umbral
    let tauEstimate = this.absoluteThreshold(yinBuffer);

    // Si no se encuentra ningún tono confiable, devolver -1
    if (tauEstimate === -1) {
      return -1;
    }

    // Paso 4: Interpolación parabólica para mejorar precisión
    let betterTau = this.parabolicInterpolation(yinBuffer, tauEstimate);

    // Convertir tau (periodo) a frecuencia en Hz
    return this.sampleRate / betterTau;
  }

  /**
   * Calcular la función de diferencia
   * @param {Float32Array} buffer - Buffer de audio
   * @param {Float32Array} yinBuffer - Buffer para resultados
   */
  difference(buffer, yinBuffer) {
    const halfLength = yinBuffer.length;

    for (let tau = 0; tau < halfLength; tau++) {
      yinBuffer[tau] = 0;

      for (let i = 0; i < halfLength; i++) {
        const delta = buffer[i] - buffer[i + tau];
        yinBuffer[tau] += delta * delta;
      }
    }
  }

  /**
   * Normalización cumulativa
   * @param {Float32Array} yinBuffer - Buffer de la función de diferencia
   */
  cumulativeMeanNormalizedDifference(yinBuffer) {
    yinBuffer[0] = 1;
    let runningSum = 0;

    for (let tau = 1; tau < yinBuffer.length; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / runningSum;
    }
  }

  /**
   * Busca el primer valor bajo el umbral
   * @param {Float32Array} yinBuffer - Buffer normalizado
   * @returns {number} - Índice del primer valor bajo el umbral o -1
   */
  absoluteThreshold(yinBuffer) {
    // Ignorar los primeros valores (suelen tener artefactos)
    const minTau = 16;
    const maxTau = yinBuffer.length - 1;

    let minValue = 1;
    let minTauPosition = -1;

    // Primero encontramos el mínimo global
    for (let tau = minTau; tau < maxTau; tau++) {
      if (yinBuffer[tau] < minValue) {
        minValue = yinBuffer[tau];
        minTauPosition = tau;
      }
    }

    // Si el mínimo global es aceptable, lo usamos
    if (minValue < this.threshold) {
      let startPoint = minTauPosition;
      while (
        startPoint > minTau &&
        yinBuffer[startPoint - 1] < yinBuffer[startPoint]
      ) {
        startPoint--;
      }

      // Ahora buscamos el primer mínimo local en la misma región
      for (let tau = startPoint; tau <= minTauPosition; tau++) {
        if (yinBuffer[tau] < this.threshold) {
          return tau;
        }
      }

      // Si no encontramos nada mejor, usamos el mínimo global
      return minTauPosition;
    }

    return -1; // No encontramos nada bajo el umbral
  }

  /**
   * Interpolación parabólica para refinar el tono
   * @param {Float32Array} yinBuffer - Buffer normalizado
   * @param {number} tauEstimate - Estimación inicial de tau
   * @returns {number} - Valor refinado de tau
   */
  parabolicInterpolation(yinBuffer, tauEstimate) {
    // Borde del array
    if (tauEstimate < 1) {
      return tauEstimate;
    }
    if (tauEstimate >= yinBuffer.length - 1) {
      return tauEstimate;
    }

    const s0 = yinBuffer[tauEstimate - 1];
    const s1 = yinBuffer[tauEstimate];
    const s2 = yinBuffer[tauEstimate + 1];

    // Calcular ajuste parabólico usando los tres puntos
    const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));

    // Asegurar que el ajuste es razonable
    if (Math.abs(adjustment) > 1) {
      return tauEstimate;
    }

    return tauEstimate + adjustment;
  }

  /**
   * Filtrado de umbral adaptativo para mejorar la detección
   * @param {Float32Array} yinBuffer - Buffer normalizado
   * @param {number} tauEstimate - Estimación inicial de tau
   * @returns {number} - Probabilidad de que el tono sea correcto (0-1)
   */
  getProbability(yinBuffer, tauEstimate) {
    if (tauEstimate === -1) {
      return 0;
    }

    // La probabilidad es inversamente proporcional al valor de YIN
    // Un valor bajo de YIN significa alta probabilidad
    return 1 - yinBuffer[tauEstimate];
  }
}

export { PitchDetector };
