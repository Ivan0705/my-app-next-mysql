import cls from "./Footer.module.css";

export const Footer = () => {
  return (
    <footer className={cls.Footer}>
      <div className={cls.Footer_Container}>
        <div className={cls.Footer_Section}></div>
      </div>
      <div>
        <div className={cls.Footer_Bottom}>
          <p>
            &copy; 2025 TypeSQL Converter. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
