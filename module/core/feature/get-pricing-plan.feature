Feature:  Get pricing plan

  Background:
    Given a successfully registered user with email "john.doe@example.com", with a mentor profile created


  Scenario: Get a pricing plan from a mentor
      When I try get a pricing plan from the mentor
      Then I should get the pricing plan

  Scenario: Get multiple pricing plans from a mentor
      When I try to get the pricing plans from the mentor
      Then I should get the two pricing plans

  Scenario: Get pricing plans without providing the identifiers
      When I try get the pricing plans without providing identifiers
      Then I should get an error about getting pricing plans



  Scenario: Get pricing plans for a non-existent mentor
    When I try get the pricing plans for an unregistered mentor
    Then I should get an error about getting pricing plans
