"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Button from "./Button";

type ModalState =
  | null
  | {
      type: "alert" | "confirm";
      title?: string;
      message: string;
      resolve: (value: any) => void;
    };

type ModalApi = {
  alert: (message: string, opts?: { title?: string }) => Promise<void>;
  confirm: (
    message: string,
    opts?: { title?: string; confirmText?: string; cancelText?: string }
  ) => Promise<boolean>;
};

const ModalContext = createContext<ModalApi | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>(null);
  const [confirmLabels, setConfirmLabels] = useState<{ confirmText: string; cancelText: string }>({
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const alert = useCallback((message: string, opts?: { title?: string }) => {
    return new Promise<void>((resolve) => {
      setState({ type: "alert", title: opts?.title, message, resolve });
    });
  }, []);

  const confirm = useCallback(
    (
      message: string,
      opts?: { title?: string; confirmText?: string; cancelText?: string }
    ) => {
      return new Promise<boolean>((resolve) => {
        setConfirmLabels({
          confirmText: opts?.confirmText || "Confirm",
          cancelText: opts?.cancelText || "Cancel",
        });
        setState({ type: "confirm", title: opts?.title, message, resolve });
      });
    },
    []
  );

  const api = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  const close = () => setState(null);

  const onOk = () => {
    if (!state) return;
    const resolve = state.resolve;
    close();
    resolve(state.type === "confirm" ? true : undefined);
  };

  const onCancel = () => {
    if (!state) return;
    const resolve = state.resolve;
    close();
    resolve(false);
  };

  return (
    <ModalContext.Provider value={api}>
      {children}
      {state && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            {state.title ? (
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {state.title}
              </h2>
            ) : null}
            <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {state.message}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {state.type === "confirm" ? (
                <Button variant="outline" onClick={onCancel}>
                  {confirmLabels.cancelText}
                </Button>
              ) : null}
              <Button onClick={onOk}>
                {state.type === "confirm" ? confirmLabels.confirmText : "OK"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalApi {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return ctx;
}
