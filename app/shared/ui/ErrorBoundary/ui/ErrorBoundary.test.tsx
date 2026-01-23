import { render, screen } from "@testing-library/react";
import { GoodComponent, ThrowError } from "./ComponentsForTestings";
import { ErrorBoundary } from "./ErrorBoundary";
import { TestErrorComponent } from "./TestErrorComponent";

describe("ErrorBoundary.test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("Render children with not error", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Everything works fine")).toBeInTheDocument();
  });

  test("Render children with  error", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Что-то пошло не так")).toBeInTheDocument();
  });

  test("Render children with TestErrorComponent", () => {
    render(
      <ErrorBoundary>
        <TestErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Вызвать ошибку")).toBeInTheDocument();
  });

  test("Render children with null", () => {
    render(<ErrorBoundary>{null}</ErrorBoundary>);
  });
});
