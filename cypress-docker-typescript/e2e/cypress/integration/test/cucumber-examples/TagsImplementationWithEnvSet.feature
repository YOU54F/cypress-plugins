@test-tag
Feature: Tags Implementation with environmental variables set

  As a cucumber cypress plugin which handles Tags
  I want to allow people set any tags via CLI
  And run only tests selected by given tags

  @ignore-tag
  Scenario: This scenario should not run if @ignore-tag is present in env
    Given 'not @ignore-tag' is in current TAGS environmental variable
    Then this should not run

  Scenario: This scenario should run
    Given '@test-tag' is in current TAGS environmental variable
    Then this should run

  @this-tag-affects-nothing
  Scenario: This scenario should also run
    Given '@test-tag' is in current TAGS environmental variable
    Then this should run
