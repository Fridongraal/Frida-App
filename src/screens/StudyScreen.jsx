import React from 'react';
import StudySession from '../components/StudySession';

export default function StudyScreen({ deck, onReviewCard, onBack }) {
  return (
    <div className="h-full w-full bg-warmgray-50 dark:bg-darkBg flex flex-col justify-center py-6 animate-fade-in transition-colors duration-300">
      <StudySession deck={deck} onReviewCard={onReviewCard} onBack={onBack} />
    </div>
  );
}
