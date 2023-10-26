# Changes Report

1. Test Old Function FunctionItems nodes
  - Modified node names:
    - Function
    - FunctionItem2
    - FunctionItem Return String

2. Test Old Interval 
  - Modified node names:
    - Every 5 seconds
    - Every 10 Minutes
    - Every 15 Hours

3. Test Old Merge 
  - Modified node names:
    - Old Merge Append
    - Old Merge Append10
    - Old Merge keep Key Matches
    - Old Merge By Index
    - Old Merge By Index1
    - Old Merge By Index2
    - Old Merge By Key
    - Old Merge By Key2
    - Old Merge Multiplex
    - Old Merge Pass-Through
    - Old Merge Remove Key Matches
    - Old Merge Wait
    - Old Merge By Key3

4. Test Old Set 
  - Modified node names:
    - Start1
    - Keep Only Set1
    - Set Expression1
    - Set Fixed1
    - Set Dot Notation1

5. Test Old ItemList
  - Modified node names:
    - Concatenate Items
    - Concatenate Items1
    - Concatenate Items2
    - Concatenate Items3
    - Limit
    - Limit1
    - Remove Duplicates
    - Remove Duplicates1
    - Remove Duplicates2
    - Sort
    - Sort1
    - Sort2
    - Sort3
    - Split Out Items
    - Split Out Items1
    - Split Out Items2
    - Summarize
    - Summarize1
    - Summarize2
    - Summarize3
    - Summarize4
    - Summarize5
    - Summarize6
    - Summarize7

6. Test Old Start DateTime Nodes
  - Modified node names:
    - Start
    - Calculate Date
    - MM/DD/YYYY
    - YYYY/MM/DD
    - MMMM DD YYYY
    - MM-DD-YYYY
    - YYYY-MM-DD
    - Unix Timestamp
    - Unix Ms Timestamp

7. Test  Old Http Request 
  - Modified node names:
    - Head
    - Options
    - Patch
    - Put
    - POST
    - GET
    - POST with expresions
    - GET with Expressions
    - Put with Expression
    - Patch with Expressions
    - Head with Expressions
    - Delete1
    - Basic Auth/POST1
    - Delete with Expressions
    - Basic Auth/GET
    - Delete Check Querystring
    - GET /Split into items
    - GET /Ignore Response Code

## TODO

Activate the "Webhook Testing HTTP Node" workflow to test the Http Request node
Check and test all nodes manually in the workflows:
 1. Test Old Function FunctionItems nodes
  - Node names:
    - Function: The node needs to be tested manually. Check the access to the input data and returned format.
    - FunctionItem2: The node needs to be tested manually. Check the access to the input data and the returned format.
    - FunctionItem Return String: The node needs to be tested manually. Check the access to the input data and the returned format.

 2. Test Old ItemList
  - Node names:
    - Summarize: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - Summarize1: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - Summarize2: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - Summarize3: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - Summarize4: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - Summarize5: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - Summarize6: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - Summarize7: Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"

 3. Test Old Start DateTime Nodes
  - Node names:
    - Calculate Date: "Subtract" operation returns +2:00 time zone offset.

 4. Test  Old Http Request 
  - Node names:
    - Head: Request method "HEAD": you will need to manually check the response to ensure it is working as expected.
    - Options: Request method "OPTIONS": you will need to manually check the response to ensure it is working as expected.
    - Head with Expressions: Request method "HEAD": you will need to manually check the response to ensure it is working as expected.
    - GET /Split into items: In the new version of the HTTP node, the "splitIntoItems" options are no longer supported.

