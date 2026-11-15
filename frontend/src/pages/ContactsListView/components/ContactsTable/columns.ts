import { CONTACT_TABLE_COLUMN_KEYS } from "../../contactsListView.constants.ts";
import type { ContactTableColumn } from "../../contactsListView.types.ts";
import {
  CheckboxCell,
  CompanyCell,
  CreatedAtCell,
  EmailCell,
  NameCell,
  PhoneCell,
  TagsCell,
} from "./components/ContactCells.tsx";
import {
  CreatedAtHeader,
  LabelHeader,
  NameHeader,
  SelectAllHeader,
} from "./components/ContactHeaderCells.tsx";

const CHECKBOX: ContactTableColumn = {
  key: CONTACT_TABLE_COLUMN_KEYS.CHECKBOX,
  width: "w-12",
  Header: SelectAllHeader,
  Cell: CheckboxCell,
};

const NAME: ContactTableColumn = {
  key: CONTACT_TABLE_COLUMN_KEYS.NAME,
  width: "w-[17%]",
  Header: NameHeader,
  Cell: NameCell,
};

const EMAIL: ContactTableColumn = {
  key: CONTACT_TABLE_COLUMN_KEYS.EMAIL,
  width: "w-[19%]",
  Header: LabelHeader,
  Cell: EmailCell,
};

const PHONE: ContactTableColumn = {
  key: CONTACT_TABLE_COLUMN_KEYS.PHONE,
  width: "w-[14%]",
  Header: LabelHeader,
  Cell: PhoneCell,
};

const COMPANY: ContactTableColumn = {
  key: CONTACT_TABLE_COLUMN_KEYS.COMPANY,
  width: "w-[17%]",
  Header: LabelHeader,
  Cell: CompanyCell,
};

const TAGS: ContactTableColumn = {
  key: CONTACT_TABLE_COLUMN_KEYS.TAGS,
  width: "w-[20%]",
  Header: LabelHeader,
  Cell: TagsCell,
};

const CREATED_AT: ContactTableColumn = {
  key: CONTACT_TABLE_COLUMN_KEYS.CREATED_AT,
  width: "w-[13%]",
  Header: CreatedAtHeader,
  Cell: CreatedAtCell,
};

export const COLUMNS: readonly ContactTableColumn[] = [
  CHECKBOX,
  NAME,
  EMAIL,
  PHONE,
  COMPANY,
  TAGS,
  CREATED_AT,
];
