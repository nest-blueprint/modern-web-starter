Feature: Create a mentor profile

  Scenario: Create a mentor profile without providing skills
    Given a user with email "john.doe@example.com", with an auth0 account created,a future mentor
    Given the user with email "john.doe@example.com" is logged in
    When  I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      | fr,en     |          | Java Mentor    | I am a mentor       | full_time         | remote      | John      | Doe      | J.Doe    | true             | true                  | true          | true                 | true             | true                       |    true         |                |                  |
    Then the mentor profile is not created, because the skills are not provided

  Scenario: Create a mentor profile successfully
    Given a user with email "john.doe@example.com", with an auth0 account created,a future mentor
    Given the user with email "john.doe@example.com" is logged in
    When  I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      | fr,en     | java,c#  | Java Mentor    | I am a mentor       | full_time         | remote      | John      | Doe      | J.Doe    | true             | true                  | true          | true                 | true             | true                       |    true         |                |                  |
    Then the mentor profile is successfully saved

  Scenario: Create a mentor profile, but a customer profile already exists for the user
    Given a successfully registered user with email "john.doe@example.com", with a "individual" customer profile created
    Given the user with email "john.doe@example.com" is logged in
    When  I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      | fr,en     | java,c#  | Java Mentor    | I am a mentor       | full_time         | remote      | John      | Doe      | J.Doe    | true             | true                  | true          | true                 | true             | true                       |    true         |                |                  |
    Then the mentor profile is not created, because a customer profile already exists for the user

  Scenario: Create a mentor profile, but a mentor profile already exists for the user
    Given a successfully registered user with email "john.doe@example.com", with a mentor profile created
    Given the user with email "john.doe@example.com" is logged in
    When  I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      | fr,en     | java,c#  | Java Mentor    | I am a mentor       | full_time         | remote      | John      | Doe      | J.Doe    | true             | true                  | true          | true                 | true             | true                       |    true         |                |                  |
    Then the mentor profile is not created, the user already has a mentor profile

  Scenario: Create a mentor profile, but the user is not logged in
    Given a user with email "john.doe@example.com", with an auth0 account created,a future mentor
    When  I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      | fr,en     | java,c#  | Java Mentor    | I am a mentor       | full_time         | remote      | John      | Doe      | J.Doe    | true             | true                  | true          | true                 | true             | true                       |    true         |                |                  |
    Then the mentor profile is not created, the user is not logged in

  Scenario: Create a mentor profile without providing spoken languages
    Given a user with email "john.doe@example.com", with an auth0 account created,a future mentor
    Given the user with email "john.doe@example.com" is logged in
    When  I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      |           | java,c#  | Java Mentor    | I am a mentor       | full_time         | remote      | John      | Doe      | J.Doe    | true             | true                  | true          | true                 | true             | true                       |    true         |                |                  |
    Then the mentor profile is not created, because the languages are not provided

  Scenario: Create a mentor profile without providing availability type
    Given a user with email "john.doe@example.com", with an auth0 account created,a future mentor
    Given the user with email "john.doe@example.com" is logged in
    When  I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      | fr,en     | java,c#  | Java Mentor    | I am a mentor       |                   | remote      | John      | Doe      | J.Doe    | true             | true                  | true          | true                 | true             | true                       |    true         |                |                  |
    Then the mentor profile is not created, because the availability type is not provided

  Scenario: Create a mentor profile without providing and setting one contact information: email,phone,linkedin
    Given a user with email "john.doe@example.com", with an auth0 account created,a future mentor
    Given the user with email "john.doe@example.com" is logged in
    When I create a mentor profile for the user, using default profile settings with these details:
      | languages | skills   | profile_title  | profile_description | availability_type | course_type | firstname | lastname | nickname | display_nickname | display_profile_photo | display_email | display_phone_number | display_linkedin | display_current_job_title | display_location | experience_ids | pricing_plan_ids |
      | fr,en     | java,c#  | Java Mentor    | I am a mentor       | full_time         | remote      | John      | Doe      | J.Doe    | true             | true                  | false         | false                | false            | true                       |    false        |                |                  |
    Then the mentor profile is not created, because at least one of some required fields has to be displayed on his profile
