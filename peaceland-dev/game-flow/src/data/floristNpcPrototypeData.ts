export type FloristChoiceEffect = {
  friendship?: number;
  branch?: "gentle" | "direct" | "retreat";
  note?: string;
};

export type FloristChoice = {
  id: string;
  label: string;
  detail: string;
  effect: FloristChoiceEffect;
};

export type FloristUnlockRule = {
  memoryEntered?: boolean;
  notebookStageAtLeast?: number;
  friendshipAtLeast?: number;
  branch?: "gentle" | "direct" | "retreat";
};

export type FloristInteraction = {
  id: string;
  title: string;
  tier: 0 | 1 | 2 | 3;
  summary: string;
  lines: string[];
  unlock: FloristUnlockRule;
  choices?: FloristChoice[];
};

export type FloristNpcPrototypeState = {
  memoryEntered: boolean;
  notebookStage: 0 | 1 | 2;
  friendshipLevel: 0 | 1 | 2 | 3;
  levelTwoBranch: "gentle" | "direct" | "retreat" | null;
  choiceHistory: string[];
};

export const FLORIST_NOTEBOOK_LABELS: Record<FloristNpcPrototypeState["notebookStage"], string> = {
  0: "White Flower not reviewed yet",
  1: "White Flower reviewed once",
  2: "White Flower reviewed twice"
};

export const INITIAL_FLORIST_NPC_STATE: FloristNpcPrototypeState = {
  memoryEntered: false,
  notebookStage: 0,
  friendshipLevel: 0,
  levelTwoBranch: null,
  choiceHistory: []
};

export const FLORIST_INTERACTIONS: FloristInteraction[] = [
  {
    id: "florist-root",
    title: "Florist Present Node",
    tier: 0,
    summary:
      "Mira is available in the present, but deeper dialogue remains locked until the player brings context back from memory and notebook review.",
    lines: [
      "Mira keeps working, but there is room for a present-day check-in.",
      "This root node stays visible even before the player has earned deeper trust."
    ],
    unlock: {}
  },
  {
    id: "memory-follow-up",
    title: "Memory Follow-up",
    tier: 1,
    summary: "Unlocked after the player has entered the florist memory once.",
    lines: [
      "You came back from the memory tree quieter than before.",
      "Mira notices that Marc knows enough to ask a more personal question."
    ],
    unlock: {
      memoryEntered: true
    }
  },
  {
    id: "white-flower-first-pass",
    title: "White Flower Question",
    tier: 1,
    summary:
      "First friendship gate. The player has reviewed the white flower in the notebook once and can ask about it directly.",
    lines: [
      "Marc mentions the white flower from the notebook instead of changing the subject.",
      "Mira pauses long enough to decide whether she wants to keep talking."
    ],
    unlock: {
      memoryEntered: true,
      notebookStageAtLeast: 1
    },
    choices: [
      {
        id: "tier1-stay",
        label: "Stay with the topic",
        detail: "Marc signals that he wants to understand, not just collect information.",
        effect: {
          friendship: 1,
          note: "Friendship rises to level 1."
        }
      },
      {
        id: "tier1-back-off",
        label: "Back off gently",
        detail: "Marc leaves space, which keeps the route open but does not deepen trust yet.",
        effect: {
          note: "No friendship gain. Review the notebook again only after trust begins."
        }
      }
    ]
  },
  {
    id: "white-flower-second-pass",
    title: "White Flower, Second Reading",
    tier: 2,
    summary:
      "Second gate. The player has both friendship level 1 and the second notebook read, so the conversation can go deeper.",
    lines: [
      "Marc returns after reading the white flower entry again and noticing the details he missed the first time.",
      "Mira is willing to answer, but how Marc frames the question changes the direction of the relationship."
    ],
    unlock: {
      memoryEntered: true,
      notebookStageAtLeast: 2,
      friendshipAtLeast: 1
    },
    choices: [
      {
        id: "tier2-gentle",
        label: "Ask gently why she kept it",
        detail: "This opens a careful, trust-first third-level interaction.",
        effect: {
          friendship: 2,
          branch: "gentle",
          note: "Unlocks the gentle level-3 follow-up."
        }
      },
      {
        id: "tier2-direct",
        label: "Ask directly who it belonged to",
        detail: "This pushes the route into a sharper, more confrontational third-level interaction.",
        effect: {
          friendship: 2,
          branch: "direct",
          note: "Unlocks the direct level-3 follow-up."
        }
      },
      {
        id: "tier2-retreat",
        label: "Admit you may have asked too much",
        detail: "This turns the route toward distance and a more fragile third-level interaction.",
        effect: {
          friendship: 2,
          branch: "retreat",
          note: "Unlocks the retreat level-3 follow-up."
        }
      }
    ]
  },
  {
    id: "level3-gentle",
    title: "Level 3: Gentle Trust Route",
    tier: 3,
    summary: "Unlocked only if the level-2 dialogue ended on the gentle branch.",
    lines: [
      "Mira explains why the flower matters without feeling cornered.",
      "The conversation becomes a shared act of remembering rather than an interrogation."
    ],
    unlock: {
      memoryEntered: true,
      notebookStageAtLeast: 2,
      friendshipAtLeast: 2,
      branch: "gentle"
    }
  },
  {
    id: "level3-direct",
    title: "Level 3: Direct Confrontation Route",
    tier: 3,
    summary: "Unlocked only if the level-2 dialogue used the direct branch.",
    lines: [
      "Mira answers, but the tone is tighter and more defensive.",
      "Marc gets information faster, but the relationship feels less safe."
    ],
    unlock: {
      memoryEntered: true,
      notebookStageAtLeast: 2,
      friendshipAtLeast: 2,
      branch: "direct"
    }
  },
  {
    id: "level3-retreat",
    title: "Level 3: Fragile Exit Route",
    tier: 3,
    summary: "Unlocked only if the level-2 dialogue ended in retreat.",
    lines: [
      "Mira notices the hesitation and fills the silence on her own terms.",
      "The player still reaches a level-3 interaction, but it is shaped by caution rather than trust."
    ],
    unlock: {
      memoryEntered: true,
      notebookStageAtLeast: 2,
      friendshipAtLeast: 2,
      branch: "retreat"
    }
  }
];
