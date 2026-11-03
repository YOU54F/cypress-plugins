Feature: Background Section

  As a cucumber cypress plugin which handles Background Section
  I want to allow people to write Background Section tests and run it in cypress

  Background:
    Given counter is incremented

  Scenario: Basic example #1
    Then counter equals 1

  Scenario: Basic example #2
    Then counter equals 2
