"use client";

import { useElectron } from "@/app/hooks/electron/use-electron";
import cls from "./Header.module.css";

interface HeaderProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export const Header = (props: HeaderProps) => {
  const { onMenuToggle } = props;

  const { isElectron, isLoading } = useElectron();

  return (
    <header className={cls.Header}>
      <div className={cls.Header_Container}>
        <div className={cls.Header_Logo}>
          <div aria-label="Home page">
            TypeSQL Converter
            {isElectron && !isLoading && (
              <span className={cls.Header_Desktop}>Desktop</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
