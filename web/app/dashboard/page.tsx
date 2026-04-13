"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, storage } from "../../lib/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [botName, setBotName] = useState("AuraBot");
  const [color, setColor] = useState("#f97316");
  const [loading, setLoading] = useState(false);
  const [botId, setBotId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      else setUser(currentUser);
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleSave = async () => {
    if (!file) {
      setError("Por favor sube un archivo PDF.");
      return;
    }
    setError("");
    setLoading(true);
    setBotId(null);

    try {
      // Upload PDF to Storage
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `pdfs/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, file);

      // Call API to process PDF and save config
      const res = await fetch("/api/process-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfPath: `pdfs/${user.uid}/${fileName}`,
          color,
          botName,
          userId: user.uid,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBotId(data.botId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-gray-950 flex justify-center items-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-orange-600">AuraBot Dashboard</h1>
        <button onClick={handleLogout} className="text-sm font-bold text-gray-500 hover:text-black">
            Cerrar Sesión
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8">Configura tu Chatbot</h2>
        
        {error && <div className="bg-red-100 text-red-700 font-medium p-4 rounded-lg mb-6 shadow-sm border border-red-200 flex items-center gap-2">⚠️ {error}</div>}

        <div className="bg-white p-8 rounded-2xl shadow-sm border mb-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">1. Sube tu PDF con información</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 file:cursor-pointer cursor-pointer border-2 border-dashed p-4 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">2. Nombre de tu Bot</label>
            <input 
              type="text" 
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full p-3 border-2 border-gray-100 rounded-lg focus:border-orange-500 focus:outline-none transition-colors font-medium"
              placeholder="Ej: Asistente de Ventas"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Preparando magia... " : "Generar mi Chatbot"}
          </button>
        </div>

        {botId && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-xl font-extrabold text-green-400 mb-4 flex items-center gap-2">
                  ¡Bot listo para usarse!
            </h2>
            <div className="bg-black/50 border border-slate-700 p-4 rounded-lg text-sm font-mono overflow-x-auto text-green-300 mb-4">
              {`<script src="${window.location.origin}/widget.js" data-bot-id="${botId}" defer></script>`}
            </div>
            <p className="text-sm text-gray-400">
              Copia este código y pégalo en tu archivo HTML, justo antes de cerrar la etiqueta <code>&lt;/body&gt;</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
