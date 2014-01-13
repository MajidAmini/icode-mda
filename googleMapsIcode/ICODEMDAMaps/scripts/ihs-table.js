/**
 * @name IHS-Table 
 * @author Sparta Cheung, Bryan Bagnall, Lynne Tablewski
 * @fileoverview
 * Create tab for info bubbles using data from IHS Fairplay tables
 */
/* -------------------------------------------------------------------------------- */
function updateIHSTabTblShip(index,NUM_INFO_BUBBLE,imo,infoBubble,map,marker,updateIHSTabSigInspect) {
    
    var title = 'IHS Ship Detail';   
    var htmlTitle;
    var fairplay_sid;
   
    var phpWithArg = "query_ihs_tblship.php?imo=" + imo;
     //Debug query output
    console.log('query_ihs_tblship(): ' + phpWithArg);

    $.getJSON(
         phpWithArg, // The server URL 
         { }
    ) //end .getJSON()
    .done(function (response) {
         document.getElementById("query").value = response.query;
         console.log('IHS(): ' + response.query);
        
         if (response.resultcount > 0) {   
            $.each(response.ihsdata, function(key,ihs) {
                fairplay_sid = ihs.fairplay_sid;
                var vessel_name = ihs.vessel_name;
                var imo_no = ihs.imo_no;
                var call_sign = ihs.call_sign;
                var mmsi_no = ihs.mmsi_no;
                var flag = ihs.flag;
                var operator = ihs.operator;
                var subtype = ihs.subtype;
                var gt = ihs.gt;
                var dwt = ihs.dwt;
                var due_or_delivered = ihs.due_or_delivered;
                var sub_status = ihs.sub_status;
                var builder = ihs.builder;
                var port_of_registry = ihs.port_of_registry;
                var official_number = ihs.official_number;
                var sat_Com_ansbk_code = ihs.sat_com_ansbk_code;
                var flag = ihs.flag;
                var sat_com = ihs.sat_com;
                var fishing_number = ihs.fishing_number;
                var p_and_i_club = ihs.p_and_i_club;
                htmlTitle = '<div id="content">' +
                    '<h3 id="firstHeading" class="firstHeading">' + title + '</h3>' +
                    '<div id="content-sub" border=1>' +
                    '<table>' +
                    '<tr>' +
                        '<td><b>Ship Name</b>: ' + vessel_name + '</td>' +
                        '<td><b>Shiptype</b>: '  + subtype + '</td>' +      
                    '</tr>' +
                    '<tr>' +
                        '<td><b>LR/IMO No.</b>: ' + imo_no + '</td>' +
                        '<td><b>Gross</b>: ' + gt + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td><b>Call Sign</b>: ' + call_sign + '</td>' +
                        '<td><b>Deadweight</b>: ' + dwt + '</td>' +
                    '</tr>' +   
                    '<tr>' +
                        '<td><b>MMSI No.</b>: ' + mmsi_no + '</td>' +
                        '<td><b>Year of Build</b>: ' + due_or_delivered + '</td>' +
                    '</tr>' + 
                    '<tr>' +
                        '<td><b>Flag</b>: ' + flag + '</td>' +
                        '<td><b>Status</b>: ' + sub_status + '</td>' +
                    '</tr>' + 
                    '<tr>' +
                        '<td><b>Operator</b>: ' + operator + '</td>' +
                        '<td><b>Shipbuilder</b>: ' + builder + '</td>' +
                    '</tr>' + 
                    '</table>' +
                    '<h5 id="firstHeading" class="firstHeading">' + 'REGISTRATION, P*I, AND COMMUNICATIONS' + '</h5>' +
                    '<div id="content-sub" border=1>' +
                    '<table>' +
                    '<tr>' +
                        '<td><b>Port of Registy</b>: ' + port_of_registry + '</td>' +
                        '<td><b>Flag</b>: '  + flag + '</td>' +      
                    '</tr>' +
                    '<tr>' +
                        '<td><b>Official Number</b>: ' + official_number + '</td>' +
                        '<td><b>Sat Com ID</b>: '  + sat_com + '</td>' +      
                    '</tr>' +
                    '<tr>' +
                        '<td><b>Sat Com Ans Back</b>: ' + sat_Com_ansbk_code + '</td>' +
                        '<td><b>Fishing Number</b>: '  + fishing_number + '</td>' +      
                    '</tr>' +
                    '</table>' +
                    '<table border = "1">'  +
                    '<caption align="left">P&I Club History' +
                    '<tr>' +
                        '<th><b>Date</th>' +
                        '<th><b>P&I Club</th>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>' + '00' + '</td>' +
                        '<td>'  + p_and_i_club + '</td>' +      
                    '</tr>' +
                    '</table>' +
                    '<div id="bodyContent">' +
                    '</div>' +
                    '</div>'+
                    '</div>' +
                    '</div>';
            })
         }
         else {
             htmlTitle = '<div id="content">' +
                             '<h3 id="firstHeading" class="firstHeading">' + 'No IHS Fairplay Data Available' + '</h3>' +
                             '</div>'; 
         }
         var indexTab = new indexInfoBubble(index,NUM_INFO_BUBBLE);
         console.log('updateIHS fairplay_sid: ' + fairplay_sid);
         updateIHSTabSigInspect(imo,fairplay_sid,indexTab,infoBubble,map,marker,updateIHSTabCasualty);

         //Now, add the tab
         infoBubble.addTab(title, htmlTitle);

         infoBubble.updateTab(indexTab.tblship, title, htmlTitle);
         infoBubble.open(map, marker);
         
         return;
       
         
    }) 
        .fail(function() { 
         console.log('IHS(): ' +  'No response from IHS query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
         return; 
    }); //end .fail()
}
/* -------------------------------------------------------------------------------- */
function updateIHSTabSigInspect(imo,fairplay_sid,indexTab,infoBubble,map,marker,updateIHSTabSigCasualty) {
    var htmlCol;
    var event = [];
    var phpWithArg = "query_ihs_sig_events_inspect.php?imo=" + imo;
     //Debug query output
    console.log('query_ihs_sig_events_inspect: ' + phpWithArg);

    $.getJSON(
         phpWithArg, // The server URL 
         { }
    ) //end .getJSON()
    .done(function (response) {
         document.getElementById("query").value = response.query;
         console.log('IHS(): ' + response.query);    
         if (response.resultcount > 0) {
            $.each(response.ihsdata, function(key,ihs) {
                event[key] = new eventElement(0,0,0,0,0,ihs.time_diff_months,ihs.shipdetained,0);
                console.log('event[' + key + '].shipdetained ' + event[key].shipdetained);
            })
            var eventCount = countEventOccurrences(event);
            htmlCol =
                    '<tr>' +
                        '<th><b>Detensions</th>' +
                        '<td>' + eventCount[0].shipdetained + '</td>' +
                        '<td>' + eventCount[1].shipdetained + '</td>' +
                        '<td>' + eventCount[2].shipdetained + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<th><b>Inspected</th>' +
                        '<td>' + eventCount[0].inspected + '</td>' +
                        '<td>' + eventCount[1].inspected + '</td>' +
                        '<td>' + eventCount[2].inspected + '</td>' +
                    '</tr>';
         }
         else {
             
             htmlCol = '<tr>' +
                        '<th><b>Detensions</th>' +
                        '<td>' + 'NA' + '</td>' +
                        '<td>' + 'NA' + '</td>' +
                        '<td>' + 'NA' + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<th><b>Inspected</th>' +
                        '<td>' + 'NA' + '</td>' +
                        '<td>' + 'NA' + '</td>' +
                        '<td>' + 'NA' + '</td>' +
                    '</tr>';
            
         }
         
         
          //Send htmlColumn infomation for adding to Significant Event info bubble
          console.log('!!!tblinspect htmlCol: ' + htmlCol);
         updateIHSTabSigCasualty(indexTab,infoBubble,map,marker,fairplay_sid,htmlCol,imo,updateIHSTabSigEvents);
    }) 
        .fail(function() { 
         console.log('IHS(): ' +  'No response from IHS query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
          
    }); //end .fail() 
}
/* -------------------------------------------------------------------------------- */
function updateIHSTabCasualty(indexTab,infoBubble,map,marker,fairplay_sid,htmlCol,imo,updateIHSTabSigEvents) {
    var htmlCol;
    var event = [];
    var phpWithArg = "query_ihs_casualty.php?imo=" + imo;
     //Debug query output
    console.log('query_ihs_casualty: ' + phpWithArg);

    $.getJSON(
         phpWithArg, // The server URL 
         { }
    ) //end .getJSON()
    .done(function (response) {
         document.getElementById("query").value = response.query;
         console.log('IHS(): ' + response.query);    
         if (response.resultcount > 0) {
            $.each(response.ihsdata, function(key,ihs) {
                
                event[key] = new eventElement(0,0,0,0,0,ihs.time_diff_months,0,ihs.casualty);
                console.log('event[' + key + '].casualty' + event[key].casualty);
            })
            var eventCount = countEventOccurrences(event);
            htmlCol +=
                '<tr>' +
                    '<th><b>Casualty</th>' +
                    '<td>' + eventCount[0].casualty + '</td>' +
                    '<td>' + eventCount[1].casualty + '</td>' +
                    '<td>' + eventCount[2].casualty + '</td>' +
                '</tr>';
         }
         else {
            htmlCol +=
                '<tr>' +
                    '<th><b>Casualty</th>' +
                    '<td>' + 'NA' + '</td>' +
                    '<td>' + 'NA' + '</td>' +
                    '<td>' + 'NA' + '</td>' +
                '</tr>';
         }
         //Send htmlColumn infomation for adding to Significant Event info bubble
         console.log('!!!tblcasualty htmlCol: ' + htmlCol);
         updateIHSTabSigEvents(indexTab,infoBubble,map,marker,fairplay_sid,htmlCol,imo,updateIHSTabTblCrew);
    }) 
        .fail(function() { 
         console.log('IHS(): ' +  'No response from IHS query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
          
    }); //end .fail() 
}
/* -------------------------------------------------------------------------------- */
function updateIHSTabSigEvents(indexTab,infoBubble,map,marker,fairplay_sid,htmlCol,imo,updateIHSTabTblCrew) {
    var title = 'IHS Ship Event';  
    var htmlTitle;
    var htmlEnd;
    var event = [];
    var phpWithArg = "query_ihs_sig_events.php?fairplay_sid=" + fairplay_sid;
     //Debug query output
    console.log('query_ihs_sig_events: ' + phpWithArg);

    $.getJSON(
         phpWithArg, // The server URL 
         { }
    ) //end .getJSON()
    .done(function (response) {
         document.getElementById("query").value = response.query;
         console.log('IHS(): ' + response.query);    
         if (response.resultcount > 0) {
            $.each(response.ihsdata, function(key,ihs) {
                
                event[key] = new eventElement(ihs.ex_flag,ihs.ex_owner,ihs.ex_name,ihs.ex_year_acquired,ihs.iteration,ihs.time_diff_months,0,0);
            })
            var eventCount = countEventChanges(event);
            htmlTitle =
                    '<div id="content">' +
                    '<div id="content-sub" border=1>' +
                    '<h5 id="firstHeading" class="firstHeading">' + 'Three Year Event' + '</h5>'  +
                    '<div id="content-sub" border=1>' +
                    '<table border = "1">' +
                    '<tr>' +
                        '<th><b>Significant Event</th>' +
                        '<th><b>Last 12 months</th>' +
                        '<th><b>Between 1 and 2 years ago</th>' +
                        '<th><b>2-3 years ago</th>' +
                    '</tr>' +
                    '<tr>' +
                        '<th><b>Flag Changes</th>' +
                        '<td>' + eventCount[0].flag + '</td>' +
                        '<td>' + eventCount[1].flag + '</td>' +
                        '<td>' + eventCount[2].flag + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<th><b>Group Owner changes</th>' +
                        '<td>' + eventCount[0].owner + '</td>' +
                        '<td>' + eventCount[1].owner + '</td>' +
                        '<td>' + eventCount[2].owner + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<th><b>Name changes</th>' +
                        '<td>' + eventCount[0].name + '</td>' +
                        '<td>' + eventCount[1].name + '</td>' +
                        '<td>' + eventCount[2].name + '</td>' +    
                    '</tr>' ;
            htmlEnd =
                     '</table>' +
                    '<div id="bodyContent">';  
            htmlTitle += htmlCol + htmlEnd;
         }
         else {
            htmlTitle = '<div id="content">' +
                        '<h3 id="firstHeading" class="firstHeading">' + 'No IHS Fairplay Data Available' + '</h3>' +
                        '</div>';
         }
         updateIHSTabTblCrew(indexTab,imo,infoBubble,map,marker);
         console.log('sig events htmlTItle: ' + htmlTitle);
         
         //Now, add the tab
         infoBubble.addTab(title, htmlTitle);

         infoBubble.updateTab(indexTab.sigevents, title, htmlTitle);
         infoBubble.open(map, marker);
         
    }) 
        .fail(function() { 
         console.log('IHS(): ' +  'No response from IHS query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
         return; 
    }); //end .fail()
}
/* -------------------------------------------------------------------------------- */
function updateIHSTabTblCrew(indexTab,imo,infoBubble,map,marker) {
    var title = 'IHS Ship Crew';  
    var htmlBeg;
    var htmlTableLabel;
    var htmlTableColumns;
    var htmlTitle;
    var htmlTableEnd;
    var htmlTableInput='';
    var phpWithArg = "query_ihs_crew.php?imo=" + imo;
     //Debug query output
    console.log('query_ihs_crew(): ' + phpWithArg);

    $.getJSON(
         phpWithArg, // The server URL 
         { }
    ) //end .getJSON()
    .done(function (response) {
         document.getElementById("query").value = response.query;
         console.log('IHS(): ' + response.query);    
         if (response.resultcount > 0) {
            htmlBeg =
                    '<div id="content">' +
                    '<div id="content-sub" border=1>' +
                    '<h5 id="firstHeading" class="firstHeading">' + 'Crew List' + '</h5>'  +
                    '<div id="content-sub" border=1>' +
                    '<table border = "1">';
            htmlTableColumns = 
                '<tr>' +
                    '<th><b>Nationality</th>' +
                    '<th><b>Total Ratings</th>' +
                    '<th><b>Total Officers</th>' +
                    '<th><b>Total Crew</th>' +
                '</tr>';
            htmlTableEnd =
                '</table>' +
                '<div id="bodyContent">';  
            $.each(response.ihsdata, function(key,ihs) {
                var id = ihs.id;
                var lrno = ihs.lrno;
                var shipname = ihs.shipname;
                var crewlistdate = ihs.crewlistdate;
                var nationality = ihs.nationality;
                var totalcrew = ihs.totalcrew;
                var totalratings = ihs.totalratings;
                var totalofficers = ihs.totalofficers;
                
                htmlTableLabel = '<h1 id="firstHeading" class="firstHeading">' + 'Data as of ' + crewlistdate + '</h1>';
                htmlTableInput += 
                    '<tr>' +
                        '<td>' + nationality + '</td>' +
                        '<td>'  + totalratings + '</td>' +  
                        '<td>'  + totalofficers + '</td>' +  
                        '<td>'  + totalcrew + '</td>' +
                    '</tr>';
            })
            htmlTitle = htmlBeg + htmlTableLabel + htmlTableColumns + htmlTableInput + htmlTableEnd;
         }
         else {
            htmlTitle = '<div id="content">' +
                        '<h3 id="firstHeading" class="firstHeading">' + 'No IHS Fairplay Data Available' + '</h3>' +
                        '</div>';
         }
         console.log('crew htmlTitle: ' + htmlTitle);

         //Now, add the tab
         infoBubble.addTab(title, htmlTitle);

         infoBubble.updateTab(indexTab.crew, title, htmlTitle);
         infoBubble.open(map, marker);
    }) 
        .fail(function() { 
         console.log('IHS(): ' +  'No response from IHS query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
         return; 
    }); //end .fail() 
}
/* -------------------------------------------------------------------------------- */
function indexInfoBubble(index,NUM_INFO_BUBBLE){
    this.tblship = index;
    if (index+3 > NUM_INFO_BUBBLE){
             console.log('Invalid number of info bubbles: ' + index+3);
    }
    var nextTab = index + 1;
    this.sigevents = nextTab;
    this.inspect = nextTab;
    this.crew = nextTab + 1;
}
/* -------------------------------------------------------------------------------- */
function eventElement(flag,owner,name,date,iteration,time_diff_months,shipdetained,casualty){
    this.flag = flag;
    this.owner = owner;
    this.name = name;
    this.date = date;
    this.iteration = iteration;
    this.time_diff_months = time_diff_months;
    this.shipdetained = shipdetained;
    this.casualty = casualty;
}
/* -------------------------------------------------------------------------------- */
function countElement(flag,owner,name,inspected,shipdetained,casualty){
    this.flag = flag;
    this.owner = owner;
    this.name = name;
    this.inspected = inspected;
    this.shipdetained = shipdetained;
    this.casualty = casualty;
}
/* -------------------------------------------------------------------------------- */
function determineMaxYear(event,index){
var numMaxYear = 0;
    if (event[index].time_diff_months) { // tests for null, 0, undefined, some date values are null in IHS tables
        if (event[index].time_diff_months <= 36 && event[index].time_diff_months > 24){
            numMaxYear = 3; 
        }else if (event[index].time_diff_months <= 24 && event[index].time_diff_months > 12){
            numMaxYear = 2;
        }else if (event[index].time_diff_months <= 12){
            numMaxYear = 1;
        }
    }
    return numMaxYear;
}
/* -------------------------------------------------------------------------------- */
function countEventChanges(event){
    var numMaxYear;
    var eventCount = [];
    eventCount[0] = new countElement(0,0,0,0,0,0); //Results for last 12 months 
    eventCount[1] = new countElement(0,0,0,0,0,0); //Results for last 12 to 24 months
    eventCount[2] = new countElement(0,0,0,0,0,0); //Results for last 24 to 36 months
    for (i=1; i < event.length; i++) {
        numMaxYear = determineMaxYear(event,i);
        //Only valid numMaxYear are 1,2 or 3
        if (numMaxYear > 0) {
            if (event[i-1].flag.toUpperCase() !== event[i].flag.toUpperCase()){
                eventCount[numMaxYear-1].flag++;
            } 
            if (event[i-1].owner.toUpperCase() !== event[i].owner.toUpperCase()){
                eventCount[numMaxYear-1].owner++;    
            }
            if (event[i-1].name.toUpperCase() !== event[i].name.toUpperCase()){
                eventCount[numMaxYear-1].name++;    
            }  
        }
    }
    return eventCount;
}
/* -------------------------------------------------------------------------------- */
function countEventOccurrences(event){
    var numMaxYear;
    var eventCount = [];
    eventCount[0] = new countElement(0,0,0,0,0,0); //Results for last 12 months 
    eventCount[1] = new countElement(0,0,0,0,0,0); //Results for last 12 to 24 months
    eventCount[2] = new countElement(0,0,0,0,0,0); //Results for last 24 to 36 months
    for (i=0; i < event.length; i++) {
        numMaxYear = determineMaxYear(event,i);
        //Only valid numMaxYear are 1,2 or 3
        if (numMaxYear > 0) {
            if (event[i].shipdetained === 1){
                eventCount[numMaxYear-1].shipdetained++;
            } else {
                eventCount[numMaxYear-1].inspected++;
            } 
            if (event[i].casualty){
                eventCount[numMaxYear-1].casualty++;
            }
            var index = numMaxYear - 1;
            console.log('event[' + i + '].shipdetained ' + event[i].shipdetained + 'eventCount[' + index + '].shipdetained ' + eventCount[numMaxYear-1].shipdetained);
            console.log('eventCount[' + index + '].inspected ' + eventCount[numMaxYear-1].inspected);
        }
    }
    return eventCount;
}

