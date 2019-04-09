Feature: Being a plugin handling DocString scenario

  As a cucumber cypress plugin which handles DocString
  I want to allow people to write DocString scenarios and run it in cypress

  Scenario: DocString
    When I use DocString for code like this:
    """
    expect(true).to.equal(true)
    variableToVerify = "hello world"
    """
    Then I ran it and verify that it executes it