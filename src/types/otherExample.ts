/**
 * Example types to test code generators
 * Run: npm run generate-zod src/types/otherExample.ts
 * Run: npm run generate-store src/types/otherExample.ts
 */

import type {Address, Order} from './otherExampleSubTypes.ts';

// Simple interface with primitives
export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  age: number;
  addresses: Address[];
  orders: Order[];
}
