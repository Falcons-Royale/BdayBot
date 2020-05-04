import urllib2
import schedule
import time

def job(): 
    url = "http://drneato.com/Bday/Data.txt"
    data = urllib2.urlopen(url)
    file = open("Data.txt", "w")
    for line in data:
        file.write(line)

schedule.every().day.at("00:00").do(job)

while(True):
    job()
    schedule.run_pending()
    time.sleep(1)