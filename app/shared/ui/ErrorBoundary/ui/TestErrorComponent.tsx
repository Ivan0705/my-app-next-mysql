import { useState } from "react";

export const TestErrorComponent = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("Тестовая ошибка для демонстрации ErrorBoundary!");
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Тест ErrorBoundary</h2>
      <button
        onClick={() => setShouldError(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Вызвать ошибку
      </button>
      <p className="mt-4 text-gray-600">
        Нажмите кнопку чтобы увидеть ErrorBoundary в действии
      </p>
    </div>
  );
};
