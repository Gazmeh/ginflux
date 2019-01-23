# OpenLTS (Open Load Test Script) V1.0

## Test plan

Test plan is an special type. There is an example:


	{
		"type" : "TestPlan",
		"version" : "1.0",
		....
	}

the version defines the structure of childrens while the properites defines structure
of test element properties.

## Root element

Test plan is an special type. There is an example:


	{
		"version" : "1.0",
		....
	}

the version defines the structure of childrens.

This specification is:

- version: 1.0

NOTE: Root element type may by one of the valid test elements.

## Why another test script 

JMeter test data is not portable and impossilbe to generate without GUI.

This is an independent test script. 

# Test items

## Abstract test item

	{
		"type": "{element tyep}",
		"enable": "{state of the element}",
		"name": "{element name}"
		"comment": "{element comment}",
		"children":[]
	}

NOTE: there MAY be some addition attributes based on element type.

## Children

Children is list of valid another test elements.



