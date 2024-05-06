import * as _Select from "../components/select.tsx";
import { useOptionsContext } from "./options-context.tsx";

export type { SelectOptionProps } from "../components/select.tsx";
export { SelectOption } from "../components/select.tsx";

export type SelectProps = {
  ref?: React.Ref<HTMLSelectElement>;
} & _Select.SelectProps;

export const Select: React.FC<SelectProps> = (props) => {
  const {
    platformInfo: { os },
  } = useOptionsContext();
  return <_Select.Select {...props} native={os !== "win"} />;
};
