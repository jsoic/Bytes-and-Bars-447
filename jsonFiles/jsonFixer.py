#!/bin/bash/python3
import csv
import json



fields = []
rows = []

def readingInFile(filename, JSONfilename):
    #Reading in file
    with open(filename, 'r') as csvfile:
        csvreader = csv.reader(csvfile)

        fields = next(csvreader)

        for row in csvreader:
            rows.append(row)

    #Formatting file
    valueDict = {}

    for row in rows:
        if row[1] not in valueDict.keys():
            valueDict[row[1]] = {}
        valueDict[row[1]][int(row[2])] = float(row[3])

    #Writing to json
    json_object=json.dumps(valueDict, indent=4)

    with open(JSONfilename, "w") as outfile:
        outfile.write(json_object)




######### Internet Usage Data #########
# readingInFile("number-of-internet-users-by-country.csv")

# #Formatting file
# nameDict = {}
# valueDict = {}

# for row in rows:
#     if row[0] not in nameDict.keys():
#         nameDict[row[0]] = row[1]
#     if row[0] not in valueDict.keys():
#         valueDict[row[0]] = {}
#     valueDict[row[0]][int(row[2])] = int(row[3])

# #Writing to json
# json_object1=json.dumps(nameDict, indent=4)
# json_object2=json.dumps(valueDict, indent=4)

# with open("names.json", "w") as outfile:
#     outfile.write(json_object1)

# with open("values.json", "w") as outfile:
#     outfile.write(json_object2)

######### Average Years of Schooling #########
readingInFile("./data/AverageYearsofSchoolingData/average-years-of-schooling.csv", "averageYearsOfSchool.json")

######### Child Mortality Rates #########
# NOTE: "Observation value-Deaths per 1,000 live births-Under-five mortality rate-Both sexes-All wealth quintiles"
readingInFile("./data/ChildMortalityRates/child-mortality-igme.csv", "childMortalityRates.json")

######## GDP per capita #########
readingInFile("./data/GDPpercapita/gdp-per-capita-prados-de-la-escosura.csv", "GDPpercaptia.json")

######### Happiness Index #########
# NOTE: Cantril ladder score
readingInFile("./data/HappinessIndex/happiness-cantril-ladder.csv", "happinessIndex.json")

######### HDI Data #########
readingInFile("./data/HDIData/human-development-index.csv", "humanDevelopmentIndex.json")

######### Infant Morality #########
readingInFile("./data/InfantMorality/infant-mortality.csv", "infant-mortality.csv.json")

######### Life Expectancy #########
readingInFile("./data/LifeExpectancy/life-expectancy-undp.csv", "life-expectancy-undp.json")

######### Literay Rates #########
readingInFile("./data/LiterayRates/cross-country-literacy-rates.csv", "cross-country-literacy-rates.json")

######### Poverty #########
readingInFile("./data/Poverty/share-of-population-in-extreme-poverty.csv", "share-of-population-in-extreme-poverty.json")

######### Unemployment #########
readingInFile("./data/Unemployment/unemployment-rate.csv", "unemployment-rate.json")

######## Voter #########
readingInFile("./data/Poverty/share-of-population-in-extreme-poverty.csv", "share-of-population-in-extreme-poverty.json")

with open("./data/Voter/idea_export_voter_turnout_database_region.csv", 'r') as csvfile:
        csvreader = csv.reader(csvfile)

        fields = next(csvreader)

        for row in csvreader:
            rows.append(row)

#Formatting file
nameDict = {}
valueDict = {}

for row in rows:
    if row[2] not in valueDict.keys():
        valueDict[row[2]] = {}
    valueDict[row[2]][int(row[4][:4])] = (row[5])

#Writing to json
json_object=json.dumps(valueDict, indent=4)

with open("voterPercent.json", "w") as outfile:
    outfile.write(json_object)