const ordinals = [
  "أولى",
  "ثانية",
  "ثالثة",
  "رابعة",
  "خامسة",
  "سادسة",
  "سابعة",
  "ثامنة",
  "تاسعة",
  "عاشرة",
  "حادية عشرة",
  "ثانية عشرة",
];
export function academicYearLabel(name: string, language: string) {
  const number = Number(name);
  if (!Number.isInteger(number) || number < 1) return name;
  return language === "ar"
    ? `سنة ${ordinals[number - 1] || number}`
    : `Year ${number}`;
}
