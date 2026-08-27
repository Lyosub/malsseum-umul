// 이달의 일정 캘린더

function escapeHtmlCal(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateStr(y, m, d) {
  return y + "-" + pad2(m + 1) + "-" + pad2(d);
}

function initCalendarPage() {
  var grid = document.getElementById("calGrid");
  var monthLabel = document.getElementById("calMonthLabel");
  var eventList = document.getElementById("calEventList");
  if (!grid) return;

  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();

  if (monthLabel) monthLabel.textContent = (month + 1) + "월 일정";

  var firstWeekday = new Date(year, month, 1).getDay();
  var totalDays = new Date(year, month + 1, 0).getDate();
  var todayStr = dateStr(year, month, now.getDate());

  var client = getClient();
  if (!client) {
    grid.innerHTML = '<p class="msg">캘린더 기능 준비 중이에요.</p>';
    return;
  }

  var startDate = dateStr(year, month, 1);
  var endDate = dateStr(year, month, totalDays);

  client.from("calendar_events")
    .select("*")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date", { ascending: true })
    .then(function (res) {
      var events = res.data || [];
      var eventsByDate = {};
      events.forEach(function (ev) {
        if (!eventsByDate[ev.event_date]) eventsByDate[ev.event_date] = [];
        eventsByDate[ev.event_date].push(ev);
      });

      var weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
      var cells = weekdayLabels.map(function (w) {
        return '<div class="cal-weekday">' + w + '</div>';
      });

      for (var i = 0; i < firstWeekday; i++) {
        cells.push('<div class="cal-cell empty"></div>');
      }
      for (var d = 1; d <= totalDays; d++) {
        var ds = dateStr(year, month, d);
        var hasEvent = !!eventsByDate[ds];
        var isToday = ds === todayStr;
        cells.push(
          '<div class="cal-cell' + (isToday ? ' today' : '') + '">' +
            '<span class="cal-day-num">' + d + '</span>' +
            (hasEvent ? '<span class="cal-dot"></span>' : '') +
          '</div>'
        );
      }
      grid.innerHTML = cells.join("");

      if (eventList) {
        if (!events.length) {
          eventList.innerHTML = '<p class="msg">이번 달 등록된 일정이 없어요.</p>';
        } else {
          eventList.innerHTML = events.map(function (ev) {
            var day = parseInt(ev.event_date.split("-")[2], 10);
            return (
              '<div class="note-item">' +
                '<div class="meta">' + (month + 1) + '월 ' + day + '일</div>' +
                '<div class="content"><strong>' + escapeHtmlCal(ev.title) + '</strong>' +
                  (ev.description ? '<br>' + escapeHtmlCal(ev.description) : '') + '</div>' +
              '</div>'
            );
          }).join("");
        }
      }
    })
    .catch(function () {
      grid.innerHTML = '<p class="msg">일정을 불러오지 못했어요.</p>';
    });
}
