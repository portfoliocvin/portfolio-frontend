import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the portfolio homepage", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /i build modern web applications/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /build your portfolio/i }),
  ).toHaveAttribute("href", "/customer/register");
});
