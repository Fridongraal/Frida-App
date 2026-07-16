/**
 * Streak Manager for Frida Flashcards
 * Handles daily study streaks and goals.
 */

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(dateStr1, dateStr2) {
  return dateStr1 === dateStr2;
}

export function isYesterday(dateStr, todayStr) {
  if (!dateStr || !todayStr) return false;
  
  const d = new Date(`${dateStr}T12:00:00`);
  const t = new Date(`${todayStr}T12:00:00`);
  
  const diffTime = t.getTime() - d.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Returns the streak information to be displayed in the UI.
 */
export function getDisplayStreak(store, todayDateStr = getLocalDateString()) {
  const streakCount = store?.streakCount ?? 0;
  const lastStudyDate = store?.lastStudyDate;

  if (!lastStudyDate) {
    return { count: 0, active: false };
  }

  if (isSameDay(lastStudyDate, todayDateStr)) {
    return { count: streakCount, active: true };
  }

  if (isYesterday(lastStudyDate, todayDateStr)) {
    return { count: streakCount, active: false };
  }

  return { count: 0, active: false };
}

/**
 * Updates the streak when a card is answered.
 * Daily goal is 5 cards.
 */
export function processCardReviewStreak(store, todayDateStr = getLocalDateString()) {
  let streakCount = store?.streakCount ?? 0;
  let lastStudyDate = store?.lastStudyDate ?? null;
  let todayCardsCount = store?.todayCardsCount ?? 0;
  let lastActiveDate = store?.lastActiveDate ?? null;

  if (lastActiveDate !== todayDateStr) {
    todayCardsCount = 0;
    lastActiveDate = todayDateStr;
  }

  todayCardsCount += 1;

  // We hit the milestone of 5 cards today!
  if (todayCardsCount === 5) {
    if (!lastStudyDate) {
      streakCount = 1;
      lastStudyDate = todayDateStr;
    } else if (isSameDay(lastStudyDate, todayDateStr)) {
      // Already completed today
    } else if (isYesterday(lastStudyDate, todayDateStr)) {
      // Incremented!
      streakCount += 1;
      lastStudyDate = todayDateStr;
    } else {
      // Reset to 1
      streakCount = 1;
      lastStudyDate = todayDateStr;
    }
  }

  return {
    ...store,
    streakCount,
    lastStudyDate,
    todayCardsCount,
    lastActiveDate
  };
}
