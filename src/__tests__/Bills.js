/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  screen,
  waitFor
} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {
  bills
} from "../fixtures/bills.js"
import {
  ROUTES,
  ROUTES_PATH
} from "../constants/routes.js";
import {
  localStorageMock
} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import NewBillUI from "../views/NewBillUI.js";

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee",
  })
);
//triger html by routes
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname
  });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //we just expect class list includes "active-icon"
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills
      })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((new Date(b.date) - new Date(a.date)))
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('When I click on see more icon, I should see img of the bill', () => {
      const store = jest.fn();
      let PREVIOUS_LOCATION = "";
      const bills = new Bills({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store
      });
      // we generate modal mock
      $.fn.modal = jest.fn();
      const seeImgIcon = screen.getAllByTestId("icon-eye")
      const handleClick = jest.fn((e) => {bills.handleClickIconEye(e)});
      seeImgIcon.forEach((icon) => {
        icon.addEventListener("click", handleClick(icon))
      })
      fireEvent.click(seeImgIcon[0])
      //we need to test if handleClick have been called + if "justificatif" is found on the page
      expect(handleClick).toHaveBeenCalled();
      expect(screen.getAllByText("Justificatif")).toBeTruthy();
    })
    test("When I click to add a new bill I should be redirected to new bill url ", () => {
      const store = jest.fn();
      let PREVIOUS_LOCATION = "";
      const bills = new Bills({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store
      });
      const newBillIcon = screen.getByTestId("btn-new-bill")
      const handleClick = jest.fn(bills.handleClickNewBill);
      newBillIcon.addEventListener("click", handleClick)
      fireEvent.click(newBillIcon)
      expect(handleClick).toHaveBeenCalled();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    })

  })

})