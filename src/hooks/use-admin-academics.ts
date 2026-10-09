import { useResource } from "./use-resource";
import type { Academics } from "../types/domain";
import { useI18n } from "../i18n/context";
import { academicYearLabel, semesterLabel } from "../i18n/academic-year";

export function useAdminAcademics() {
  const resource = useResource<Academics>("/admin/academics");
  const { language } = useI18n();
  const data = resource.data;
  return {
    ...resource,
    data: data && {
      ...data,
      academic_years: data.academic_years.map((year) => ({
        ...year,
        name: academicYearLabel(String(year.order || Number(year.name) || data.academic_years.filter((item) => item.collegeId === year.collegeId).findIndex((item) => item._id === year._id) + 1), language),
      })),
      terms: data.terms.map((term) => {
        const year = data.academic_years.find((item) => item._id === term.academicYearId);
        const yearNumber = year?.order || Number(year?.name) || 1;
        const position = term.localOrder ||
          (/الأول|first|(?:term|semester)\s*1\b/i.test(term.name) ? 1 :
            /الثاني|second|(?:term|semester)\s*2\b/i.test(term.name) ? 2 :
              data.terms.filter((item) => item.academicYearId === term.academicYearId).findIndex((item) => item._id === term._id) + 1);
        return { ...term, name: semesterLabel(term.order || (yearNumber - 1) * 2 + position, language) };
      }),
    },
  };
}
