//helper functions
var XHR = function(url,callback){
  var xhr;
  if (window.XMLHttpRequest)
    xhr=new XMLHttpRequest();
  else
    xhr=new ActiveXObject("Microsoft.XMLHTTP");
  xhr.onreadystatechange=function(){
    if (xhr.readyState==4 && xhr.status==200){
     callback(xhr.responseText);
    }
  }
  xhr.open("GET",url,true);
  xhr.send();
}