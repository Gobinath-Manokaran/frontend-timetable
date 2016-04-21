    
    /**
       Global variables like user id,username,added_courses
    **/
    var mandatory_courses = [];
    var token = localStorage.getItem('token');
    var userid = localStorage.getItem('userid');
    var username = localStorage.getItem('username');
    var added_courses = [];
    var total_credits = 0;
    $(document).ready(function() {
      var time_tableid = getParameterByName("id");
      load_timetable(time_tableid);
      load_courses();
      if (total_credits < 15)
        $("#complete_timetable").hide();
      $("#credits").text(total_credits);
      $("#complete_timetable").click(function() {
        save_completed_timetable();
      });
    });


    /*Method load_courses used to generate all the available courses*/
    function load_courses() {
      $.ajax({
        type: "GET",
        url: 'http://localhost:3000/courses/',
        async: true,
        crossDomain: true,
        headers: {
          "Authorization": "Token " + token
        },
        complete: function(data, status, xhr) {
          console.log(added_courses);
          courses = JSON.parse(data.responseText);
          $.each(courses, function(key, course) {
            if ($.inArray(course.id, added_courses) != -1) {
              if (course.mandatory) {
                mandatory_courses.push(course.id);
                html = "<li class='selectedCourse'><b>" + course.name + "(credits-" + course.credits + ")</b></li>"
              } else {
                html = "<li class='selectedCourse'>" + course.name + "(credits-" + course.credits + ")</li>"
              }


            } else {
              if (course.mandatory) {
                html = "<li><button id='" + course.id + "' class='course-add' onclick=add_course(" + course.id + ",this)>+</button><b><span class='course-name'>" + course.name + "(credits-" + course.credits + ")</span></b></li>"
                mandatory_courses.push(course.id);
              } else
                html = "<li><button id='" + course.id + "' class='course-add' onclick=add_course(" + course.id + ",this)>+</button><span class='course-name'>" + course.name + "(credits-" + course.credits + ")</span></li>"
            }
            $("#course-list").append(html);
          });

        }
      });
    }

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
            added_courses.push(data.id);
            total_credits = parseInt(total_credits) + parseInt(data.credits);
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

/* Method to validate the timeslots  */
    function add_course(id, obj) {
      $.ajax({
        type: "GET",
        url: 'http://localhost:3000/courses/' + id,
        async: true,
        headers: {
          "Authorization": "Token " + token
        },
        crossDomain: true,
        complete: function(data, status, xhr) {
          course = JSON.parse(data.responseText);
          classes = course.classes;
          count = 0;
          $.each(classes, function(key, cls) {
            var date = new Date();
            var currentDay = date.getDay();
            var distance = cls.day - currentDay;
            date.setDate(date.getDate() + distance);
            string = date.toDateString();
            startDate = new Date(string + " " + cls.start_date + " +0000");
            endDate = new Date(string + " " + cls.end_date + " +0000");
            $('#calendar').fullCalendar('clientEvents', function(event) {
              if (event.start.toDate() >= startDate && event.start.toDate() <= endDate || event.end.toDate() >= startDate && event.end.toDate() <= endDate) {
                alert("Time slot not available since you have " + event.title + " class at that time")
                count++;
              }
            });
          });
          if (count == 0) {
            save_course(id, course.credits, obj);
          }
        }
      });

    }

    /**
    ajax callback to call add course
    **/

    function save_course(id, credits, obj) {
      obj.remove();
      added_courses.push(id);
      time_tableid = getParameterByName("id");
      name = $("#timetable_name").text();
      user = userid;
      $.ajax({
        type: "PUT",
        url: 'http://localhost:3000/timetable_update/' + time_tableid,
        async: true,
        headers: {
          "Authorization": "Token " + token
        },
        contentType: "application/json",
        data: JSON.stringify({
          'name': name,
          'credits': credits,
          'user': user,
          'courses': added_courses
        }),
        crossDomain: true,
        dataType: 'json',
        complete: function(data, status, xhr) {
          load_timetable(time_tableid);
          window.location.reload();
        }
      });
    }

 /**
    ajax callback to save completed timetable
    **/

    function save_completed_timetable() {
      time_tableid = getParameterByName("id");
      name = $("#timetable_name").text();
      user = userid;
      count = 0;
      for (i = 0; i < mandatory_courses.length; i++) {
        if ($.inArray(mandatory_courses[i], added_courses) == -1) {
          count++;
        }
      }
      if (count != 0)
        alert("Please select all mandatory courses");
      else {
        $.ajax({
          type: "PUT",
          url: 'http://localhost:3000/timetable_update/' + time_tableid,
          async: true,
          headers: {
            "Authorization": "Token " + token
          },
          contentType: "application/json",
          data: JSON.stringify({
            'name': name,
            'credits': total_credits,
            'user': user,
            'courses': added_courses,
            'complete': 'true'
          }),
          crossDomain: true,
          dataType: 'json',
          complete: function(data, status, xhr) {
            load_timetable(time_tableid);
            window.location.href = "list.html";
          }
        });
      }
    }