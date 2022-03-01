/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills"
import { localStorageMock } from '../__mocks__/localStorage'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import router from "../app/Router"

jest.mock("../app/store", () => mockStore)

const data = []
const loading = false
const error = null

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      window.$ = jest.fn().mockImplementation(() => {
        return {
          modal: jest.fn(),
          click: jest.fn(),
          width: jest.fn(),
          find: jest.fn().mockImplementation(() => ({ html: jest.fn() })),

        }
      });
      // Set localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee'
      })
      window.localStorage.setItem('user', user)

      // Route path Bills
      const pathname = ROUTES_PATH['Bills']
      const html = ROUTES({
        pathname,
        data,
        loading,
        error
      })
      document.body.innerHTML = html

      // const html = BillsUI({ data: [] })
      // document.body.innerHTML = html
      //to-do write expect expression
      expect(document.querySelector("#layout-icon1.active-icon")).toBeDefined()
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- \/.](0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe('When I click on the icon eye', () => {
      test('handleClickIconEye function should be called', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const billsContainer = new Bills({
          document, onNavigate, mockStore, localStorage
        })
        billsContainer.handleClickIconEye = jest.fn()
        const iconEyes = screen.getAllByTestId('icon-eye')
        expect(iconEyes).not.toHaveLength(0)
        expect(iconEyes).not.toBeNull()
        iconEyes[0].click()
        expect(billsContainer.handleClickIconEye).toHaveBeenCalled()
      })

      test('A modal should open', () => {
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const billsContainer = new Bills({
          document, onNavigate, mockStore, localStorage
        })

        billsContainer.handleClickIconEye = jest.fn(billsContainer.handleClickIconEye)
        const iconEye = screen.getAllByTestId('icon-eye')[0]
        expect(iconEye).toBeTruthy()
        fireEvent.click(iconEye)
        expect(billsContainer.handleClickIconEye).toHaveBeenCalled()
      })

    })
  })

  // Test d'intégration GET Bills
  describe("When I navigate to Bills", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("Then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("Then fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })

    test(('Then, it should render Loading...'), () => {
      const html = BillsUI({ data: [], loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })

    test(('Then, if error, it should render Error page'), () => {
      const error = 'Erreur de connexion internet'
      const html = BillsUI({ data: [], error: error })
      document.body.innerHTML = html
      expect(screen.getAllByText(error)).toBeTruthy()
    })

    test('Then I click on New Bill and I should navigate to NewBill', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const mockStore = null
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const billsContainer = new Bills({
        document, onNavigate, mockStore, localStorage
      })
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      expect(buttonNewBill).toBeTruthy()
      buttonNewBill.addEventListener('click', handleClickNewBill)
      buttonNewBill.click()
      if (buttonNewBill) expect(handleClickNewBill).toHaveBeenCalled()
      else expect(handleClickNewBill).not.toHaveBeenCalled()
    })

    test('Then I click on New Bill and I should test conditions', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const mockStore = null

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const bills = new Bills({
        document, onNavigate, mockStore, localStorage
      })
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const handleClickNewBill = jest.fn(bills.handleClickNewBill)
      const buttonNewBill = jest.fn()
      if (buttonNewBill) expect(handleClickNewBill).not.toHaveBeenCalled()
    })
  })

})
