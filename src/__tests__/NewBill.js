/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  screen
} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js";
import {
  localStorageMock
} from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import mockStore from "../__mocks__/store"
import {
  ROUTES,
} from "../constants/routes.js";
import Router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)
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
let newBills
const bill = {
  id: "47qAXb6fIm2zOKkLzMro",
  vat: "80",
  status: "pending",
  type: "Hôtel et logement",
  commentary: "séminaire billed",
  name: "encore",
  date: "2004-04-04",
  amount: 400,
  commentAdmin: "ok",
  email: "a@a",
  pct: 20
}
function generateNewBillPage() {
  const html = NewBillUI()
  document.body.innerHTML = html
  const PREVIOUS_LOCATION = ""
  newBills = new NewBill({
    document,
    localStorage: window.localStorage,
    onNavigate,
    PREVIOUS_LOCATION,
    store: store
  });

}
function getFakeFile(format) {
  return {
    target: {
      files: [new File(['test.' + format], 'test.' + format, {
        type: 'image/' + format
      })],
    }
  }
}

function doFailedQuery(error) {
  mockStore.bills.mockImplementationOnce(() => {
    return {
      update: () => {
        return Promise.reject(new Error(error))
      }
    }
  })
  const htmlWithError = BillsUI({error})
  document.body.innerHTML = htmlWithError
  // await new Promise(process.nextTick);
  let message = screen.getByText(error)
  expect(message).toBeTruthy()
}
/**
 * @description update DOM to set many values needed by the new bill form
 * @param {boolean} needToBeValid determine if it's sending invalid file or not
 */
function updateDomToCreateBills(needToBeValid) {
  const type = screen.getByTestId("expense-type")
  type.value = bill.type
  const name = screen.getByTestId("expense-name")
  name.value = bill.name
  const amount = screen.getByTestId("amount")
  amount.value = bill.value
  const date = screen.getByTestId("datepicker")
  date.value = bill.date
  const vat = screen.getByTestId("vat")
  vat.value = bill.vat
  const pct = screen.getByTestId("pct")
  pct.value = bill.pct
  const file = screen.getByTestId("file")
  const handleChange = jest.fn((e) => {
    newBills.handleChangeFile(e)
  });
  file.addEventListener("change", (e) => handleChange(e))
  //Launch event
  fireEvent.change(file, getFakeFile(needToBeValid ? "jpg" : "mp4"));
}
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I fill the form", () => {

      describe("When I add a new VALID file", () => {
        beforeEach(() => {
          generateNewBillPage()
        })
        test("Then it (file input) should be updated", () => {
          const submit = screen.getAllByTestId("file")
          const handleChange = jest.fn((e) => {
            newBills.handleChangeFile(e)
          });
          submit.forEach((btn) => {
            btn.addEventListener("change", (e) => handleChange(e))
          })
          fireEvent.change(submit[0], getFakeFile("jpg"));
          expect(handleChange).toHaveBeenCalled();
          //do we have got a file with name "test.jpg" ? Hell yes!
          expect(submit[0].files.filter((f) => f.name === "test.jpg").length > 0).toBeTruthy()

        })
      })

      describe("When I add a new INVALID file", () => {
        beforeEach(() => {
          generateNewBillPage()
        })
        test("Then it (file input) should not be updated and files array should not contain it", () => {
          const submit = screen.getAllByTestId("file")
          const handleChange = jest.fn((e) => {
            newBills.handleChangeFile(e)
          });
          submit.forEach((btn) => {
            btn.addEventListener("change", (e) => handleChange(e))
          })

          fireEvent.change(submit[0], getFakeFile("mp4"));
          expect(handleChange).toHaveBeenCalled();
          //do we have got a file with name "test.jpg" ? Please, no !
          expect(submit[0].files.filter((f) => f.name === "test.jpg").length > 0).toBeFalsy()
        })
      })

      describe("When I submit the form with valid data", () => {
        beforeEach(() => {
          generateNewBillPage()

        })
        test("Then we should be redirected to the bill list and the POST query should be successfull", () => {
          //checking if we've got the valid html
          expect(screen.getAllByText("Type de dépense")).toBeTruthy()
          //handling submit 
          const submit = [...screen.getAllByTestId("form-new-bill")]
          const handleClick = jest.fn((e) => {
            newBills.handleSubmit(e)
          });
          submit.forEach((btn) => {
            btn.addEventListener("submit", (e) => handleClick(e))
          })

          //formating & updating data
          updateDomToCreateBills(true)

          fireEvent.submit(submit[0])
          expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
        })
        
      })

      describe("When I submit the form with valid data but the API query fail", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
            window,
            'localStorage', {
              value: localStorageMock
            }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "a@a"
          }))
          const root = document.createElement("div")
          root.setAttribute("id", "root")

          document.body.appendChild(root)
          Router()
          
        })
        test("update bills from an API and fails with 404 message error", async () => {

          doFailedQuery("Erreur 404")
        })

        test("update bills from an API and fails with 500 message error", async () => {

          doFailedQuery("Erreur 500")
        })
      })

      describe("When I submit the form with invalid data", () => {
        beforeEach(() => {
          generateNewBillPage()
        })
        test("Then we should stay at the same page and not be redirected", () => {
          //checking if we've got the valid html
          expect(screen.getAllByText("Type de dépense")).toBeTruthy()
          //handling submit 
          const submit = screen.getAllByTestId("form-new-bill")
          const handleClick = jest.fn((e) => {
            newBills.handleSubmit(e)
          });
          submit.forEach((btn) => {
            btn.addEventListener("submit", (e) => handleClick(e))
          })

          //formating & updating data
          updateDomToCreateBills(false)

          fireEvent.submit(submit[0])
          expect(screen.getByText("Type de dépense")).toBeTruthy()
        })
      })
    })
  })
})