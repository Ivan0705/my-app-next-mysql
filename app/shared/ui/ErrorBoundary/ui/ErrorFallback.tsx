import cls from "./ErrorFallback.module.css";

export const ErrorFallback = ({ error }: { error?: Error }) => (
  <div className={cls.ErrorFallback}>
    <div className={cls.ErrorFallback_Container}>
      <div>
        <h2 className={cls.ErrorFallback_Title}>Что-то пошло не так</h2>
        <p className={cls.ErrorFallback_Message}>
          Произошла непредвиденная ошибка. Пожалуйста, попробуйте перезагрузить
          страницу.
        </p>
        {error && (
          <details className={cls.ErrorFallback_Details}>
            <summary className={cls.ErrorFallback_Summary}>
              Детали ошибки
            </summary>
            <pre className={cls.ErrorFallback_Pre}>{error.message}</pre>
          </details>
        )}
        <button onClick={() => window.location.reload()}
          className={cls.ErrorFallback_Button}>
          Перезагрузить страницу
        </button>
      </div>
    </div>
  </div>
);
