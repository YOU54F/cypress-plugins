Feature: Test for using 'this' keyword in step definitions

  Scenario: Keyword 'this' test with a classic function

    When I assign a variable to 'this' object
    Then 'this' object contains the given value
