Feature: Create professional experience

  Background:
    Given a successfully registered user with email "john.doe@example.com", with a mentor profile created


  Scenario: Create successfully a professional experience
    Given the user with email "john.doe@example.com" is logged in
    Given I create a professional experience for the mentor with these details:
      | title       | company  | start_date               | end_date                  |
      | Developer  | SageCom  | 2014-06-15T00:00:00+02:00 | 2015-09-25T00:00:00+02:00 |
    Then I should see the professional experience created successfully

  Scenario: Create a professional experience that is overlapping with a previous one
    Given the user with email "john.doe@example.com" is logged in
    Given I create a professional experience for the mentor with these details:
      | title       | company  | start_date               | end_date                  |
      | Developer  | SageCom  | 2014-06-15T00:00:00+02:00 | 2015-09-25T00:00:00+02:00 |
    Then I should see the professional experience created successfully
    When I create a professional experience for the mentor with these details:
      | title       | company  | start_date               | end_date                  |
      | Developer  | SageCom  | 2014-06-15T00:00:00+02:00 | 2015-09-25T00:00:00+02:00 |
    Then the professional experience should not be created

  Scenario: Create a professional experience for a mentor that does not exist:
    Given I create a professional experience for the mentor with these details:
      | title       | company  | start_date               | end_date                  |
      | Developer  | SageCom  | 2014-06-15T00:00:00+02:00 | 2015-09-25T00:00:00+02:00 |
    Then the professional experience should not be created



