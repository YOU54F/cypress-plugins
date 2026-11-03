Feature: Being a plugin handling DataTable scenario

  As a cucumber cypress plugin which handles DataTables
  I want to allow people to write DataTable scenarios and run it in cypress

  Scenario: DataTable
    When I add all following numbers:
      | number | another number |
      | 1      | 2              |
      | 3      | 4              |
    Then I verify the datatable result is equal to 10