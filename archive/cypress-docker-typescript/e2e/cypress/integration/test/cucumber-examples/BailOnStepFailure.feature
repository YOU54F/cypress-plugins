Feature: Bail on a step failure

 This is a tricky one because we DO want our tests to fail, but just skip the remaining ones in a scenario.
 Additionally, jest fails here because the internals work different and the trick to skip remaining tests won't work.
 Since there is no logic here, and only change from it() to step() in createTestFromScenario
 I'm not particularly worried about regressions here, so this will just be commented out and we can run it once in a
 while when things around that piece of code change

  As a cucumber cypress plugin
  I want to skip remaining tests of a scenario if previous steps fail
  So the tests run faster and my beloved users get a shorter feedback loop

  Scenario: Running with a failing step
    When I run one successful step
#    And I run another that's unsuccessful
#    Then I don't run the last step