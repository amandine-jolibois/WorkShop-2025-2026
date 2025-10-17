import React, { useEffect, useState } from "react";
import axios from "axios";
import Profile from "./components/Profile";
import "./App.css";

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [mails, setMails] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/me");
        setUser(res.data);
      } catch {
        console.log("Non connecté");
      } finally {
        setFadeOut(true);
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchUser();
  }, []);

  const handleLogin = () => window.location.href = "http://localhost:5000/auth/google";
  const handleLogout = () => window.location.href = "http://localhost:5000/logout";

  const fetchGmail = async () => {
    const res = await axios.get("http://localhost:5000/gmail");
    setMails(res.data || []);
  };

  const fetchMailContent = async (id) => {
    const res = await axios.get(`http://localhost:5000/gmail/${id}`);
    alert(`Sujet: ${res.data.subject}\n\nContenu:\n${res.data.body}`);
  };

  const fetchCalendar = async () => {
    const res = await axios.get("http://localhost:5000/calendar");
    setEvents(res.data.items || []);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
  };

  return (
    <>
      {loading && (
        <div className={`overlay ${fadeOut ? "fade-out" : ""}`}>
          <iframe src="/animation_2D.html" style={{ border:"none", width:"100%", height:"100%" }} title="Animation 2D"/>
        </div>
      )}
      {!loading && (
        <div className="app-container">
          <h1>Hedwige - Google OAuth Demo</h1>
          {!user && <button className="hp-button" onClick={handleLogin}>Se connecter avec Google</button>}

          {user && (
            <>
              <Profile user={user} />
              <button className="hp-button" onClick={handleLogout}>Se déconnecter</button>

              <button className="hp-button" onClick={fetchGmail}>Voir mes 5 derniers mails</button>
              {mails.length > 0 && (
                <ul className="hp-list">
                  {mails.map(mail => (
                    <li key={mail.id} onClick={() => fetchMailContent(mail.id)} style={{ cursor:"pointer" }}>
                      {mail.subject} - {formatDate(mail.date)}
                    </li>
                  ))}
                </ul>
              )}

              <button className="hp-button" onClick={fetchCalendar}>Voir mes prochains événements</button>
              {events.length > 0 && (
                <ul className="hp-list">
                  {events.map((evt, idx) => (
                    <li key={idx}>
                      {evt.summary} - {formatDate(evt.start?.dateTime || evt.start?.date)}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;
