
export interface Discipline {
  value: string;
  label: string;
}

// In a real application, this could be fetched from an API
export const getAllDisciplines = (): Discipline[] => {
  return [
    { value: "computer-engineering", label: "مهندسی کامپیوتر" },
    { value: "electrical-engineering", label: "مهندسی برق" },
  ];
};

// Helper function to get discipline label from value
export const getDisciplineLabel = (value: string): string => {
  const discipline = getAllDisciplines().find(d => d.value === value);
  return discipline ? discipline.label : value;
};
