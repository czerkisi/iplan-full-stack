Event JSON Formats
------------------

This is a collection of JSON examples for creating events with different fields and default values. The entries include:

1.  Event with required fields and default values
2.  Event with a description and attendees
3.  Event with a location, status, and organizer
4.  Event with a recurrence rule and exception dates

Each JSON entry includes the following fields:

*   `summary`: The event summary or title.
*   `start`: The start date and time of the event, in ISO-8601 format.
*   `end`: The end date and time of the event, in ISO-8601 format.
*   `uid`: A unique identifier for the event.

The additional fields and values are as follows:

*   `description`: A text description of the event.
*   `attendees`: An array of email addresses for attendees.
*   `location`: The location of the event.
*   `status`: The status of the event (e.g. "CONFIRMED").
*   `organizer`: The organizer of the event.
*   `recurrenceRule`: A string representing a recurrence rule, in iCalendar format.
*   `recurrenceException`: An array of ISO-8601 formatted dates that represent exceptions to the recurrence rule.

Event with required fields and default values:

```json
{     
    "summary": "Weekly Team Meeting",     
    "start": "2023-02-07T10:00:00.000Z",
    "end": "2023-02-07T11:00:00.000Z",     
    "uid": "team-meeting-12345" 
}
```


Event with a description and attendees:

```json
{
  "summary": "Weekly Team Meeting",
  "start": "2023-02-07T10:00:00.000Z",
  "end": "2023-02-07T11:00:00.000Z",
  "description": "Discuss project progress and future plans",
  "attendees": [
    "john.doe@example.com",
    "jane.doe@example.com"
  ],
  "uid": "team-meeting-67890"
}
```

Event with a location, status, and organizer:

```json
{
    "summary": "Weekly Team Meeting",
    "start": "2023-02-07T10:00:00.000Z",
    "end": "2023-02-07T11:00:00.000Z",
    "location": "Conference Room A",
    "status": "CONFIRMED",
    "organizer": "Jane Doe",
    "uid": "team-meeting-111213"
}
```

Event with a recurrence rule and exception dates:

```json
{
  "summary": "Weekly Team Meeting",
  "start": "2023-02-07T10:00:00.000Z",
  "end": "2023-02-07T11:00:00.000Z",
  "uid": "team-meeting-141516",
  "recurrenceRule": "FREQ=WEEKLY;INTERVAL=1",
  "recurrenceException": ["2023-02-14T10:00:00.000Z"]
}
```
	