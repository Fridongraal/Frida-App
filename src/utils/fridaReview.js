function clampEaseFactor(value) {
  const next = Number.isFinite(value) ? value : 2.5;
  return Math.max(1.3, parseFloat(next.toFixed(2)));
}

function normalizeAlgorithm(algorithm = {}) {
  return {
    interval: Number.isFinite(algorithm.interval) ? algorithm.interval : 1,
    easeFactor: clampEaseFactor(algorithm.easeFactor),
    repetitions: Number.isFinite(algorithm.repetitions) ? algorithm.repetitions : 0,
  };
}

function nextReviewDateFromDays(days) {
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + days);
  nextReviewDate.setHours(0, 0, 0, 0);
  return nextReviewDate.toISOString();
}

function formatDaysLabel(days) {
  return `${days}d`;
}

export function getStudyCardState(card, sessionState = {}) {
  const algorithm = normalizeAlgorithm(card?.algorithm);
  return {
    algorithm,
    awaitingGraduation: Boolean(sessionState.awaitingGraduation),
  };
}

export function getStudyActionPreview(card, action, sessionState = {}) {
  const { algorithm, awaitingGraduation } = getStudyCardState(card, sessionState);

  if (action === 1) {
    return { label: '<1m' };
  }

  if (action === 2) {
    if (algorithm.repetitions === 0 && !awaitingGraduation) {
      return { label: '<10m' };
    }

    if (algorithm.repetitions === 0 && awaitingGraduation) {
      return { label: formatDaysLabel(1) };
    }

    if (algorithm.repetitions === 1) {
      return { label: formatDaysLabel(6) };
    }

    const interval = Math.max(1, Math.round(algorithm.interval * algorithm.easeFactor));
    return { label: formatDaysLabel(interval) };
  }

  if (action === 3) {
    if (algorithm.repetitions === 0 || awaitingGraduation) {
      return { label: formatDaysLabel(5) };
    }

    const easeFactor = clampEaseFactor(algorithm.easeFactor + 0.15);
    const interval = Math.max(1, Math.round(algorithm.interval * easeFactor * 1.3));
    return { label: formatDaysLabel(interval) };
  }

  return { label: '' };
}

export function applyStudyAction(card, action, sessionState = {}) {
  const { algorithm, awaitingGraduation } = getStudyCardState(card, sessionState);

  if (action === 1) {
    const nextAlgorithm = {
      ...algorithm,
      interval: 0,
      easeFactor: clampEaseFactor(algorithm.easeFactor - 0.2),
      repetitions: 0,
    };

    return {
      sessionAlgorithm: nextAlgorithm,
      awaitingGraduation: false,
      persistAlgorithm: null,
      requeueMode: 'short',
    };
  }

  if (action === 2) {
    if (algorithm.repetitions === 0 && !awaitingGraduation) {
      return {
        sessionAlgorithm: algorithm,
        awaitingGraduation: true,
        persistAlgorithm: null,
        requeueMode: 'end',
      };
    }

    let interval = 1;
    if (algorithm.repetitions === 0) {
      interval = 1;
    } else if (algorithm.repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.max(1, Math.round(algorithm.interval * algorithm.easeFactor));
    }

    const nextAlgorithm = {
      ...algorithm,
      interval,
      repetitions: algorithm.repetitions + 1,
      nextReviewDate: nextReviewDateFromDays(interval),
    };

    return {
      sessionAlgorithm: nextAlgorithm,
      awaitingGraduation: false,
      persistAlgorithm: nextAlgorithm,
      requeueMode: 'none',
    };
  }

  if (action === 3) {
    const easeFactor = clampEaseFactor(algorithm.easeFactor + 0.15);
    const isFreshCard = algorithm.repetitions === 0 || awaitingGraduation;
    const interval = isFreshCard
      ? 5
      : Math.max(1, Math.round(algorithm.interval * easeFactor * 1.3));

    const nextAlgorithm = {
      ...algorithm,
      interval,
      easeFactor,
      repetitions: isFreshCard ? 1 : algorithm.repetitions + 1,
      nextReviewDate: nextReviewDateFromDays(interval),
    };

    return {
      sessionAlgorithm: nextAlgorithm,
      awaitingGraduation: false,
      persistAlgorithm: nextAlgorithm,
      requeueMode: 'none',
    };
  }

  return {
    sessionAlgorithm: algorithm,
    awaitingGraduation,
    persistAlgorithm: null,
    requeueMode: 'none',
  };
}
