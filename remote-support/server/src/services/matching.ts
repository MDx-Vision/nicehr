import db from '../db/index.js';

interface SupportRequest {
  staffId: number;
  hospitalId: number;
  department: string;
  preferredConsultantId?: number;
}

interface MatchResult {
  consultant: {
    id: number;
    name: string;
    email: string;
  };
  reasons: string[];
}

export function matchConsultant(request: SupportRequest): MatchResult | null {
  // Get available consultants
  const availableList = db.availability.getAvailable();
  
  if (availableList.length === 0) {
    return null;
  }

  // Calculate scores for each consultant
  const scores = availableList.map(avail => {
    const consultant = db.users.getById(avail.consultant_id);
    if (!consultant) return null;

    let score = 0;
    const reasons: string[] = [];

    // Check for department specialty
    const specialty = db.specialties.getByDepartment(consultant.id, request.department);
    if (specialty?.proficiency === 'expert') {
      score += 30;
      reasons.push('Department expert (+30)');
    } else if (specialty?.proficiency === 'standard') {
      score += 15;
      reasons.push('Department experience (+15)');
    }

    // Check for previous relationship
    const pref = db.preferences.get(request.staffId, consultant.id);
    if (pref) {
      score += 50;
      reasons.push('Previous relationship (+50)');
      if (pref.avg_rating && pref.avg_rating >= 4) {
        score += 20;
        reasons.push('High rating (+20)');
      }
    }

    // Rotation penalty
    const rotationPenalty = avail.sessions_today * 10;
    if (rotationPenalty > 0) {
      score -= rotationPenalty;
      reasons.push(`Rotation balance (-${rotationPenalty})`);
    }

    return { consultant, score, reasons };
  }).filter(Boolean) as Array<{ 
    consultant: NonNullable<ReturnType<typeof db.users.getById>>; 
    score: number; 
    reasons: string[] 
  }>;

  if (scores.length === 0) {
    return null;
  }

  // Sort by score and pick the best
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  return {
    consultant: {
      id: best.consultant.id,
      name: best.consultant.name,
      email: best.consultant.email,
    },
    reasons: best.reasons,
  };
}

export default { matchConsultant };
