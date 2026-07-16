import React from 'react';
import StudySession from '../components/StudySession';

export default function StudyScreen({ deck, onReviewCard, onBack }) {
  return (
    <div className="h-full w-full bg-warmgray-50 flex flex-col justify-center py-6 animate-fade-in">
      <StudySession deck={deck} onReviewCard={onReviewCard} onBack={onBack} />
    </div>
  );
}
