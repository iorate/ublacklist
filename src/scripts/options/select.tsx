import * as _Select from "../components/select.tsx";
import { getOS } from "./platform.ts";

export type { SelectOptionProps } from "../components/select.tsx";
export { SelectOption } from "../components/select.tsx";

export type SelectProps = {
  ref?: React.Ref<HTMLSelectElement>;
} & _Select.SelectProps;

export const Select: React.FC<SelectProps> = (props) => {
  return <_Select.Select {...props} native={getOS() !== "win"} />;
};
