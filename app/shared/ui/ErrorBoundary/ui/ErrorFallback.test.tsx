import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorFallback } from "./ErrorFallback";

const originalLocation = window.location;
describe("ErrorFallback.test", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    delete (window as any).location;
    (window as any) = {
      ...originalLocation,
      reload: jest.fn(),
    };
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    jest.clearAllMocks();
  });

  test("Reload page on refresh button click", () => {
    const reloadMock = jest.fn();

    const obj = {};
    Object.defineProperty(obj, "location", {
      value: { reload: reloadMock },
      writable: true,
    });

    render(<ErrorFallback />);
    fireEvent.click(screen.getByText("Перезагрузить страницу"));

    expect(reloadMock).toHaveBeenCalledTimes(0);
  });
});
