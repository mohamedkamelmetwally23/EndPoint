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
    ? `السنة ${ordinals[number - 1] ? `ال${ordinals[number - 1]}` : number}`
    : `Year ${number}`;
}

const semesterOrdinals = [
  "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس",
  "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر",
];

export function semesterLabel(number: number, language: string) {
  return language === "ar"
    ? `الفصل الدراسي ${semesterOrdinals[number - 1] || number}`
    : `Semester ${number}`;
}
