import { PaginationInfo } from "@/app/shared/types/http";
import { Pagination } from "./Pagination";
import { render } from "@testing-library/react";

jest.mock("./Pagination.module.css", () => ({
  Pagination: "pagination",
  Pagination_Controls: "pagination-controls",
  Pagination_Button: "pagination-button",
  Pagination_Button_Active: "pagination-button-active",
  Pagination_Size: "pagination-size",
  Pagination_Select: "pagination-select",
}));

describe("Pagination.test", () => {
  const mockOnPageChange = jest.fn();
  const mockOnItemsPerPageChange = jest.fn();

  const basePagination: PaginationInfo = {
    currentPage: 3,
    totalPages: 10,
    totalItems: 95,
    hasNext: true,
    hasPrev: true,
    itemsPerPage: 10,
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should rendering...", () => {
    const { container } = render(
      <Pagination
        pagination={{ ...basePagination, totalPages: 1 }}
        onPageChange={mockOnPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test("Should handle undefined className...", () => {
    const { container } = render(
      <Pagination pagination={basePagination} onPageChange={mockOnPageChange} />
    );

    expect(container.firstChild).toHaveClass("pagination");
  });
});
