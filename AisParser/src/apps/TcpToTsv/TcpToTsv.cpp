#include <iostream>
#include <stdexcept>
#include <string>

#include <boost/timer/timer.hpp>
#include <boost/date_time/gregorian/gregorian.hpp>

//Input sources
#include <AisTcpStreamInputSource.h>

//Output sources
#include <AisTsvWriter.h>

//Parsers
#include <AisMsisSentenceParser.h>
#include <AisSatSentenceParser.h>
#include <AisMessageParser.h>

#include <AisMessage.h>
#include <AisDebug.h>

using namespace std;

void usage()
{
	cerr << "AisParserApp.exe <hostname> <port> <number-of-entries-per-tsv>" << endl;
	cerr << "Will create a file named <input-filename>.p<partition-number>.tsv with the parsed AIS.\nThis file will be suitable for uploading using SQL Loader." << endl;
	cerr << "<number-of-entries-per-tsv> is the number of entries per file.\nIt will create mutliple files named <input-filename><file-number>.tsv.\nIf set to 0, it will push all to a single file." << endl;
}

//========================================================================================
//========================================================================================
//========================================================================================
//========================================================================================

int main(int argc, char** argv)
{

	//parse args
	if(argc!=4)
	{
		usage();
		return -1;
	}

	boost::timer::auto_cpu_timer timer;

	std::string host = argv[1];
	std::string port = argv[2];
	
	unsigned int messagesPerFile = 0;
	try
	{
		messagesPerFile = boost::lexical_cast<unsigned int>(argv[3]);
	}
	catch(exception& e)
	{
		cerr << e.what() << endl;
		cerr << "Setting messages per file to 0" << endl;
		messagesPerFile = 0;
	}

	//Define input class (an AisInputSource)
	//STEPX: choose the correct type of input source
	AisTcpStreamInputSource aisInputSource(host, port);
	
	unsigned int partition = 0;
		
	while(aisInputSource.isReady())
	{

		boost::gregorian::date d(boost::gregorian::day_clock::universal_day());
		//Define output class (an AisWriter)
		//STEPX: choose the correct type of output source
		AisTsvWriter aisWriter(d.year(), d.month().as_number(), d.day().as_number(), partition++);

		if(!aisWriter.isReady())
		{
			aisDebug("AisWriter is not ready");
			return -1;
		}

		for(unsigned int messageCount = 0; ((messagesPerFile == 0) || (messageCount < messagesPerFile)) && (aisInputSource.isReady()); messageCount++)
		{

			//load the next sentence from the AIS input to the parser
			//STEPX: choose the correct type of sentence parser
			//AisMsisSentenceParser aisSentenceParser(aisInputSource.getNextSentence());
			AisSatSentenceParser aisSentenceParser(aisInputSource.getNextSentence());
			AisMessageParser aisMessageParser;

			if(aisSentenceParser.isMessageValid())
			{
				//This check is to make sure that if the first sentence of the message
				//was bad we won't read the second sentence and parse it as a new message
				if(aisSentenceParser.getSentenceNumber()==1)
				{
					aisMessageParser.addData(aisSentenceParser.getData());	
					//if the current sentence is part of a multipart message
					//grab the next message until you have them all, or message is invalid
					try
					{
						while(aisSentenceParser.getSentenceNumber() < aisSentenceParser.getNumberOfSentences())
						{
							aisSentenceParser.setSentence(aisInputSource.getNextSentence());
							if(aisSentenceParser.isMessageValid()){
								aisMessageParser.addData(aisSentenceParser.getData());	
							}
							else
							{
								//aisDebug("Invalid multipart message:\n" + aisSentenceParser.getCurrentSentence());
								throw std::runtime_error("Invalid multipart message");
							}
						}

						AisMessage aisMessage = aisMessageParser.parseMessage();
						//add time from ais sentence to the ais message
						aisMessage.setDATETIME(aisSentenceParser.getTimestamp());
						//add streamid from ais sentence to the ais message
						aisMessage.setSTREAMID(aisSentenceParser.getStreamId());

						aisWriter.writeEntry(aisMessage);
					}
					catch(exception &e)
					{
						cerr << e.what() << endl;
					}
				}
				else
				{
					aisDebug("First sentence of message was invalid/not receieved.\nSkipping the rest of the sentences of this message");
					continue;
				}
			}
			else
			{
				//aisDebug("Invalid message:\n" + aisSentenceParser.getCurrentSentence());
			}
		}
	}
	return 0;
}

