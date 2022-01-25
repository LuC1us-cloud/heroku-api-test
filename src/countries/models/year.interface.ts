import { Holiday } from "./holiday.interface";

export interface Year {
  countryCode: string;
  year: number;
  holidays: Holiday[];
}
