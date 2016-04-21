    
    /*
    Ajax request to validate user
    */
    $(document).ready(function() {
     $("#signin").click(function(){
      name= $("#name").val();
      password=$("#password").val();
      if(name=="" || password==""){
        alert("username and password are mandatory");
      }else{
       $.ajax({
        type: "POST",
        url: "http://localhost:3000/api-token-auth/",
        async:true,
        contentType: "application/json",
        data:JSON.stringify({'username':name,'password':password}), 
        crossDomain:true,
        dataType: 'json',
        complete: function(data, status, xhr) {   
            response=JSON.parse(data.responseText);
            console.log(data);
            if(data.status==200){
             window.location.href="list.html";
              localStorage.setItem('token',response.token);
              localStorage.setItem('userid',response.id);
              localStorage.setItem('username',name);
}
           else
            alert("Wrong username or password");
        }
    });
     }
     });
  });