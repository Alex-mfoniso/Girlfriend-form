import type { ApplicationFormData } from '../types/application';

export interface CompatibilityResult {
  score: number;
  verdict: string;
  summary: string;
  badge: string;
  highlights: string[];
}

export function calculateCompatibilityScore(data: ApplicationFormData): CompatibilityResult {
  let baseScore = 72; // Start from an optimistic baseline

  // Factor 1: Reaction to Alexander not replying for 3 hours
  if (data.noReplyReaction?.includes('Assume he is deep in code') || data.noReplyReaction?.includes('debugging')) {
    baseScore += 10;
  } else if (data.noReplyReaction?.includes('Live my best life')) {
    baseScore += 8;
  } else if (data.noReplyReaction?.includes('Send a funny meme')) {
    baseScore += 9;
  } else if (data.noReplyReaction?.includes('Double text')) {
    baseScore += 3;
  }

  // Factor 2: Disagreement style
  if (data.disagreementStyle?.includes('Direct conversation with calm reasoning')) {
    baseScore += 9;
  } else if (data.disagreementStyle?.includes('Order food first, talk when fed')) {
    baseScore += 12; // Alexander loves food-based diplomacy
  } else if (data.disagreementStyle?.includes('Give each other space then talk')) {
    baseScore += 8;
  }

  // Factor 3: Jealousy level (1-10)
  // Optimal sweet spot: 2 to 5. Too high (8-10) or too indifferent (1) modifies score slightly
  const jealousy = Number(data.jealousyLevel) || 3;
  if (jealousy >= 2 && jealousy <= 5) {
    baseScore += 6;
  } else if (jealousy >= 6 && jealousy <= 7) {
    baseScore += 2;
  } else if (jealousy >= 8) {
    baseScore -= 4;
  }

  // Factor 4: Personality traits count
  const traitsCount = data.personalityTraits?.length || 0;
  if (traitsCount >= 3) {
    baseScore += 5;
  }

  // Factor 5: Effort in text answers
  const textEffort =
    (data.whySelected?.length || 0) +
    (data.relationshipValue?.length || 0) +
    (data.greenFlag?.length || 0);

  if (textEffort > 120) {
    baseScore += 4;
  }

  // Keep score realistically within 65-99 range (never a robotic 100%, because human relationships have edge cases!)
  const finalScore = Math.min(99, Math.max(62, baseScore));

  let verdict = '';
  let summary = '';
  let badge = '';
  const highlights: string[] = [];

  if (finalScore >= 92) {
    badge = 'Executive Tier Match';
    verdict = 'Immaculate Vibe Alignment';
    summary =
      'Our proprietary non-scientific heuristics predict an 90%+ probability of harmonious brunching, shared playlists, and mutual tolerance for software debugging rants.';
    highlights.push('Exceptional emotional diplomacy detected');
    highlights.push('High tolerance for software engineering metaphors');
    highlights.push('Optimal meme-sharing frequency projected');
  } else if (finalScore >= 84) {
    badge = 'Strong Contender';
    verdict = 'High-Value Candidate';
    summary =
      'Outstanding overall synergy. Shows strong diplomatic capabilities and genuine humor quotient. Immediate referral to coffee interview stage recommended.';
    highlights.push('Balanced communication cadence');
    highlights.push('Healthy food-sharing equilibrium');
    highlights.push('Passed preliminary sanity and vibe screenings');
  } else if (finalScore >= 75) {
    badge = 'Promising Applicant';
    verdict = 'Positive Potential with Minor Quirks';
    summary =
      'Solid alignment on major life priorities. Both parties may need to negotiate on reply latency expectations and Netflix queue supremacy.';
    highlights.push('Good humor tolerance threshold');
    highlights.push('Constructive conversational style');
    highlights.push('Further in-person vibe check suggested');
  } else {
    badge = 'High-Risk High-Reward';
    verdict = 'Dynamic & Unpredictable Chemistry';
    summary =
      'A thrilling wild card. Either a legendary romantic saga or an unforgettable story for the group chat.';
    highlights.push('Unapologetically authentic responses');
    highlights.push('Spicy disagreement resolution dynamic');
    highlights.push('Requires thorough coffee-table inquiry');
  }

  return {
    score: finalScore,
    verdict,
    summary,
    badge,
    highlights,
  };
}
