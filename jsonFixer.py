#!/bin/bash/python3
import csv
import json

filename = "number-of-internet-users-by-country.csv"

fields = []
rows = []

#Reading in file
with open(filename, 'r') as csvfile:
    csvreader = csv.reader(csvfile)

    fields = next(csvreader)

    for row in csvreader:
        rows.append(row)

#Formatting file
nameDict = {}
valueDict = {}

for row in rows:
    if row[0] not in nameDict.keys():
        nameDict[row[0]] = row[1]
    if row[0] not in valueDict.keys():
        valueDict[row[0]] = {}
    valueDict[row[0]][int(row[2])] = int(row[3])

#Writing to json
json_object1=json.dumps(nameDict, indent=4)
json_object2=json.dumps(valueDict, indent=4)

with open("names.json", "w") as outfile:
    outfile.write(json_object1)

with open("values.json", "w") as outfile:
    outfile.write(json_object2)