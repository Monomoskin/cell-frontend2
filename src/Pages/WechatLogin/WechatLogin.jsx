import { useEffect, useState } from "react";
import QRCode from "react-qr-code"; // Import limpio, funciona con Vite

export default function WechatLogin() {
  const [sessionId] = useState(Date.now().toString()); // ya no necesitamos setSessionId
  const [username, setUsername] = useState(null);

  // URL que el QR codifica
  const qrUrl = `http://localhost:5000/api/wechat-login/${sessionId}`;

  useEffect(() => {
    if (username) return; // si ya tenemos username, no seguimos polling

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/wechat-poll/${sessionId}`,
        );
        const data = await res.json();
        if (data.username) {
          setUsername(data.username);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error polling username:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [sessionId, username]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!username && (
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Escanea el QR con WeChat</h2>
          <div className="bg-white p-2">
            <QRCode value={qrUrl} size={256} />
          </div>
          <p className="text-gray-500 mt-2 text-center">
            Escanea este código con tu móvil para iniciar sesión
          </p>
        </div>
      )}

      {username && (
        <div className="flex flex-col items-center bg-green-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">¡Bienvenido!</h2>
          <p className="text-gray-700 text-lg">Usuario: {username}</p>
        </div>
      )}
    </div>
  );
}
