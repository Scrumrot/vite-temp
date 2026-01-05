
/**
 * Example types to test code generators
 * Run: npm run generate-zod src/types/example.ts
 * Run: npm run generate-store src/types/example.ts
 */
export interface AirPlane {
  id: string;
  model: string;
  manufacturer: string;
  capacity: number;
  range: number;
  inService: boolean;
}
