import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import { login } from '../pageObjects/login.page'; 

Given('I have loaded the internet page', () => {
  login.visit()
})

// tslint:disable-next-line: no-empty
Given('I am a user', () => {
})


When('I enter invalid details', () => {
  login.username.type('invalidUser')
  login.password.type('invalidPassword{enter}')
})


Then('I should be denied access', () => {
  login.errorMsg.contains('Your username is invalid!')
  login.logOutButton.should('not.exist')
})
  

When('I enter valid details', () => {
  login.username.type('tomsmith')
  login.password.type('SuperSecretPassword!{enter}')
})

Then('I should be granted access', () => {
  login.successMsg.contains('You logged into a secure area!')
  login.logOutButton.should('exist')
})