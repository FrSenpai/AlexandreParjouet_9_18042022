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
import Bills from "../containers/Bills.js";
import store from "../__mocks__/store.js";
import fakeStore from "../__mocks__/fakeStore.js";

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee",
  })
);
//trigger html by routes
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname
  });
};
let billsClass
let fakeBillsClass

function doFailedQuery(error) {
  store.bills.mockImplementationOnce(() => {
    return {
      list: () => {
        return Promise.reject(new Error(error))
      }
    }
  })
  const htmlWithError = BillsUI({
    error
  })
  document.body.innerHTML = htmlWithError
  // await new Promise(process.nextTick);
  let message = screen.getByText(error)
  return expect(message).toBeTruthy()
}

beforeEach(() => {

  let PREVIOUS_LOCATION = "";
  billsClass = new Bills({
    document,
    localStorage: window.localStorage,
    onNavigate,
    PREVIOUS_LOCATION,
    store
  });

  fakeBillsClass = new Bills({
    document,
    localStorage: window.localStorage,
    onNavigate,
    PREVIOUS_LOCATION,
    store: fakeStore
  });
})

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
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
    describe("When we need to display bills list", () => {
      test("Bills should be fetched (GET) and displayed", async () => {
        onNavigate(ROUTES_PATH.Bills)
        const title = await waitFor(() => screen.getByText("Mes notes de frais"))
        const billsFromGetter = await billsClass.getBills() //we know the length will be 4
        expect(title).toBeTruthy()
        expect(billsFromGetter).toHaveLength(4)
      })
      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(store, "bills") //used to know if something used it
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
          doFailedQuery("Erreur 404")
        })

        test("fetches messages from an API and fails with 500 message error", async () => {
          doFailedQuery("Erreur 500")
        })
      })

    })
  })
  test("Then bills should be ordered from earliest to latest", () => {
    document.body.innerHTML = BillsUI({
      data: bills
    })
    const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    const antiChrono = (a, b) => ((new Date(b.date) - new Date(a.date)))
    const datesSorted = [...dates].sort(antiChrono)
    const billsSorted = [...billsClass.getSortedBills(bills)].sort(antiChrono)
    expect(billsClass.getSortedBills(bills)).toEqual(billsSorted)
    expect(dates).toEqual(datesSorted)
  })
  test('When I click on see more icon, I should see img of the bill', () => {

    // we generate modal mock
    $.fn.modal = jest.fn();
    const seeImgIcon = [...screen.getAllByTestId("icon-eye")]
    const handleClick = jest.fn((e) => {
      billsClass.handleClickIconEye(e)
    });
    seeImgIcon.forEach((icon) => {
      icon.addEventListener("click", handleClick(icon))
    })
    fireEvent.click(seeImgIcon[0])
    //we need to test if handleClick have been called + if "justificatif" is found on the page
    expect(handleClick).toHaveBeenCalled();
    expect(screen.getAllByText("Justificatif")).toBeTruthy();
  })
  test("When I click to add a new bill I should be redirected to new bill url", () => {
    const newBillIcon = screen.getByTestId("btn-new-bill")
    const handleClick = jest.fn(billsClass.handleClickNewBill);
    newBillIcon.addEventListener("click", handleClick)
    fireEvent.click(newBillIcon)
    expect(handleClick).toHaveBeenCalled();
    expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
  })

})