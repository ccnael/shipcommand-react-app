
export interface DropdownOption {
  value: string;
  text: string;
}

export type FetchOptionsFunction = () => Promise<DropdownOption[]>;
