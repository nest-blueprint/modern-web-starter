Feature: Get professional experience

      Background:
        Given a successfully registered user with email "john.doe@example.com", with a mentor profile created



        Scenario: Get a professional experience from the mentor
            When I try to get one of the experience from a mentor
            Then I should get the experience

        Scenario: Get multiple professional experiences from a mentor
        When I try to get the experiences from a mentor
        Then I should get the multiple experiences from the mentor

        Scenario: Get professional experiences without providing the identifiers
          When I try get the experiences without providing identifiers
          Then I should get an error about getting experiences
        
        Scenario: Get professional experiences for a non-existent mentor
        When I try get the experiences for an unregistered mentor
        Then I should get an error about getting experiences