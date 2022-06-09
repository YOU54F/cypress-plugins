Feature: Being a plugin

  As a cucumber cypress plugin
  I want to allow people to use gherkin syntax in cypress tests
  So they can create beautiful executable specification for their projects

  Scenario: Basic example
    Given a feature and a matching step definition file
    When I run cypress tests
    Then they run properly