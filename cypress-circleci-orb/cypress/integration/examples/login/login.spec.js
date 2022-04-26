
import { login } from '../../../support/pageObjects/login.page'; 

describe('Logging In - HTML Web Form - The Internet', () => {
  context('Unauthorized', () => {
    it('User denied access with invalid details', () => {
      login.visit()
      login.username.type('invalidUser')
      login.password.type('invalidPassword{enter}')
      login.errorMsg.contains('Your username is invalid!')
      login.logOutButton.should('not.exist')
    })
    it('User granted access with valid details', () => {
      login.visit()
      login.username.type('tomsmith')
      login.password.type('SuperSecretPassword!{enter}')
      login.successMsg.contains('You logged into a secure area!')
      login.logOutButton.should('exist')
    })
  })
})
