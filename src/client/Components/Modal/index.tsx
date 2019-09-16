import isFunction from "lodash/isFunction";
import { cloneElement, Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Modal as SemanticModal, ModalProps } from "semantic-ui-react";

function Modal<TData = undefined>({
  children,
  onClick,
  trigger,
  headerBody: header,
  actionsModal: actions,
  id,
  openOnClick = true,
  defaultData,
  ...rest
}: {
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
   */
  trigger:
    | JSX.Element
    | FC<{
        open: () => void;
        close: () => void;
        setData: Dispatch<SetStateAction<TData | undefined>>;
        data: TData | undefined;
      }>;

  /**
   * Element to render inside the modal
   *
   */
  children:
    | JSX.Element
    | FC<{
        open: () => void;
        close: () => void;
        setData: Dispatch<SetStateAction<TData | undefined>>;
        data: TData | undefined;
      }>;
  /**
   * Optional header inside the modal
   *
   */
  headerBody?:
    | JSX.Element
    | FC<{
        open: () => void;
        close: () => void;
        setData: Dispatch<SetStateAction<TData | undefined>>;
        data: TData | undefined;
      }>;
  /**
   * Optional element to render inside the modal at the bottom, usually for actions buttons
   *
   */
  actionsModal?:
    | JSX.Element
    | FC<{
        open: () => void;
        close: () => void;
        setData: Dispatch<SetStateAction<TData | undefined>>;
        data: TData | undefined;
      }>;

  /**
   * Optional boolean to determine whether to automatically open the modal on
   * click, or to rely on manual "open" callback
   *
   * Default value: true
   *
   * @type {boolean}
   */
  openOnClick?: boolean;

  defaultData?: TData;
} & ModalProps) {
  const [open, setOpen] = useState(false);

  const [data, setData] = useState<TData | undefined>(defaultData);
  useEffect(() => {
    if (id) setOpen(!!JSON.parse(localStorage.getItem(id) || "0"));
  }, [id]);

  useEffect(() => {
    if (id) localStorage.setItem(id, open ? "1" : "0");
  }, [id, open]);

  const helperFunctions = {
    open: () => setOpen(true),
    close: () => setOpen(false),
    setData,
    data,
  };

  return (
    <SemanticModal
      trigger={
        isFunction(trigger)
          ? trigger(helperFunctions)
          : cloneElement(trigger, {
              onClick: () => {
                if (openOnClick) setOpen(true);
                if (onClick) onClick();
              },
            })
      }
      onOpen={() => openOnClick && setOpen(true)}
      onClose={() => setOpen(false)}
      open={open}
      mountNode={document.querySelector("#__next")}
      {...rest}
    >
      {header && (
        <SemanticModal.Header>
          {isFunction(header) ? header(helperFunctions) : header}
        </SemanticModal.Header>
      )}
      <SemanticModal.Content>
        {isFunction(children) ? children(helperFunctions) : children}
      </SemanticModal.Content>
      {actions && (
        <SemanticModal.Actions>
          {isFunction(actions) ? actions(helperFunctions) : actions}
        </SemanticModal.Actions>
      )}
    </SemanticModal>
  );
}

export default Modal;
