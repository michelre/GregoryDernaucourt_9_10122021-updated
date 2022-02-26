/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from '../__mocks__/localStorage'
import { ROUTES } from "../constants/routes"
import '../css/bills.css';


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I should be able to send a file", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'cedric.hiely@billed.com'
      }))
      const storage = window.localStorage
      const store = {
        bills: jest.fn()
      }

      const newbill = new NewBill({ document, onNavigate, store, storage })
      const handleChangeFile = jest.fn(newbill.handleChangeFile)
      const fileInput = screen.getByTestId('file')

      const inputData = {
        name: 'jane-roe.jpg',
        _lastModified: 1580400631732,
        get lastModified() {
          return this._lastModified
        },
        set lastModified(value) {
          this._lastModified = value
        },
        size: 703786,
        type: 'image/jpeg'
      }
      const file = screen.getByTestId('file')
      fileInput.addEventListener("change", handleChangeFile)
      fireEvent.change(file, { target: { files: [inputData] } })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(firestore.storage.put).toHaveBeenCalled()
    })

    test('Then I should submit', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'cedric.hiely@billed.com'
      }))
      const storage = window.localStorage
      const store = null
      const newbill = new NewBill({ document, onNavigate, store, storage })
      const handleSubmit = jest.fn(newbill.handleSubmit)
      const formNewBill = screen.getByTestId("form-new-bill")
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toHaveBeenCalled()

    })
  })
})
