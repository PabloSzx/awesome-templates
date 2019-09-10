import React, { cloneElement, FunctionComponent, useState } from "react";
import { Modal as SemanticModal, ModalProps } from "semantic-ui-react";

const Modal: FunctionComponent<
  {
    /**
     * Secondary effect after click on trigger element
     *
     */
    onClick?: () => void;
    /**
     * Trigger element to render, should be somewhat clickable
     *
     * @type {JSX.Element}
     */
    trigger: JSX.Element;
    /**
     * Element to render inside the modal
     *
     * @type {JSX.Element}
     */
    children: JSX.Element;
    /**
     * Optional header inside the modal
     *
     * @type {JSX.Element}
     */
    header?: JSX.Element;
    /**
     * Optional element to render inside the modal at the bottom, usually for actions buttons
     *
     * @type {JSX.Element}
     */
    actions?: JSX.Element;
  } & ModalProps
> = ({ children, onClick, trigger, header, actions, ...rest }) => {
  const [open, setOpen] = useState(false);

  return (
    <SemanticModal
      trigger={cloneElement(trigger, {
        onClick: () => {
          setOpen(true);
          if (onClick) onClick();
        },
      })}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      open={open}
      {...rest}
    >
      {header && <SemanticModal.Header>{header}</SemanticModal.Header>}
      <SemanticModal.Content>{children}</SemanticModal.Content>
      {actions && <SemanticModal.Actions>{actions}</SemanticModal.Actions>}
    </SemanticModal>
  );
};

export default Modal;
