export interface Plan {
  name: string;
  start: number;
  end: number;
  children: Plan[];
}
