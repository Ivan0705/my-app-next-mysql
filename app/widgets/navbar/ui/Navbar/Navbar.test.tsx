import { render, screen } from "@testing-library/react";
import { NavigationItem } from "../../model";
import { Navbar } from "./Navbar";

jest.mock("@/app/providers/navigator-provider", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUseNavigation =
  require("@/app/providers/navigator-provider").useNavigation;
const mockUsePathname = require("next/navigation").usePathname;

describe("Navbar.test", () => {
  const mockItems: NavigationItem[] = [
    { href: "/home", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const mockGetActiveItem = jest.fn();

  beforeEach(() => {
    mockUseNavigation.mockReturnValue({
      items: mockItems,
      getActiveItem: mockGetActiveItem,
    });

    mockUsePathname.mockReturnValue("/home");
    mockGetActiveItem.mockReturnValue(mockItems[0]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should render Navbar with mockItems", () => {
    render(<Navbar items={mockItems} />);

    mockItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });

    mockItems.forEach((item) => {
      expect(item.href).toEqual(item.href);
    });
  });

  it("Should call usePathname hook", () => {
    render(<Navbar items={mockItems} />);

    expect(mockUsePathname).toHaveBeenCalled();
  });
});
