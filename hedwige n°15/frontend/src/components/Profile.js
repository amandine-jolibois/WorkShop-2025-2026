import React from "react";

export default function Profile({ user }) {
  if (!user) return null;
  const hasPhoto = user.photo && user.photo.trim() !== "";
  return (
    <div>
      <h2>Profil</h2>
      {hasPhoto && <img src={user.photo} alt="Profile" width={80} style={{ borderRadius: "50%", marginBottom: "10px" }}/>}
      <p>Nom : {user.name}</p>
      <p>Email : {user.email}</p>
    </div>
  );
}
