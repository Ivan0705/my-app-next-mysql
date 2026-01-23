import { render } from "@testing-library/react";
import { Footer } from "./Footer";
import cls from "../ui/Footer.module.css";

describe("Footer.test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should render Footer successfully", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("footer");
    const sectionDiv = container.querySelector(`.${cls.Footer_Section}`);

    expect(footer).toHaveClass(cls.Footer);
    expect(sectionDiv).toHaveClass(cls.Footer_Section);
  });
});
