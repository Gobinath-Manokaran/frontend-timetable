  var token = localStorage.getItem('token');
  $(document).ready(function() {
    var id = getParameterByName("id");
    load_timetable(id);
  });
  var total_credits = 0;

  /*Method load_calendar used to generate the timetable*/
  function load_timetable(id) {
    $.ajax({
      type: "GET",
      url: 'http://localhost:3000/timetable/' + id,
      async: false,
      headers: {
        "Authorization": "Token " + token
      },
      crossDomain: true,
      complete: function(data, status, xhr) {
        var events_arr = [];
        response = JSON.parse(data.responseText);
        courses = response.courses;
        $("#timetable_name").text(response.name);
        $.each(courses, function(key, data) {
          classes = data.classes;
          name = data.name;
          total_credits = parseInt(total_credits) + parseInt(data.credits);
          $("#credits").text(total_credits);
          $.each(classes, function(key, cls) {
            event = {};
            event.title = name;
            var date = new Date();
            var currentDay = date.getDay();
            var distance = cls.day - currentDay;
            date.setDate(date.getDate() + distance);
            string = date.toDateString();
            start_date = new Date(string + " " + cls.start_date + " +0000").toISOString();
            end_date = new Date(string + " " + cls.end_date + " +0000").toISOString();
            event.id = cls.id;
            event.start = start_date;
            event.end = end_date;
            events_arr.push(event);
          });
        });
        $('#calendar').fullCalendar({
          defaultView: 'agendaWeek',
          events: events_arr,
          allDaySlot: false
        });
      }
    });
  }