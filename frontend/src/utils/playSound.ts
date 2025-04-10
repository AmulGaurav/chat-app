export const playSound = (src: string) => {
  const audio = new Audio(src);
  audio.play().catch((e) => console.error("Failed to play sound:", e));
};
