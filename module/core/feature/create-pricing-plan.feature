Feature: Create pricing plan

  Background:
    Given a successfully registered user with email "john.doe@example.com", with a mentor profile created

  Scenario: Create successfully pricing plan for a specific mentor
    Given the user with email "john.doe@example.com" is logged in
    Given I create a pricing plan for the mentor with these details:
      | title                    | course_type | price_currency | price_amount | rate_type |
      | One hour remote session  | remote      | EUR            | 100          | hourly    |
    Then  the pricing plan should be created for the mentor

  Scenario: Create a pricing for plan for a specific mentor but the mentor does not exist
    Given I create a pricing plan for the mentor with these details:
      | title                    | course_type | price_currency | price_amount | rate_type |
      | One hour remote session  | remote      | EUR            | 100          | hourly    |
    Then  the pricing plan should not be created for the mentor