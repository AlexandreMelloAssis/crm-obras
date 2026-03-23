"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/common/ConfirmDialog";

type ConfirmRequest = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
};

type ConfirmState = ConfirmRequest & {
  open: boolean;
};

const initialState: ConfirmState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
  tone: "default",
  onConfirm: () => undefined,
};

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState>(initialState);

  const closeDialog = () => {
    setState(initialState);
  };

  const requestConfirmation = (request: ConfirmRequest) => {
    setState({
      open: true,
      confirmLabel: "Confirmar",
      cancelLabel: "Cancelar",
      tone: "default",
      ...request,
    });
  };

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      tone={state.tone}
      onCancel={closeDialog}
      onConfirm={() => {
        state.onConfirm();
        closeDialog();
      }}
    />
  );

  return {
    requestConfirmation,
    closeDialog,
    dialog,
  };
}
