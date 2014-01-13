function fileUpload(form, action_url, div_id) {
    // Create the iframe...
    var iframe = document.createElement("iframe");
    iframe.setAttribute("id", "upload_iframe");
    iframe.setAttribute("name", "upload_iframe");
    iframe.setAttribute("width", "0");
    iframe.setAttribute("height", "0");
    iframe.setAttribute("border", "0");
    iframe.setAttribute("style", "width: 0; height: 0; border: none;");
 
    // Add to document...
    form.parentNode.appendChild(iframe);
    window.frames['upload_iframe'].name = "upload_iframe";
 
    iframeId = document.getElementById("upload_iframe");
 
    // Add event...
    var eventHandler = function () {
       if (iframeId.detachEvent) 
          iframeId.detachEvent("onload", eventHandler);
       else 
          iframeId.removeEventListener("load", eventHandler, false);

       // Message from server...
       if (iframeId.contentDocument) {
          //console.log('contentDocument');
          content = iframeId.contentDocument.body.innerHTML;
          if (content == 'No file specified!') {
             alert('Please choose a file');
             return;
          }
          console.debug(content);

          var result = jQuery.parseJSON(content);
          //console.log(result.datetime);
          //console.log(result.filename);
          //console.log(JSON.stringify(result.type));

          //Make sure this is KML file
          if (JSON.stringify(result.result) == '"success"') {
             if (JSON.stringify(result.type)  == '"kmz"') {
                if (result.filename.slice(-3).toLowerCase() == 'kmz') {
                   showUploadedKML(result.datetime);
                }
                else {
                   alert('Please upload a *.kmz file');
                }
             }
             else {
                console.log('Uploaded type not supported yet');
             }
          }
          else {
             console.log('Upload failed');
          }
       } 
       else if (iframeId.contentWindow) {
          console.log('contentWindow');
          content = iframeId.contentWindow.document.body.innerHTML;
       }
       else if (iframeId.document) {
          console.log('iframeId.document');
          content = iframeId.document.body.innerHTML;
       }


       //Hide output
       //document.getElementById(div_id).innerHTML = content;
       document.getElementById(div_id).innerHTML = "";

       // Del the iframe...
       setTimeout('iframeId.parentNode.removeChild(iframeId)', 250);
    }

    if (iframeId.addEventListener) 
       iframeId.addEventListener("load", eventHandler, true);
    if (iframeId.attachEvent) 
       iframeId.attachEvent("onload", eventHandler);
 
    // Set properties of form...
    form.setAttribute("target", "upload_iframe");
    form.setAttribute("action", action_url);
    form.setAttribute("method", "post");
    form.setAttribute("enctype", "multipart/form-data");
    form.setAttribute("encoding", "multipart/form-data");
 
    // Submit the form..
    //console.log($("#kmlform")[0].submit);
    form.submit();

 
    document.getElementById(div_id).innerHTML = "Uploading...";
}

