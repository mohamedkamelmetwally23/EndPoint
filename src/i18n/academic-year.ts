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
  const number = Number(name) || Number(/^Year\s+(\d+)$/i.exec(name)?.[1]) ||
    ordinals.findIndex((ordinal) => name === `السنة ال${ordinal}` || name === `سنة ${ordinal}`) + 1;
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

export function academicTermLabel(
  term: { name: string; order?: number; localOrder?: number },
  year: { name: string; order?: number } | undefined,
  language: string,
) {
  if (term.order && term.order > 0) return semesterLabel(term.order, language);
  const explicit = /^(?:Semester|الفصل الدراسي)\s+(\d+)$/i.exec(term.name);
  if (explicit) return semesterLabel(Number(explicit[1]), language);
  const local = term.localOrder ||
    (/الأول|first|(?:term)\s*1\b/i.test(term.name) ? 1 : /الثاني|second|(?:term)\s*2\b/i.test(term.name) ? 2 : 0);
  if (!local) return term.name;
  const yearNumber = year?.order || Number(year?.name) || Number(/^Year\s+(\d+)$/i.exec(year?.name || "")?.[1]) || 1;
  return semesterLabel((yearNumber - 1) * 2 + local, language);
}
