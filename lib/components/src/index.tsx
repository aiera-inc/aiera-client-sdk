import { FC, ReactElement } from "react";

interface Props {
  name: string;
}

export const HelloWorld: FC<Props> = (props: Props): ReactElement => {
  return <div>Hello {props.name}</div>;
};
