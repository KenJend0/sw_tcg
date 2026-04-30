/** Leaders (recto) and Bases are landscape 400×286. All others are portrait 287×400. */
export function cardAspect(type: string): string {
  return type === "Leader" || type === "Base"
    ? "aspect-[400/286]"
    : "aspect-[287/400]";
}
