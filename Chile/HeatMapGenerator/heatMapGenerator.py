#Bryan, here are the instruction to use te histogram function.
#1 Import the ICODE_FX library, here are included all the functions of
#ICODE_DB and ICODE_RP because it's needed and pylab to plot
import ICODE_FX as FX
import pylab as pl
from datetime import date
import datetime as dt
import time as time

def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + dt.timedelta(n)


#2 Initialize the database
FX.DB.dbConnection('localhost','username','password','database')
#3 Use the AIS_date_hist to meke a histogram for each day, in this case
#the histogram will be for the day '2013-09-04' and the next 5 days, I
#made a help log for this with a short explanation, if you want can use
#then help(FX.AIS_date_hist)
start_date = date(2013,01,01)
end_date = date(2013,12,31)

for single_date in daterange(start_date, end_date):
	the_date = time.strftime("%Y-%m-%d", single_date.timetuple())
	print 'processing :' + the_date
	FX.AIS_date_hist(the_date,1)


#Note:This fx will save all the histograms in a folder named 'histograms'
#with the name day_thedayofthehistogram_hist.npy.
#The saved matrix will have 1000 bins per axis as default, you can change 
#the number of bins in the function (see the help()).
#4 To retrieve the histogram matrix, you can use this:
#hist, bins, xl, yl = FX.RP.histfromfile('histograms/day_2013-08-01_hist.npy')
#As you can see it will give you the number of bins used and the histogram
#data (hist is the histogram matrix, xl ans yl are linespaces made with
#the xlim and ylim of the AIS_date_hist function.
#5 finally, you can see the graphic using:
#hist = FX.np.ma.masked_where(hist == 0,hist)
#pl.imshow(hist)
#pl.show()
#that will avoid the 0 data and will let it transparent


