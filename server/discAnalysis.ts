import {
  type DiscAssessment,
  type DiscCompatibilityRule,
  type DiscAnalysisResult,
  type DiscStyleInfo,
} from "@shared/schema";
import { getDiscCompatibilityRules } from "./discStorage";

// DiSC Style Metadata
export const DISC_STYLES: Record<"D" | "i" | "S" | "C", DiscStyleInfo> = {
  D: {
    style: "D",
    name: "Dominance",
    color: "#D64933",
    strengths: ["Decisive", "Problem solver", "Risk taker", "Self-starter"],
    challenges: ["Impatient", "Insensitive", "Demanding"],
    idealRoles: ["Project Lead", "Command Center Director", "Go-Live Manager"],
  },
  i: {
    style: "i",
    name: "Influence",
    color: "#F4B942",
    strengths: ["Enthusiastic", "Collaborative", "Creative", "Motivating"],
    challenges: ["Disorganized", "Impulsive", "Lacks follow-through"],
    idealRoles: ["Trainer", "End-user Liaison", "Change Champion"],
  },
  S: {
    style: "S",
    name: "Steadiness",
    color: "#4A9B5D",
    strengths: ["Patient", "Team player", "Reliable", "Good listener"],
    challenges: ["Resistant to change", "Avoids conflict", "Indecisive"],
    idealRoles: ["At-the-Elbow Support", "Super User Coach", "Help Desk"],
  },
  C: {
    style: "C",
    name: "Conscientiousness",
    color: "#3B82C4",
    strengths: ["Accurate", "Detail-oriented", "Quality-focused", "Systematic"],
    challenges: ["Overly critical", "Analysis paralysis", "Perfectionist"],
    idealRoles: ["Build Analyst", "Testing Lead", "Data Validation"],
  },
};

// Base compatibility matrix (style1 -> style2 = score)
export const COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
  D: { D: 70, i: 80, S: 60, C: 75 },
  i: { D: 80, i: 75, S: 85, C: 65 },
  S: { D: 60, i: 85, S: 80, C: 75 },
  C: { D: 75, i: 65, S: 75, C: 85 },
};

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  discAssessment: DiscAssessment | null;
}

/**
 * Analyzes a team's DiSC composition and returns compatibility insights
 */
export async function analyzeTeam(
  members: TeamMember[]
): Promise<DiscAnalysisResult> {
  // Filter members with DiSC assessments
  const membersWithDisc = members.filter((m) => m.discAssessment !== null);

  if (membersWithDisc.length === 0) {
    return {
      overallScore: 0,
      styleDistribution: { D: 0, i: 0, S: 0, C: 0 },
      compatibilityMatrix: [],
      strengths: [],
      risks: ["No team members have DiSC assessments"],
      recommendations: ["Complete DiSC assessments for all team members"],
      flagsTriggered: [],
    };
  }

  // 1. Calculate style distribution
  const distribution: Record<"D" | "i" | "S" | "C", number> = {
    D: 0,
    i: 0,
    S: 0,
    C: 0,
  };

  membersWithDisc.forEach((m) => {
    const style = m.discAssessment!.primaryStyle as "D" | "i" | "S" | "C";
    distribution[style]++;
  });

  // 2. Calculate pairwise compatibility scores
  const pairScores: Array<{
    person1Id: string;
    person2Id: string;
    score: number;
  }> = [];

  for (let i = 0; i < membersWithDisc.length; i++) {
    for (let j = i + 1; j < membersWithDisc.length; j++) {
      const member1 = membersWithDisc[i];
      const member2 = membersWithDisc[j];
      const style1 = member1.discAssessment!.primaryStyle;
      const style2 = member2.discAssessment!.primaryStyle;

      const baseScore = COMPATIBILITY_MATRIX[style1][style2];

      // Adjust score based on how extreme the scores are
      const extremityAdjustment = calculateExtremityAdjustment(
        member1.discAssessment!,
        member2.discAssessment!
      );

      pairScores.push({
        person1Id: member1.id,
        person2Id: member2.id,
        score: Math.round(baseScore + extremityAdjustment),
      });
    }
  }

  // 3. Evaluate rules
  const rules = await getDiscCompatibilityRules();
  const flagsTriggered = evaluateRules(membersWithDisc, distribution, rules);

  // 4. Calculate overall score
  const avgPairScore =
    pairScores.length > 0
      ? pairScores.reduce((a, b) => a + b.score, 0) / pairScores.length
      : 70;

  const criticalFlags = flagsTriggered.filter(
    (f) => f.severity === "critical"
  ).length;
  const warningFlags = flagsTriggered.filter(
    (f) => f.severity === "warning"
  ).length;
  const successFlags = flagsTriggered.filter(
    (f) => f.severity === "success"
  ).length;

  let overallScore = Math.round(
    avgPairScore - criticalFlags * 15 - warningFlags * 5 + successFlags * 5
  );
  overallScore = Math.max(0, Math.min(100, overallScore));

  // 5. Generate insights
  const strengths = generateStrengths(distribution, membersWithDisc);
  const risks = generateRisks(distribution, flagsTriggered);
  const recommendations = generateRecommendations(distribution, flagsTriggered);

  return {
    overallScore,
    styleDistribution: distribution,
    compatibilityMatrix: pairScores,
    strengths,
    risks,
    recommendations,
    flagsTriggered,
  };
}

/**
 * Calculate adjustment based on how extreme individual scores are
 */
function calculateExtremityAdjustment(
  assessment1: DiscAssessment,
  assessment2: DiscAssessment
): number {
  const style1 = assessment1.primaryStyle;
  const style2 = assessment2.primaryStyle;

  // Get the scores for the primary styles
  const score1 = getStyleScore(assessment1, style1);
  const score2 = getStyleScore(assessment2, style2);

  // If both are very high (>80), slightly reduce compatibility for same style
  if (style1 === style2 && score1 > 80 && score2 > 80) {
    return -10;
  }

  // If opposite styles and both are moderate (50-70), increase compatibility
  if (
    ((style1 === "D" && style2 === "S") || (style1 === "S" && style2 === "D")) &&
    score1 >= 50 &&
    score1 <= 70 &&
    score2 >= 50 &&
    score2 <= 70
  ) {
    return 5;
  }

  return 0;
}

function getStyleScore(
  assessment: DiscAssessment,
  style: string
): number {
  switch (style) {
    case "D":
      return assessment.dScore;
    case "i":
      return assessment.iScore;
    case "S":
      return assessment.sScore;
    case "C":
      return assessment.cScore;
    default:
      return 0;
  }
}

/**
 * Evaluate team against compatibility rules
 */
function evaluateRules(
  members: TeamMember[],
  distribution: Record<"D" | "i" | "S" | "C", number>,
  rules: DiscCompatibilityRule[]
): DiscAnalysisResult["flagsTriggered"] {
  const flags: DiscAnalysisResult["flagsTriggered"] = [];

  for (const rule of rules) {
    const conditions = rule.conditions as any;
    let triggered = false;
    let message = rule.messageTemplate;

    switch (conditions.type) {
      case "style_count": {
        // Check if a style exceeds threshold
        const count = distribution[conditions.style as keyof typeof distribution] || 0;
        const highScoreMembers = members.filter((m) => {
          const score = getStyleScore(m.discAssessment!, conditions.style);
          return (
            m.discAssessment?.primaryStyle === conditions.style &&
            score >= (conditions.scoreThreshold || 0)
          );
        });

        if (highScoreMembers.length >= conditions.threshold) {
          triggered = true;
          message = message.replace("{count}", String(highScoreMembers.length));
        }
        break;
      }

      case "style_minimum": {
        // Check if style has minimum representation
        const count = distribution[conditions.style as keyof typeof distribution] || 0;
        const qualifiedMembers = members.filter((m) => {
          const score = getStyleScore(m.discAssessment!, conditions.style);
          return score >= (conditions.scoreThreshold || 0);
        });

        if (qualifiedMembers.length < conditions.minimumCount) {
          triggered = true;
        }
        break;
      }

      case "style_diversity": {
        // Check if team has enough style diversity
        const stylesPresent = Object.values(distribution).filter((v) => v > 0).length;
        if (stylesPresent < conditions.minimumStyles) {
          triggered = true;
        }
        break;
      }

      case "all_styles_present": {
        // Check if all styles are represented
        const allPresent = Object.values(distribution).every((v) => v > 0);
        if (allPresent) {
          triggered = true;
        }
        break;
      }

      case "pairwise_friction": {
        // Check for high-friction pairings
        const pairs = conditions.pairs as [string, string][];
        for (const [style1, style2] of pairs) {
          const members1 = members.filter(
            (m) => m.discAssessment?.primaryStyle === style1
          );
          const members2 = members.filter(
            (m) => m.discAssessment?.primaryStyle === style2
          );

          for (const m1 of members1) {
            for (const m2 of members2) {
              if (m1.id !== m2.id) {
                triggered = true;
                message = message
                  .replace("{person1}", `${m1.firstName} ${m1.lastName}`)
                  .replace("{person2}", `${m2.firstName} ${m2.lastName}`)
                  .replace("{style1}", style1)
                  .replace("{style2}", style2);
                break;
              }
            }
            if (triggered) break;
          }
        }
        break;
      }
    }

    if (triggered) {
      flags.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity as "info" | "warning" | "critical" | "success",
        message,
        suggestion: rule.suggestion || undefined,
      });
    }
  }

  return flags;
}

/**
 * Generate team strengths based on composition
 */
function generateStrengths(
  distribution: Record<"D" | "i" | "S" | "C", number>,
  members: TeamMember[]
): string[] {
  const strengths: string[] = [];

  if (distribution.D > 0) {
    strengths.push("Decision-making capability with D-style leadership");
  }
  if (distribution.i > 0) {
    strengths.push("Strong communication and stakeholder engagement via i-style members");
  }
  if (distribution.S > 0) {
    strengths.push("Team stability and support focus from S-style members");
  }
  if (distribution.C > 0) {
    strengths.push("Quality assurance and attention to detail from C-style members");
  }

  // Check for balance
  const presentStyles = Object.values(distribution).filter((v) => v > 0).length;
  if (presentStyles >= 3) {
    strengths.push("Good diversity of perspectives and working styles");
  }

  // Check for complementary pairs
  if (distribution.D > 0 && distribution.S > 0) {
    strengths.push("Balance between driving results and maintaining team harmony");
  }
  if (distribution.i > 0 && distribution.C > 0) {
    strengths.push("Balance between enthusiasm and analytical rigor");
  }

  return strengths;
}

/**
 * Generate team risks based on composition and flags
 */
function generateRisks(
  distribution: Record<"D" | "i" | "S" | "C", number>,
  flags: DiscAnalysisResult["flagsTriggered"]
): string[] {
  const risks: string[] = [];

  // Add risks from critical/warning flags
  flags
    .filter((f) => f.severity === "critical" || f.severity === "warning")
    .forEach((f) => risks.push(f.message));

  // Check for missing styles
  if (distribution.D === 0) {
    risks.push("May lack decisive leadership in critical moments");
  }
  if (distribution.C === 0) {
    risks.push("May overlook important details or quality standards");
  }

  // Check for imbalance
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const dominant = Object.entries(distribution).find(
    ([_, count]) => count > total * 0.6
  );
  if (dominant && total > 2) {
    risks.push(
      `Team is heavily weighted toward ${DISC_STYLES[dominant[0] as keyof typeof DISC_STYLES].name} style`
    );
  }

  return risks;
}

/**
 * Generate recommendations based on composition and flags
 */
function generateRecommendations(
  distribution: Record<"D" | "i" | "S" | "C", number>,
  flags: DiscAnalysisResult["flagsTriggered"]
): string[] {
  const recommendations: string[] = [];

  // Add suggestions from flags
  flags
    .filter((f) => f.suggestion)
    .forEach((f) => {
      if (!recommendations.includes(f.suggestion!)) {
        recommendations.push(f.suggestion!);
      }
    });

  // Add style-specific recommendations
  if (distribution.D === 0) {
    recommendations.push(
      "Consider adding a D-style member or designating a clear decision-maker"
    );
  }
  if (distribution.i === 0) {
    recommendations.push(
      "Consider adding an i-style member for stakeholder communication"
    );
  }
  if (distribution.S === 0) {
    recommendations.push(
      "Consider adding an S-style member for team cohesion and support roles"
    );
  }
  if (distribution.C === 0) {
    recommendations.push(
      "Consider adding a C-style member for quality control and testing"
    );
  }

  // Communication recommendations
  if (distribution.D > 1) {
    recommendations.push(
      "Establish clear decision-making protocols to prevent D-style conflicts"
    );
  }

  // Training recommendations
  if (distribution.i > 0 && distribution.C > 0) {
    recommendations.push(
      "Foster mutual understanding between i-style and C-style members through style awareness training"
    );
  }

  return recommendations.slice(0, 5); // Limit to top 5
}

/**
 * Get suggested role assignments based on DiSC styles
 */
export function getSuggestedRoles(
  members: TeamMember[]
): Array<{ memberId: string; suggestedRoles: string[] }> {
  return members
    .filter((m) => m.discAssessment)
    .map((m) => {
      const style = m.discAssessment!.primaryStyle as keyof typeof DISC_STYLES;
      return {
        memberId: m.id,
        suggestedRoles: DISC_STYLES[style].idealRoles,
      };
    });
}
