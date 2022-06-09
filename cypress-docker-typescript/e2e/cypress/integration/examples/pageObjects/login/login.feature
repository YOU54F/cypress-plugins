
Feature: Logging In - HTML Web Form - The Internet

Background: 
  Given I have loaded the internet page

  Scenario: Unauthorized
    Given I am a user
    When I enter invalid details
    Then I should be denied access

  Scenario: Authorized
    Given I am a user
    When I enter valid details
    Then I should be granted access   