declare module '@/data/professions.json' {
  export interface Profession {
    name: string;
    description: string;
    category: string;
    tasks?: string[];
  }

  export interface ProfessionsData {
    professions: Profession[];
  }

  const data: ProfessionsData;
  export default data;
}

