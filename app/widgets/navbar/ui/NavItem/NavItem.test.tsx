import { render, screen } from "@testing-library/react";
import { NavigationItem } from "../../model";
import { NavItem } from "./NavItem";
import cls from "../ui/NavItem.module.css";

describe("NavItem.test", () => {
  const mockItem: NavigationItem = {
    href: "/home",
    label: "Home",
    icon: "🏠",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Should render NavItem", () => {
    render(<NavItem item={mockItem} />);

    expect(screen.getByText("🏠")).toBeInTheDocument();
    expect(screen.getByText("🏠")).toHaveClass(cls.NavItem_Icon);
  });

  test("Should not render NavItem", () => {
    render(<NavItem item={mockItem} />);

    const iconElement = screen.queryByTestId("Nav_Item_Icon");
    expect(iconElement).not.toBeInTheDocument();
  });
});
