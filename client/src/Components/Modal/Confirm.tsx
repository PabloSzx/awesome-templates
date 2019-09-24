import { cloneElement, useState } from "react";
import { Confirm, ConfirmProps } from "semantic-ui-react";

const ConfirmModal = ({
  children,
  onConfirm,
  ...rest
}: { children: JSX.Element; onConfirm: () => void } & ConfirmProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {cloneElement(children, {
        onClick: function() {
          children.props.onClick && children.props.onClick(...arguments);
          setOpen(true);
        },
      })}
      <Confirm
        {...rest}
        basic
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          onConfirm();
          setOpen(false);
        }}
      />
    </>
  );
};

export default ConfirmModal;
