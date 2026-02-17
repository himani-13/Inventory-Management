import React, { useState } from "react";

export default function AdminUpload() {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const upload = async () => {

    if (!file) {
      setMsg("Please select a file first");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      setMsg("");

      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: form
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setMsg("File uploaded successfully");

    } catch (err) {

      console.log(err);
      setMsg("Backend not available. Demo mode.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>

      <h2>Sales Data Upload</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={upload} disabled={loading}>
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {msg && (
        <p style={{ marginTop: 12 }}>{msg}</p>
      )}

    </div>
  );
}

