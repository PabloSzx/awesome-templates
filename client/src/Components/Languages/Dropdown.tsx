import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import { Dropdown } from "semantic-ui-react";

function LanguagesDropdown<T extends string | string[]>({
  onChange,
  value,
  clearable,
  multiple,
  selection,
  search,
  placeholder,
  disabled = false,
  loading = false,
}: {
  onChange: (value: T) => any;
  value: T;
  multiple: T extends string[] ? true : false;
  clearable?: boolean;
  selection?: boolean;
  search?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { data: optionsLanguages, loading: loadingLanguages } = useQuery<{
    languages: { name: string }[];
  }>(gql`
    query {
      languages {
        name
      }
    }
  `);

  if (!placeholder) {
    placeholder = `Select Language${multiple ? "s" : ""}`;
  }
  return (
    <Dropdown
      clearable={clearable}
      selection={selection}
      search={search}
      multiple={multiple}
      placeholder={placeholder}
      options={
        !loadingLanguages && optionsLanguages
          ? optionsLanguages.languages.map(({ name: value }, key) => ({
              key,
              text: value,
              value,
            }))
          : []
      }
      onChange={(_e, { value }) => onChange(value as T)}
      value={value}
      disabled={loadingLanguages || disabled}
      loading={loadingLanguages || loading}
    />
  );
}

export default LanguagesDropdown;
