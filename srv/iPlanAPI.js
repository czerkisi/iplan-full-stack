const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');

mongoose.connect('mongodb://localhost/iplan', { useNewUrlParser: true });

const app = express();
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(cors());


Event = new mongoose.Schema({
    summary: {
        type: String,
        required: [true, "Event summary is required"],
        minlength: [5, "Event summary must have at least 5 characters"],
        maxlength: [100, "Event summary cannot have more than 100 characters"],
    },
    start: {
        type: Date,
        required: [true, "Event start date is required"],
    },
    end: {
        type: Date,
        required: [true, "Event end date is required"],
        validate: {
            validator: function (value) {
                return value > this.start;
            },
            message: "Event end date must be after the start date",
        },
    },
    stamp: {
        type: Date,
        default: new Date(),
        immutable: true,
    },
    description: {
        type: String,
        default: "",
        maxlength: [1000, "Event description cannot have more than 1000 characters"],
    },
    location: {
        type: String,
        default: "",
        maxlength: [100, "Event location cannot have more than 100 characters"],
    },
    status: {
        type: String,
        default: "CONFIRMED",
        enum: ["TENTATIVE", "CONFIRMED", "CANCELLED"],
    },
    organizer: {
        type: String,
        default: "",
        maxlength: [100, "Event organizer cannot have more than 100 characters"],
    },
    attendees: [{
        type: String,
        default: [],
        maxlength: [100, "Attendee email address cannot have more than 100 characters"],
        validate: [validator.isEmail, "Invalid attendee email address"],
    }],
    uid: {
        type: String,
        required: true,
        minlength: [5, "Event uid must have at least 5 characters"],
        maxlength: [100, "Event uid cannot have more than 100 characters"],
    },
    sequence: {
        type: Number,
        default: 0,
        min: [0, "Event sequence number cannot be negative"],
    },
    created: {
        type: Date,
        default: new Date(),
    },
    lastModified: {
        type: Date,
        default: new Date(),
        validate: {
            validator: function (value) {
                return value >= this.created;
            },
            message: "Last modified date must be after the created date",
        },
    },
    recurrenceId: {
        type: String,
        default: "",
        maxlength: [100, "Event recurrenceId cannot have more than 100 characters"],
    },
    recurrenceRule: {
        type: String,
        default: "",
        maxlength: [1000, "Event recurrenceRule cannot have more than 1000 characters"],
    },
    recurrenceException: {
        type: [Date],
        default: [],
    },
    alarm: {
        type: Object,
        default: {},
        validate: {
            validator: function (value) {
                return value.action && value.trigger;
            },
            message: "Alarm must have 'action' and 'trigger' properties",
        },
    },
});

const CalendarSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    events: [Event],
    productId: {
        type: String,
        default: function() {
            return `-//iPlan API//NONSGML ${this.name}//EN`;
        }
    },
    version: {
        type: String,
        default: "2.0",
    },
    calscale: {
        type: String,
        default: "GREGORIAN",
    },
    method: {
        type: String,
        default: "PUBLISH",
    },
    uid: {
        type: String,
        unique: true,
        default: function() {
            const timestamp = new Date().getTime().toString(36);
            const randomString = crypto.randomBytes(4).toString('hex');
            return `${this.creator}-${timestamp}-${randomString}`;
        }
    }
});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    calendars: {
        type: [CalendarSchema],
        default: []
    }
});

const sessionKeySchema = new mongoose.Schema({
    sessionKey: String,
    expirationDate: Number,
    username: String
});

const calendarModel = mongoose.model('ICal', CalendarSchema);
const userModel = mongoose.model('Users', UserSchema);
const sessionKeyModel = mongoose.model('SessionKeys', sessionKeySchema)

passport.use(new LocalStrategy(function(username, password, done) {
    userModel.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (user.password !== password) { return done(null, false); }
        return done(null, user);
    });
}));

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({ error: 'Incorrect username or password' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            const rawKey = generateSessionKey();
            const oneWeekFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
            const sessionKey = new sessionKeyModel({
                key: rawKey,
                expirationDate: oneWeekFromNow
            });

            sessionKey.save().then(key => {
                res.cookie('sessionKey', rawKey, { httpOnly: true, secure: true });
                return res.status(200).send({ success: 'Login successful' });
            }).catch(error => {
                return res.status(500).send({ error: `Error in creating Session Key: ${error.message}` });
            })
        });
    })
})

app.post('/createUser', (req, res) => {
    console.log('creating user');
    const username = req.body.username;
    if (!username){
        return res.status(400).send({ error: 'Missing username in body' });
    }
    const password = req.body.password;
    if (!password){
        return res.status(400).send({ error: 'Missing password in body' });
    }
    const newUser = new userModel({
        username: username,
        password: password
    });
    newUser.save()
        .then(user => {
            return res.status(201).send({ status: `User: ${user.username} was created` });
        })
        .catch(error => {
            console.log('error');
            if (error.code === 11000) {
                return res.status(409).send({ error: `Username: ${username} already exists` });
            }
            return res.status(500).send({ error: `User was not created: ${error.message}` });
        });
})

const generateSessionKey = () => {
    return crypto.randomBytes(32).toString('hex');
}
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    userModel.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get('/events', (req, res) => {
    const username = req.query.username;
    const calendarName = req.query.calendarName;
    if (!username){
        return res.status(400).send({ error: 'Missing user parameter' });
    }
    if (!calendarName){
        return res.status(400).send({ error: 'Missing calendar name parameter' });
    }

    // retrieve the iCal file with the specified ID from MongoDB
    userModel.findOne({ username: username })
        .then((user) => {
            if (!user){
                return res.status(404).send({ error: 'User not found' });
            }
            const calendar = user.calendars.find(c => c.name === calendarName);
            if (!calendar) {
                res.status(404).send({ error: 'Calendar not found' });
            } else {
                res.send({ events: calendar.events});
            }
        })
        .catch((err) => {
            return res.status(500).send({ error: 'Error retrieving events from database' });
        });
});

app.post('/events', (req, res) => {
    const username = req.query.username;
    const calendarName = req.query.calendarName;
    if (!username){
        return res.status(400).send({ error: 'Missing user parameter' });
    }
    if (!calendarName){
        return res.status(400).send({ error: 'Missing calendar name parameter' });
    }
    const data = req.body;
    if (!data){
        return res.status(400).send({ error: 'Missing Body' });
    }
    userModel.findOne({ username: username })
        .then((user) => {
            if (!user){
                return res.status(404).send({ error: 'User not found' });
            }
            const calendar = user.calendars.find(c => c.name === calendarName);
            if (!calendar){
                return res.status(404).send({ error: 'Calendar not found' });
            }
            calendar.events.push(data);
            return user.save();
        })
        .then(calendar => {
            return res.status(201).send({ calendar: calendar });
        })
        .catch(error => {
            return res.status(500).send({ error: `iCal Event was not added: ${error.message}` });
        });
})

app.put('/events', (req, res) => {
    const username = req.query.username;
    const calendarName = req.query.calendarName;
    const eventId = req.query.eventId;
    if (!eventId){
        return res.status(400).send({ error: 'Missing eventId in query parameter' });
    }
    if (!username){
        return res.status(400).send({ error: 'Missing user parameter' });
    }
    if (!calendarName){
        return res.status(400).send({ error: 'Missing calendar name parameter' });
    }

    const data = req.body;
    if (!data){
        return res.status(400).send({ error: 'Missing data in Body' });
    }

    userModel.findOne({ username: username })
        .then((user) => {
            if (!user){
                return res.status(404).send({ error: 'User not found' });
            }
            const calendar = user.calendars.find(c => c.name === calendarName);
            const existingEventIndex = calendar.events.findIndex(e => e.uid === eventId);
            if (existingEventIndex === -1) {
                return res.status(400).send({ error: `Event does not exist` });
            }
            calendar.events[existingEventIndex] = data;
            return calendar.save();
        })
        .then(calendar => {
            return res.status(200).send({ calendar: calendar });
        })
        .catch(error => {
            return res.status(500).send({ error: `iCal Event was not updated: ${error.message}` });
        });
});

app.delete('/events', (req, res) => {
    const username = req.query.username;
    const calendarName = req.query.calendarName;
    const eventId = req.query.eventId;
    if (!eventId){
        return res.status(400).send({ error: 'Missing eventId in query parameter' });
    }
    if (!username){
        return res.status(400).send({ error: 'Missing user parameter' });
    }
    if (!calendarName){
        return res.status(400).send({ error: 'Missing calendar name parameter' });
    }

    userModel.findOne({ username: username })
        .then((user) => {
            if (!user){
                return res.status(404).send({ error: 'User not found' });
            }
            const calendar = user.calendars.find(c => c.name === calendarName);
            const eventIndex = calendar.events.findIndex(event => event.uid === eventId);
            if (eventIndex === -1) {
                return res.status(400).send({ error: `Event with id ${eventId} does not exist` });
            }
            calendar.events.splice(eventIndex, 1);
            return calendar.save();
        })
        .then(calendar => {
            return res.status(200).send({ calendar: calendar });
        })
        .catch(error => {
            return res.status(500).send({ error: `iCal Event was not deleted: ${error.message}` });
        });
});

app.get('/:uid.ics', (req, res) => {
    const uid = req.params.uid;

    iCalFile(uid)
        .then((icalFile) => {
            return res.set('Content-Type', 'text/calendar').send(icalFile);
        }).catch(error => {
        console.log(error)
        return res.status(500).send({ error: `Could not retrieve iCal: ${error.message}` });
    });
});

const iCalFile = async (uid) => {
    const calendar = await calendarModel.findOne({ uid: uid});

    let icalendar = "BEGIN:VCALENDAR\n";
    icalendar += "PRODID:" + calendar.productId + "\n";
    icalendar += "VERSION:2.0\n";

    calendar.events.forEach(event => {
        icalendar += "BEGIN:VEVENT\n";
        icalendar += "SUMMARY:" + event.summary + "\n";
        icalendar += "DTSTAMP:" + formatDate(event.stamp) + "\n";
        icalendar += "DTSTART:" + formatDate(event.start) + "\n";
        icalendar += "DTEND:" + formatDate(event.end) + "\n";
        icalendar += "DESCRIPTION:" + event.description + "\n";
        icalendar += "LOCATION:" + event.location + "\n";
        icalendar += "STATUS:" + event.status + "\n";
        icalendar += "ORGANIZER:" + event.organizer + "\n";
        icalendar += "ATTENDEE:" + event.attendees.join(",") + "\n";
        icalendar += "UID:" + event.uid + "\n";
        icalendar += "SEQUENCE:" + event.sequence + "\n";
        icalendar += "END:VEVENT\n";
    });

    icalendar += "END:VCALENDAR";

    return icalendar;
};


const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, "");
};

function isValidSessionKey(sessionKey) {
    sessionKeyModel.findOne({ key: sessionKey}).then(sessionKey => {
        if (!sessionKey){
            return {
                valid: false,
            }
        } else if (sessionKey.expirationDate > Date.now()){
            return {
                valid: false
            }
        } else {
            return {
                valid: true,
                username: sessionKey.username
            }
        }
    })

    // Return true if the session key is valid, false otherwise
    return true;
}

app.post('/createCalendar', (req, res) => {
    const sessionKey = req.cookies.sessionKey;
    const username = isValidSessionKey(sessionKey).username;
    const name = req.query.calendarName;

    if (!username){
       return res.status(401).send( { error: 'Unauthorized access to create a calendar'});
    }
    if (!name){
        return res.redirect(400, '/');
    }

    const newCalendar = new calendarModel({
        creator: username,
        name: name,
        events: []
    });

    userModel.findOne({ username: username })
        .then((user) => {
            if (!user){
                return res.status(404).send({ error: 'User not found' });
            }
            user.calendars.push(newCalendar);
            user.save()
                .then(calendar => {
                    return res.status(201).send({ calendar: calendar });
                })
                .catch(error => {
                    return res.status(500).send({ error: `iCal Calendar was not created: ${error.message}` });
                });

        })
        .catch(error => {
            return res.status(500).send({ error: `Calendar was not created: ${error.message}` });
        });
});

app.listen(3001, () => {
    console.log('API listening on port 3001!');
});
