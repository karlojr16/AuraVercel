"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [botName, setBotName] = useState("AuraBot Mesero");
  const [color, setColor] = useState("#f97316");

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <nav className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-orange-600">AuraBot</h1>
        <Link href="/login" className="px-4 py-2 bg-orange-600 text-white font-medium text-sm rounded-lg hover:bg-orange-700 transition-colors">
          Iniciar Sesión
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        
        {/* LADO IZQUIERDO: CONFIGURACION */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Sube tu Menú (PDF)
            </h2>
            <input 
              type="file" 
              accept=".pdf"
              className="w-full text-sm border-2 border-dashed p-4 rounded-lg cursor-pointer hover:bg-orange-50"
              onChange={() => setStep(2)}
            />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border text-gray-400">
            <h2 className={`font-bold mb-4 flex items-center gap-2 ${step >= 2 ? 'text-gray-900' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>2</span>
              Personaliza
            </h2>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-600 uppercase">Nombre del Bot</label>
              <input 
                type="text" 
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Nombre de tu bot..."
              />
      
            </div>
          </section>

          <section className="bg-slate-800 p-6 rounded-lg shadow-sm text-white">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Código de Instalación
            </h2>
            <div className="bg-slate-900 p-3 rounded font-mono text-[10px] text-green-400 overflow-x-auto">
              {`<script src="https://aurabot.com/widget.js" data-id="123" defer></script>`}
            </div>
            <button 
              className="w-full mt-4 bg-white text-slate-900 font-bold py-2 rounded text-sm hover:bg-gray-100"
              onClick={() => alert("¡Código copiado!")}
            >
              Copiar Script
            </button>
          </section>
        </div>

        {/* LADO DERECHO: PREVIEW */}
        <div className="hidden md:block">
          <div className="sticky top-10 border-[12px] border-slate-900 rounded-[3rem] h-[550px] shadow-2xl relative bg-white overflow-hidden">
            <div className="p-4 bg-gray-100 h-full">
              <div className="h-4 w-24 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-20 w-full bg-gray-200 rounded"></div>
              </div>
              
              {/* Botón flotante simulado */}
              <div className="absolute bottom-6 right-6">
                <div className="bg-white p-3 rounded-xl shadow-lg border text-[10px] mb-2 w-32 animate-pulse">
                    ¡Hola! Soy <b>{botName}</b>. ¿En qué puedo ayudarte?
                </div>
                <div 
                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl text-white ml-auto"
                  style={{ backgroundColor: color }}
                >
                  💬
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4 italic">Vista previa de cómo se verá en tu web</p>
        </div>

      </main>
    </div>
  );
}