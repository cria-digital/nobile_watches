export type GenderOption = {
  value: string;
  label: string;
};

export const genderOptions: GenderOption[] = [
  // { value: "", label: "Selecione..." },
  { value: "Mulher", label: "Mulher" },
  { value: "Homem", label: "Homem" },
  { value: "Unissex", label: "Unissex" },
  // { value: "trans_woman", label: "Mulher trans" },
  // { value: "trans_man", label: "Homem trans" },
  // { value: "non_binary", label: "Não binário" },
  // { value: "other", label: "Outro" },
  // { value: "prefer_not_say", label: "Prefiro não informar" },
];
