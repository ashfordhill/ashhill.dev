import { GridPosition } from '../data/Grid';
import { Path } from '../data/Car';

export interface Algorithm {
  name: string;
  description: string;
  findPath(
    start: [number, number], 
    goal: [number, number], 
    obstacles: Set<string>
  ): Path | null;
}