export interface TermConstant {
  id: string;
  label: string;
  defaultChecked: boolean;
}

export const COMMON_TERMS: TermConstant[] = [
  {
    id: "no-combine",
    label: "Cannot be combined with any other offer or promotion.",
    defaultChecked: true,
  },
  {
    id: "one-time",
    label: "Valid for one-time use only.",
    defaultChecked: true,
  },
  {
    id: "show-code",
    label: "Digital code must be shown at the time of billing.",
    defaultChecked: true,
  },
  {
    id: "withdraw",
    label: "Merchant reserves the right to withdraw the offer without prior notice.",
    defaultChecked: true,
  },
  {
    id: "weekends",
    label: "Valid on all days including weekends.",
    defaultChecked: false,
  },
  {
    id: "min-purchase",
    label: "Applicable on a minimum purchase amount.",
    defaultChecked: false,
  },
  {
    id: "outlets",
    label: "Valid at all participating outlets.",
    defaultChecked: false,
  },
  {
    id: "stocks",
    label: "Offer valid until stocks last.",
    defaultChecked: false,
  },
  {
    id: "discounted",
    label: "Not applicable on already discounted items.",
    defaultChecked: false,
  },
  {
    id: "appointment",
    label: "Prior appointment or booking required.",
    defaultChecked: false,
  },
];
