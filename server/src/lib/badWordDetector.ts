import fetch from "node-fetch";

// use https://vector.profanity.dev
// problem: it does detect words like "fuck" which we could allow?
// fix: removeAcceptableBadWords!

export interface BadWordResponse {
  isProfanity: boolean;
  score: number;
  flaggedFor: string;
}

const acceptableBadWords = ["fuck", "shit", "bitch"];

const removeAcceptableBadWords = (
  message: string,
  badWords: string[],
): string => {
  let cleanedMessage = message;
  badWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\w*\\b`, "gi");
    cleanedMessage = cleanedMessage.replace(regex, "");
  });
  return cleanedMessage;
};

export const checkForBadWords = async (
  message: string,
): Promise<BadWordResponse> => {
  const cleanMessage = removeAcceptableBadWords(message, acceptableBadWords);
  const response = await fetch("https://vector.profanity.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cleanMessage }),
  });

  const data: BadWordResponse = (await response.json()) as BadWordResponse;

  return data;
};
