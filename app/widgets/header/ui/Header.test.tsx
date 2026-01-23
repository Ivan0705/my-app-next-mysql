import { render } from "@testing-library/react";
import { Header } from "./Header";
import cls from "../ui/Header.module.css";

describe("Header.test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should render Header successfully", () => {
    const { container } = render(<Header />);

    const header = container.querySelector("header");
    const containerDiv = container.querySelector(`.${cls.Header_Container}`);

    expect(header).toHaveClass(cls.Header);
    expect(containerDiv).toHaveClass(cls.Header_Container);
  });
});
