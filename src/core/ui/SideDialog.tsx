'use client';

import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { DialogTrigger } from '~/core/ui/Dialog';
import If from '~/core/ui/If';

interface BaseSideDialogProps {
  modal?: boolean;
}

type ControlledSideDialogProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

type UncontrolledSideDialogProps = {
  Trigger: React.ReactNode;
}

type SideDialogProps = (ControlledSideDialogProps | UncontrolledSideDialogProps) & BaseSideDialogProps;

function SideDialog(
  props: React.PropsWithChildren<SideDialogProps>,
) {
  const isControlled = 'open' in props;
  const Trigger = ('Trigger' in props && props.Trigger) || null;

  const DialogWrapper = (wrapperProps: React.PropsWithChildren) =>
    isControlled ? (
      <Dialog
        open={props.open}
        onOpenChange={(open) => {
          if (!open) {
            props.onOpenChange(false);
          }
        }}
      >
        {wrapperProps.children}
      </Dialog>
    ) : (
      <Dialog>{wrapperProps.children}</Dialog>
    );

  return (
    <DialogWrapper>
      <If condition={Trigger}>
        <DialogTrigger asChild>{Trigger}</DialogTrigger>
      </If>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={
          'h-screen fixed right-0 w-full xl:w-[50%] bg-background' +
          ' border z-50 shadow-2xl rounded-l-lg' +
          ' top-0 outline-none animate-in fade-in zoom-in-90' +
          ' slide-in-from-right-64 p-6 duration-800 dark:shadow-primary/40'
        }
      >
        {props.children}
      </DialogContent>
    </DialogWrapper>
  );
}

export default SideDialog;
