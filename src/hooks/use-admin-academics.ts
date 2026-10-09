import { useResource } from "./use-resource";
import type { Academics } from "../types/domain";

export function useAdminAcademics() {
  const resource = useResource<Academics>("/admin/academics");
  const data = resource.data;
  return {
    ...resource,
    data: data && {
      ...data,
      academic_years: data.academic_years.map((year) => ({
        ...year,
        name: `Year ${year.order || Number(year.name) || data.academic_years.filter((item) => item.collegeId === year.collegeId).findIndex((item) => item._id === year._id) + 1}`,
      })),
      terms: data.terms.map((term) => {
        const year = data.academic_years.find((item) => item._id === term.academicYearId);
        const yearNumber = year?.order || Number(year?.name) || 1;
        const position = term.localOrder ||
          (/الأول|first|(?:term|semester)\s*1\b/i.test(term.name) ? 1 :
            /الثاني|second|(?:term|semester)\s*2\b/i.test(term.name) ? 2 :
              data.terms.filter((item) => item.academicYearId === term.academicYearId).findIndex((item) => item._id === term._id) + 1);
        return { ...term, name: `Semester ${term.order || (yearNumber - 1) * 2 + position}` };
      }),
    },
  };
}
