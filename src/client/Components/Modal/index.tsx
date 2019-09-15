import isFunction from "lodash/isFunction";
import React, { cloneElement, FC, FunctionComponent, useEffect, useState } from "react";
import { Modal as SemanticModal, ModalProps } from "semantic-ui-react";

const Modal: FunctionComponent<
  {
    /**
     * Optional ID for persistance on modal open state
     *
     * @type {string}
     */
    id?: string;
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
     */
    children: JSX.Element | FC<{ close: () => void }>;
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
> = ({ children, onClick, trigger, header, actions, id, ...rest }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (id) setOpen(!!JSON.parse(localStorage.getItem(id) || "0"));
  }, [id]);

  useEffect(() => {
    if (id) localStorage.setItem(id, open ? "1" : "0");
  }, [id, open]);

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
      <SemanticModal.Content>
        {isFunction(children)
          ? children({ close: () => setOpen(false) })
          : children}
      </SemanticModal.Content>
      {actions && <SemanticModal.Actions>{actions}</SemanticModal.Actions>}
    </SemanticModal>
  );
};

export default Modal;
