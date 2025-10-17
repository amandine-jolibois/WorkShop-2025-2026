const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const { google } = require("googleapis");

require("dotenv").config();

const app = express();
app.use(express.json());

// --- Connexion MongoDB pour stocker les sessions
mongoose.connect(process.env.MONGO_URL);

// --- CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// --- Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: { maxAge: 7*24*60*60*1000, secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
  scope: [
    "profile",
    "email",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly"
  ]
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0]?.value,
    photo: profile.photos?.[0]?.value || "",
    accessToken
  };
  return done(null, user);
}));

// --- Routes auth
app.get("/auth/google", passport.authenticate("google", {
  accessType: "offline",
  prompt: "consent"
}));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  }
);

// --- Logout
app.get("/logout", (req, res) => {
  if (req.logout) {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect(process.env.FRONTEND_URL);
      });
    });
  } else {
    // Même si pas connecté, rediriger vers frontend
    res.redirect(process.env.FRONTEND_URL);
  }
});

// --- Profil utilisateur
app.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Non connecté" });
  res.json(req.user);
});

// --- Gmail : liste mails récents (subject + date)
app.get("/gmail", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Non connecté" });
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const list = await gmail.users.messages.list({ userId: "me", maxResults: 5 });
  const messages = list.data.messages || [];
  const fullMessages = await Promise.all(messages.map(async msg => {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "metadata",
      metadataHeaders: ["Subject", "Date"]
    });
    const headers = detail.data.payload.headers;
    const subject = headers.find(h => h.name==="Subject")?.value || "(sans sujet)";
    const date = headers.find(h => h.name==="Date")?.value || "";
    return { id: msg.id, subject, date };
  }));
  res.json(fullMessages);
});

// --- Gmail : contenu complet d’un mail
app.get("/gmail/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Non connecté" });
  const { id } = req.params;
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const msg = await gmail.users.messages.get({ userId: "me", id, format: "full" });

  let body = "";
  const parts = msg.data.payload.parts;
  if (parts) {
    const textPart = parts.find(p => p.mimeType === "text/plain");
    if (textPart?.body?.data) body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
  } else if (msg.data.payload.body?.data) {
    body = Buffer.from(msg.data.payload.body.data, "base64").toString("utf-8");
  }

  res.json({ id, subject: msg.data.snippet, body });
});

// --- Calendar : événements à partir d’aujourd’hui
app.get("/calendar", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Non connecté" });
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const now = new Date().toISOString();
  const response = await calendar.events.list({
    calendarId: "primary",
    maxResults: 10,
    orderBy: "startTime",
    singleEvents: true,
    timeMin: now
  });
  res.json(response.data);
});

// --- Démarrage
if (require.main === module) {
  app.listen(5000, () => console.log("Backend Node.js démarré sur le port 5000"));
}

module.exports = app;