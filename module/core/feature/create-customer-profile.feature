Feature: Create a customer profile

  Scenario: Create successfully customer profile
    Given a user with email "john.doe@example.com", with an auth0 account created,a future customer
    Given the user with email "john.doe@example.com" is logged in
    When I create a customer profile with role "individual"
    Then the customer profile is created successfully

  Scenario: Create a customer profile without being logged in with auth provider
    Given a user with email "john.doe@example.com", with an auth0 account created,a future customer
    When I create a customer profile with role "individual"
    Then the customer profile is not created, the user is not logged in

  Scenario: Create a customer profile, but a customer profile already exists for this user
    Given a successfully registered user with email "john.doe@example.com", with a "individual" customer profile created
    Given the user with email "john.doe@example.com" is logged in
    When I create a customer profile with role "individual"
    Then the customer profile is not created, the user already has a customer profile

  Scenario: Create successfully a user account and a customer profile in the same time
    Given a user with email "john.doe@example.com", with an auth0 account created,a future customer
    Given the user with email "john.doe@example.com" is logged in
    When I create a customer profile with role "individual"
    Then the customer profile is created successfully

  Scenario: Create a customer profile, but the user already has a mentor profile
    Given a successfully registered user with email "john.doe@example.com", with a mentor profile created
    Given the user with email "john.doe@example.com" is logged in
    When I create a customer profile with role "individual"
    Then the customer profile is not created, the user already has a mentor profile

