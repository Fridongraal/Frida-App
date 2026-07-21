export const ANKI_CONFIG = {
  learningSteps: [1, 10],       // minutos [1m, 10m]
  relearningSteps: [10],        // minutos [10m]
  graduatingInterval: 1,        // días
  easyInterval: 4,              // días
  easyBonus: 1.3,
  hardIntervalFactor: 1.2,
  easeBonusEasy: 150,           // milésimas (+15%)
  easePenaltyAgain: 200,        // milésimas (-20%)
  minimumEase: 1300,            // 130%
  fuzzRange: [0.95, 1.05],
};

export function clampEaseFactor(value) {
  let next = Number.isFinite(value) ? value : 2500;
  if (next < 100) {
    next = Math.round(next * 1000);
  }
  return Math.max(ANKI_CONFIG.minimumEase, Math.round(next));
}

export function normalizeAlgorithm(algorithm = {}) {
  const reps = Number.isFinite(algorithm.repetitions)
    ? algorithm.repetitions
    : Number.isFinite(algorithm.reps)
    ? algorithm.reps
    : 0;

  const interval = Number.isFinite(algorithm.interval) ? algorithm.interval : 0;

  const learningStep = Number.isFinite(algorithm.learningStep)
    ? algorithm.learningStep
    : Number.isFinite(algorithm.learning_step)
    ? algorithm.learning_step
    : 0;

  const lapses = Number.isFinite(algorithm.lapses) ? algorithm.lapses : 0;

  const easeFactor = clampEaseFactor(
    algorithm.easeFactor ?? algorithm.ease_factor ?? 2500
  );

  const due = algorithm.due || algorithm.nextReviewDate || new Date().toISOString();

  let state = algorithm.state;
  if (!state || !['new', 'learning', 'review', 'relearning'].includes(state)) {
    if (reps === 0 && interval === 0 && learningStep === 0) {
      state = 'new';
    } else if (interval < 1) {
      state = 'learning';
    } else {
      state = 'review';
    }
  }

  return {
    state,
    easeFactor,
    interval,
    learningStep,
    lapses,
    repetitions: reps,
    due,
    nextReviewDate: due,
  };
}

export function apply_fuzz(intervalDays) {
  if (!Number.isFinite(intervalDays) || intervalDays < 2) {
    return Math.max(0, Math.round(intervalDays || 0));
  }
  const minFuzz = ANKI_CONFIG.fuzzRange[0];
  const maxFuzz = ANKI_CONFIG.fuzzRange[1];
  const fuzzPercent = minFuzz + Math.random() * (maxFuzz - minFuzz);
  return Math.max(2, Math.round(intervalDays * fuzzPercent));
}

function addMinutes(minutes) {
  const date = new Date(Date.now() + minutes * 60 * 1000);
  return date.toISOString();
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function formatDurationLabel(minutesOrDays, isDays = false) {
  if (isDays) {
    return `${minutesOrDays}d`;
  }
  if (minutesOrDays < 60) {
    return `<${minutesOrDays}m`;
  }
  const hours = Math.round(minutesOrDays / 60);
  return `<${hours}h`;
}

export function getStudyCardState(card, sessionState = {}) {
  const baseAlg = sessionState.workingAlgorithm || card?.algorithm || card;
  const algorithm = normalizeAlgorithm(baseAlg);
  return {
    algorithm,
  };
}

export function getStudyActionPreview(card, action, sessionState = {}) {
  const { algorithm } = getStudyCardState(card, sessionState);
  const state = algorithm.state;

  if (action === 1) { // Again
    if (state === 'new' || state === 'learning') {
      return { label: formatDurationLabel(ANKI_CONFIG.learningSteps[0], false) };
    }
    return { label: formatDurationLabel(ANKI_CONFIG.relearningSteps[0], false) };
  }

  if (action === 2) { // Good
    if (state === 'new' || state === 'learning') {
      const nextStep = algorithm.learningStep + 1;
      if (nextStep < ANKI_CONFIG.learningSteps.length) {
        return { label: formatDurationLabel(ANKI_CONFIG.learningSteps[nextStep], false) };
      }
      return { label: formatDurationLabel(ANKI_CONFIG.graduatingInterval, true) };
    }
    if (state === 'relearning') {
      const nextStep = algorithm.learningStep + 1;
      if (nextStep < ANKI_CONFIG.relearningSteps.length) {
        return { label: formatDurationLabel(ANKI_CONFIG.relearningSteps[nextStep], false) };
      }
      const recoveredInterval = Math.max(1, algorithm.interval || ANKI_CONFIG.graduatingInterval);
      return { label: formatDurationLabel(recoveredInterval, true) };
    }
    const currentInterval = algorithm.interval || 1;
    const calcInterval = Math.max(1, Math.round(currentInterval * (algorithm.easeFactor / 1000)));
    return { label: formatDurationLabel(calcInterval, true) };
  }

  if (action === 3) { // Easy
    if (state === 'new' || state === 'learning') {
      return { label: formatDurationLabel(ANKI_CONFIG.easyInterval, true) };
    }
    if (state === 'relearning') {
      const recoveredInterval = Math.round((algorithm.interval || 1) * ANKI_CONFIG.easyBonus);
      const nextInterval = Math.max(ANKI_CONFIG.easyInterval, recoveredInterval);
      return { label: formatDurationLabel(nextInterval, true) };
    }
    const currentInterval = algorithm.interval || 1;
    const calcInterval = Math.max(
      currentInterval + 1,
      Math.round(currentInterval * (algorithm.easeFactor / 1000) * ANKI_CONFIG.easyBonus)
    );
    return { label: formatDurationLabel(calcInterval, true) };
  }

  return { label: '' };
}

export function applyStudyAction(card, action, sessionState = {}) {
  const { algorithm } = getStudyCardState(card, sessionState);
  const state = algorithm.state;

  if (action === 1) { // Again
    if (state === 'new' || state === 'learning') {
      const due = addMinutes(ANKI_CONFIG.learningSteps[0]);
      const nextAlg = {
        ...algorithm,
        state: 'learning',
        learningStep: 0,
        interval: 0,
        due,
        nextReviewDate: due,
      };
      return {
        sessionAlgorithm: nextAlg,
        persistAlgorithm: nextAlg,
        requeueMode: 'short',
      };
    } else { // review or relearning -> Again
      const lapses = algorithm.lapses + 1;
      const newEase = Math.max(
        ANKI_CONFIG.minimumEase,
        algorithm.easeFactor - ANKI_CONFIG.easePenaltyAgain
      );
      const due = addMinutes(ANKI_CONFIG.relearningSteps[0]);
      const nextAlg = {
        ...algorithm,
        state: 'relearning',
        easeFactor: newEase,
        lapses,
        learningStep: 0,
        due,
        nextReviewDate: due,
      };
      return {
        sessionAlgorithm: nextAlg,
        persistAlgorithm: nextAlg,
        requeueMode: 'short',
      };
    }
  }

  if (action === 2) { // Good
    if (state === 'new' || state === 'learning') {
      const nextStep = algorithm.learningStep + 1;
      if (nextStep < ANKI_CONFIG.learningSteps.length) {
        const due = addMinutes(ANKI_CONFIG.learningSteps[nextStep]);
        const nextAlg = {
          ...algorithm,
          state: 'learning',
          learningStep: nextStep,
          interval: 0,
          due,
          nextReviewDate: due,
        };
        return {
          sessionAlgorithm: nextAlg,
          persistAlgorithm: nextAlg,
          requeueMode: 'end',
        };
      } else { // Graduates from learning to review
        const interval = apply_fuzz(ANKI_CONFIG.graduatingInterval);
        const due = addDays(interval);
        const nextAlg = {
          ...algorithm,
          state: 'review',
          learningStep: 0,
          interval,
          repetitions: algorithm.repetitions + 1,
          due,
          nextReviewDate: due,
        };
        return {
          sessionAlgorithm: nextAlg,
          persistAlgorithm: nextAlg,
          requeueMode: 'none',
        };
      }
    } else if (state === 'relearning') {
      const nextStep = algorithm.learningStep + 1;
      if (nextStep < ANKI_CONFIG.relearningSteps.length) {
        const due = addMinutes(ANKI_CONFIG.relearningSteps[nextStep]);
        const nextAlg = {
          ...algorithm,
          state: 'relearning',
          learningStep: nextStep,
          due,
          nextReviewDate: due,
        };
        return {
          sessionAlgorithm: nextAlg,
          persistAlgorithm: nextAlg,
          requeueMode: 'end',
        };
      } else { // Graduates from relearning back to review
        const recoveredInterval = Math.max(1, algorithm.interval || ANKI_CONFIG.graduatingInterval);
        const interval = apply_fuzz(recoveredInterval);
        const due = addDays(interval);
        const nextAlg = {
          ...algorithm,
          state: 'review',
          learningStep: 0,
          interval,
          repetitions: algorithm.repetitions + 1,
          due,
          nextReviewDate: due,
        };
        return {
          sessionAlgorithm: nextAlg,
          persistAlgorithm: nextAlg,
          requeueMode: 'none',
        };
      }
    } else { // state === 'review'
      const currentInterval = algorithm.interval || 1;
      const rawCalculated = Math.round(currentInterval * (algorithm.easeFactor / 1000));
      const fuzzed = apply_fuzz(rawCalculated);
      const interval = Math.max(fuzzed, currentInterval + 1);
      const due = addDays(interval);

      const nextAlg = {
        ...algorithm,
        state: 'review',
        interval,
        repetitions: algorithm.repetitions + 1,
        due,
        nextReviewDate: due,
      };
      return {
        sessionAlgorithm: nextAlg,
        persistAlgorithm: nextAlg,
        requeueMode: 'none',
      };
    }
  }

  if (action === 3) { // Easy
    if (state === 'new' || state === 'learning') {
      const interval = apply_fuzz(ANKI_CONFIG.easyInterval);
      const due = addDays(interval);
      const nextAlg = {
        ...algorithm,
        state: 'review',
        learningStep: 0,
        interval,
        repetitions: algorithm.repetitions + 1,
        due,
        nextReviewDate: due,
      };
      return {
        sessionAlgorithm: nextAlg,
        persistAlgorithm: nextAlg,
        requeueMode: 'none',
      };
    } else if (state === 'relearning') {
      const baseInt = Math.round((algorithm.interval || 1) * ANKI_CONFIG.easyBonus);
      const targetInt = Math.max(ANKI_CONFIG.easyInterval, baseInt);
      const interval = apply_fuzz(targetInt);
      const newEase = algorithm.easeFactor + ANKI_CONFIG.easeBonusEasy;
      const due = addDays(interval);

      const nextAlg = {
        ...algorithm,
        state: 'review',
        easeFactor: newEase,
        learningStep: 0,
        interval,
        repetitions: algorithm.repetitions + 1,
        due,
        nextReviewDate: due,
      };
      return {
        sessionAlgorithm: nextAlg,
        persistAlgorithm: nextAlg,
        requeueMode: 'none',
      };
    } else { // state === 'review'
      const currentInterval = algorithm.interval || 1;
      const rawCalculated = Math.round(
        currentInterval * (algorithm.easeFactor / 1000) * ANKI_CONFIG.easyBonus
      );
      const fuzzed = apply_fuzz(rawCalculated);
      const interval = Math.max(fuzzed, currentInterval + 1);
      const newEase = algorithm.easeFactor + ANKI_CONFIG.easeBonusEasy;
      const due = addDays(interval);

      const nextAlg = {
        ...algorithm,
        state: 'review',
        easeFactor: newEase,
        interval,
        repetitions: algorithm.repetitions + 1,
        due,
        nextReviewDate: due,
      };
      return {
        sessionAlgorithm: nextAlg,
        persistAlgorithm: nextAlg,
        requeueMode: 'none',
      };
    }
  }

  return {
    sessionAlgorithm: algorithm,
    persistAlgorithm: null,
    requeueMode: 'none',
  };
}
