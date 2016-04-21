    /*Global variables*/

    var token = localStorage.getItem('token');
    var userid = localStorage.getItem('userid');

    /**
    call back for create timetable
    **/
    $(document).ready(function() {
      load_timetables();
      $('#create_timetable').click(function() {
        name = $("#timetable_name").val();
        data = {};
        if (name == "")
          alert("A name for timetable is required");
        else {
          $.ajax({
            type: "POST",
            url: 'http://localhost:3000/timetable/',
            async: true,
            data: {
              "name": name,
              "user": userid
            },
            headers: {
              "Authorization": "Token " + token
            },
            crossDomain: true,
            dataType: 'json',
            complete: function(data, status, xhr) {
              response = JSON.parse(data.responseText);
              window.location.href = "timetable.html?id=" + response.id;

            }
          });
        }
      });

   /**
   event for logout action
   ***/
      $("#logout").click(function() {
        localStorage.clear();
        window.location.href = "index.html";
      });
    });
    
    /**Callback for listing timetables
    **/
    function load_timetables() {
      $.ajax({
        type: "GET",
        url: 'http://localhost:3000/timetables/',
        async: true,
        dataType: 'json',
        headers: {
          "Authorization": "Token " + token
        },
        crossDomain: true,
        complete: function(data, status, xhr) {
          tables = JSON.parse(data.responseText);
          console.log(tables);
          $.each(tables, function(key, table) {
            var html = '<div class="col-md-3 col-sm-6 hero-feature">' +
              '<div class="thumbnail"><div class="caption">' +
              '<h3>' + table.name + '</h3>' + '<p><a href="view_table.html?id=' + table.id + '">view</a>' +
              '</div></div></div>';
            if (table.complete)
              $(".timetable-list").append(html);
          })

        }
      });
    }