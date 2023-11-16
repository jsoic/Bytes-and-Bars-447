#!/bin/bash/python3
import csv
import json


#Load json
jsonFile = open('countryCodeMapper.json')
# returns JSON object as a dictionary
mappedData = json.load(jsonFile)
# Closing file
jsonFile.close()

rows = []

#Read in a line
with open("./data/Population/population-and-demography.csv", 'r') as csvfile:
     with open("./data/Population/country-population.csv", 'w') as outfile:  

        csvreader = csv.reader(csvfile)
        # creating a csv writer object  
        csvwriter = csv.writer(outfile) 

        fields = next(csvreader)
        csvwriter.writerow(fields) 

        #Create array of row
        for row in csvreader:
            rows.append(row)


        #Edit line
        for row in rows:
           
           for i in range(0, len(mappedData.values())):
                if list(mappedData.values())[i] == row[0]:
                    print("Match found")
                    row[1] = list(mappedData.keys())[i]
                    print(row)
                    # writing the data rows  
                    csvwriter.writerow(row) 
                    continue