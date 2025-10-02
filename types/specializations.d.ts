declare module '@/data/specializations.json' {
  export interface SpecializationsData {
    specializations: Record<string, string[]>;
    defaults: string[];
  }
  const data: SpecializationsData;
  export default data;
}
