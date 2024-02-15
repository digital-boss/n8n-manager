# Changes Report

1. Test ItemList Conv t.v. 1 to 3
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

2. Test ItemList Conv t.v. 3 new types
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

3. Test Old Function FunctionItems nodes
  - Modified node names:
    - Function
    - FunctionItem2
    - FunctionItem Return String

4. Test Old Http Request Node
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
    - Delete with Expressions
    - Delete Check Querystring
    - GET /Split into items
    - GET /Ignore Response Code

5. Test Old If Node
  - Modified node names:
    - Start1
    - IF
    - IF1
    - IF2
    - IF3
    - IF4
    - IF5
    - IF6
    - IF7
    - IF8
    - IF9
    - IF10
    - IF11
    - IF12
    - IF13
    - IF14
    - IF15
    - IF16
    - IF17
    - IF18
    - IF19
    - IF20
    - IF21
    - IF22
    - IF23

6. Test Old Interval Node
  - Modified node names:
    - Every 5 seconds
    - Every 10 Minutes
    - Every 15 Hours

7. Test Old Merge Node
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

8. Test Old Start DateTime Nodes
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

9. Test Set Node Conv t.v.1 to 3
  - Modified node names:
    - Start1
    - Keep Only Set1
    - Set Expression1
    - Set Fixed1
    - Set Dot Notation1

10. Test Switch Node Conv t.v2 to 3
  - Modified node names:
    - Switch7

11. Test Switch Node conv t.v1 to 2
  - Modified node names:
    - Switch2
    - Switch
    - Switch3
    - Switch1
    - Switch4
    - Switch5
    - Switch7

## TODO

Activate the "Webhook Testing HTTP Node" workflow to test the Http Request node
Check and test all nodes manually in the workflows:
1. Test_ItemList_Conv t.v. 1 to 3
  - Node names
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"
    - [itemLists] Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"

2. Test_Old_Function_FunctionItems_nodes
  - Node names
    - [code] The node needs to be tested manually. Check the access to the input data and returned format.
    - [code] The node needs to be tested manually. Check the access to the input data and the returned format.
    - [code] The node needs to be tested manually. Check the access to the input data and the returned format.

3. Test_Old_Http_Request_Node
  - Node names
    - [httpRequest] Request method "HEAD": you will need to manually check the response to ensure it is working as expected.
    - [httpRequest] Request method "OPTIONS": you will need to manually check the response to ensure it is working as expected.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] Request method "HEAD": you will need to manually check the response to ensure it is working as expected.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.
    - [httpRequest] The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.

4. Test_Old_If_Node
  - Node names
    - [if] New node version only supports DateTime values in the format YYYY-MM-DD (e.g., "2022-09-08"). Please ensure your configurations adhere to this format.
    - [if] New node version only supports DateTime values in the format YYYY-MM-DD (e.g., "2022-09-08"). Please ensure your configurations adhere to this format.

5. Test_Old_Start_DateTime_Nodes
  - Node names
    - [dateTime] "Subtract" operation returns +2:00 time zone offset.

6. Test_Switch_Node_Conv t.v2 to 3
  - Node names
    - [switch] New node version only supports DateTime values in the format YYYY-MM-DD (e.g., "2022-09-08"). Please ensure your configurations adhere to this format.

